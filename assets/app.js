/* Ina Yoon fan page: renders every page from data/content.js and data/live.json.
   Each block runs only if its target element exists, so index.html, story.html
   and sources.html all share this one file. */
(function () {
  "use strict";
  var D = window.IY;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  function ext(url, text, cls) {
    return el("a", { href: url, target: "_blank", rel: "noopener", class: cls || "", text: text });
  }
  /* Quiet attribution, used only where a story clearly comes from a publication: "via Outlet and Outlet" */
  function via(ids) {
    var seen = {};
    var list = (ids || []).map(function (id) { return D.SOURCES[id]; }).filter(function (s) {
      if (!s) return false;
      var name = s.label.split(",")[0];
      if (seen[name]) return false;
      seen[name] = true; return true;
    }).slice(0, 2);
    if (!list.length) return null;
    var p = el("p", { class: "via" }, ["via "]);
    list.forEach(function (s, i) {
      if (i) p.appendChild(document.createTextNode(" and "));
      p.appendChild(ext(s.url, s.label.split(",")[0]));
    });
    return p;
  }
  function fmtDay(d) {
    var p = String(d || "").slice(0, 10).split("-");
    if (p.length < 3) return "";
    return MONTHS[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10);
  }
  function fmtDate(d) { var day = fmtDay(d); return day ? day + ", " + String(d).slice(0, 4) : ""; }
  function photo(slot, key, cls) {
    var P = D.photos && D.photos[key];
    if (!slot) return;
    if (!P || !P.src) { slot.hidden = true; return; }
    var img = el("img", { src: P.src, alt: P.alt || "" });
    img.addEventListener("error", function () { slot.hidden = true; });
    slot.className = cls;
    slot.appendChild(img);
    if (P.credit) slot.appendChild(el("figcaption", { text: "Photo: " + P.credit }));
  }

  /* Intro */
  if ($("name")) {
    $("kicker").textContent = D.profile.kicker;
    $("name").textContent = D.profile.name;
    $("quote").textContent = D.profile.quote;
    D.profile.facts.forEach(function (f) {
      $("facts").appendChild(el("div", null, [el("dt", { text: f.k }), el("dd", { text: f.v })]));
    });
    photo($("photo"), "main", "photo");
  }

  /* Stats */
  if ($("stats")) D.stats.forEach(function (s) {
    $("stats").appendChild(el("div", { class: "stat " + s.tone }, [
      el("b", { text: s.v }), el("div", { class: "k", text: s.k }), el("div", { class: "n", text: s.note })
    ]));
  });

  /* Story page: biography and timeline */
  if ($("bio")) {
    D.bio.forEach(function (b) { $("bio").appendChild(el("p", { text: b.t })); });
    photo($("story-photo"), "story", "photo tall");
  }
  if ($("timeline")) D.timeline.forEach(function (t) {
    $("timeline").appendChild(el("li", null, [el("span", { class: "y", text: t.y }), el("p", { text: t.t })]));
  });

  /* Results tabs */
  function finishClass(f) {
    if (f === "CUT" || f === "Unclear") return "fin cut";
    if (f === "In progress") return "fin now";
    var n = parseInt(String(f).replace("T", ""), 10);
    return n && n <= 10 ? "fin hi" : "fin";
  }
  var built = {};
  if ($("tabs")) {
    var seasonTable = function (key) {
      var S = D.results[key];
      var tb = el("tbody");
      S.rows.forEach(function (r) {
        var flags = r[6] || "";
        var name = el("td", null, [r[1]]);
        if (flags.indexOf("m") >= 0) name.appendChild(el("span", { class: "maj", text: "MAJOR" }));
        tb.appendChild(el("tr", flags.indexOf("live") >= 0 ? { id: "live-row" } : null, [
          el("td", { class: "date", text: r[0] }), name,
          el("td", { class: finishClass(r[2]), text: r[2] }),
          el("td", { class: "rd", text: r[3] + (flags.indexOf("d") >= 0 ? " *" : "") }),
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
      if (S.note2) box.appendChild(el("p", { class: "note", text: S.note2 }));
      return box;
    };
    var majorsTable = function () {
      var tb = el("tbody");
      D.majors.rows.forEach(function (r) {
        tb.appendChild(el("tr", null, [el("td", { text: r[0] }), el("td", { class: finishClass(r[1]), text: r[1] }), el("td", { class: finishClass(r[2]), text: r[2] })]));
      });
      var table = el("table", null, [el("thead", null, [el("tr", null, D.majors.head.map(function (h) { return el("th", { text: h }); }))]), tb]);
      return el("div", null, [el("div", { class: "scroll" }, [table])]);
    };
    var klpgaPanel = function () {
      var wins = el("div", { class: "wins" });
      D.klpga.wins.forEach(function (w) {
        wins.appendChild(el("div", { class: "win" }, [el("span", { class: "d", text: w.d }), el("h4", { text: w.n }), el("p", { text: w.s + ". " + w.m + "." })]));
      });
      return el("div", null, [wins, el("p", { class: "note", text: D.klpga.season2024 })]);
    };
    var schedulePanel = function () {
      var tb = el("tbody");
      D.schedule.rows.forEach(function (r) { tb.appendChild(el("tr", null, [el("td", { class: "date", text: r[0] }), el("td", { text: r[1] })])); });
      return el("div", null, [el("div", { class: "scroll" }, [el("table", null, [tb])]), el("p", { class: "note", text: D.schedule.note })]);
    };
    var views = [
      { id: "2026", label: "2026", make: function () { return seasonTable("2026"); } },
      { id: "2025", label: "2025", make: function () { return seasonTable("2025"); } },
      { id: "majors", label: "Majors", make: majorsTable },
      { id: "klpga", label: "KLPGA wins", make: klpgaPanel },
      { id: "next", label: "Coming up", make: schedulePanel }
    ];
    var show = function (id) {
      views.forEach(function (v) { $("tab-" + v.id).setAttribute("aria-selected", v.id === id ? "true" : "false"); });
      var panel = $("results-panel");
      while (panel.firstChild) panel.removeChild(panel.firstChild);
      panel.appendChild(built[id]);
    };
    views.forEach(function (v) {
      built[v.id] = v.make();
      var b = el("button", { type: "button", role: "tab", id: "tab-" + v.id, "aria-controls": "results-panel", text: v.label });
      b.addEventListener("click", function () { show(v.id); });
      $("tabs").appendChild(b);
    });
    show("2026");
  }

  /* Deep cuts and team */
  if ($("cuts")) D.deepCuts.forEach(function (c) {
    $("cuts").appendChild(el("article", { class: "cut " + (c.tone === "navy" ? "" : c.tone) }, [
      el("span", { class: "tag", text: c.tag }), el("h3", { text: c.h }), el("p", { text: c.t }), via(c.src)
    ]));
  });
  if ($("fan") && D.fanClub) {
    var F = D.fanClub;
    var tiles = el("div", { class: "fan-tiles" });
    F.tiles.forEach(function (t) {
      tiles.appendChild(el("div", { class: "fan-tile" }, [el("b", { text: t.v }), el("span", { class: "k", text: t.k }), el("span", { class: "n", text: t.n })]));
    });
    $("fan").appendChild(el("div", { class: "fan-text" }, [
      el("span", { class: "tag", text: "Shout-out" }), el("h3", { text: "To " + F.name + ", her fan club" }),
      el("p", { text: F.lead }), el("p", { text: F.charity }),
      F.url ? el("p", { class: "more" }, [ext(F.url, F.urlLabel)]) : null, via(F.src.slice(0, 1).concat(F.src.slice(3, 4)))
    ]));
    $("fan").appendChild(tiles);
  }
  if ($("team")) D.team.forEach(function (m) {
    $("team").appendChild(el("div", { class: "mate" }, [el("span", { class: "role", text: m.role }), el("h4", { text: m.name }), el("p", { text: m.t })]));
  });

  /* Bag */
  if ($("bag-list")) {
    $("bag-asof").textContent = D.bag.asOf;
    D.bag.current.forEach(function (c) {
      $("bag-list").appendChild(el("div", { class: "club" + (c.unknown ? " unknown" : "") }, [
        el("div", { class: "slot", text: c.slot }),
        el("div", null, [el("div", { class: "item", text: c.item }), c.note ? el("p", { class: "cn", text: c.note }) : null])
      ]));
    });
    D.bag.story.forEach(function (s) {
      $("bag-story").appendChild(el("article", null, [el("h3", { text: s.h }), el("p", { text: s.t }), via(s.src)]));
    });
    var dist = el("div", { class: "dist" }, [el("h3", { text: "Driving distance by season" })]);
    D.bag.numbers.forEach(function (n) {
      dist.appendChild(el("div", { class: "row" }, [el("span", { text: n.k }), el("span", { text: n.v })]));
    });
    $("bag-numbers").appendChild(dist);
    $("bag-old").appendChild(el("summary", { text: D.bag.old.label }));
    $("bag-old").appendChild(el("ul", null, D.bag.old.items.map(function (i) { return el("li", { text: i }); })));
  }

  /* Videos: newest first by event date. Thumbnail first, player loads only on click. */
  if ($("videos")) {
    D.videos.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); }).forEach(function (v) {
      var frame = el("div", { class: "frame" });
      var btn = el("button", { type: "button", "aria-label": "Play video: " + v.t }, [
        el("img", { src: "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg", alt: "", loading: "lazy" }),
        el("span", { class: "play", text: "▶ Play" })
      ]);
      btn.addEventListener("click", function () {
        frame.removeChild(btn);
        frame.appendChild(el("iframe", {
          src: "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0",
          title: v.t, allow: "accelerometer; autoplay; encrypted-media; picture-in-picture", allowfullscreen: ""
        }));
      });
      frame.appendChild(btn);
      $("videos").appendChild(el("div", { class: "vid" }, [
        frame, el("span", { class: "vdate", text: fmtDate(v.date) }), el("h4", { text: v.t }),
        el("p", null, [v.c + " · " + v.d + " · ", ext("https://www.youtube.com/watch?v=" + v.id, "Open on YouTube")])
      ]));
    });
  }
  if ($("links")) D.links.forEach(function (l) {
    $("links").appendChild(el("a", { class: "link", href: l.url, target: "_blank", rel: "noopener" }, [el("b", { text: l.h }), el("span", { text: l.t })]));
  });

  /* Sources page: grouped by the part of the site each source supports */
  if ($("source-groups")) {
    var collect = function (items) {
      var ids = [];
      (items || []).forEach(function (it) {
        var list = Array.isArray(it) ? it : (it && Array.isArray(it.src) ? it.src : []);
        list.forEach(function (id) { if (D.SOURCES[id] && ids.indexOf(id) < 0) ids.push(id); });
      });
      return ids;
    };
    var groups = [
      ["Profile and key numbers", collect([D.profile.quoteSrc].concat(D.profile.facts, D.stats))],
      ["Her story", collect(D.bio.concat(D.timeline))],
      ["Results", collect([["lpgaResults", "espn", "rolex"], D.majors.src, D.klpga.season2024Src].concat(D.klpga.wins))],
      ["Deep cuts and the fan club", collect(D.deepCuts.concat([D.fanClub]))],
      ["Her team", collect(D.team)],
      ["The bag", collect(D.bag.current.concat(D.bag.story, D.bag.numbers, [D.bag.old.src]))]
    ];
    groups.forEach(function (g) {
      var ul = el("ul");
      g[1].forEach(function (id) { ul.appendChild(el("li", null, [ext(D.SOURCES[id].url, D.SOURCES[id].label)])); });
      $("source-groups").appendChild(el("section", { class: "sgroup" }, [el("h3", { text: g[0] }), ul]));
    });
  }
  if ($("verified")) $("verified").textContent = "Content last verified October 4, 2026.";

  /* Live card */
  if (!$("live")) return;
  function fmtET(iso, opts) {
    try { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "America/New_York" }, opts)).format(new Date(iso)) + " ET"; }
    catch (e) { return ""; }
  }
  function renderLive(L, stale) {
    var box = $("live");
    while (box.firstChild) box.removeChild(box.firstChild);
    var st = L.state, badge, on = false;
    if (st === "in") { badge = "On the course now"; on = true; }
    else if (st === "pre") { badge = "Playing this week"; }
    else if (st === "post") { badge = "Latest result"; }
    else { badge = "Off this week"; }
    box.appendChild(el("span", { class: "badge" }, [el("span", { class: "dot" + (on ? " on" : "") }), "Live scoring · " + badge]));

    if (L.event && st !== "none") {
      box.appendChild(el("h2", { text: String(L.event.name).replace(/ pres\.? by .*$/i, "") }));
      var days = fmtDay(L.event.start) && fmtDay(L.event.end) ? fmtDay(L.event.start) + " to " + fmtDay(L.event.end) : "";
      box.appendChild(el("p", { class: "where", text: [L.event.course, days].filter(Boolean).join(" · ") }));
      var third;
      if (st === "in" && L.today) third = { b: L.today, s: "Today, thru " + (L.thru || 0) };
      else if (st === "in") third = { b: L.thru ? String(L.thru) : "0", s: "Thru, round " + L.round };
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
    box.appendChild(el("p", { class: "meta" }, [
      el("span", { text: (stale ? "Saved snapshot from " : "Score last changed ") + fmtET(L.updated, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }),
      ext("https://www.lpga.com/athletes/ina-yoon/102401/overview", "Official scoring on LPGA.com")
    ]));
  }
  /* Keep the in-progress results row in step with the live file */
  function syncRow(L) {
    var row = built["2026"] && built["2026"].querySelector("#live-row");
    var want = String(D.results["2026"].liveEvent);
    var E = L.event && String(L.event.id) === want ? L : (L.last && String(L.last.id) === want ? L.last : null);
    if (!row || !E) return;
    var c = row.children;
    var fin = E === L.last || L.state === "post" ? (E.position || "") : "In progress";
    c[2].textContent = fin; c[2].className = finishClass(fin);
    if (E.rounds && E.rounds.length) c[3].textContent = E.rounds.join(" ");
    if (E.toPar) c[4].textContent = E.toPar;
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
