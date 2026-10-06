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
  // monogram místo chybějící fotky: první písmena prvního a posledního slova (bez „M.“ a podobných zkratek)
  function mono(jmeno){
    var casti=String(jmeno||"").split(/\s+/).filter(function(x){ return x && !/^\p{Lu}\.$/u.test(x) && !/^[„"(]/.test(x); });
    if(!casti.length) return "";
    return (casti[0][0]+(casti.length>1?casti[casti.length-1][0]:"")).toUpperCase();
  }
  function portret(f, trida){
    return f.photo
      ? '<img src="'+esc(f.photo)+'" alt="'+esc(f.name)+'" loading="lazy" decoding="async">'
      : '<span class="'+trida+'" aria-hidden="true">'+esc(mono(f.name))+'</span>';
  }
  var redukce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ikony kreslené ručně v barvě textu (currentColor), ať jdou na bílou i fialovou kartu
  var IKONA={
    vlevo:'<svg viewBox="0 0 31 25" width="31" height="25" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M29 12.5H3M12 3.5 3 12.5l9 9"/></svg>',
    vpravo:'<svg viewBox="0 0 31 25" width="31" height="25" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12.5h26M19 3.5l9 9-9 9"/></svg>',
    kava:'<svg viewBox="0 0 109 109" width="109" height="109" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 44h52v22a22 22 0 0 1-22 22H44a22 22 0 0 1-22-22z"/><path d="M74 50h7a10 10 0 0 1 0 20h-7"/><path d="M18 98h66"/><path d="M39 32c0-6 6-6 6-12s-6-6-6-12M53 32c0-6 6-6 6-12s-6-6-6-12"/></svg>',
    ven:'<svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5"/></svg>'
  };

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
      h.push('<div class="pr-hlava"><div class="pr-hlava-l"><p class="pr-cas">'+esc(cas(s))+'</p>'
        +'<h3 class="pr-titul"><span>'+esc(s.label||("Session "+s.number))+'</span><span>'+esc(s.title)+'</span></h3></div>'
        +'<div class="pr-hlava-p">'+skupina("Chairs", s.chairs||[])+skupina("Panel", s.panel||[]));
      var male=[];
      if((s.provokers||[]).length) male.push(skupina(s.provokers.length>1?"Provokers":"Provoker", s.provokers));
      if((s.coordinators||[]).length) male.push(skupina(s.coordinators.length>1?"Session coordinators":"Session coordinator", s.coordinators));
      if(male.length) h.push('<div class="pr-skupiny-2">'+male.join("")+'</div>');
      h.push('</div></div>');

      if((s.liveCases||[]).length){
        h.push('<h3 class="pr-h">Live cases</h3><div class="pr-live">');
        s.liveCases.forEach(function(lc){
          var ops=(lc.operators||[]).map(jmeno);
          h.push('<article class="pr-karta">'
            +(lc.country?'<span class="pr-pilulka">'+esc(lc.country)+'</span>':'')
            +'<h4>'+esc(lc.title)+'</h4><p class="pr-misto">'+esc(lc.location)+'</p>'
            +'<div class="pr-ops"><p>'+(ops.length>1?"Operators":"Operator")+'</p><p>'+(ops.length?esc(ops.join(", ")):'<span class="pr-tba">To be announced</span>')+'</p>'
            +(lc.ivus?'<p class="pr-ivus">IVUS commentary · '+esc(jmeno(lc.ivus))+'</p>':'')
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
          h.push('<article class="pr-prednaska'+(i===0?" on":"")+'"><span class="pr-cislo" aria-hidden="true">'+(i+1)+'</span><h4>Lecture</h4>'
            +'<div class="pr-telo"><p class="pr-nazev'+(s.topicsHidden?" tba":"")+'">'+esc(p.title)+'</p>'
            +'<p class="pr-recnik">'+(rec.length?esc(rec.join(" & ")):'<span class="pr-tba">Speaker to be announced</span>')
            +(p.minutes?'<small>'+p.minutes+' min</small>':'')+'</p></div></article>');
        });
        h.push('</div></div><div class="pr-sipky"><button type="button" class="pr-sipka" data-smer="-1" aria-label="Previous lectures">'+IKONA.vlevo+'</button>'
          +'<button type="button" class="pr-sipka" data-smer="1" aria-label="Next lectures">'+IKONA.vpravo+'</button></div>');
      }

      var pz=pauzaPo(d, s);
      // hrnek jen tam, kde se opravdu něco pije nebo jí (ne u Closing Remarks)
      if(pz) h.push('<div class="pr-pauza">'+(/coffee|break|lunch|dinner/i.test(pz.title)?'<span class="pr-kava">'+IKONA.kava+'</span>':'')+'<p class="pr-cas">'+esc(cas(pz))+'</p><h3>'+esc(pz.title)+'</h3></div>');
      return h.join("");
    }
    // den bez sessions (čtvrtek): jen společenské bloky
    function denBezSessionsHtml(d){
      return '<div class="pr-spolecenske">'+d.blocks.map(function(b){
        return '<div class="pr-pauza pr-spol"><p class="pr-cas">'+esc(b.time||cas(b))+'</p><h3>'+esc(b.title)+'</h3>'
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
    // „Chair · Session 4“; stejná role ve více sessions se slije: „Panel · Sessions 1, 3“
    var podle={}; (f.roles||[]).forEach(function(r){ (podle[r.role]=podle[r.role]||[]).push(r.session); });
    return Object.keys(podle).map(function(role){
      var s=podle[role].filter(function(x){ return x!=null; });
      return role+(s.length?" · "+(s.length>1?"Sessions ":"Session ")+s.join(", "):"");
    });
  }
  function kresliFaculty(el, D){
    var vsichni=D.faculty||[];
    var reditele=vsichni.filter(function(f){ return (f.tags||[]).indexOf("Course director")>=0; });
    var clenove=vsichni.filter(function(f){ return reditele.indexOf(f)<0; });
    var MOBIL_PRVNICH=6;   // na telefonu se ukáže šest a tlačítko „Load more“, jako v návrhu
    var h=[];
    if(reditele.length){
      h.push('<div class="fa-reditele"><h3 class="fa-h">Course directors</h3><div class="fa-karty">');
      reditele.forEach(function(f){
        h.push('<article class="fa-karta"><div class="fa-foto">'+portret(f,"fa-mono fa-mono-velky")+'<span class="fa-stitek">'+esc(f.tags[0])+'</span></div>'
          +'<div class="fa-telo"><h4>'+esc(f.name)+'</h4>'+(f.affiliation?'<p class="fa-org">'+esc(f.affiliation)+'</p>':'')
          +'<div class="fa-radek"><p>'+esc(f.country)+'</p><p class="fa-role">'+roleText(f).map(esc).join("<br>")+'</p></div></div></article>');
      });
      h.push('</div></div>');
    }
    h.push('<div class="fa-clenove"><h3 class="fa-h">'+clenove.length+' faculty members</h3><ul class="fa-seznam">');
    clenove.forEach(function(f,i){
      h.push('<li'+(i>=MOBIL_PRVNICH?' class="fa-dalsi"':'')+'><div class="fa-kolo">'+portret(f,"fa-mono")+'</div><div class="fa-text">'
        +'<p class="fa-jmeno">'+esc(f.name)+'</p>'
        +'<p class="fa-popis">'+roleText(f).map(function(t){ return '<span>'+esc(t)+'</span>'; }).join("")+'</p>'
        +'<p class="fa-zeme">'+esc(f.country)+'</p></div></li>');
    });
    h.push('</ul>'+(clenove.length>MOBIL_PRVNICH?'<button type="button" class="fa-vic">Load more</button>':'')+'</div>');
    el.innerHTML=h.join("");
    var vic=el.querySelector(".fa-vic");
    if(vic) vic.addEventListener("click",function(){ el.querySelector(".fa-seznam").classList.add("vse"); vic.remove(); });
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
