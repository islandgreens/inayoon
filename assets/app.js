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

  /* Cheer bar: scoreboard, weekly goal and a headline that follows the tournament.
     Counts come from the Cloudflare Worker; the bar stays hidden until D.api is set and reachable. */
  var cheerFromLive = null;
  if ($("cheer") && D.api) {
    var cheerBox = $("cheer"), busy = false, weekCount = 0, liveForCheer = null;
    var GOAL = D.cheerGoal || 100, H = D.cheerHeadlines || {};
    var num = function (n) { return Number(n || 0).toLocaleString("en-US"); };
    var fill = function (t) { return String(t || "").replace(/\{goal\}/g, num(GOAL)); };
    var cLabel = el("span", { class: "cheer-label", text: "Go Ina!" });
    var cBtn = el("button", { type: "button", class: "cheer-btn" }, [el("span", { class: "ball", "aria-hidden": "true" }), cLabel]);
    var board = el("div", { class: "board", "aria-hidden": "true" });
    var boardWrap = el("div", { class: "board-wrap" }, [board, el("span", { class: "board-label", text: "Cheers this week" })]);
    var cHead = el("p", { class: "cheer-head" });
    var cSub = el("p", { class: "cheer-sub" });
    var bar = el("div", { class: "goal-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(GOAL) }, [el("i")]);
    var cMeta = el("p", { class: "cheer-meta" });
    var cNote = el("p", { class: "cheer-note", "aria-live": "polite" });
    var lines = D.cheerLines || ["Cheer sent!"], lastLine = -1;
    var nextLine = function () {
      var i = Math.floor(Math.random() * lines.length);
      if (lines.length > 1 && i === lastLine) i = (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length;
      lastLine = i;
      return lines[i];
    };
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var placeWords = function (pos) {
      var n = parseInt(String(pos || "").replace("T", ""), 10);
      if (isNaN(n)) return "";
      var suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] || "th");
      return (/^T/.test(pos) ? "tied " : "") + n + suffix;
    };
    /* Pick the headline and the small line from the live card's data */
    var headline = function () {
      var L = liveForCheer, key = "offWeek", sub = "";
      var nameOf = function (n) { return String(n || "").replace(/ pres\.? by .*$/i, ""); };
      if (L && L.event && (L.state === "in" || L.state === "pre")) {
        var R = L.event.numberOfRounds || 4, r = L.round || 1, played = L.rounds && L.rounds.length;
        if (L.state === "pre" && !played) {
          key = "preEvent";
          var start = new Date(String(L.event.start) + "T12:00:00Z");
          var startsToday = String(L.event.start) <= new Date().toISOString().slice(0, 10);
          sub = nameOf(L.event.name) + (startsToday ? " starts today" : " starts " + WEEKDAYS[start.getUTCDay()]);
        } else {
          key = r >= R ? "finalRound" : ({ 1: "round1", 2: "round2", 3: "round3" })[r] || "round3";
          sub = L.state === "in" ? (r >= R ? "Final round under way" : "Round " + r + " under way") : (r >= R ? "Final round up next" : "Round " + r + " up next");
        }
      } else if (L && L.event && L.state === "post" && Date.now() - Date.parse(String(L.event.end) + "T23:59:00Z") < 3 * 86400000) {
        key = "afterEvent";
        sub = L.position === "CUT" || L.statusText ? "She missed the cut at the " + nameOf(L.event.name) : "She finished " + (placeWords(L.position) || L.position) + " at the " + nameOf(L.event.name);
      } else {
        key = "offWeek";
        sub = L && L.next && L.next.name ? "Next up: " + nameOf(L.next.name) + ", " + fmtDay(L.next.start) : "Next event to be announced";
      }
      if (weekCount >= GOAL) key = "goalReached";
      cHead.textContent = fill(H[key]);
      cSub.textContent = sub;
    };
    var showCounts = function (c) {
      weekCount = Number(c.week || 0);
      var digits = String(Math.max(0, weekCount));
      var padded = digits.length < 3 ? "000".slice(digits.length) + digits : digits;
      while (board.firstChild) board.removeChild(board.firstChild);
      padded.split("").forEach(function (d, i) {
        board.appendChild(el("b", { class: i < padded.length - digits.length ? "dim" : "", text: d }));
      });
      boardWrap.setAttribute("aria-label", num(weekCount) + " cheers this week");
      var pct = Math.min(100, Math.round((weekCount / GOAL) * 100));
      bar.firstChild.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", String(Math.min(weekCount, GOAL)));
      bar.setAttribute("aria-label", num(weekCount) + " of " + num(GOAL) + " cheers");
      bar.classList.toggle("done", weekCount >= GOAL);
      cMeta.textContent = num(weekCount) + " of " + num(GOAL) + " \u00b7 " + num(c.total) + " all time";
      headline();
    };
    /* Fireworks: particles fly out from the button across the screen, then fall and fade. */
    var burst = function () {
      var r = cBtn.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var layer = el("div", { class: "fx", "aria-hidden": "true" });
      document.body.appendChild(layer);
      var colors = ["#FF5FA2", "#FF8FC0", "#FFD84A", "#FFFFFF", "#FF5FA2"];
      var count = calm ? 16 : 70, longest = 0;
      for (var i = 0; i < count; i++) {
        var size = 8 + Math.round(Math.random() * 10);
        var p = el("i", { class: "fx-p" + (i % 5 === 0 ? " ring" : "") });
        p.style.width = p.style.height = size + "px";
        p.style.left = (cx - size / 2) + "px";
        p.style.top = (cy - size / 2) + "px";
        p.style.color = colors[i % colors.length];
        layer.appendChild(p);
        var ang = Math.random() * Math.PI * 2;
        var dist = calm ? 40 + Math.random() * 50 : 110 + Math.random() * 330;
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - (calm ? 0 : 60);
        var dur = calm ? 900 : 1200 + Math.random() * 800;
        longest = Math.max(longest, dur);
        if (!p.animate) continue;
        if (calm) {
          p.style.transform = "translate(" + dx + "px," + dy + "px)";
          p.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: dur, fill: "forwards" });
        } else {
          p.animate([
            { transform: "translate(0,0) scale(0.4)", opacity: 1 },
            { transform: "translate(" + dx + "px," + dy + "px) scale(1)", opacity: 1, offset: 0.6, easing: "ease-in" },
            { transform: "translate(" + (dx * 1.08) + "px," + (dy + 90) + "px) scale(0.5)", opacity: 0 }
          ], { duration: dur, easing: "cubic-bezier(0.1, 0.7, 0.3, 1)", fill: "forwards" });
        }
      }
      setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, longest + 150);
    };
    /* v12: hourly limit reached. The Worker counts per UTC hour, so the button reopens at the top of the
       next UTC hour, shown in the visitor's own clock (in half-hour zones that reads as :30). */
    var spent = false, reopenAt = 0, reopenTimer = null;
    var reopen = function () {
      if (!spent || Date.now() < reopenAt) return;
      spent = false; clearTimeout(reopenTimer);
      cBtn.classList.remove("spent"); cBtn.disabled = false; cLabel.textContent = "Go Ina!";
      cNote.textContent = "";
    };
    var voiceGone = function () {
      var now = Date.now();
      reopenAt = (Math.floor(now / 3600000) + 1) * 3600000 + 2000; /* 2 s of slack for clock drift */
      spent = true;
      cBtn.classList.add("spent"); cBtn.disabled = true; cLabel.textContent = "Voice gone!";
      var at = new Date(reopenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      cNote.textContent = "Easy, superfan! Save some voice for the back nine. Back at " + at + ".";
      clearTimeout(reopenTimer);
      reopenTimer = setTimeout(reopen, reopenAt - now + 500);
    };
    /* Timers can sleep in background tabs; check again whenever the page comes back. */
    document.addEventListener("visibilitychange", function () { if (!document.hidden) reopen(); });
    window.addEventListener("focus", reopen);
    cBtn.addEventListener("click", function () {
      if (busy || spent) return;
      busy = true; cBtn.disabled = true;
      fetch(D.api + "/cheers", { method: "POST" })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); })
        .then(function (res) {
          if (typeof res.j.total === "number") { showCounts(res.j); board.classList.remove("bump"); void board.offsetWidth; board.classList.add("bump"); }
          if (res.status === 200) { burst(); cNote.textContent = nextLine(); }
          else if (res.status === 429) voiceGone();
          else cNote.textContent = "Cheers are resting. Try again later.";
        })
        .catch(function () { cNote.textContent = "Cheers are resting. Try again later."; })
        .then(function () { setTimeout(function () { busy = false; if (!spent) cBtn.disabled = false; }, 900); });
    });
    cheerBox.appendChild(el("div", { class: "cheer-left" }, [cBtn, boardWrap]));
    cheerBox.appendChild(el("div", { class: "cheer-goal" }, [cHead, cSub, bar, el("div", { class: "cheer-foot" }, [cMeta, cNote])]));
    cheerFromLive = function (L) { liveForCheer = L; headline(); };
    fetch(D.api + "/cheers")
      .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
      .then(function (c) { showCounts(c); cheerBox.hidden = false; })
      .catch(function () { /* Worker unreachable: keep the section hidden */ });
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
  var HOME_LATEST = 12;
  function videoCard(v) {
    var frame = el("div", { class: "frame" });
    var btn = el("button", { type: "button", "aria-label": "Play video: " + v.t }, [
      el("img", { src: "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg", alt: "", loading: "lazy" }),
      el("span", { class: "play", text: "\u25B6 Play" })
    ]);
    btn.addEventListener("click", function () {
      frame.removeChild(btn);
      frame.appendChild(el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0",
        title: v.t, allow: "accelerometer; autoplay; encrypted-media; picture-in-picture", allowfullscreen: ""
      }));
    });
    frame.appendChild(btn);
    return el("div", { class: "vid" }, [
      frame, el("span", { class: "vdate", text: fmtDate(v.date) }), el("h4", { text: v.t }),
      el("p", null, [v.c + " \u00b7 " + v.d + " \u00b7 ", ext("https://www.youtube.com/watch?v=" + v.id, "Open on YouTube")])
    ]);
  }
  var allVideos = D.videos.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  if ($("videos")) {
    /* Home page: favorites in their own row, then the newest of the rest */
    var favs = allVideos.filter(function (v) { return v.fav; });
    var rest = allVideos.filter(function (v) { return !v.fav; });
    if ($("videos-fav")) {
      if (favs.length) favs.forEach(function (v) { $("videos-fav").appendChild(videoCard(v)); });
      else $("fav-block").hidden = true;
    } else rest = allVideos;
    rest.slice(0, HOME_LATEST).forEach(function (v) { $("videos").appendChild(videoCard(v)); });
    if ($("videos-more")) $("videos-more").textContent = "See all " + allVideos.length + " videos";
  }
  if ($("videos-all")) {
    /* Videos page: everything, grouped by year */
    var years = [];
    allVideos.forEach(function (v) { var y = String(v.date).slice(0, 4); if (years.indexOf(y) < 0) years.push(y); });
    years.forEach(function (y) {
      var grid = el("div", { class: "videos" });
      allVideos.filter(function (v) { return String(v.date).slice(0, 4) === y; }).forEach(function (v) { grid.appendChild(videoCard(v)); });
      $("videos-all").appendChild(el("h2", { class: "year", text: y }));
      $("videos-all").appendChild(grid);
    });
    if ($("videos-count")) $("videos-count").textContent = allVideos.length + " videos, newest first. They play from the official and broadcaster channels on YouTube, and many are in Korean.";
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
  if ($("verified")) $("verified").textContent = "Content last verified October 7, 2026.";
  if ($("ver") && D.version) $("ver").textContent = D.version;

  /* Live card */
  if (!$("live")) return;
  function fmtET(iso, opts) {
    try { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: "America/New_York" }, opts)).format(new Date(iso)) + " ET"; }
    catch (e) { return ""; }
  }
  var ticker = null;
  function parWords(p) {
    if (!p) return "";
    if (p === "E") return "even par";
    var n = Math.abs(parseInt(p, 10));
    return isNaN(n) ? "" : n + (String(p).charAt(0) === "-" ? " under" : " over");
  }
  function shortName(n) { return String(n || "").replace(/ pres\.? by .*$/i, ""); }
  /* Three ticking tiles. Days, hours, minutes when far off; hours, minutes, seconds inside the last day. */
  function countdown(target) {
    var wrap = el("div", { class: "nums cd", role: "timer" });
    var tiles = [0, 1, 2].map(function () {
      var b = el("b"), sp = el("span");
      wrap.appendChild(el("div", { class: "num" }, [b, sp]));
      return { b: b, sp: sp };
    });
    var draw = function () {
      var ms = Math.max(0, target - Date.now());
      var d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
      var vals = d > 0 ? [[d, d === 1 ? "day" : "days"], [h, "hrs"], [m, "min"]] : [[h, "hrs"], [m, "min"], [sec, "sec"]];
      vals.forEach(function (v, i) { tiles[i].b.textContent = String(v[0]); tiles[i].sp.textContent = v[1]; });
      return ms;
    };
    draw();
    return { node: wrap, draw: draw };
  }
  function clock(ms) {
    var h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
    var two = function (n) { return (n < 10 ? "0" : "") + n; };
    return (h > 0 ? h + "h " : "") + two(m) + "m " + two(sec) + "s";
  }
  function resultLine(E, statusText) {
    if (!E || !E.name) return "";
    var pos = E.position || "", where = "the " + shortName(E.name);
    var n = parseInt(String(pos).replace("T", ""), 10), tied = /^T/.test(pos);
    var suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] || "th");
    var place = isNaN(n) ? pos : (tied ? "tied " : "") + n + suffix;
    var lead = pos === "CUT" || statusText ? "missed the cut at " + where : (n === 1 && !tied ? "won " + where : (place ? place + " at " + where : where));
    var par = parWords(E.toPar), rounds = E.rounds && E.rounds.length ? " (" + E.rounds.join(" · ") + ")" : "";
    return "Last time out: " + lead + (par ? ", " + par : "") + rounds;
  }
  function renderLive(L, stale) {
    var box = $("live");
    if (ticker) { clearInterval(ticker); ticker = null; }
    while (box.firstChild) box.removeChild(box.firstChild);
    var now = Date.now(), st = L.state;
    var badge = function (text, on) {
      box.appendChild(el("span", { class: "badge" }, [el("span", { class: "dot" + (on ? " on" : "") }), "Live scoring · " + text]));
    };
    var eventHead = function () {
      box.appendChild(el("h2", { text: shortName(L.event.name) }));
      var days = fmtDay(L.event.start) && fmtDay(L.event.end) ? fmtDay(L.event.start) + " to " + fmtDay(L.event.end) : "";
      box.appendChild(el("p", { class: "where", text: [L.event.course, days].filter(Boolean).join(" · ") }));
    };
    var tiles = function (third) {
      box.appendChild(el("div", { class: "nums" }, [
        el("div", { class: "num" }, [el("b", { text: L.position || "" }), el("span", { text: "Position" })]),
        el("div", { class: "num hi" }, [el("b", { text: L.toPar || "" }), el("span", { text: "To par" })]),
        el("div", { class: "num" + (third.small ? " sm" : "") }, [el("b", { text: third.b }), el("span", { text: third.s })])
      ]));
      if (L.rounds && L.rounds.length) box.appendChild(el("p", { class: "rounds", text: "Rounds: " + L.rounds.join(" · ") + (L.statusText ? "  (" + L.statusText + ")" : "") }));
    };
    var tee = L.teeTime ? Date.parse(L.teeTime) : NaN;
    var played = L.rounds && L.rounds.length;
    var nextAt = L.next && L.next.name ? Date.parse(L.next.startTime || (L.next.start + "T04:00:00Z")) : NaN;

    if (st === "in" && L.event) {
      badge("On the course now", true);
      eventHead();
      tiles(L.today ? { b: L.today, s: "Today, thru " + (L.thru || 0) } : { b: L.thru ? String(L.thru) : "0", s: "Thru, round " + L.round });
    } else if (st === "pre" && L.event && !played && tee > now) {
      /* Event week, before her first shot: count down to her tee time */
      badge("Playing this week", false);
      eventHead();
      var c1 = countdown(tee);
      box.appendChild(c1.node);
      box.appendChild(el("p", { class: "rounds", text: "Round " + (L.round || 1) + " tee time: " + fmtET(L.teeTime, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }));
      ticker = setInterval(function () { if (c1.draw() <= 0) { clearInterval(ticker); ticker = null; } }, 1000);
    } else if (st === "pre" && L.event) {
      /* Between rounds */
      badge("Playing this week", false);
      eventHead();
      tiles(L.teeTime ? { b: fmtET(L.teeTime, { hour: "numeric", minute: "2-digit" }).replace(" ET", ""), s: "R" + L.round + " tee time, ET", small: true } : { b: L.total ? String(L.total) : "", s: "Total strokes" });
      if (tee > now) {
        var startsIn = el("p", { class: "rounds", role: "timer" });
        var drawIn = function () { var ms = tee - Date.now(); startsIn.textContent = ms > 0 ? "Round " + L.round + " starts in " + clock(ms) : ""; return ms; };
        drawIn();
        box.appendChild(startsIn);
        ticker = setInterval(function () { if (drawIn() <= 0) { clearInterval(ticker); ticker = null; } }, 1000);
      }
    } else if (nextAt > now) {
      /* Between events: lead with what is next, keep the last result as a smaller line */
      badge("Between events", false);
      box.appendChild(el("h2", { text: "Next up: " + shortName(L.next.name) }));
      box.appendChild(el("p", { class: "where", text: "Next on the LPGA schedule · " + fmtDay(L.next.start) + " to " + fmtDay(L.next.end) }));
      var c2 = countdown(nextAt);
      box.appendChild(c2.node);
      box.appendChild(el("p", { class: "cd-note", text: "Counting down to the first day of the event. Her tee time takes over once pairings are out." }));
      var last = L.away ? "This week: not in the field at the " + shortName(L.away) + "." : resultLine({ name: L.event && L.event.name, position: L.position, toPar: L.toPar, rounds: L.rounds }, L.statusText);
      if (last) box.appendChild(el("p", { class: "last", text: last }));
      ticker = setInterval(function () { if (c2.draw() <= 0) { clearInterval(ticker); ticker = null; } }, 1000);
    } else if (L.event && st !== "none") {
      badge("Latest result", false);
      eventHead();
      tiles({ b: L.total ? String(L.total) : "", s: "Total strokes" });
    } else {
      badge("Off this week", false);
      box.appendChild(el("h2", { text: L.away ? "Not in this week's field" : "No tournament this week" }));
      if (L.away) box.appendChild(el("p", { class: "where", text: "On tour this week: " + shortName(L.away) }));
    }
    if (cheerFromLive) cheerFromLive(L);
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
