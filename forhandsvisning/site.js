(function(){
  var C = window.SITE || {}, html = document.documentElement, page = document.body.dataset.page;
  var q = new URLSearchParams(location.search).get("p");

  function L(){ return html.getAttribute("data-lang"); }
  function t(v){ if(v == null) return ""; if(typeof v !== "object") return String(v); return v[L()] || v.sv || v.en || ""; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function tx(sv, en){ return L() === "sv" ? sv : en; }
  function date(d){ var x = new Date(d + "T12:00:00"); return isNaN(x) ? esc(d) : x.toLocaleDateString(L() === "sv" ? "sv-SE" : "en-GB", {day:"numeric", month:"long", year:"numeric"}); }
  function $(id){ return document.getElementById(id); }
  function set(id, h){ var el = $(id); if(el) el.innerHTML = h; return el; }
  function show(id, on){ var el = $(id); if(el) el.hidden = !on; }
  function list(k){ return C[k] || []; }
  function guard(root){
    if(!root) return;
    root.querySelectorAll("img").forEach(function(img){
      function miss(){ var d = document.createElement("div"); d.className = "missing"; d.textContent = tx("Bilden saknas", "Image missing"); (img.closest("button") || img).replaceWith(d); }
      if(!img.getAttribute("src") || (img.complete && img.naturalWidth === 0)) miss(); else img.addEventListener("error", miss);
    });
  }

  var TYP = {bok:{sv:"Böcker",en:"Books"}, artikel:{sv:"Artiklar och kapitel",en:"Articles and chapters"}, ovrigt:{sv:"Övriga texter",en:"Other writing"}};
  var AVS = {anstallning:{sv:"Anställningar",en:"Employment"}, utbildning:{sv:"Utbildning",en:"Education"}, medel:{sv:"Forskningsmedel",en:"Grants"}, uppdrag:{sv:"Uppdrag",en:"Appointments"}};
  var NAV = [["om",{sv:"Om",en:"About"}],["forskning",{sv:"Forskning",en:"Research"},null,"forskning"],["texter",{sv:"Texter",en:"Writing"},null,"texter"],
             ["blogg",{sv:"Blogg",en:"Blog"},"blogg.html","inlagg"],["foto",{sv:"Fotografier",en:"Photographs"},"foto.html","foto"],
             ["cv","CV",null,"cv"],["kontakt",{sv:"Kontakt",en:"Contact"}]];

  /* Sidospalt och sidfot */
  function side(){
    set("side",
      '<div class="top"><a class="name" href="index.html">' + esc(C.namn) + '</a>' +
      '<div class="lang" role="group" aria-label="Språk / Language">' +
      '<button type="button" data-set="sv" aria-pressed="' + (L() === "sv") + '">Sv</button>' +
      '<button type="button" data-set="en" aria-pressed="' + (L() === "en") + '">En</button></div></div>' +
      '<p class="role">' + esc(t(C.roll)) + '</p>' +
      '<nav aria-label="' + tx("Innehåll", "Contents") + '"><ul>' + NAV.filter(function(n){ return !n[3] || list(n[3]).length || (n[0] === "cv" && C.cv_pdf); }).map(function(n){
        var h = n[2] || (page === "home" ? "#" + n[0] : "index.html#" + n[0]);
        return '<li><a href="' + h + '"' + (n[2] && page === n[0] ? ' aria-current="true"' : "") + ">" + esc(t(n[1])) + "</a></li>";
      }).join("") + "</ul></nav>");
  }
  function social(){
    return '<ul class="social">' + list("lankar").map(function(l){ return '<li><a href="' + esc(l.url) + '" rel="me noopener">' + esc(l.namn) + "</a></li>"; }).join("") + "</ul>";
  }
  function foot(){ set("foot", social() + "<p>© " + new Date().getFullYear() + " " + esc(C.namn) + "</p>"); }

  function item(p){
    return '<li><time datetime="' + esc(p.datum) + '">' + date(p.datum) + '</time><div><a href="blogg.html?p=' + encodeURIComponent(p.slug) + '">' + esc(p.titel) + "</a>" + (p.ingress ? "<p>" + esc(p.ingress) + "</p>" : "") + "</div></li>";
  }
  function cover(p){ return p.omslag || (p.bilder[0] && p.bilder[0].bild) || ""; }
  function grid(xs){
    return '<div class="projects">' + xs.map(function(p){
      return '<a href="foto.html?p=' + encodeURIComponent(p.slug) + '"><img src="' + esc(cover(p)) + '" alt="" loading="lazy"><h3>' + esc(t(p.titel)) + '</h3><p class="meta">' + esc(p.ar) + "</p></a>";
    }).join("") + "</div>";
  }

  /* Startsidan */
  function home(){
    set("intro", t(C.intro) ? '<p class="intro">' + t(C.intro) + "</p>" : "");
    set("om-text", t(C.om));

    set("forskning-list", list("forskning").map(function(p){
      return '<article class="project"><h3>' + esc(t(p.titel)) + "</h3>" + (t(p.status) ? '<p class="meta">' + esc(t(p.status)) + "</p>" : "") + t(p.text) + "</article>";
    }).join(""));
    show("forskning", list("forskning").length);

    set("texter-list", Object.keys(TYP).map(function(k){
      var xs = list("texter").filter(function(x){ return x.typ === k; }).sort(function(a, b){ return String(b.ar).localeCompare(String(a.ar)); });
      return xs.length ? '<div class="pubgroup"><h3>' + t(TYP[k]) + '</h3><ul class="pubs">' + xs.map(function(x){
        return "<li>" + x.html + (x.lank ? ' <a href="' + esc(x.lank) + '">' + tx("Länk", "Link") + "</a>" : "") + "</li>"; }).join("") + "</ul></div>" : "";
    }).join(""));
    show("texter", list("texter").length);

    var ps = list("inlagg");
    set("senaste", '<ul class="postlist">' + ps.slice(0, 3).map(item).join("") + '</ul><a class="more" href="blogg.html">' + tx("Alla inlägg", "All posts") + "</a>");
    show("blogg", ps.length);

    var fs = list("foto");
    guard(set("fotoprojekt", grid(fs.slice(0, 4)) + '<p class="more-wrap"><a class="more" href="foto.html">' + tx("Alla fotoprojekt", "All photo projects") + "</a></p>"));
    show("foto", fs.length);

    set("cv-list", Object.keys(AVS).map(function(k){
      var xs = list("cv").filter(function(x){ return x.avsnitt === k; });
      return xs.length ? "<h3>" + t(AVS[k]) + "</h3><dl>" + xs.map(function(x){ return "<dt>" + esc(x.period) + "</dt><dd>" + t(x.text) + "</dd>"; }).join("") + "</dl>" : "";
    }).join("") + (C.cv_pdf ? '<p><a href="' + esc(C.cv_pdf) + '">' + tx("Ladda ner fullständigt cv (pdf)", "Download full CV (pdf)") + "</a></p>" : ""));
    show("cv", list("cv").length || C.cv_pdf);

    set("sociala", (C.epost ? '<p><a href="mailto:' + esc(C.epost) + '">' + esc(C.epost) + "</a></p>" : "") + social());
    document.title = C.namn + (t(C.roll) ? ", " + t(C.roll) : "");
  }

  /* Bloggen */
  function blog(){
    var ps = list("inlagg"), p = q && ps.filter(function(x){ return x.slug === q; })[0];
    if(p){
      document.title = p.titel + " – " + C.namn;
      set("view", '<article class="post narrow" lang="' + esc(p.sprak) + '"><h1>' + esc(p.titel) + '</h1><p class="dateline"><time datetime="' + esc(p.datum) + '">' + date(p.datum) + "</time></p>" +
        (p.ingress ? '<p class="lede">' + esc(p.ingress) + "</p>" : "") + '<div class="body">' + p.html + "</div>" +
        '<p class="back"><a href="blogg.html">' + tx("Alla inlägg", "All posts") + "</a></p></article>");
    } else {
      document.title = tx("Blogg", "Blog") + " – " + C.namn;
      set("view", "<h2>" + tx("Blogg", "Blog") + "</h2>" + (q ? '<p class="empty">' + tx("Inlägget finns inte. Här är alla inlägg.", "That post does not exist. Here are all posts.") + "</p>" : "") +
        (ps.length ? '<ul class="postlist">' + ps.map(item).join("") + "</ul>" : '<p class="empty">' + tx("Inga inlägg ännu.", "No posts yet.") + "</p>"));
    }
    guard($("view"));
  }

  /* Foto */
  function photo(){
    var all = list("foto"), i = -1;
    all.forEach(function(x, k){ if(x.slug === q) i = k; });
    if(i > -1){
      var p = all[i], prev = all[i - 1], next = all[i + 1];
      document.title = t(p.titel) + " – " + C.namn;
      set("view", '<article><div class="narrow"><h1 class="intro" style="margin-bottom:.4rem">' + esc(t(p.titel)) + '</h1><p class="meta">' + esc(p.ar) + "</p>" + t(p.beskrivning) +
        '</div><div class="series">' + p.bilder.map(function(b){ var cap = t(b.text);
          return '<figure><button type="button" class="zoom" data-cap="' + esc(cap) + '"><img src="' + esc(b.bild) + '" alt="' + esc(cap) + '" loading="lazy"></button>' + (cap ? "<figcaption>" + esc(cap) + "</figcaption>" : "") + "</figure>";
        }).join("") + '</div><nav class="pager">' +
        (prev ? '<a href="foto.html?p=' + encodeURIComponent(prev.slug) + '">' + esc(t(prev.titel)) + "</a>" : "<span></span>") +
        '<a href="foto.html">' + tx("Alla projekt", "All projects") + "</a>" +
        (next ? '<a href="foto.html?p=' + encodeURIComponent(next.slug) + '">' + esc(t(next.titel)) + "</a>" : "<span></span>") + "</nav></article>");
    } else {
      document.title = tx("Fotografier", "Photographs") + " – " + C.namn;
      set("view", "<h2>" + tx("Fotografier", "Photographs") + "</h2>" + (all.length ? grid(all) : '<p class="empty">' + tx("Inga projekt ännu.", "No projects yet.") + "</p>"));
    }
    guard($("view"));
  }

  /* Ljuslåda */
  var dlg = document.createElement("dialog");
  dlg.innerHTML = '<button type="button" class="close"></button><img src="" alt=""><p></p>';
  document.body.appendChild(dlg);
  document.addEventListener("click", function(e){
    var b = e.target.closest("button.zoom"); if(!b || !dlg.showModal) return;
    dlg.querySelector("img").src = b.querySelector("img").src;
    dlg.querySelector("p").textContent = b.dataset.cap || "";
    dlg.querySelector(".close").textContent = tx("Stäng", "Close");
    dlg.showModal();
  });
  dlg.addEventListener("click", function(e){ if(e.target === dlg || e.target.classList.contains("close")) dlg.close(); });

  /* Språk och rendering */
  function render(){ side(); foot(); if(page === "home") home(); else if(page === "blogg") blog(); else if(page === "foto") photo(); }
  function setLang(l){ html.setAttribute("data-lang", l); html.lang = l; try{ localStorage.setItem("lang", l); }catch(e){} render(); }
  document.addEventListener("click", function(e){ var b = e.target.closest(".lang button"); if(b) setLang(b.dataset.set); });
  var saved = null; try{ saved = localStorage.getItem("lang"); }catch(e){}
  setLang(saved || ((navigator.language || "sv").slice(0, 2) === "sv" ? "sv" : "en"));

  /* Markera aktuell sektion på startsidan */
  if(page === "home" && "IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return;
      document.querySelectorAll(".side nav a").forEach(function(a){ a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id); });
    }); }, {rootMargin:"-40% 0px -55% 0px"});
    document.querySelectorAll("main section").forEach(function(s){ io.observe(s); });
  }
})();
