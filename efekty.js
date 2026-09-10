/* Nabíhání textu při skrolování – přesně jako na jejich webu: každé slovo je vlastní
   <span>, ve výchozím stavu šedé #D9D9D9, a jak odstavec projíždí pod pomyslnou linkou
   v 84,5 % výšky okna, slova se po řádcích rozsvěcují do fialové (přechod color .5s).
   Změřeno v jejich buildu: odstavec začne nabíhat, jakmile jeho horní hrana linku
   podleze, a je celý fialový, když ji podleze i jeho spodní hrana. Efekt je čistě
   funkcí polohy scrollu, takže při rolování zpět zase pohasíná.
   Bez JS (a při prefers-reduced-motion) zůstává text rovnou fialový. */
(function(){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var bloky=[];

  function priber(){
  var nove=[].slice.call(document.querySelectorAll("p.nabih:not(.nabih-on)"));
  nove.forEach(function(p){
    if(p.children.length) return;              // odstavce s odkazem či obrázkem nesahat
    var slova=p.textContent.split(" ");
    p.textContent="";
    p.__s=[];
    slova.forEach(function(t,i){
      if(i) p.appendChild(document.createTextNode(" "));
      if(!t) return;
      var sp=document.createElement("span"); sp.className="s"; sp.textContent=t;
      p.appendChild(sp); p.__s.push(sp);
    });
    p.classList.add("nabih-on");
    if(p.__s.length) bloky.push(p);
  });
  }

  var ceka=false;
  function prepocitej(){
    ceka=false;
    var cara=innerHeight*0.845;
    bloky.forEach(function(p){
      var r=p.getBoundingClientRect();
      var post=(cara-r.top)/Math.max(r.height,1);
      if(post<0) post=0; if(post>1) post=1;
      var n=Math.round(post*p.__s.length);
      if(p.__n===n) return;
      p.__n=n;
      for(var i=0;i<p.__s.length;i++) p.__s[i].classList.toggle("tu", i<n);
    });
  }
  function planuj(){ if(!ceka){ ceka=true; requestAnimationFrame(prepocitej); } }
  addEventListener("scroll",planuj,{passive:true});
  addEventListener("resize",planuj);
  document.addEventListener("obsah",function(){ priber(); prepocitej(); });   // program se dokresluje z content.json
  priber(); prepocitej();
})();

/* Dojezd nadpisů – efekt, jaký má Apple: nadpis se rozseká na skutečné řádky
   (podle toho, kde je zalomil prohlížeč), každý řádek dostane okénko s overflow:hidden
   a vyjede zespodu s dlouhým měkkým doběhem, řádek po řádku.
   Řádky se počítají až z vykresleného textu, takže se při změně šířky okna přepočítají. */
(function(){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var nadpisy=[].slice.call(document.querySelectorAll("h2, .page-head h1")).filter(function(h){
    return !h.closest("footer") && h.children.length===0 && h.textContent.trim();
  });
  if(!nadpisy.length) return;
  nadpisy.forEach(function(h){ h.__txt=h.textContent; });

  function radky(h){
    // 1. změřit, kde prohlížeč zalomil – přes Range nad čistým textovým uzlem.
    //    (Slova zabalená do inline-blocků měřit nejde: vypne to text-wrap:balance
    //    a nadpis se pak zalomí jinam, než jak ho stránka doopravdy sází.)
    h.textContent=h.__txt;
    var uzel=h.firstChild, r=document.createRange();
    var skup=[], posledni=null, i=0;
    h.__txt.split(" ").forEach(function(t){
      if(t){
        r.setStart(uzel,i); r.setEnd(uzel,i+t.length);
        var y=Math.round(r.getBoundingClientRect().top);
        if(posledni===null || Math.abs(y-posledni)>4){ skup.push([]); posledni=y; }
        skup[skup.length-1].push(t);
      }
      i+=t.length+1;
    });
    if(!skup.length) return;
    // 2. přestavět na okénka po řádcích
    h.textContent="";
    skup.forEach(function(slova,i){
      var ven=document.createElement("span"); ven.className="dr"; ven.style.setProperty("--i",i);
      var dov=document.createElement("span"); dov.className="dri"; dov.textContent=slova.join(" ");
      ven.appendChild(dov); h.appendChild(ven);
    });
    h.classList.add("dojezd");
  }

  var pozorovatel=new IntersectionObserver(function(zaznamy){
    zaznamy.forEach(function(z){
      if(z.isIntersecting){ z.target.classList.add("tu"); pozorovatel.unobserve(z.target); }
    });
  },{threshold:0.15});

  // až po načtení Safira – se záložním fontem se text zalomí jinde a řádky by seděly špatně
  function spust(){
    nadpisy.forEach(radky);
    nadpisy.forEach(function(h){ pozorovatel.observe(h); });
  }
  // Počkáme na font, ale ne donekonečna – dokud se nadpis nerozseká, je neviditelný,
  // a na stránce s padesáti fotkami umí fonts.ready dojet pozdě.
  var spusteno=false;
  function spustJednou(){ if(spusteno) return; spusteno=true; spust(); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(spustJednou);
  setTimeout(spustJednou, 1200);

  // při změně šířky se text zalomí jinak – přepočítat, doběhnuté nadpisy nechat doběhnuté
  var t;
  addEventListener("resize",function(){
    clearTimeout(t);
    t=setTimeout(function(){
      nadpisy.forEach(function(h){
        var hotovo=h.classList.contains("tu");
        h.classList.remove("dojezd","tu");
        radky(h);
        if(hotovo) h.classList.add("tu");
      });
    },250);
  });
})();
