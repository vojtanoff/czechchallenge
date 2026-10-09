/* Program a Faculty 2026 – dvě samostatné komponenty pro web Czech Challenge.
   Obě čtou jeden soubor program-2026.json, který vyrábí generátor
   brain-tools/czech-challenge-program-a-commitmenty.py z exportu Czech Challenge Desku
   (jen potvrzení lidé, jen veřejná pole). Web do dat nesahá, jen je kreslí.

   Zapojení (viz README-program-2026.md):
     <div data-cc-program data-src="program-2026.json" data-day="fri"></div>
     <div data-cc-faculty data-src="program-2026.json"></div>
     <script src="program-2026.js"></script>
   Skript si prvky najde sám po načtení stránky. Styl je v program-2026.css.
   Žádné závislosti, vanilla JS, žádný build. */
(function(){
  "use strict";

  function esc(t){ return String(t==null?"":t).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var redukce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ikony jsou Milošovy soubory z návrhu (img/ikony/, převzaté z testovacího webu); oběd je dokreslený stejným tahem
  var IKONY=(document.currentScript&&document.currentScript.dataset.ikony)||"img/ikony/";
  function ikona(soubor, w, h){ return '<img src="'+IKONY+soubor+'" width="'+w+'" height="'+h+'" alt="" aria-hidden="true" loading="lazy">'; }
  var IKONA={
    vlevo:ikona("sipka-vlevo.svg",31,25), vpravo:ikona("sipka-vpravo.svg",31,25),
    kava:ikona("kava.svg",109,109), obed:ikona("obed.svg",109,109), saxofon:ikona("saxofon.svg",109,109),
    ven:'<svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5"/></svg>'
  };

  // vlajky: vlastní zjednodušené SVG (poměr 3:2, viewBox 0 0 30 20) v jednotném stylu, žádné emoji ani CDN
  function hvezda(cx,cy,r,n,barva){
    n=n||5; var b=[]; for(var i=0;i<n*2;i++){ var a=Math.PI/n*i-Math.PI/2, k=i%2?r*.42:r; b.push((cx+Math.cos(a)*k).toFixed(2)+","+(cy+Math.sin(a)*k).toFixed(2)); }
    return '<polygon points="'+b.join(" ")+'" fill="'+barva+'"/>';
  }
  function pruhy(barvy, svisle){ // rovnoměrné pruhy
    var n=barvy.length, d=(svisle?30:20)/n;
    return barvy.map(function(c,i){ return svisle?'<rect x="'+(i*d)+'" y="0" width="'+d+'" height="20" fill="'+c+'"/>':'<rect x="0" y="'+(i*d)+'" width="30" height="'+d+'" fill="'+c+'"/>'; }).join("");
  }
  var VLAJKY={
    CZE:pruhy(["#fff","#d7141a"])+'<polygon points="0,0 15,10 0,20" fill="#11457e"/>',
    SVK:pruhy(["#fff","#0b4ea2","#ee1c25"])+'<path d="M6.5 6h7v7.2c0 2.3-2.2 3.6-3.5 4.3C8.7 16.8 6.5 15.5 6.5 13.2z" fill="#ee1c25" stroke="#fff" stroke-width=".7"/><path d="M10 7.6v6.4M8 9.4h4M8.4 11.2h3.2" stroke="#fff" stroke-width="1"/><path d="M7.6 14.6c.6-.9 1.5-1.3 2.4-1.3s1.8.4 2.4 1.3c-.6.9-1.5 1.4-2.4 1.4s-1.8-.5-2.4-1.4z" fill="#0b4ea2"/>',
    POL:pruhy(["#fff","#dc143c"]),
    ROU:pruhy(["#002b7f","#fcd116","#ce1126"],true),
    ITA:pruhy(["#009246","#fff","#ce2b37"],true),
    FRA:pruhy(["#002395","#fff","#ed2939"],true),
    AUT:pruhy(["#ed2939","#fff","#ed2939"]),
    GER:pruhy(["#000","#dd0000","#ffce00"]),
    HUN:pruhy(["#ce2939","#fff","#477050"]),
    SLO:pruhy(["#fff","#005da4","#ed1c24"])+'<path d="M6 4.2h5v4.2c0 1.8-1.4 2.9-2.5 3.5C7.4 11.3 6 10.2 6 8.4z" fill="#005da4" stroke="#fff" stroke-width=".5"/><path d="M6.6 9.6l1.3-1.9.6.8 1-1.6 1 1.6.6-.8 1.3 1.9c-.4 1-1.3 1.6-2.4 2.1-1.1-.5-2-1.1-2.4-2.1z" fill="#fff"/>',
    TUN:'<rect width="30" height="20" fill="#e70013"/><circle cx="15" cy="10" r="5.6" fill="#fff"/><circle cx="15" cy="10" r="4.2" fill="#e70013"/><circle cx="16" cy="10" r="3.4" fill="#fff"/>'+hvezda(16.6,10,2,5,"#e70013"),
    AUS:'<rect width="30" height="20" fill="#00008b"/><path d="M0 0l15 10M15 0L0 10" stroke="#fff" stroke-width="2.2"/><path d="M0 0l15 10M15 0L0 10" stroke="#cf142b" stroke-width=".8"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3"/><path d="M7.5 0v10M0 5h15" stroke="#cf142b" stroke-width="1.6"/>'+hvezda(7.5,15.5,2.4,7,"#fff")+hvezda(22.5,4.2,1.5,7,"#fff")+hvezda(18.5,9,1.5,7,"#fff")+hvezda(26.5,8.2,1.5,7,"#fff")+hvezda(22.5,16.2,1.5,7,"#fff")+hvezda(24.2,11,1,5,"#fff"),
    PRI:pruhy(["#ed0000","#fff","#ed0000","#fff","#ed0000"])+'<polygon points="0,0 17,10 0,20" fill="#0050f0"/>'+hvezda(5.6,10,3.2,5,"#fff"),
    LAT:'<rect width="30" height="20" fill="#9e3039"/><rect y="8" width="30" height="4" fill="#fff"/>',
    EST:pruhy(["#0072ce","#000","#fff"]),
    SWE:'<rect width="30" height="20" fill="#006aa7"/><path d="M10 0v20M0 10h30" stroke="#fecc00" stroke-width="4"/>',
    SUI:'<rect width="30" height="20" fill="#d52b1e"/><path d="M15 5v10M10 10h10" stroke="#fff" stroke-width="3"/>',
    ESP:'<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>',
    GBR:'<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.5"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.5"/>',
    ISR:'<rect width="30" height="20" fill="#fff"/><rect y="2.5" width="30" height="3" fill="#0038b8"/><rect y="14.5" width="30" height="3" fill="#0038b8"/><path d="M15 6l3.5 6h-7zM15 14l3.5-6h-7z" fill="none" stroke="#0038b8" stroke-width=".9"/>',
    BEL:pruhy(["#000","#fdda24","#ef3340"],true),
    GRE:pruhy(["#0d5eaf","#fff","#0d5eaf","#fff","#0d5eaf","#fff","#0d5eaf","#fff","#0d5eaf"])+'<rect width="11" height="11.1" fill="#0d5eaf"/><path d="M5.5 0v11.1M0 5.6h11" stroke="#fff" stroke-width="2.2"/>'
  };
  function vlajka(kod, zeme){
    if(!VLAJKY[kod]) return "";
    return '<svg class="fa-vlajka" viewBox="0 0 30 20" width="22" height="15" role="img" aria-label="'+esc(zeme)+'"><title>'+esc(zeme)+'</title>'+VLAJKY[kod]+'</svg>';
  }

  var cache={};
  function nacti(src){
    if(!cache[src]) cache[src]=fetch(src,{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(src+": "+r.status); return r.json(); });
    return cache[src];
  }
  function lideMapa(D){ var m={}; (D.faculty||[]).forEach(function(f){ m[f.id]=f; }); return m; }
  function cas(b){ return b.to ? b.from+" – "+b.to : b.from; }

  /* ================================================================ PROGRAM */
  function kresliProgram(el, D){
    var lide=lideMapa(D);
    function jmeno(id){ return lide[id] ? lide[id].name : "TBA"; }
    function jmena(ids){ return ids.length ? ids.map(function(i){ return '<span>'+esc(jmeno(i))+'</span>'; }).join("") : '<span class="pr-tba">To be announced</span>'; }

    var dny=D.days||[];
    var den=Math.max(0, dny.map(function(d){ return d.id; }).indexOf(el.dataset.day||"fri"));
    var vybrana={};   // index session v rámci dne (pamatuje se při přepínání dnů)

    function sessions(d){ return d.blocks.filter(function(b){ return b.type==="session"; }); }
    // přestávka, která po session následuje – kreslí se pod ní jako limetková karta
    function pauzaPo(d, s){ var i=d.blocks.indexOf(s), n=d.blocks[i+1]; return n && n.type==="break" ? n : null; }

    function skupina(nadpis, ids){
      return '<div class="pr-skupina"><h4>'+nadpis+'</h4><p>'+jmena(ids)+'</p></div>';
    }
    function sessionHtml(d, s){
      var h=[];
      h.push('<div class="pr-hlava"><div class="pr-hlava-l"><p class="pr-cas">'+esc(cas(s))+(s.remote?' <span class="pr-stitek">Live Cases</span>':'')+'</p>'
        +'<h3 class="pr-titul"><span>'+esc(s.label||("Session "+s.number))+'</span><span>'+esc(s.title)+'</span></h3></div>'
        +'<div class="pr-hlava-p">'+skupina("Chairs", s.chairs||[])+skupina("Discussants", s.discussants||[]));
      var male=[];
      if((s.provokers||[]).length) male.push(skupina(s.provokers.length>1?"Provokers":"Provoker", s.provokers));
      if((s.coordinators||[]).length) male.push(skupina(s.coordinators.length>1?"Session coordinators":"Session coordinator", s.coordinators));
      if(male.length) h.push('<div class="pr-skupiny-2">'+male.join("")+'</div>');
      h.push('</div></div>');

      if((s.liveCases||[]).length){
        h.push('<h3 class="pr-h">Live Cases</h3><div class="pr-live">');
        s.liveCases.forEach(function(lc){
          var ops=(lc.operators||[]).map(jmeno);
          h.push('<article class="pr-karta">'
            +(lc.country?'<span class="pr-pilulka">'+esc(lc.country)+'</span>':'')
            +'<h4>'+esc(lc.title)+'</h4><p class="pr-misto">'+esc(lc.location)+'</p>'
            +'<div class="pr-ops"><p>'+(ops.length>1?"Operators":"Operator")+'</p><p>'+(ops.length?esc(ops.join(", ")):'<span class="pr-tba">To be announced</span>')+'</p>'
            +(lc.ivus?'<p class="pr-ivus">IVUS commentary · '+esc(jmeno(lc.ivus))+'</p>':'')
            +(lc.localCoordinator||lc.localCoordinatorName?'<p class="pr-ivus">Local coordinator: '+esc(lc.localCoordinator?jmeno(lc.localCoordinator):lc.localCoordinatorName)+'</p>':'')
            +'</div></article>');
        });
        h.push('</div>');
      }

      if((s.lectures||[]).length){
        // pás přetéká k okrajům okna; karty se mají chytat na levý okraj rámečku = vzdálenost prvku od kraje okna.
        // Procenta ve scroll-padding se berou z celého scrollportu, proto se okraj dává rovnou v px (a při resize znovu).
        h.push('<h3 class="pr-h">Lectures</h3><div class="pr-pas-obal"><div class="pr-pas" tabindex="0" aria-label="Lectures – scroll sideways" style="scroll-padding-inline:'+Math.round(el.getBoundingClientRect().left)+'px">');
        s.lectures.forEach(function(p,i){
          var rec=(p.speakers||[]).map(jmeno);
          h.push('<article class="pr-prednaska"><span class="pr-cislo" aria-hidden="true">'+(i+1)+'</span><h4>Lecture</h4>'
            +'<div class="pr-telo"><p class="pr-nazev">'+esc(p.title)+'</p>'
            +'<p class="pr-recnik">'+(rec.length?esc(rec.join(" & ")):'<span class="pr-tba">Speaker to be announced</span>')
            +(p.minutes?'<small>'+p.minutes+' min</small>':'')+'</p></div></article>');
        });
        h.push('</div></div><div class="pr-sipky"><button type="button" class="pr-sipka" data-smer="-1" aria-label="Previous lectures">'+IKONA.vlevo+'</button>'
          +'<button type="button" class="pr-sipka" data-smer="1" aria-label="Next lectures">'+IKONA.vpravo+'</button></div>');
      }

      var pz=pauzaPo(d, s);
      // ikona podle druhu přestávky: Milošův hrnek u kávy, příbor u oběda, u Closing Remarks nic
      if(pz){ var ik=/coffee/i.test(pz.title)?IKONA.kava:/lunch|dinner/i.test(pz.title)?IKONA.obed:"";
        h.push('<div class="pr-pauza">'+(ik?'<span class="pr-kava">'+ik+'</span>':'')+'<p class="pr-cas">'+esc(cas(pz))+'</p><h3>'+esc(pz.title)+'</h3></div>'); }
      return h.join("");
    }
    // den bez sessions (čtvrtek): jen společenské bloky
    function denBezSessionsHtml(d){
      return '<div class="pr-spolecenske">'+d.blocks.map(function(b){
        // Vojta 6. 10.: příbor a saxofon vedle sebe
        return '<div class="pr-pauza pr-spol"><span class="pr-kava pr-ikony">'+IKONA.obed+IKONA.saxofon+'</span><p class="pr-cas">'+esc(b.time||cas(b))+'</p><h3>'+esc(b.title)+'</h3>'
          +(b.location?'<p class="pr-kde">'+esc(b.location)+'</p>':'')
          +(b.note?'<p class="pr-pozn">'+esc(b.note)+'</p>':'')
          +(b.url?'<a class="pr-odkaz" href="'+esc(b.url)+'" target="_blank" rel="noopener">'+esc(b.url.replace(/^https?:\/\/(www\.)?/,"").replace(/\/$/,""))+' '+IKONA.ven+'</a>':'')
          +'</div>';
      }).join("")+'</div>';
    }

    function pilulky(trida, polozky, aktivni, popis){
      return '<div class="'+trida+'" role="group" aria-label="'+popis+'">'+polozky.map(function(t,i){
        return '<button type="button" aria-pressed="'+(i===aktivni?"true":"false")+'" data-i="'+i+'">'+esc(t)+'</button>';
      }).join("")+'</div>';
    }

    function kresli(){
      var d=dny[den], ses=sessions(d), si=Math.min(vybrana[d.id]||0, Math.max(0, ses.length-1));
      var h=[];
      h.push(pilulky("pr-dny", dny.map(function(x){ return x.label+" "+x.date.replace(/\s+\d{4}$/,"").replace(/^(\d+) (\w{3})\w*/,"$1 $2"); }), den, "Day"));
      if(ses.length>1) h.push(pilulky("pr-sessions", ses.map(function(s){ return s.label||("Session "+s.number); }), si, "Session"));
      h.push('<div class="pr-detail">'+(ses.length ? sessionHtml(d, ses[si]) : denBezSessionsHtml(d))+'</div>');
      el.innerHTML=h.join("");
      sipky(el);
    }
    el.addEventListener("click",function(e){
      var b=e.target.closest("button[data-i]"); if(!b) return;
      var i=+b.dataset.i;
      if(b.parentNode.classList.contains("pr-dny")){ den=i; }
      else { vybrana[dny[den].id]=i; }
      kresli();
      // při přepnutí session na telefonu by detail zůstal pod ohybem – posunout k němu, ale ne při prvním vykreslení
      var det=el.querySelector(".pr-detail");
      if(det && !b.parentNode.classList.contains("pr-dny") && det.getBoundingClientRect().top>innerHeight*0.6 && !redukce) det.scrollIntoView({behavior:"smooth", block:"start"});
    });
    kresli();
  }

  // šipky pod pásem přednášek: posun o jednu kartu, na krajích zešednou
  function sipky(el){
    var pas=el.querySelector(".pr-pas"); if(!pas) return;
    var tl=el.querySelectorAll(".pr-sipka");
    function krok(){ var k=pas.querySelector(".pr-prednaska"); return k ? k.getBoundingClientRect().width+parseFloat(getComputedStyle(pas).columnGap||getComputedStyle(pas).gap||21) : 300; }
    function okraj(){ pas.style.scrollPaddingInline=Math.round(el.getBoundingClientRect().left)+"px"; }
    function stav(){
      var max=pas.scrollWidth-pas.clientWidth-1;
      tl[0].disabled=pas.scrollLeft<=1; tl[1].disabled=pas.scrollLeft>=max;
    }
    tl.forEach(function(t){ t.addEventListener("click",function(){ pas.scrollBy({left:krok()*(+t.dataset.smer), behavior:redukce?"auto":"smooth"}); }); });
    pas.addEventListener("scroll",stav,{passive:true}); addEventListener("resize",function(){ okraj(); stav(); }); stav();
  }

  /* ================================================================ FACULTY */
  function roleText(f){
    // „Chair · Session 4“; stejná role ve více sessions se slije: „Discussant · Sessions 1, 3“
    var podle={}; (f.roles||[]).forEach(function(r){ (podle[r.role]=podle[r.role]||[]).push(r.session); });
    return Object.keys(podle).map(function(role){
      var s=podle[role].filter(function(x){ return x!=null; });
      return role+(s.length?" · "+(s.length>1?"Sessions ":"Session ")+s.join(", "):"");
    });
  }
  // Vojta 6. 10.: jen země pracoviště a její vlajka, národnost se nezobrazuje
  function zeme(f, sVlajkou){
    return (sVlajkou?vlajka(f.countryCode, f.country):'')+'<span>'+esc(f.country)+'</span>';
  }

  function kresliFaculty(el, D){
    // Vojta 6. 10.: bez fotek i zástupných, bez bloku Course directors (jsou na hlavní straně), jen jméno, role a stát.
    // Vlajky: data-flags="1" na prvku; pro náhled přebije ?vlajky=1 / ?vlajky=0 v adrese.
    var vl=/[?&]vlajky=(\d)/.exec(location.search), sVlajkou=vl ? vl[1]==="1" : el.dataset.flags==="1";
    var clenove=D.faculty||[];
    var h=['<div class="fa-clenove'+(sVlajkou?" s-vlajkou":"")+'"><h3 class="fa-h">'+clenove.length+' faculty members</h3><ul class="fa-seznam">'];
    clenove.forEach(function(f,i){
      h.push('<li><div class="fa-text">'
        +'<p class="fa-jmeno">'+esc(f.name)+'</p>'
        +'<p class="fa-popis">'+roleText(f).map(function(t){ return '<span>'+esc(t)+'</span>'; }).join("")+'</p>'
        +'<p class="fa-zeme">'+zeme(f, sVlajkou)+'</p></div></li>');
    });
    // Vojta 6. 10.: na telefonu hned všichni, bez „Load more“ z návrhu
    h.push('</ul></div>');
    el.innerHTML=h.join("");
  }

  /* ================================================================ start */
  function start(){
    document.querySelectorAll("[data-cc-program],[data-cc-faculty]").forEach(function(el){
      var src=el.dataset.src||"program-2026.json";
      nacti(src).then(function(D){
        if(el.hasAttribute("data-cc-program")) kresliProgram(el, D); else kresliFaculty(el, D);
        el.classList.add("cc-hotovo");
        document.dispatchEvent(new CustomEvent("obsah"));   // efekty stránky si můžou vzít i nový obsah
      }).catch(function(err){
        el.innerHTML='<p class="pr-chyba">The program could not be loaded. Please try again later.</p>';
        if(window.console) console.error(err);
      });
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
