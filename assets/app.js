/* Ina Yoon fan page: renders everything from data/content.js and data/live.json */
(function () {
  "use strict";
  var D = window.IY;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  /* Source numbering: stable order of first use */
  var order = [];
  function num(id) {
    var i = order.indexOf(id);
    if (i < 0) { order.push(id); i = order.length - 1; }
    return i + 1;
  }
  function srcLine(ids) {
    if (!ids || !ids.length) return null;
    var p = el("p", { class: "src" }, [ids.length > 1 ? "Sources " : "Source "]);
    ids.forEach(function (id) {
      var s = D.SOURCES[id];
      if (!s) return;
      p.appendChild(el("a", { href: s.url, target: "_blank", rel: "noopener", title: s.label, "aria-label": "Source " + num(id) + ": " + s.label, text: String(num(id)) }));
    });
    return p;
  }

  /* Intro */
  $("kicker").textContent = D.profile.kicker;
  $("name").textContent = D.profile.name;
  $("quote").textContent = D.profile.quote;
  $("quote").parentNode.insertBefore(srcLine(D.profile.quoteSrc), $("facts"));
  D.profile.facts.forEach(function (f) {
    $("facts").appendChild(el("div", null, [el("dt", { text: f.k }), el("dd", { text: f.v }), srcLine(f.src)]));
  });

  /* Stats */
  D.stats.forEach(function (s) {
    $("stats").appendChild(el("div", { class: "stat " + s.tone }, [
      el("b", { text: s.v }), el("div", { class: "k", text: s.k }), el("div", { class: "n", text: s.note }), srcLine(s.src)
    ]));
  });

  /* Bio and timeline */
  D.bio.forEach(function (b) { $("bio").appendChild(el("p", { text: b.t })); $("bio").appendChild(srcLine(b.src)); });
    D.timeline.forEach(function (t) {
    $("timeline").appendChild(el("li", null, [el("span", { class: "y", text: t.y }), el("p", { text: t.t }), srcLine(t.src)]));
  });

  /* Results tabs */
  function finishClass(f) {
    if (f === "CUT" || f === "Unclear") return "fin cut";
    if (f === "In progress") return "fin now";
    var n = parseInt(String(f).replace("T", ""), 10);
    return n && n <= 10 ? "fin hi" : "fin";
  }
  function seasonTable(key) {
    var S = D.results[key];
    var tb = el("tbody");
    S.rows.forEach(function (r) {
      var flags = r[6] || "";
      var name = el("td", null, [r[1]]);
      if (flags.indexOf("m") >= 0) name.appendChild(el("span", { class: "maj", text: "MAJOR" }));
      var rounds = r[3] + (flags.indexOf("d") >= 0 ? " *" : "");
      tb.appendChild(el("tr", flags.indexOf("live") >= 0 ? { id: "live-row" } : null, [
        el("td", { class: "date", text: r[0] }), name,
        el("td", { class: finishClass(r[2]), text: r[2] }),
        el("td", { class: "rd", text: rounds }),
        el("td", { class: "num", text: r[4] }),
        el("td", { class: "num", text: r[5] || "" })
      ]));
    });
    var table = el("table", null, [
      el("thead", null, [el("tr", null, [
        el("th", { text: "Date" }), el("th", { text: "Tournament" }), el("th", { text: "Finish" }),
        el("th", { text: "Rounds" }), el("th", { class: "num", text: "To par" }), el("th", { class: "num", text: "Earnings" })
      ])]), tb
    ]);
    var box = el("div", null, [el("div", { class: "scroll" }, [table]), el("p", { class: "note", text: S.note })]);
    if (key === "2025") box.appendChild(el("p", { class: "note", text: "Notes: the 2025 Walmart NW Arkansas Championship row shows one round only. The data feed lists the 2025 Mizuho Americas Open as a missed cut but also shows earnings, so her finish there is awaiting a second check." }));
    box.appendChild(srcLine(["lpgaResults", "espn", "rolex"]));
    return box;
  }
  function majorsTable() {
    var tb = el("tbody");
    D.majors.rows.forEach(function (r) {
      tb.appendChild(el("tr", null, [el("td", { text: r[0] }), el("td", { class: finishClass(r[1]), text: r[1] }), el("td", { class: finishClass(r[2]), text: r[2] })]));
    });
    var table = el("table", null, [el("thead", null, [el("tr", null, D.majors.head.map(function (h) { return el("th", { text: h }); }))]), tb]);
    return el("div", null, [el("div", { class: "scroll" }, [table]), srcLine(D.majors.src)]);
  }
  function klpgaPanel() {
    var wins = el("div", { class: "wins" });
    D.klpga.wins.forEach(function (w) {
      wins.appendChild(el("div", { class: "win" }, [el("span", { class: "d", text: w.d }), el("h4", { text: w.n }), el("p", { text: w.s + ". " + w.m + "." }), srcLine(w.src)]));
    });
    return el("div", null, [wins, el("p", { class: "note", text: D.klpga.season2024 }), srcLine(D.klpga.season2024Src)]);
  }
  function schedulePanel() {
    var tb = el("tbody");
    D.schedule.rows.forEach(function (r) { tb.appendChild(el("tr", null, [el("td", { class: "date", text: r[0] }), el("td", { text: r[1] })])); });
    return el("div", null, [el("div", { class: "scroll" }, [el("table", null, [tb])]), el("p", { class: "note", text: D.schedule.note })]);
  }
  var views = [
    { id: "2026", label: "2026", make: function () { return seasonTable("2026"); } },
    { id: "2025", label: "2025", make: function () { return seasonTable("2025"); } },
    { id: "majors", label: "Majors", make: majorsTable },
    { id: "klpga", label: "KLPGA wins", make: klpgaPanel },
    { id: "next", label: "Coming up", make: schedulePanel }
  ];
  var built = {};
  function show(id) {
    views.forEach(function (v) {
      $("tab-" + v.id).setAttribute("aria-selected", v.id === id ? "true" : "false");
    });
    var panel = $("results-panel");
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    panel.appendChild(built[id]);
  }
  views.forEach(function (v) {
    built[v.id] = v.make();
    var b = el("button", { type: "button", role: "tab", id: "tab-" + v.id, "aria-controls": "results-panel", text: v.label });
    b.addEventListener("click", function () { show(v.id); });
    $("tabs").appendChild(b);
  });
  show("2026");

  /* Deep cuts and team */
  D.deepCuts.forEach(function (c) {
    $("cuts").appendChild(el("article", { class: "cut " + (c.tone === "navy" ? "" : c.tone) }, [
      el("span", { class: "tag", text: c.tag }), el("h3", { text: c.h }), el("p", { text: c.t }), srcLine(c.src)
    ]));
  });
  D.team.forEach(function (m) {
    $("team").appendChild(el("div", { class: "mate" }, [el("span", { class: "role", text: m.role }), el("h4", { text: m.name }), el("p", { text: m.t }), srcLine(m.src)]));
  });

  /* Bag */
  $("bag-asof").textContent = D.bag.asOf;
  D.bag.current.forEach(function (c) {
    $("bag-list").appendChild(el("div", { class: "club" + (c.unknown ? " unknown" : "") }, [
      el("div", { class: "slot", text: c.slot }),
      el("div", null, [el("div", { class: "item", text: c.item }), c.note ? el("p", { class: "cn", text: c.note }) : null, srcLine(c.src)])
    ]));
  });
  D.bag.story.forEach(function (s) {
    $("bag-story").appendChild(el("article", null, [el("h3", { text: s.h }), el("p", { text: s.t }), srcLine(s.src)]));
  });
  var dist = el("div", { class: "dist" }, [el("h3", { text: "Driving distance by season" })]);
  D.bag.numbers.forEach(function (n) {
    dist.appendChild(el("div", { class: "row" }, [el("span", { text: n.k }), el("span", { text: n.v })]));
  });
  dist.appendChild(srcLine(D.bag.numbers.map(function (n) { return n.src[0]; })));
  $("bag-numbers").appendChild(dist);
  $("bag-old").appendChild(el("summary", { text: D.bag.old.label }));
  $("bag-old").appendChild(el("ul", null, D.bag.old.items.map(function (i) { return el("li", { text: i }); })));
  $("bag-old").appendChild(srcLine(D.bag.old.src));

  /* Videos: thumbnail first, player loads only on click */
  D.videos.forEach(function (v) {
    var frame = el("div", { class: "frame" });
    var btn = el("button", { type: "button", "aria-label": "Play video: " + v.t }, [
      el("img", { src: "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg", alt: "", loading: "lazy" }),
      el("span", { class: "play", text: "▶ Play" })
    ]);
    btn.addEventListener("click", function () {
      var f = el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0",
        title: v.t, allow: "accelerometer; autoplay; encrypted-media; picture-in-picture", allowfullscreen: ""
      });
      frame.removeChild(btn); frame.appendChild(f);
    });
    frame.appendChild(btn);
    $("videos").appendChild(el("div", { class: "vid" }, [
      frame, el("h4", { text: v.t }),
      el("p", null, [v.c + " · " + v.d + " · ", el("a", { href: "https://www.youtube.com/watch?v=" + v.id, target: "_blank", rel: "noopener", text: "Open on YouTube" })])
    ]));
  });
  D.links.forEach(function (l) {
    $("links").appendChild(el("a", { class: "link", href: l.url, target: "_blank", rel: "noopener" }, [el("b", { text: l.h }), el("span", { text: l.t })]));
  });

  /* Sources list, in order of first use */
  order.forEach(function (id) {
    var s = D.SOURCES[id];
    $("source-list").appendChild(el("li", { id: "src-" + (order.indexOf(id) + 1) }, [el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.label })]));
  });
  $("verified").textContent = "Content last verified October 4, 2026.";

  /* Live card */
  function fmtET(iso, opts) {
    try { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "America/New_York" }, opts)).format(new Date(iso)) + " ET"; }
    catch (e) { return ""; }
  }
  function fmtDay(d) {
    var p = String(d || "").slice(0, 10).split("-");
    if (p.length < 3) return "";
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10);
  }
  function renderLive(L, stale) {
    var box = $("live");
    while (box.firstChild) box.removeChild(box.firstChild);
    var st = L.state, badge, on = false;
    if (st === "in") { badge = "On the course now"; on = true; }
    else if (st === "pre") { badge = "Playing this week"; }
    else if (st === "post") { badge = "Latest result"; }
    else { badge = "Off this week"; }
    box.appendChild(el("span", { class: "badge" }, [el("span", { class: "dot" + (on ? " on" : "") }), badge]));

    if (L.event && st !== "none") {
      box.appendChild(el("h2", { text: String(L.event.name).replace(/ pres\.? by .*$/i, "") }));
      var days = fmtDay(L.event.start) && fmtDay(L.event.end) ? fmtDay(L.event.start) + " to " + fmtDay(L.event.end) : "";
      var where = [L.event.course, days].filter(Boolean).join(" · ");
      box.appendChild(el("p", { class: "where", text: where }));
      var third;
      if (st === "in") third = { b: L.thru ? String(L.thru) : "0", s: "Thru, round " + L.round };
      else if (st === "pre" && L.teeTime) third = { b: fmtET(L.teeTime, { hour: "numeric", minute: "2-digit" }).replace(" ET", ""), s: "R" + L.round + " tee time, ET", small: true };
      else third = { b: L.total ? String(L.total) : "", s: "Total strokes" };
      box.appendChild(el("div", { class: "nums" }, [
        el("div", { class: "num" }, [el("b", { text: L.position || "" }), el("span", { text: "Position" })]),
        el("div", { class: "num hi" }, [el("b", { text: L.toPar || "" }), el("span", { text: "To par" })]),
        el("div", { class: "num" + (third.small ? " sm" : "") }, [el("b", { text: third.b }), el("span", { text: third.s })])
      ]));
      if (L.rounds && L.rounds.length) box.appendChild(el("p", { class: "rounds", text: "Rounds: " + L.rounds.join(" · ") + (L.statusText ? "  (" + L.statusText + ")" : "") }));
    } else {
      box.appendChild(el("h2", { text: L.away ? "Not in this week's field" : "No tournament this week" }));
      if (L.away) box.appendChild(el("p", { class: "where", text: "On tour this week: " + L.away }));
    }
    if (L.next && L.next.name && st !== "pre" && st !== "in") {
      box.appendChild(el("p", { class: "rounds", text: "Next on the LPGA schedule: " + L.next.name + ", " + fmtDay(L.next.start) + " to " + fmtDay(L.next.end) }));
    }
    var meta = el("p", { class: "meta" }, [
      el("span", { text: (stale ? "Saved snapshot from " : "Score last changed ") + fmtET(L.updated, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
      el("a", { href: "https://www.lpga.com/athletes/ina-yoon/102401/overview", target: "_blank", rel: "noopener", text: "Official scoring on LPGA.com" })
    ]);
    box.appendChild(meta);
  }
  /* Keep the in-progress results row in step with the live file */
  function syncRow(L) {
    var row = built["2026"] && built["2026"].querySelector("#live-row");
    if (!row || !L.event || String(L.event.id) !== String(D.results["2026"].liveEvent)) return;
    var c = row.children;
    var fin = L.state === "post" ? (L.position || "") : "In progress";
    c[2].textContent = fin; c[2].className = finishClass(fin);
    if (L.rounds && L.rounds.length) c[3].textContent = L.rounds.join(" ");
    if (L.toPar) c[4].textContent = L.toPar;
  }
  renderLive(D.liveFallback, true);
  function loadLive() {
    fetch("data/live.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
      .then(function (L) { if (L && L.updated) { renderLive(L, false); syncRow(L); } })
      .catch(function () { /* keep the saved snapshot */ });
  }
  loadLive();
  setInterval(loadLive, 5 * 60 * 1000);
})();
