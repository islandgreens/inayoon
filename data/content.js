/* Ina Yoon fan page content. Facts carry source ids from SOURCES (videos, schedule and live data do not).
   Edit this file to update the page; layout code never needs to change.
   Content verified on: 2026-10-07 (v7). */
window.IY = (function () {
  const SOURCES = {
    wiki: { label: "Wikipedia: Ina Yoon", url: "https://en.wikipedia.org/wiki/Ina_Yoon" },
    lpga: { label: "LPGA.com player page", url: "https://www.lpga.com/athletes/ina-yoon/102401/overview" },
    lpgaResults: { label: "LPGA.com results", url: "https://www.lpga.com/athletes/ina-yoon/102401/results" },
    lpgaStats: { label: "LPGA.com stats", url: "https://www.lpga.com/athletes/ina-yoon/102401/stats" },
    cme: { label: "LPGA Race to CME Globe", url: "https://www.lpga.com/stats-and-rankings/race-to-cme-globe" },
    rolex: { label: "Rolex Rankings", url: "https://www.rolexrankings.com/players/9296" },
    espn: { label: "ESPN player page", url: "https://www.espn.com/golf/player/_/id/5259423" },
    kpmg: { label: "KPMG Women's PGA player page", url: "https://www.kpmgwomenspgachampionship.com/player/ina-yoon" },
    gc63: { label: "Golf Channel, Jun 2026", url: "https://www.golfchannel.com/pga-of-america/news/ina-yoon-opens-womens-pga-championship-hazeltine-record-tying-63" },
    gnnKpmg: { label: "Golf News Net, Jun 28 2026", url: "https://thegolfnewsnet.com/golfnewsnetteam/2026/06/28/2026-kpmg-womens-pga-championship-final-results-prize-money-payout-lpga-tour-leaderboard-and-how-much-each-golfer-won-143651/" },
    gnnChevron: { label: "Golf News Net, Apr 26 2026", url: "https://thegolfnewsnet.com/golfnewsnetteam/2026/04/26/2026-the-chevron-championship-final-results-prize-money-payout-lpga-tour-leaderboard-and-how-much-each-golfer-won-142464/" },
    aig: { label: "AIG Women's Open player page", url: "https://www.aigwomensopen.com/players/ina-yoon" },
    usga: { label: "US Women's Open player page", url: "https://www.uswomensopen.com/players/68273.html" },
    kjdWin22: { label: "Korea JoongAng Daily, Jul 2022", url: "https://www.koreajoongangdaily.com/sports/rookie-yoon-ina-wins-her-first-klpga-title-at-evercollagen-queens-crown/11480452" },
    kjdBan: { label: "Korea JoongAng Daily, Sep 2022", url: "https://www.koreajoongangdaily.com/sports/golfer-yoon-ina-banned-for-three-years-after-playing-wrong-ball/10882941" },
    kjdReduce: { label: "Korea JoongAng Daily, Jan 2024", url: "https://www.koreajoongangdaily.com/sports/golfer-suspended-for-playing-wrong-ball-to-rejoin-klpga-this-year/12483504" },
    kjdReturn: { label: "Korea JoongAng Daily, Apr 2024", url: "https://www.koreajoongangdaily.com/sports/yoon-ina-golfer-banned-for-playing-wrong-ball-returns-this-week/12445935" },
    kjdAwards: { label: "Korea JoongAng Daily, Nov 2024", url: "https://www.koreajoongangdaily.com/sports/yoon-ina-scores-big-with-3-prizes-at-klpga-awards-ceremony/12401107" },
    kjdQ: { label: "Korea JoongAng Daily, Dec 2024", url: "https://www.koreajoongangdaily.com/sports/korean-golfer-once-banned-for-playing-wrong-ball-earns-lpga-tour-card/12307886" },
    kjd2025: { label: "Korea JoongAng Daily, Nov 2025", url: "https://www.koreajoongangdaily.com/sports/once-dominant-yoon-ina-looks-to-rebound-from-first-year-struggles-on-lpga-tour/12022287" },
    kjdWtgl: { label: "Korea JoongAng Daily, Aug 2026", url: "https://www.koreajoongangdaily.com/sports/yoon-ina-joins-women-screen-golf-league-backed-by-tiger-woods-rory-mcilroy/12838027" },
    segyeJeju: { label: "Segye Ilbo, Aug 2024 (Korean)", url: "https://www.segye.com/newsView/20240805511659" },
    mlgt: { label: "Minor League Golf Tour, Aug 2023", url: "https://minorleaguegolf.com/newsdetail.asp?ID=4706" },
    newsis22: { label: "Newsis, Feb 2022 (Korean)", url: "https://v.daum.net/v/20220217111605661" },
    donga22feb: { label: "Dong-A Ilbo, Feb 2022 (Korean)", url: "https://v.daum.net/v/20220212095109547" },
    donga22jul: { label: "Dong-A Ilbo, Jul 2022 (Korean)", url: "https://v.daum.net/v/20220707030216304" },
    donga25: { label: "Dong-A Ilbo, Jan 2025 (Korean)", url: "https://v.daum.net/v/20250117153500583" },
    yonhap22: { label: "Yonhap, Jul 2022 (Korean)", url: "https://v.daum.net/v/20220714151517564" },
    sed24sep: { label: "Seoul Economic Daily, Sep 2024 (Korean)", url: "https://v.daum.net/v/20240904060204466" },
    sed24nov: { label: "Seoul Economic Daily, Nov 2024 (Korean)", url: "https://v.daum.net/v/20241111112127208" },
    sedCaddie: { label: "Seoul Economic Daily, Apr 2026 (Korean)", url: "https://v.daum.net/v/20260428225346059" },
    edaily24aug: { label: "Edaily, Aug 2024 (Korean)", url: "https://v.daum.net/v/20240819001006038" },
    edailyCaddie: { label: "Edaily, Apr 2026 (Korean)", url: "https://v.daum.net/v/20260427161037407" },
    edaily26jan: { label: "Edaily, Jan 2026 (Korean)", url: "https://v.daum.net/v/20260111112405831" },
    edailyFan: { label: "Edaily, Oct 2024 (Korean)", url: "https://v.daum.net/v/20241014060007213" },
    edailyKim: { label: "Edaily, Jun 2025 (Korean)", url: "https://v.daum.net/v/20250625175229242" },
    edailyRefit: { label: "Edaily, Mar 2025 (Korean)", url: "https://edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01095526642100040" },
    edailyTm: { label: "Edaily, Jan 2025 (Korean)", url: "https://edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01266086642035752" },
    chosunPutt: { label: "Chosun Ilbo, Oct 2024 (Korean)", url: "https://v.daum.net/v/20241009054445276" },
    chosunPutt25: { label: "Chosun Ilbo, Jan 2025 (Korean)", url: "https://v.daum.net/v/20250123004045744" },
    chosun24dec: { label: "Chosun Ilbo, Dec 2024 (Korean)", url: "https://v.daum.net/v/20241226164840511" },
    chosun25aug: { label: "Chosun Ilbo, Aug 2025 (Korean)", url: "https://v.daum.net/v/20250806190857206" },
    ssPutter: { label: "Sports Seoul, Sep 2025 (Korean)", url: "https://v.daum.net/v/20250926171251986" },
    herald24: { label: "Herald Business, Jan 2024 (Korean)", url: "https://v.daum.net/v/20240131140518400" },
    heraldFans: { label: "Herald Business, Aug 2025 (Korean)", url: "https://www.heraldk.com/article/2025080700163497408" },
    yonhapNana: { label: "Yonhap, Jun 2026 (Korean)", url: "https://v.daum.net/v/20260628080529192" },
    mhnWtgl: { label: "MHN Sports, Sep 2026 (Korean)", url: "https://v.daum.net/v/20260901133411090" },
    ilganWtgl: { label: "Ilgan Sports, Sep 2026 (Korean)", url: "https://v.daum.net/v/20260923162437646" },
    mk25: { label: "Maeil Business, Jan 2025 (Korean)", url: "https://v.daum.net/v/20250105111803423" },
    munhwaVester: { label: "Munhwa Ilbo, Apr 2025 (Korean)", url: "https://v.daum.net/v/20250420110118635" },
    jaCann: { label: "JoongAng Ilbo, May 2025 (Korean)", url: "https://v.daum.net/v/20250530120305484" },
    kookmin24: { label: "Kookmin Ilbo, Apr 2024 (Korean)", url: "https://v.daum.net/v/20240408191913821" },
    munhwaDonate: { label: "Munhwa Ilbo, Jan 2025 (Korean)", url: "https://v.daum.net/v/20250103112115006" },
    news1Donate: { label: "News1, Dec 2025 (Korean)", url: "https://v.daum.net/v/20251230144037107" },
    semaSed: { label: "Seoul Economic Daily, Nov 2024 (Korean)", url: "https://v.daum.net/v/20241126100614120" },
    solaire: { label: "Nocut News, Jan 2025 (Korean)", url: "https://www.nocutnews.co.kr/news/6279358" },
    tmKorea: { label: "TaylorMade Korea player page", url: "https://www.taylormadegolf.co.kr/tourplayers/ina-yoon.html?lang=ko_KR" },
    khanTm: { label: "Sports Khan, Jan 2025 (Korean)", url: "https://sports.khan.co.kr/article/202501081532003" },
    mydailyFord: { label: "MyDaily, Mar 2025 (Korean)", url: "https://www.mydaily.co.kr/page/view/2025032808081632538" },
    ajuQi4d: { label: "Aju News, Jan 2026 (Korean)", url: "https://www.ajunews.com/view/20260109164437137" },
    golfissue: { label: "Golf Issue, Apr 2024 (Korean)", url: "http://www.golfissue.com/news/articleView.html?idxno=20658" },
    titleist24: { label: "Titleist Tour Report, Aug 2024", url: "https://mediacenter.titleist.com/en-US/240139-titleist-tour-report-08-04-24/" },
    fitter24: { label: "Seoul Economic Daily, Apr 2024 (Korean)", url: "https://v.daum.net/v/20240402030015662" },
    dist25: { label: "Daum Sports, Jan 2026 (Korean)", url: "https://v.daum.net/v/20260103173435402" },
    dist26: { label: "Sports Khan, Jul 2026 (Korean)", url: "https://sports.khan.co.kr/article/202607080907003/amp" },
    dist24: { label: "Daum Sports, Nov 2024 (Korean)", url: "https://v.daum.net/v/20241110200448158" },
    apLead: { label: "Associated Press via KSL, Jun 2026", url: "https://www.ksl.com/article/51558629/ina-yoon-widens-her-womens-pga-championship-lead-to-5-strokes" },
    dist22: { label: "Ilgan Sports, Feb 2025 (Korean)", url: "https://isplus.com/article/view/isp202502040328" },
    ohCoach: { label: "Economy Chosun, Jan 2025 (Korean)", url: "https://v.daum.net/v/20250131111455225" },
    sedDriver: { label: "Seoul Economic Daily, Mar 2026 (Korean)", url: "https://v.daum.net/v/20260327060127841" },
    speed22: { label: "Daum Sports, Jul 2022 (Korean)", url: "https://v.daum.net/v/UIpejv9rmq" }
  };

  const profile = {
    name: "Ina Yoon",
    kicker: "LPGA Tour · South Korea",
    quote: "She learned the game chasing the loud bang of a well-struck ball. Now she is one of the longest hitters on the LPGA Tour and a major runner-up at 23.",
    quoteSrc: ["sed24sep", "dist26", "gnnKpmg"],
    facts: [
      { k: "Born", v: "May 2, 2003, Seoul", src: ["newsis22"] },
      { k: "Turned pro", v: "2021", src: ["aig"] },
      { k: "Home base", v: "Tampa, Florida", src: ["wiki"] },
      { k: "Management", v: "Sema Sports Marketing", src: ["semaSed"] }
    ]
  };

  /* Photos supplied by the site owner. Set credit to the photographer or source if known. */
  const photos = {
    main: { src: "assets/ina-action.jpg", alt: "Ina Yoon watching an iron shot from the fairway", credit: "" },
    story: { src: "assets/ina-portrait.jpg", alt: "Studio portrait of Ina Yoon holding an iron", credit: "" }
  };

  /* Cloudflare Worker address, for example "https://inayoon-api.yourname.workers.dev" (no slash at the end).
     While this is empty the cheer button stays hidden. */
  const api = "https://inayoon-api.digitaldarkmatter.workers.dev";

  const stats = [
    { v: "17", k: "Rolex world ranking", note: "Week 40, 2026", src: ["rolex"], tone: "yellow" },
    { v: "7th", k: "Race to CME Globe", note: "After the LOTTE Championship", src: ["cme"], tone: "pink" },
    { v: "$2.4M", k: "2026 official earnings", note: "After the LOTTE Championship", src: ["lpgaResults"], tone: "yellow" },
    { v: "277.5", k: "Driving yards, 8th on tour", note: "As of July 8, 2026", src: ["dist26"], tone: "pink" }
  ];

  const bio = [
    { t: "Ina Yoon was born in Seoul and grew up in South Gyeongsang province after her parents moved to Sacheon. She took up golf at 10, tagging along with her father, and by her third year of middle school she had won the Korean Women's Amateur and earned a place on the national team.", src: ["newsis22", "donga22feb"] },
    { t: "She turned professional in 2021, topped the second-tier Dream Tour money list, and won on the KLPGA Tour as a rookie in July 2022, going wire to wire at 20 under par. In 2024 she swept the KLPGA's Player of the Year, money and scoring titles, then finished eighth at LPGA Q-Series to earn her card.", src: ["usga", "kjdWin22", "kjdAwards", "kjdQ"] },
    { t: "Her 2025 rookie season in the United States was a grind: one top 10 in 26 starts. In 2026 it clicked. She finished fourth in Los Angeles, tied for fourth at the Chevron Championship, and led the KPMG Women's PGA Championship by five shots at halfway after a record-tying 63 before finishing second. In October she was runner-up again, at the LOTTE Championship in Hawaii.", src: ["kjd2025", "gnnChevron", "gc63", "apLead", "gnnKpmg", "rolex"] }
  ];

  const timeline = [
    { y: "Age 10", t: "Starts golf after following her father to a screen golf venue.", src: ["donga22jul"] },
    { y: "2019", t: "Wins the Korean Women's Amateur as a middle schooler. National team member in 2019 and 2020.", src: ["donga22feb"] },
    { y: "2021", t: "Turns pro and finishes first on the Dream Tour money list to earn KLPGA membership.", src: ["usga"] },
    { y: "Jun 2022", t: "At the Korea Women's Open she plays a ball that was not hers and reports it about a month later. The Korea Golf Association and the KLPGA each suspend her for three years; both bans are later reduced to 18 months.", src: ["kjdBan", "kjdReduce"] },
    { y: "Jul 2022", t: "First KLPGA win: Evercollagen Queens Crown, 20 under par, wire to wire, in her 14th start.", src: ["kjdWin22"] },
    { y: "2023", t: "Based in Tampa during the ban, she plays the Minor League Golf Tour and donates her winnings to junior golf.", src: ["mlgt"] },
    { y: "Apr 2024", t: "Returns to the KLPGA at the Doosan E&C We've Championship.", src: ["kjdReturn"] },
    { y: "Aug 2024", t: "Wins the Jeju Samdasoo Masters by two at 14 under par, her first title since coming back.", src: ["segyeJeju"] },
    { y: "Nov 2024", t: "Sweeps the KLPGA's Player of the Year, money title and scoring title.", src: ["kjdAwards"] },
    { y: "Dec 2024", t: "Finishes eighth at LPGA Q-Series (15 under par) to earn her LPGA Tour card.", src: ["kjdQ"] },
    { y: "2025", t: "LPGA rookie season: 26 starts, best finish tied 10th, 63rd in CME points.", src: ["kjd2025"] },
    { y: "Apr 2026", t: "Solo fourth at the JM Eagle LA Championship, then tied fourth at the Chevron Championship, her best major finish at that point.", src: ["gnnChevron"] },
    { y: "Jun 2026", t: "Opens the KPMG Women's PGA with a record-tying 63, leads by five at halfway and finishes runner-up.", src: ["gc63", "apLead", "gnnKpmg"] },
    { y: "Oct 2026", t: "Finishes solo second at the LOTTE Championship in Hawaii at 18 under par, her second runner-up finish of the season.", src: ["rolex", "espn"] },
    { y: "Nov 2026", t: "Set to join Boston Common Golf in WTGL, the women's simulator league, as its only Korean player.", src: ["kjdWtgl", "ilganWtgl"] }
  ];

  const deepCuts = [
    { tag: "Origins", h: "Her name is a wish", t: "Hers is a pure Korean name, not one built from Chinese characters. In Korean, \"yuni na\" means to gleam or shine. Her paternal grandmother insisted on it, saying: shine, shine in the world.", src: ["sed24sep"], tone: "yellow" },
    { tag: "Origins", h: "Chasing the bang", t: "She has told the story two ways: screen golf with her father, or an underground indoor range in Seoul with a tarp for a target. Both versions end the same. She loved the loud bang of a pure strike and kept swinging harder to hear it.", src: ["sed24sep", "donga22jul"], tone: "navy" },
    { tag: "Origins", h: "106 in her first tournament", t: "She learned golf as a hobby and shot 106 in her first event in fourth grade. She says she became a competitor because tournaments were more fun than practice.", src: ["donga22feb"], tone: "navy" },
    { tag: "Origins", h: "Dad's one rule", t: "From elementary school her father taught her to swing as hard and as far as she could and never to steer the driver to avoid trouble.", src: ["donga22feb"], tone: "pink" },
    { tag: "Routine", h: "The right-knee trigger", t: "Watch her right knee nudge inward before every swing. According to her former club fitter, it releases tension and loads the lower body.", src: ["donga22feb"], tone: "navy" },
    { tag: "Routine", h: "Braced for a punch", t: "At address she tightens her core as if someone were about to punch her, then lets go through impact. Her reason: it stops her hips thrusting toward the ball and keeps the strike centered.", src: ["edaily24aug", "sed24sep"], tone: "navy" },
    { tag: "Routine", h: "A diary since age 12", t: "She has kept a notebook since fifth grade: schedule, lesson notes and a few lines on how she feels. She calls it her way of letting emotions out, and used it to list the pros and cons of moving to the United States.", src: ["sed24sep", "sed24nov"], tone: "white" },
    { tag: "Routine", h: "Putting with the wrong balls", t: "Her putting coach since middle school leaves her stroke alone. Instead he trains feel, using balls of different sizes, weights and materials and asking her to describe the difference in words.", src: ["chosunPutt"], tone: "navy" },
    { tag: "Routine", h: "83 meters", t: "Her favorite yardage is 83 meters with a 54-degree wedge. She has long practiced wedges from around 100 meters because that is what her drives leave her.", src: ["sed24sep", "yonhap22"], tone: "navy" },
    { tag: "2026", h: "The caddie's caddie", t: "Two days after tying for fourth at the Chevron Championship, she flew to Ohio and carried her caddie Kevin Benstead's bag at a US Open local qualifier. She had never caddied before.", src: ["sedCaddie", "edailyCaddie"], tone: "yellow" },
    { tag: "2025", h: "The borrowed putter", t: "Her childhood teacher, long-drive champion Kim Bong-sub, thought her putter head looked too heavy and lent her his spare. She shot 69 the next day.", src: ["ssPutter"], tone: "navy" },
    { tag: "Off course", h: "Steak, tteokbokki and a guitar", t: "Her personality type is ESTJ. Favorite foods: steak and rice-cake tteokbokki, with kimchi stew the dish she misses abroad. She took up the guitar in 2024 and always carries a book.", src: ["sed24nov", "sed24sep", "donga22jul"], tone: "pink" },
    { tag: "Off course", h: "Nana and the Red Sox", t: "She has a Yorkshire terrier named Nana, and became a Boston Red Sox fan after a game at Fenway Park in 2025. Fitting, since her WTGL team is Boston Common Golf.", src: ["yonhapNana", "mhnWtgl"], tone: "navy" },
    { tag: "Fans", h: "A wall of letters", t: "Her favorite gift from fans is a handwritten letter, and she posts them on a wall at home. Asked how she wants to be remembered, she said as a player who moves people.", src: ["sed24sep"], tone: "navy" },
    { tag: "Mindset", h: "The flag on her bag", t: "When a round is going badly she looks at the Korean flag stitched on her bag and shoes. Her stated goals on leaving for America: adapt, win Rookie of the Year, reach world No. 1 and win Olympic gold.", src: ["mk25", "chosun24dec"], tone: "navy" }
  ];

  /* Fan club shout-out. Set url once the official cafe address is confirmed; the button is hidden while it is empty. */
  const fanClub = {
    name: "Bitina",
    lead: "Her official fan club in Korea is called Bitina. The name rhymes with hers and carries the same wish: \"bichi na\" means \"shining\", literally \"light comes out\". At tournaments they turn up in pink and chant \"Yoon Ina, Bitina, fighting!\"",
    charity: "They also do real good. Members pay into a Birdie Fund for every birdie she makes, she adds her own money, and the total goes to children and teenagers with cancer at Yonsei Medical Center in Seoul.",
    tiles: [
      { v: "4,753", k: "Fan cafe members", n: "October 2024, fourth among Korean women pros" },
      { v: "33.6M won", k: "Donated in December 2024", n: "Half raised by fans, matched by her" },
      { v: "43M won", k: "Donated in December 2025", n: "Birdie Fund plus her own money" }
    ],
    url: "https://cafe.naver.com/enayoune",
    urlLabel: "Visit the Bitina fan cafe on Naver (in Korean)",
    src: ["heraldFans", "edailyFan", "munhwaDonate", "news1Donate", "sed24sep"]
  };

  const team = [
    { role: "Swing coach", name: "Oh Se-uk", t: "Has worked with her since junior days. Moved her ball flight to a fade in 2022 and was still her swing coach in early 2025. Whether that continues in 2026 is not confirmed.", src: ["yonhap22", "ohCoach"] },
    { role: "Putting coach", name: "Choi Jong-hwan", t: "With her since the first year of middle school. Trains distance feel and pressure putting.", src: ["chosunPutt", "chosunPutt25"] },
    { role: "Childhood teacher", name: "Kim Bong-sub", t: "KPGA long-drive champion who taught her in elementary school. They trained together in Thailand before the 2026 season.", src: ["edailyKim", "edaily26jan"] },
    { role: "Mentor", name: "Shin Ji-yai", t: "Her role model. Yoon joined Shin's training camp in Australia in January 2024.", src: ["herald24", "donga22jul"] },
    { role: "Caddie, 2026", name: "Kevin Benstead", t: "American, a former PGA Tour China player.", src: ["sedCaddie"] },
    { role: "Earlier caddies", name: "Michael Vester, Colin Cann", t: "Vester joined in spring 2025. Cann, who caddied for Annika Sorenstam and Pak Se-ri, took over at the 2025 US Women's Open.", src: ["munhwaVester", "jaCann"] }
  ];

  const bag = {
    asOf: "Models as listed on her TaylorMade Korea player page, checked October 4, 2026, except the driver, which comes from a March 2026 press report. Lofts and shafts are not published.",
    current: [
      { slot: "Driver", item: "TaylorMade Qi4D", note: "Reported in March 2026 as her new driver for the season. Which version, loft and shaft are not published.", src: ["sedDriver"] },
      { slot: "Fairway wood", item: "TaylorMade Qi4D Tour", src: ["tmKorea"] },
      { slot: "Hybrid", item: "TaylorMade Qi4D Rescue", src: ["tmKorea"] },
      { slot: "Irons", item: "TaylorMade P770 and P7CB", note: "Which irons are which model is not published.", src: ["tmKorea"] },
      { slot: "Wedges", item: "TaylorMade MG5", src: ["tmKorea"] },
      { slot: "Putter", item: "Not confirmed", note: "Her 2025 club deal excluded the putter, and she changed putters several times that year.", src: ["khanTm", "chosun25aug"], unknown: true },
      { slot: "Ball", item: "Not confirmed", note: "Her 2025 club deal excluded the ball.", src: ["khanTm"], unknown: true }
    ],
    story: [
      { h: "Why she switched", t: "After using Titleist clubs since her amateur days, she signed with TaylorMade in January 2025. Her reasoning: on the LPGA she expected to hit driver more often, the new driver head gave her comfort and confidence at setup, and the same swing can vary 10 to 15 yards depending on the club.", src: ["khanTm", "edailyTm"] },
      { h: "The rough start", t: "She missed the cut on her LPGA debut, hitting 43 percent of fairways. She then went to TaylorMade's headquarters for swing analysis and a refit. By the Ford Championship in late March she shot 65 and hit 12 of 14 fairways.", src: ["edailyRefit", "mydailyFord"] },
      { h: "Accuracy over distance", t: "In 2024 she carried a three-model combo iron set. Her fitter at the time explained that she weights accuracy over distance, so the scoring irons were blades for shot control.", src: ["fitter24"] }
    ],
    old: {
      label: "2024 KLPGA bag (Titleist, for reference only)",
      items: [
        "Driver: Titleist TSR3, 9 degrees, Fujikura Ventus Blue 6S",
        "Fairway: Titleist TSR3, 15 degrees",
        "Irons: Titleist T150 (4), 620 CB (5 to 8), 620 MB (9 to PW), NS Pro Modus 105 S",
        "Wedges: Vokey SM10 at 50, 54 and 58 degrees",
        "Putter: Odyssey White Hot OG Double Wide in April, Scotty Cameron GOLO 6 prototype by August",
        "Ball: Titleist Pro V1"
      ],
      src: ["golfissue", "titleist24"]
    },
    numbers: [
      { k: "2022 KLPGA", v: "About 264 yards, 1st", src: ["dist22"] },
      { k: "2024 KLPGA", v: "255.0 yards, 2nd", src: ["dist24"] },
      { k: "2025 LPGA", v: "272.9 yards, 13th", src: ["dist25"] },
      { k: "2026 LPGA", v: "277.5 yards, 8th (to early July)", src: ["dist26"] }
    ]
  };

  /* Results rows: [dates, tournament, finish, rounds, toPar, earnings, flags]
     flags: m = major, d = round scores derived from to-par values, n = see note */
  const results = {
    "2026": {
      note: "17 starts through the LOTTE Championship. Rows marked * are awaiting a second check of their round scores or to-par figure.",
      liveEvent: "",
      rows: [
        ["Oct 1 to 4", "LOTTE Championship", "2", "66 67 69 68", "-18", "$277,738", ""],
        ["Sep 25 to 27", "Walmart NW Arkansas Championship", "CUT", "71 70", "-1", "$0", ""],
        ["Aug 27 to 30", "FM Championship", "T44", "74 70 71 73", "E", "$18,239", ""],
        ["Jul 30 to Aug 2", "AIG Women's Open", "CUT", "74 74", "+6", "$0", "md"],
        ["Jul 23 to 26", "ISPS Handa Women's Scottish Open", "T28", "73 68 76 76", "+5", "$18,588", "d"],
        ["Jul 9 to 12", "Amundi Evian Championship", "T53", "69 70 73 70", "-2", "$30,186", "m"],
        ["Jun 25 to 28", "KPMG Women's PGA Championship", "2", "63 69 75 70", "-11", "$1,169,108", "m"],
        ["Jun 4 to 7", "US Women's Open", "CUT", "68 79", "+5", "$0", "m"],
        ["May 14 to 17", "Kroger Queen City Championship", "T12", "66 71 69 70", "-4", "$31,953", "d"],
        ["May 7 to 10", "Mizuho Americas Open", "T20", "74 70 71 72", "-1", "$35,714", "d"],
        ["Apr 23 to 26", "The Chevron Championship", "T4", "69 68 71 68", "-12", "$393,221", "m"],
        ["Apr 16 to 19", "JM Eagle LA Championship", "4", "68 64 71 69", "-16", "$252,937", ""],
        ["Apr 2 to 5", "Aramco Championship", "T17", "70 74 75 75", "+6", "$46,888", ""],
        ["Mar 26 to 29", "Ford Championship", "T6", "67 66 67 70", "-18", "$65,477", ""],
        ["Mar 19 to 22", "Fortinet Founders Cup", "T42", "68 76 69 71", "-4", "$14,253", ""],
        ["Feb 26 to Mar 1", "HSBC Women's World Championship", "T41", "73 72 71 72", "E", "$14,391", "d"],
        ["Feb 19 to 22", "Honda LPGA Thailand", "T50", "67 73 72 72", "-4", "$6,311", ""]
      ]
    },
    "2025": {
      note: "Rookie season. The 25 stroke-play starts shown total $554,766. She also played the T-Mobile Match Play (Apr 2 to 6); that result is not yet verified and is left out.",
      note2: "The 2025 Walmart NW Arkansas Championship row shows one round only. The data feed lists the 2025 Mizuho Americas Open as a missed cut but also shows earnings, so her finish there is awaiting a second check.",
      rows: [
        ["Nov 13 to 16", "The ANNIKA", "T21", "69 68 70 65", "-8", "$34,319", ""],
        ["Nov 6 to 8", "TOTO Japan Classic", "T10", "72 70 67", "-7", "$31,537", ""],
        ["Oct 30 to Nov 2", "Maybank Championship", "11", "69 68 68 68", "-15", "$56,607", ""],
        ["Oct 16 to 19", "BMW Ladies Championship", "T24", "71 67 69 69", "-12", "$21,261", ""],
        ["Oct 9 to 12", "Buick LPGA Shanghai", "T26", "65 68 72 74", "-9", "$19,982", ""],
        ["Oct 1 to 4", "LOTTE Championship", "T42", "71 65 73 75", "-4", "$12,958", ""],
        ["Sep 19 to 21", "Walmart NW Arkansas Championship", "T129", "73", "+2", "$3,500", "n"],
        ["Sep 11 to 14", "Kroger Queen City Championship", "CUT", "72 75", "+3", "$0", ""],
        ["Aug 28 to 31", "FM Championship", "T45", "72 70 71 71", "-4", "$15,521", ""],
        ["Aug 21 to 24", "CPKC Women's Open", "T36", "69 71 71 71", "-2", "$15,395", ""],
        ["Jul 31 to Aug 3", "AIG Women's Open", "CUT", "69 80", "+5", "$0", "m"],
        ["Jul 24 to 27", "ISPS Handa Women's Scottish Open", "T38", "70 67 74 76", "-1", "$9,898", ""],
        ["Jul 10 to 13", "Amundi Evian Championship", "T65", "68 70 76 73", "+3", "$17,788", "m"],
        ["Jun 19 to 22", "KPMG Women's PGA Championship", "CUT", "78 75", "+9", "$0", "m"],
        ["Jun 12 to 15", "Meijer LPGA Classic", "T31", "73 66 73 70", "-6", "$20,914", ""],
        ["Jun 6 to 8", "ShopRite LPGA Classic", "CUT", "70 73", "+1", "$0", ""],
        ["May 29 to Jun 1", "US Women's Open", "T14", "71 70 79 68", "E", "$179,245", "m"],
        ["May 22 to 25", "Riviera Maya Open", "CUT", "76 73", "+5", "$0", ""],
        ["May 8 to 11", "Mizuho Americas Open", "Unclear", "73 71", "E", "$7,479", "n"],
        ["May 1 to 4", "Black Desert Championship", "CUT", "69 73", "-2", "$0", ""],
        ["Apr 24 to 27", "The Chevron Championship", "T52", "72 71 76 74", "+5", "$22,215", "m"],
        ["Apr 17 to 20", "JM Eagle LA Championship", "T16", "70 67 64 73", "-14", "$48,350", ""],
        ["Mar 27 to 30", "Ford Championship", "T22", "65 69 71 69", "-14", "$22,539", ""],
        ["Mar 6 to 9", "Blue Bay LPGA", "T33", "69 73 70 78", "+2", "$15,258", ""],
        ["Feb 6 to 9", "Founders Cup", "CUT", "72 74", "+4", "$0", ""]
      ]
    }
  };

  const majors = {
    head: ["Major", "2025", "2026"],
    rows: [
      ["Chevron Championship", "T52", "T4"],
      ["US Women's Open", "T14", "CUT"],
      ["KPMG Women's PGA", "CUT", "2"],
      ["Evian Championship", "T65", "T53"],
      ["AIG Women's Open", "CUT", "CUT"]
    ],
    src: ["wiki", "kpmg"]
  };

  const klpga = {
    wins: [
      { d: "Jul 17, 2022", n: "Evercollagen Queens Crown", s: "268 (20 under)", m: "Won by 1, wire to wire", src: ["kjdWin22"] },
      { d: "Aug 4, 2024", n: "Jeju Samdasoo Masters", s: "274 (14 under)", m: "Won by 2", src: ["segyeJeju"] }
    ],
    season2024: "2024 season: 25 starts, 1 win, 4 runner-up finishes, 14 top 10s. First in Player of the Year points, prize money (about 1.21 billion won) and scoring average (70.05).",
    season2024Src: ["kjdAwards"]
  };

  const schedule = {
    note: "Remaining 2026 LPGA schedule. Her entry in each event is not yet confirmed.",
    rows: [
      ["Oct 15 to 18", "Buick LPGA Shanghai"],
      ["Oct 22 to 25", "BMW Ladies Championship (Korea)"],
      ["Oct 29 to Nov 1", "Maybank Championship"],
      ["Nov 5 to 8", "TOTO Japan Classic"],
      ["Nov 8", "WTGL simulator league season opens"],
      ["Nov 12 to 15", "The ANNIKA"],
      ["Nov 19 to 22", "CME Group Tour Championship"]
    ]
  };

  /* Videos are sorted newest first on the page, by the date of the event shown.
     Checked October 4, 2026: each plays embedded. Three earlier picks (two NBC Sports, one KBS)
     were removed because their owners block them outside their home countries. */
  const videos = [
    { id: "UN23oGCc--Q", date: "2026-10-01", t: "Opening 66 in Hawaii", c: "LPGA Korea", d: "LOTTE Championship, round 1 (Korean)" },
    { id: "3nBOLJl3VA0", date: "2026-07-24", t: "A 68 on the Scottish links", c: "LPGA Korea", d: "ISPS Handa Women's Scottish Open, round 2 (Korean)" },
    { id: "awlBSAFpHjA", date: "2026-06-28", t: "Final round at Hazeltine", c: "LPGA Korea", d: "KPMG Women's PGA, final round (Korean)" },
    { id: "xBig9IETevE", date: "2026-06-26", t: "Five clear at halfway", c: "LPGA Korea", d: "KPMG Women's PGA, round 2 (Korean)" },
    { id: "c8atS-iT2tg", date: "2026-06-25", t: "The record-tying 63 at Hazeltine", c: "LPGA", d: "KPMG Women's PGA, round 1" },
    { id: "OMJ4E1ObqG8", date: "2026-04-25", t: "Round 3 at the Chevron", c: "LPGA Korea", d: "Chevron Championship, round 3 (Korean)" },
    { id: "a-v4raIKHuA", date: "2026-04-24", t: "Round 2 at the Chevron", c: "LPGA Korea", d: "Chevron Championship, round 2 (Korean)" },
    { id: "MYqDOl1mqVo", date: "2026-04-18", t: "Moving day in Los Angeles", c: "LPGA Korea", d: "JM Eagle LA Championship, round 3 (Korean)" },
    { id: "WIm01zaJYSI", date: "2024-12-11", t: "The moment she earned her LPGA card", c: "SBS Golf", d: "After LPGA Q-Series (Korean)" },
    { id: "0O_A8gU1oYk", date: "2024-08-04", t: "Every shot of the comeback win", c: "SBS Golf", d: "Jeju Samdasoo Masters (Korean)" },
    { id: "M_SRKzqQIJ0", date: "2024-04-11", t: "Leading a week after her return", c: "SBS Golf", d: "Mediheal Hankook Ilbo Championship, round 1 (Korean)" },
    { id: "2e9bxJlyyBQ", date: "2022-07-17", t: "The first win", c: "SBS Golf", d: "Evercollagen Queens Crown, final round (Korean)" },
    { id: "myGD8Veikk0", date: "2022-07-03", t: "4D driver swing analysis", c: "SBS Golf", d: "With two other players (Korean)" }
  ];

  const links = [
    { h: "LPGA.com news, photos and video", t: "Official interviews and highlights from every event.", url: "https://www.lpga.com/athletes/ina-yoon/102401/media" },
    { h: "Instagram: @yoon_2naa", t: "The account news outlets identify as hers.", url: "https://www.instagram.com/yoon_2naa/" },
    { h: "KPMG Women's PGA player page", t: "Photos and coverage from her runner-up week at Hazeltine.", url: "https://www.kpmgwomenspgachampionship.com/player/ina-yoon" },
    { h: "AIG Women's Open player page", t: "Profile and photos from the Women's Open.", url: "https://www.aigwomensopen.com/players/ina-yoon" },
    { h: "Rolex Rankings profile", t: "Week by week world ranking and recent results.", url: "https://www.rolexrankings.com/players/9296" },
    { h: "LPGA.com results", t: "Her official event by event record.", url: "https://www.lpga.com/athletes/ina-yoon/102401/results" }
  ];

  /* Shown when data/live.json cannot be loaded (for example when the page is opened from disk). */
  const liveFallback = {
    updated: "2026-10-06T00:23:00Z",
    state: "post",
    event: { id: "401835171", name: "LOTTE Championship pres. by Hoakalei", start: "2026-10-01", end: "2026-10-04", course: "Hoakalei Country Club" },
    position: "2", toPar: "-18", total: 270, round: 4, thru: 18,
    teeTime: null, rounds: [66, 67, 69, 68], statusText: "",
    next: { name: "Buick LPGA Shanghai", start: "2026-10-15", end: "2026-10-18" }
  };

  return { SOURCES, profile, photos, api, stats, bio, timeline, deepCuts, fanClub, team, bag, results, majors, klpga, schedule, videos, links, liveFallback };
})();
