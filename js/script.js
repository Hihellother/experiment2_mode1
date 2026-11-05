const root = document.getElementById("root");
const initialScreen = root?.dataset.startScreen || "welcome";

const SCENARIO_TEXT =
  "Due to a person near the tracks, Berg station is partially closed. Several trains cannot pass the station as planned. Create an action plan to bring as many passengers as possible to their destination with as little additional delay as possible.";

const DELAY_OPTIONS = [10, 20, 30, 45];

const GAME_TOOLTIP_HIDE_MS = 30000;
const GAME_BRUGG_TOOLTIP_HIDE_MS = 10000;
const GAME_TOOLTIP_ORDER = ["express", "regional-east", "freight", "regional-west"];
let gameTooltipTimer = null;
let gameRoutePreviewTimer = null;
let gameTrainAnimationFrame = null;
let planSkeletonTimer = null;
let planProgressTimer = null;
const PLAN_SKELETON_MS = 2000;
const PLAN_EXECUTION_MS = 10000;
const PLAN_PROGRESS_TICK_MS = 1000;
const GAME_TRAIN_STEP_PX = 5;
const GAME_TRAIN_STEP_MS = 2000;
const GAME_TRAIN_SPEED_PX_PER_SECOND = GAME_TRAIN_STEP_PX / (GAME_TRAIN_STEP_MS / 1000);
const GAME_TRAIN_ROUTE_BOX_OUTSET = 10;

const TRAIN_FILL_COLORS = {
  express: "#005CD5",
  regional: "#B100D5",
  freight: "#00D5C3",
  measure: "#D7D7D7",
  blocked: "#D7D7D7",
};

const GAME_ASSETS = {
  background: "images/background_primitive_mode.png",
  trackHorizontal: "images/Gleis_horizontal.svg",
  trackPerron: "images/Gleis_horizontal_Perron.svg",
  trackCurveTopRight: "images/Gleis_Kurve_oben_rechts.svg",
  trackCurveBottomRight: "images/Gleis_Kurve_unten_rechts.svg",
  trackCurveBottomLeft: "images/Gleis_Kurve_unten_links.svg",
  trackDeadend: "images/Gleis_Deadend.svg",
  trackCrossing: "images/Gleis_Diamond_Crossing.svg",
  switchRight: "images/Weiche_horizontal_unten_rechts.svg",
  switchLeft: "images/Weiche_horizontal_unten_links.svg",
  switchUpLeft: "images/Weiche_horizontal_oben_links.svg",
  leafTree: "images/Scenery-Laubbaume_A.svg",
  pineTree: "images/Scenery-Nadelbaume_B.svg",
  highrise: "images/Buildings-Hochhaus.svg",
  office: "images/Buildings-Office.svg",
};

const GAME_DECOR = [
  { type: "pineTree", x: 3, y: -11, w: 107, h: 112 },
  { type: "pineTree", x: 64, y: -31, w: 108, h: 111 },
  { type: "pineTree", x: -23, y: 48, w: 108, h: 112 },
  { type: "leafTree", x: 552, y: 12, w: 135, h: 138 },
  { type: "leafTree", x: 603, y: -25, w: 135, h: 139 },
  { type: "leafTree", x: 664, y: 38, w: 133, h: 141 },
  { type: "highrise", x: 1612, y: 193, w: 107, h: 98 },
  { type: "office", x: 1665, y: 234, w: 106, h: 106 },
  { type: "leafTree", x: 1408, y: 284, w: 85, h: 98 },
  { type: "leafTree", x: 1466, y: 234, w: 136, h: 139 },
  { type: "leafTree", x: 1452, y: 213, w: 84, h: 96 },
  { type: "leafTree", x: 1632, y: 758, w: 134, h: 140 },
  { type: "leafTree", x: 1683, y: 723, w: 135, h: 139 },
  { type: "leafTree", x: 1741, y: 786, w: 135, h: 138 },
  { type: "leafTree", x: 1747, y: 701, w: 136, h: 140 },
  { type: "leafTree", x: 1799, y: 664, w: 135, h: 141 },
  { type: "leafTree", x: 1857, y: 728, w: 136, h: 139 },
];

const GAME_TRACKS = [
  { type: "trackCurveBottomRight", x: 215, y: 201, w: 140, h: 140 },
  { type: "trackHorizontal", x: 350, y: 201, w: 140, h: 140 },
  { type: "trackHorizontal", x: 485, y: 201, w: 140, h: 140 },
  { type: "trackDeadend", x: 620, y: 201, w: 140, h: 140 },
  { type: "trackHorizontal", x: 215, y: 338, w: 140, h: 140, rotate: 90 },
  { type: "trackHorizontal", x: -55, y: 476, w: 140, h: 140 },
  { type: "trackHorizontal", x: 80, y: 476, w: 140, h: 140 },
  { type: "trackCrossing", x: 215, y: 476, w: 140, h: 140 },
  { type: "trackPerron", x: 350, y: 476, w: 140, h: 140 },
  { type: "trackHorizontal", x: 485, y: 476, w: 140, h: 140 },
  { type: "switchRight", x: 620, y: 476, w: 140, h: 140 },
  { type: "trackHorizontal", x: 755, y: 476, w: 140, h: 140 },
  { type: "trackHorizontal", x: 890, y: 476, w: 140, h: 140 },
  { type: "trackPerron", x: 1025, y: 476, w: 140, h: 140 },
  { type: "switchRight", x: 1160, y: 476, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1295, y: 476, w: 140, h: 140 },
  { type: "trackCurveBottomRight", x: 1430, y: 338, w: 140, h: 140 },
  { type: "trackPerron", x: 1565, y: 338, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1700, y: 338, w: 140, h: 140 },
  { type: "trackDeadend", x: 1835, y: 338, w: 140, h: 140 },
  { type: "trackHorizontal", x: 215, y: 613, w: 140, h: 140, rotate: 90 },
  { type: "trackHorizontal", x: 350, y: 613, w: 140, h: 140 },
  { type: "switchUpLeft", x: 620, y: 613, w: 140, h: 140 },
  { type: "trackHorizontal", x: 755, y: 613, w: 140, h: 140 },
  { type: "trackPerron", x: 890, y: 613, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1025, y: 613, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1160, y: 613, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1295, y: 613, w: 140, h: 140 },
  { type: "trackCurveBottomLeft", x: 1430, y: 613, w: 140, h: 140 },
  { type: "trackHorizontal", x: -55, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 80, y: 750, w: 140, h: 140 },
  { type: "trackCrossing", x: 215, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 350, y: 750, w: 140, h: 140 },
  { type: "trackPerron", x: 485, y: 750, w: 140, h: 140 },
  { type: "switchLeft", x: 620, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 755, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 890, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1025, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 1160, y: 750, w: 140, h: 140 },
  { type: "trackCurveTopRight", x: 1295, y: 750, w: 140, h: 140 },
  { type: "trackHorizontal", x: 215, y: 887, w: 140, h: 140, rotate: 90 },
  { type: "trackHorizontal", x: 350, y: 887, w: 140, h: 140 },
  { type: "trackHorizontal", x: 215, y: 1024, w: 140, h: 140, rotate: 90 },
];

const GAME_LABELS = [
  { text: "Auen", x: 362, y: 339 },
  { text: "Berg", x: 759, y: 339 },
  { text: "Lind", x: 1038, y: 329 },
  { text: "Ried", x: 496, y: 616 },
  { text: "Matt", x: 1605, y: 168 },
];

const GAME_TRAINS = [
  {
    id: "freight",
    label: "G&uuml;terzug",
    x: 10,
    y: 476,
    w: 135,
    h: 138,
    nudgeX: 4,
    nudgeY: 0,
    rotate: 90,
    className: "freight-train",
    fill: TRAIN_FILL_COLORS.freight,
  },
  {
    id: "regional-west",
    label: "Regionalzug Aarau-Matt",
    x: 10,
    y: 752,
    w: 135,
    h: 140,
    nudgeX: 4,
    nudgeY: 0,
    rotate: 90,
    className: "regional-west-train",
    fill: TRAIN_FILL_COLORS.regional,
  },
  {
    id: "blocked",
    label: "Blockierter Zug",
    x: 755,
    y: 476,
    w: 135,
    h: 140,
    nudgeX: 0,
    nudgeY: 0,
    rotate: 90,
    className: "blocked-train",
    disabled: true,
    fill: TRAIN_FILL_COLORS.blocked,
  },
  {
    id: "express",
    label: "Schnellzug",
    x: 1350,
    y: 476,
    w: 139,
    h: 137,
    nudgeX: -4,
    nudgeY: 0,
    rotate: -90,
    className: "express-train",
    fill: TRAIN_FILL_COLORS.express,
  },
  {
    id: "regional-east",
    label: "Regionalzug Matt-Aarau",
    x: 1565,
    y: 336,
    w: 135,
    h: 140,
    nudgeX: -4,
    nudgeY: 0,
    rotate: -90,
    className: "regional-east-train",
    fill: TRAIN_FILL_COLORS.regional,
  },
];

const GAME_TOOLTIP_CONTENT = {
  brugg: {
    nodeId: "95:3770",
    title: "St&ouml;rung Bahnhof Berg",
    body:
      "Der Bahnhof&nbsp;<strong>Berg</strong> ist aufgrund einer technischen St&ouml;rung gesperrt. Der graue Zug kann seine Fahrt nicht fortsetzen. Legen Sie f&uuml;r die &uuml;brigen Z&uuml;ge einen geeigneten <strong>Massnahmenplan</strong>&nbsp;fest.",
    x: 862,
    y: 684,
    w: 348,
    h: 218,
    arrow: "top-left",
    className: "brugg-warning",
    autoHideMs: GAME_BRUGG_TOOLTIP_HIDE_MS,
  },
  express: {
    nodeId: "95:12236",
    title: "Schnellzug",
    body:
      "<span>Start: Matt</span><span>Stopp: Basel</span><span>Route: &uuml;ber Lind - Berg - Auen</span><span>Kapazit&auml;t: viel</span>",
    x: 1157,
    y: 342,
    w: 345,
    h: 121,
    arrow: "bottom-right",
  },
  "regional-east": {
    nodeId: "95:10118",
    title: "Regionalzug",
    body:
      "<span>Start: Matt</span><span>Ziel: Aarau</span><span>Route: &uuml;ber Lind - Berg - Auen</span><span>Kapazit&auml;t: wenig</span>",
    x: 1304,
    y: 206,
    w: 345,
    h: 121,
    arrow: "bottom-right",
  },
  freight: {
    nodeId: "95:5886",
    title: "G&uuml;terzug",
    body:
      "<span>Start: Aarau</span><span>Stopp: Matt</span><span>Route: &uuml;ber Auen - Berg - Lind</span><span>Kapazit&auml;t: -</span>",
    x: 41,
    y: 343,
    w: 345,
    h: 121,
    arrow: "bottom-left",
  },
  "regional-west": {
    nodeId: "95:8001",
    title: "Regionalzug",
    body:
      "<span>Start: Aarau</span><span>Ziel: Matt</span><span>Route: &uuml;ber Auen - Berg - Lind</span><span>Kapazit&auml;t: wenig</span>",
    x: 40,
    y: 609,
    w: 345,
    h: 119,
    arrow: "bottom-left",
  },
};

const GAME_ROUTES = {
  express: {
    path: "M1490 545 L1290 545 L1090 545 L890 545 L690 545 L500 545 L300 545 L78 545",
    dots: [],
  },
  "regional-east": {
    path: "M1708 405 L1620 405 C1566 405 1516 430 1497 475 C1478 522 1436 545 1375 545 L1165 545 L925 545 L690 545 L420 545 L296 545 L296 822 L78 822",
    dots: [
      { x: 1088, y: 545 },
      { x: 817, y: 545 },
      { x: 419, y: 545 },
    ],
  },
  freight: {
    path: "M80 545 L330 545 L570 545 L820 545 L1088 545 L1350 545 C1418 545 1465 520 1489 475 C1512 430 1562 405 1620 405 L1780 405",
    flag: { x: 1704, y: 252 },
  },
  "regional-west": {
    path: "M78 822 L296 822 L296 545 L420 545 L690 545 L925 545 L1165 545 L1365 545 C1434 545 1481 521 1501 476 C1521 431 1566 405 1620 405 L1780 405",
    dots: [
      { x: 420, y: 545 },
      { x: 817, y: 545 },
      { x: 1088, y: 545 },
    ],
    flag: { x: 1704, y: 252 },
  },
};

const GAME_TRAIN_MOTION_PATHS = {
  freight: [
    { x: 77.5, y: 545 },
    { x: 330, y: 545 },
    { x: 570, y: 545 },
    { x: 820, y: 545 },
    { x: 1088, y: 545 },
    { x: 1350, y: 545 },
    ...sampleCubicPoints(
      { x: 1350, y: 545 },
      { x: 1418, y: 545 },
      { x: 1465, y: 520 },
      { x: 1489, y: 475 },
    ),
    ...sampleCubicPoints(
      { x: 1489, y: 475 },
      { x: 1512, y: 430 },
      { x: 1562, y: 405 },
      { x: 1620, y: 405 },
    ),
    { x: 1780, y: 405 },
  ],
  "regional-west": [
    { x: 77.5, y: 822 },
    { x: 296, y: 822 },
    { x: 296, y: 545 },
    { x: 420, y: 545 },
    { x: 690, y: 545 },
    { x: 925, y: 545 },
    { x: 1165, y: 545 },
    { x: 1365, y: 545 },
    ...sampleCubicPoints(
      { x: 1365, y: 545 },
      { x: 1434, y: 545 },
      { x: 1481, y: 521 },
      { x: 1501, y: 476 },
    ),
    ...sampleCubicPoints(
      { x: 1501, y: 476 },
      { x: 1521, y: 431 },
      { x: 1566, y: 405 },
      { x: 1620, y: 405 },
    ),
    { x: 1780, y: 405 },
  ],
  express: [
    { x: 1419.5, y: 544.5 },
    { x: 1290, y: 544.5 },
    { x: 1090, y: 544.5 },
    { x: 890, y: 544.5 },
    { x: 690, y: 544.5 },
    { x: 500, y: 544.5 },
    { x: 300, y: 544.5 },
    { x: 77.5, y: 544.5 },
  ],
  "regional-east": [
    { x: 1632.5, y: 406 },
    { x: 1620, y: 406 },
    ...sampleCubicPoints(
      { x: 1620, y: 406 },
      { x: 1566, y: 406 },
      { x: 1516, y: 430 },
      { x: 1497, y: 475 },
    ),
    ...sampleCubicPoints(
      { x: 1497, y: 475 },
      { x: 1478, y: 522 },
      { x: 1436, y: 545 },
      { x: 1375, y: 545 },
    ),
    { x: 1165, y: 545 },
    { x: 925, y: 545 },
    { x: 690, y: 545 },
    { x: 420, y: 545 },
    { x: 296, y: 545 },
    { x: 296, y: 822 },
    { x: 77.5, y: 822 },
  ],
};

const GAME_TRAIN_STOP_POINTS = {
  freight: { x: 420, y: 545 },
  "regional-west": { x: 420, y: 545 },
  express: { x: 1090, y: 544.5 },
  "regional-east": { x: 1088, y: 545 },
};

const GAME_TRAIN_MOTION_METRICS = createMotionMetrics(GAME_TRAIN_MOTION_PATHS);

const TRAINS = [
  {
    id: "magenta",
    name: "Magenta",
    color: "#d81b9c",
    passengers: 180,
    timeToDisruption: 20,
    timeToNextStop: 15,
    connectionImportance: "high",
  },
  {
    id: "blue",
    name: "Blue",
    color: "#2868d9",
    passengers: 120,
    timeToDisruption: 22,
    timeToNextStop: 10,
    connectionImportance: "medium",
  },
  {
    id: "turquoise",
    name: "Türkis",
    color: "#14a7bd",
    passengers: 70,
    timeToDisruption: 23,
    timeToNextStop: 15,
    connectionImportance: "low",
  },
];

const PRIMITIVE_STEPS = {
  "identify-suitable-trains": {
    label: "Identify suitable trains",
    description: "Checks which affected trains are suitable for this action.",
  },
  "find-suitable-route": {
    label: "Find suitable route",
    description: "Searches for an alternative route around the disrupted station.",
  },
  "find-turnback-point": {
    label: "Find suitable turnback point",
    description: "Searches for a station where the train can turn back.",
  },
  "check-alternatives": {
    label: "Check alternatives",
    description: "Checks whether passengers have alternative connections.",
  },
  "check-feasibility": {
    label: "Check feasibility",
    description: "Checks whether the action is operationally possible.",
  },
  "check-impact": {
    label: "Check impact",
    description: "Estimates additional delay, missed connections, and passenger impact.",
  },
  "compare-overall-damage": {
    label: "Compare overall damage",
    description: "Compares which option has the lowest overall negative effect.",
  },
};

const ACTION_ORDER = ["reroute", "turnback", "cancel"];

const ACTION_CONFIG = {
  reroute: {
    cardTitle: "Reroute train",
    panelTitle: "Reroute trains",
    planLabel: "Reroute train",
    description: "Find trains that can use an alternative route around Berg.",
    steps: [
      "identify-suitable-trains",
      "find-suitable-route",
      "check-feasibility",
      "check-impact",
    ],
    results: {
      magenta: {
        trainId: "magenta",
        suitability: "good",
        additionalDelay: 18,
        reason:
          "High passenger number, route available, important connection can probably be preserved.",
      },
      blue: {
        trainId: "blue",
        suitability: "medium",
        additionalDelay: 24,
        reason:
          "Reroute is possible, but there is some risk of missed connections.",
      },
      turquoise: {
        trainId: "turquoise",
        suitability: "low",
        additionalDelay: 35,
        reason: "High additional delay and lower passenger benefit.",
      },
    },
  },
  turnback: {
    cardTitle: "Turn train back",
    panelTitle: "Turn trains back",
    planLabel: "Turn train back",
    description:
      "Find trains that can turn around before reaching the disrupted area.",
    steps: [
      "identify-suitable-trains",
      "find-turnback-point",
      "check-feasibility",
      "check-impact",
    ],
    results: {
      magenta: {
        trainId: "magenta",
        suitability: "low",
        additionalDelay: 30,
        reason:
          "High passenger number and important connections make turnback less suitable.",
      },
      blue: {
        trainId: "blue",
        suitability: "good",
        additionalDelay: 20,
        reason:
          "Can turn back before the disrupted area and helps reduce network conflicts.",
      },
      turquoise: {
        trainId: "turquoise",
        suitability: "medium",
        additionalDelay: 25,
        reason: "Turnback is possible, but passenger benefit is limited.",
      },
    },
  },
  cancel: {
    cardTitle: "Cancel train",
    panelTitle: "Cancel trains",
    planLabel: "Cancel train",
    description:
      "Find trains where cancellation causes the lowest overall impact.",
    steps: [
      "identify-suitable-trains",
      "check-alternatives",
      "check-impact",
      "compare-overall-damage",
    ],
    results: {
      magenta: {
        trainId: "magenta",
        suitability: "low",
        additionalDelay: 45,
        reason: "Too many passengers and important connections affected.",
      },
      blue: {
        trainId: "blue",
        suitability: "medium",
        additionalDelay: 35,
        reason:
          "Cancellation is possible but affects a medium number of passengers.",
      },
      turquoise: {
        trainId: "turquoise",
        suitability: "good",
        additionalDelay: 25,
        reason: "Lower passenger number and alternative connections available.",
      },
    },
  },
};

const conceptCards = [
  {
    title: "Szenario",
    body: "Ein Bahnhof f&auml;llt aufgrund einer St&ouml;rung aus. Dadurch k&ouml;nnen mehrere Z&uuml;ge ihre geplante Strecke nicht wie vorgesehen befahren.",
    imageSrc: "images/instruction_scenario.png",
    nodeId: "56:2266",
  },
  {
    title: "Aufgabe",
    body: "Ihre Aufgabe besteht darin, einen Massnahmenplan zu erstellen. Ein Massnahmenplan legt fest, wie auf die St&ouml;rung reagiert werden soll, z. B. indem Z&uuml;ge umgeleitet, gewendet oder ausfallen gelassen werden.",
    imageSrc: "images/instruction_task.png",
    nodeId: "56:2279",
  },
  {
    title: "Ziel",
    bodyHtml: `
      <p>Versuchen Sie, die Auswirkungen der St&ouml;rung m&ouml;glichst gering zu halten.</p>
      <p>Achten Sie dabei insbesondere darauf, dass:</p>
      <ul>
        <li>m&ouml;glichst viele Reisende ihr Ziel erreichen,</li>
        <li>Versp&auml;tungen begrenzt werden,</li>
        <li>wichtige Verbindungen erhalten bleiben.</li>
      </ul>
    `,
    imageSrc: "images/instruction_goal.png",
    nodeId: "56:2286",
  },
];

const trainCards = [
  {
    title: "Schnellzug / IC",
    bodyHtml: `
      <ul>
        <li>Verbindet gr&ouml;ssere St&auml;dte.</li>
        <li>H&auml;lt nur an wenigen Bahnh&ouml;fen.</li>
        <li>Bef&ouml;rdert viele Reisende.</li>
      </ul>
    `,
    visual: "train-fast",
    nodeId: "56:2297",
  },
  {
    title: "Regionalzug / S-Bahn",
    bodyHtml: `
      <ul>
        <li>H&auml;lt an vielen Bahnh&ouml;fen.</li>
        <li>Bef&ouml;rdert Reisende auf k&uuml;rzeren Strecken.</li>
        <li>Bef&ouml;rdert weniger Reisende als ein Schnellzug.</li>
      </ul>
    `,
    visual: "train-regional",
    nodeId: "56:2301",
  },
  {
    title: "Güterzug",
    bodyHtml: `
      <ul>
        <li>Transportiert Waren statt Reisende.</li>
        <li>Ben&ouml;tigt Streckenkapazit&auml;t.</li>
        <li>Hat keinen direkten Einfluss auf die Reisenden.</li>
      </ul>
    `,
    visual: "train-freight",
    nodeId: "56:2305",
  },
];

const measureCards = [
  {
    title: "Wenden",
    body: "Der Zug f&auml;hrt bis m&ouml;glichst nahe an die St&ouml;rung und kehrt dort um. Der Unterbruch wird mit Ersatzb&uuml;ssen geregelt.",
    visual: "measure-turnback",
    nodeId: "57:1257",
  },
  {
    title: "Umleiten",
    body: "Der Zug f&auml;hrt &uuml;ber eine alternative Strecke und kann bei Kapazit&auml;t zus&auml;tzlich anhalten, um betroffene Passagiere aufzunehmen.",
    visual: "measure-reroute",
    nodeId: "57:1261",
  },
  {
    title: "Ausfall",
    body: "Der Zug wird gestrichen und f&auml;hrt nicht mehr weiter.",
    visual: "measure-cancel",
    nodeId: "57:1265",
  },
];

const trainPositions = {
  magenta: { top: "48%", left: "5%" },
  blue: { top: "62%", left: "5%" },
  turquoise: { top: "68%", left: "5%" },
};

const initialConditions = {
  maxAdditionalDelay: 30,
  preferHighPassengerTrains: true,
  preserveImportantConnections: true,
  avoidNetworkConflicts: true,
};

const appState = {
  screen: initialScreen,
  flowScreen: 1,
  selectedAction: null,
  selectedStepIds: [],
  conditions: { ...initialConditions },
  selectedResultTrainIds: [],
  savedActions: [],
  gameDialogVisible: true,
  activeGameTooltip: null,
  gameTooltipIndex: -1,
  gameDisturbanceTooltipNeedsContinue: false,
  gameExplanationLocked: false,
  gameRoutePreviewRunning: false,
  gameTrainMotionStarted: false,
  gameTrainMotionStartedAt: 0,
  gameTrainMotionStoppedAt: null,
  gameTrainMotionStopped: false,
  gameAccordionOpen: false,
  gameAccordionMode: "overview",
  gameRerouteSaved: false,
  gameTurnbackSaved: false,
  gameCancelSaved: false,
  measureDefinitions: createEmptyMeasureDefinitions(),
  measureDefinitionStepCounts: createEmptyMeasureDefinitionStepCounts(),
  activeCustomConditionKind: null,
  customConditionDrafts: createEmptyCustomConditionDrafts(),
  planExecutionState: "idle",
  planExecutionStartedAt: null,
};

root.addEventListener("click", handleClick);
root.addEventListener("change", handleChange);
root.addEventListener("input", handleInput);
root.addEventListener("mouseover", handleMouseOver);
root.addEventListener("mouseout", handleMouseOut);
root.addEventListener("mousemove", handleMouseMove);
root.addEventListener("dragstart", handleDragStart);
root.addEventListener("dragover", handleDragOver);
root.addEventListener("dragleave", handleDragLeave);
root.addEventListener("drop", handleDrop);
window.addEventListener("resize", updateGameStageScale);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateGameStageScale);
  window.visualViewport.addEventListener("scroll", updateGameStageScale);
}

render();

function setScreen(screen) {
  if (screen !== "plan-execution") {
    clearPlanExecutionTimers();
  }

  appState.screen = screen;
  if (screen === "game") {
    resetGameState();
  } else {
    clearGameTooltipTimer();
    clearGameRoutePreviewTimer();
    clearGameTrainAnimationFrame();
  }
  window.scrollTo({ left: 0, top: 0 });
  render();
}

function setFlowScreen(screen) {
  appState.flowScreen = screen;
  render();
}

function render() {
  if (appState.screen === "welcome") {
    root.innerHTML = renderWelcomeScreen();
    return;
  }

  if (appState.screen === "concept") {
    root.innerHTML = renderInstructionConceptScreen();
    return;
  }

  if (appState.screen === "trains") {
    root.innerHTML = renderInstructionTrainActionsScreen();
    return;
  }

  if (appState.screen === "game") {
    root.innerHTML = renderGameScreen();
    requestAnimationFrame(() => {
      updateGameStageScale();
      syncGameTrainMotion();
    });
    return;
  }

  if (appState.screen === "plan-execution") {
    root.innerHTML = renderPlanExecutionScreen();
    return;
  }

  if (appState.screen === "plan-result") {
    root.innerHTML = renderPlanResultScreen();
    return;
  }

  if (appState.screen === "plan-end") {
    root.innerHTML = renderPlanEndScreen();
    return;
  }

  root.innerHTML = `
    <main class="app-shell">
      ${renderRailMap()}
      ${renderPrimitiveFlow()}
    </main>
  `;
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");

  if (!button) {
    if (appState.screen === "game" && !event.target.closest(".game-accordion")) {
      handleGameCanvasClick(event);
    }
    return;
  }

  const action = button.dataset.action;

  if (action === "go-welcome") setScreen("welcome");
  if (action === "go-concept") setScreen("concept");
  if (action === "go-trains") setScreen("trains");
  if (action === "go-prototype") setScreen("prototype");
  if (action === "go-game") setScreen("game");
  if (action === "go-previous-from-game") setScreen("trains");
  if (action === "dismiss-game-dialog") dismissGameDialog();
  if (action === "continue-disturbance-tooltip") continueGameDisturbanceTooltip();
  if (action === "continue-route-tooltip") continueGameRouteTooltip();
  if (action === "pause-game-trains") pauseGameTrains();
  if (action === "toggle-game-accordion") toggleGameAccordion();
  if (action === "define-reroute") openRerouteDefinition();
  if (action === "define-turnback") openTurnbackDefinition();
  if (action === "define-cancel") openCancelDefinition();
  if (action === "back-to-accordion") backToGameAccordion();
  if (action === "save-reroute") saveGameReroute();
  if (action === "save-turnback") saveGameTurnback();
  if (action === "save-cancel") saveGameCancel();
  if (action === "add-definition-step") addDefinitionStep(button.dataset.measureKind);
  if (action === "open-custom-condition") openCustomCondition(button.dataset.measureKind);
  if (action === "cancel-custom-condition") cancelCustomCondition();
  if (action === "save-custom-condition") saveCustomCondition(button.dataset.measureKind);
  if (action === "start-plan-execution") startPlanExecution();
  if (action === "cancel-plan-execution") cancelPlanExecution();
  if (action === "go-plan-result") goPlanResult();
  if (action === "go-plan-end") goPlanEnd();
  if (action === "flow-screen") setFlowScreen(Number(button.dataset.screen));
  if (action === "select-action") selectAction(button.dataset.actionType);
  if (action === "toggle-step") toggleStep(button.dataset.stepId);
  if (action === "toggle-result-train") toggleResultTrain(button.dataset.trainId);
  if (action === "save-action") saveAction();
  if (action === "add-another-action") addAnotherAction();
  if (action === "finish-plan") setFlowScreen(8);
  if (action === "complete-task") completeTask();
  if (action === "remove-saved-action") removeSavedAction(button.dataset.actionId);
}

function handleChange(event) {
  const target = event.target;

  if (target.matches("[data-condition-toggle]")) {
    appState.conditions[target.dataset.conditionToggle] = target.checked;
    render();
  }

  if (target.matches("[data-result-train]")) {
    toggleResultTrain(target.dataset.resultTrain);
  }
}

function handleInput(event) {
  const target = event.target;

  if (target.id === "delay-range") {
    appState.conditions.maxAdditionalDelay = DELAY_OPTIONS[Number(target.value)];
    render();
  }

  if (target.id === "definition-delay-range") {
    const valueLabel = root.querySelector("[data-definition-delay-value]");
    if (valueLabel) valueLabel.textContent = `${target.value} min.`;
    saveMeasureDefinitionValue(target);
    updateMeasureDefinitionSavedState(target.dataset.measureDefinitionInput);
  }

  if (target.matches("[data-measure-definition-input]")) {
    saveMeasureDefinitionValue(target);
    updateDefinitionStepFilledState(target);
    updateMeasureDefinitionSavedState(target.dataset.measureDefinitionInput);
  }

  if (target.matches("[data-custom-condition-input]")) {
    saveCustomConditionDraftValue(target);
    updateCustomConditionSaveButton(target.dataset.customConditionKind);
  }
}

function handleMouseOver(event) {
  if (appState.screen !== "game" || appState.gameDialogVisible) return;
  if (isGameExplanationLocked()) return;

  const alert = event.target.closest("[data-alert-tooltip]");
  if (alert && !appState.gameRoutePreviewRunning) {
    showGameTooltip("brugg", { autoHide: false });
    return;
  }

  if (appState.gameRoutePreviewRunning || appState.activeGameTooltip === "brugg") return;

  const train = event.target.closest("[data-train-tooltip]");
  if (!train) return;

  const tooltipId = train.dataset.trainTooltip;
  if (!tooltipId || appState.activeGameTooltip === tooltipId) return;

  const index = GAME_TOOLTIP_ORDER.indexOf(tooltipId);
  appState.gameTooltipIndex = index;
  showGameTooltip(tooltipId, { autoHide: false });
}

function handleMouseOut(event) {
  if (appState.screen !== "game" || appState.gameDialogVisible) return;
  if (isGameExplanationLocked()) return;

  const alert = event.target.closest("[data-alert-tooltip]");
  if (alert) {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && alert.contains(relatedTarget)) return;
    if (appState.activeGameTooltip === "brugg") hideGameTooltip();
    return;
  }

  if (appState.gameRoutePreviewRunning || appState.activeGameTooltip === "brugg") return;

  const train = event.target.closest("[data-train-tooltip]");
  if (!train) return;

  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && train.contains(relatedTarget)) return;

  if (appState.activeGameTooltip === train.dataset.trainTooltip) {
    hideGameTooltip();
  }
}

function handleMouseMove(event) {
  if (appState.screen !== "game" || appState.gameDialogVisible) return;
  if (isGameExplanationLocked() || appState.gameRoutePreviewRunning) return;
  if (!appState.activeGameTooltip) return;

  if (appState.activeGameTooltip === "brugg") {
    if (!event.target.closest("[data-alert-tooltip]")) hideGameTooltip();
    return;
  }

  const hoveredTrain = event.target.closest("[data-train-tooltip]");
  if (hoveredTrain?.dataset.trainTooltip === appState.activeGameTooltip) return;

  hideGameTooltip();
}

function handleDragStart(event) {
  const chip = event.target.closest("[data-definition-chip]");
  if (!chip) return;

  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", chip.dataset.definitionChip || chip.textContent.trim());
}

function handleDragOver(event) {
  const target = event.target.closest("[data-definition-step-input]");
  if (!target) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  target.classList.add("is-drag-over");
}

function handleDragLeave(event) {
  const target = event.target.closest("[data-definition-step-input]");
  if (!target) return;

  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && target.contains(relatedTarget)) return;

  target.classList.remove("is-drag-over");
}

function handleDrop(event) {
  const target = event.target.closest("[data-definition-step-input]");
  if (!target) return;

  event.preventDefault();
  const chipText = event.dataTransfer.getData("text/plain").trim();
  if (!chipText) return;

  target.value = target.value.trim() ? `${target.value.trim()}; ${chipText}` : chipText;
  target.classList.remove("is-drag-over");
  updateDefinitionStepFilledState(target);
  updateMeasureDefinitionSavedState(target.dataset.measureDefinitionInput);
  target.dispatchEvent(new Event("input", { bubbles: true }));
}

function updateDefinitionStepFilledState(input) {
  if (!input.matches("[data-definition-step-input]")) return;

  const isFilled = Boolean(input.value.trim());
  input.classList.toggle("is-filled", isFilled);
  input.closest(".definition-step-row")?.classList.toggle("is-filled", isFilled);
}

function renderWelcomeScreen() {
  return `
    <main class="welcome-screen" data-name="1 - Willkommen Screen für Experiment" data-node-id="54:862">
      <section class="welcome-copy" aria-labelledby="welcome-title">
        <h1 id="welcome-title" data-node-id="56:2122">Sie befinden sich nun in der Simulation.</h1>
        <div class="welcome-text" data-node-id="56:2123">
          <p>Sie nehmen in der Simulation die Rolle einer Dispatcherin bzw. eines Dispatchers im Bahnverkehr ein. Dispatcher koordinieren den Zugverkehr und entscheiden bei St&ouml;rungen, welche Massnahmen f&uuml;r die betroffenen Z&uuml;ge getroffen werden. Im n&auml;chsten Schritt erhalten Sie eine kurze Einf&uuml;hrung in Ihre Aufgabe, das Szenario und das Ziel der Simulation.</p>
        </div>
      </section>
      <section class="welcome-visual-panel" aria-label="Simulation Vorschau">
        <img alt="" class="welcome-map-image" data-node-id="180:1991" src="images/welcome.png" />
      </section>
      <button class="primary-button welcome-continue" data-action="go-concept" data-node-id="56:2141" type="button">
        Weiter zur Anleitung
      </button>
    </main>
  `;
}

function renderInstructionConceptScreen() {
  return `
    <main class="instruction-screen instruction-concept" data-name="2 - Anleitung Konzept" data-node-id="56:2155">
      ${renderInstructionHeader("go-welcome", "140:1708", "56:2156")}
      ${renderInstructionStepper(1, "56:2256")}
      ${renderGuideCardGrid(conceptCards, "concept-card-grid", "56:2293")}
      ${renderInstructionNextButton("Weiter", "go-trains", "56:2230")}
    </main>
  `;
}

function renderInstructionTrainActionsScreen() {
  return `
    <main class="instruction-screen instruction-trains" data-name="3 - Anleitung Züge und Massnahmen" data-node-id="56:2294">
      ${renderInstructionHeader("go-concept", "140:1710", "56:2295")}
      ${renderInstructionStepper(2, "56:2310")}
      <h2 class="instruction-section-title train-title" data-node-id="57:1276">Die Züge</h2>
      ${renderGuideCardGrid(trainCards, "train-card-grid", "56:2296")}
      <h2 class="instruction-section-title measure-title" data-node-id="57:1277">Die Massnahmen</h2>
      ${renderGuideCardGrid(measureCards, "measure-card-grid", "57:1256")}
      <p class="instruction-training-note" data-node-id="177:2544">Die Zugtypen unterscheiden sich in ihren Eigenschaften. &Uuml;berlegen Sie deshalb, welche Massnahmen f&uuml;r die jeweiligen Z&uuml;ge am besten geeignet sind, um die Auswirkungen der St&ouml;rung m&ouml;glichst gering zu halten.</p>
      ${renderInstructionNextButton("Simulation starten", "go-game", "56:2309")}
    </main>
  `;
}

function renderInstructionHeader(backAction, backNodeId, titleNodeId) {
  return `
    <div class="instruction-header">
      ${renderInstructionBackButton(backAction, backNodeId)}
      ${renderInstructionTitle(titleNodeId)}
    </div>
  `;
}

function renderInstructionBackButton(action, nodeId) {
  return `
    <button class="instruction-back-button" data-action="${action}" data-node-id="${nodeId}" type="button" aria-label="Zur&uuml;ck">
      <span aria-hidden="true">&larr;</span>
    </button>
  `;
}

function renderInstructionTitle(nodeId) {
  return `<h1 class="instruction-title" data-node-id="${nodeId}">Anleitung</h1>`;
}

function renderInstructionStepper(activeStep, nodeId) {
  return `
    <nav aria-label="Anleitungsschritte" class="instruction-stepper" data-node-id="${nodeId}">
      <button class="instruction-stepper-item" data-action="go-concept" ${activeStep === 1 ? 'aria-current="step"' : ""} type="button">
        <span class="${activeStep === 1 ? "stepper-number active" : "stepper-number complete"}">1</span>
        <span class="stepper-label">Aufgabe</span>
      </button>
      <span class="stepper-connector"></span>
      <button class="instruction-stepper-item" data-action="go-trains" ${activeStep === 2 ? 'aria-current="step"' : ""} type="button">
        <span class="${activeStep === 2 ? "stepper-number active" : "stepper-number"}">2</span>
        <span class="${activeStep === 2 ? "stepper-label is-wide" : "stepper-label muted is-wide"}">Zugtypen &amp; Massnahme</span>
      </button>
    </nav>
  `;
}

function renderGuideCardGrid(cards, className, nodeId) {
  return `
    <section class="guide-card-grid ${className}" data-node-id="${nodeId}">
      ${cards.map(renderGuideCard).join("")}
    </section>
  `;
}

function renderGuideCard(card) {
  return `
    <article class="guide-card" data-node-id="${card.nodeId}">
      <figure class="guide-card-visual">${renderGuideVisual(card)}</figure>
      <div class="guide-card-body">
        <h3>${card.title}</h3>
        ${card.bodyHtml || `<p>${card.body}</p>`}
      </div>
    </article>
  `;
}

function renderGuideVisual(card) {
  if (card.imageSrc) {
    return `<img alt="" class="guide-card-image" src="${card.imageSrc}" />`;
  }

  const { visual: type } = card;

  if (type.startsWith("concept")) {
    return `
      <div class="concept-visual ${type}">
        <span class="concept-icon-sun"></span>
        <span class="concept-icon-mountain"></span>
        <span class="concept-icon-ground"></span>
      </div>
    `;
  }

  if (type.startsWith("train")) {
    const colors = {
      "train-fast": TRAIN_FILL_COLORS.express,
      "train-regional": TRAIN_FILL_COLORS.regional,
      "train-freight": TRAIN_FILL_COLORS.freight,
    };

    return renderTrainSvg(`guide-train-icon ${type}`, colors[type]);
  }

  return renderMeasureScene(type);
}

function renderTrainSvg(className, fill = TRAIN_FILL_COLORS.express) {
  return `
    <svg class="${className}" data-name="Zug" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <rect fill="none" width="240" height="240"></rect>
      <path fill="#cdcdcd" d="M151.23,204c4.66,0,8.73-1.27,11-3.12a4.33,4.33,0,0,0,1.85-3.3V74.18c0-11.22-10.53-37.84-43.81-37.83s-43.82,26-43.82,37.83v123.4a3.84,3.84,0,0,0,1.09,2.58c2,2.24,6.49,3.82,11.74,3.84ZM147.55,45.55c.64-.64,6.15,5,6.67,5.7s-.9,2.5-2.44,2.18S146.91,46.19,147.55,45.55Zm-61.28,5.7c.52-.7,6-6.34,6.67-5.7s-2.69,7.56-4.23,7.88S85.66,52.1,86.27,51.25Zm34-9.76c21,0,37.71,11.92,37.71,36.45,0-7.65-14.41-23.16-37.71-23.16S82.53,70.29,82.53,77.94C82.53,53.41,99.28,41.49,120.25,41.49ZM82.58,194.55V92.19c-.86-9.8,9.06-32.53,37.67-32.52s38.52,22.72,37.66,32.52V194.55c0,3-4.92,5.49-11,5.52H93.61C87.5,200,82.56,197.57,82.58,194.55Z"></path>
      <path fill="${fill}" d="M102.32,122.24v77.83h35.36V122.24Z"></path>
      <path fill="${fill}" d="M101.17,200.07V122.24H95.83c-3.55,0-6.42-1.44-6.42-3.21v-2.25c0-1.77,2.87-3.21,6.42-3.21H143.9c3.55,0,6.42,1.44,6.42,3.21V119c0,1.77-2.87,3.21-6.42,3.21h-5.07v77.83h8c6.11,0,11.05-2.5,11-5.52V92.19c.86-9.8-9.06-32.53-37.66-32.52S81.72,82.39,82.58,92.19V194.55c0,3,4.92,5.49,11,5.52Z"></path>
      <path fill="#444444" d="M120.25,54.78c23.3,0,37.71,15.51,37.71,23.16,0-24.53-16.74-36.45-37.71-36.45S82.53,53.41,82.53,77.94C82.53,70.29,96.94,54.78,120.25,54.78Z"></path>
      <path fill="#5b5a5a" d="M143.9,113.57H95.83c-3.55,0-6.42,1.44-6.42,3.21V119c0,1.77,2.87,3.21,6.42,3.21h5.34v77.83h1.15V122.24h35.36v77.83h1.15V122.24h5.07c3.55,0,6.42-1.44,6.42-3.21v-2.25C150.32,115,147.45,113.57,143.9,113.57Z"></path>
      <path fill="#fbfbfb" d="M151.78,53.43c1.54.32,3.05-1.33,2.44-2.18s-6-6.34-6.67-5.7S150.24,53.11,151.78,53.43Z"></path>
      <path fill="#fbfbfb" d="M88.71,53.43c1.54-.32,4.87-7.24,4.23-7.88s-6.15,5-6.67,5.7S87.17,53.75,88.71,53.43Z"></path>
    </svg>
  `;
}

function renderMeasureScene(type) {
  if (type === "measure-turnback") {
    return `
      <div class="measure-scene measure-turnback">
        <img alt="" class="scene-track track-left" src="images/guide-track-horizontal.svg" />
        <img alt="" class="scene-track track-right" src="images/guide-track-horizontal.svg" />
        ${renderTrainSvg("scene-train train-turnback", TRAIN_FILL_COLORS.measure)}
      </div>
    `;
  }

  if (type === "measure-reroute") {
    return `
      <div class="measure-scene measure-reroute">
        <img alt="" class="scene-track crossing" src="images/guide-track-crossing.svg" />
        <img alt="" class="scene-track route-top" src="images/guide-track-horizontal.svg" />
        <img alt="" class="scene-track route-bottom" src="images/guide-track-horizontal.svg" />
        <img alt="" class="scene-track route-curve" src="images/guide-track-curve.svg" />
        ${renderTrainSvg("scene-train train-reroute", TRAIN_FILL_COLORS.measure)}
      </div>
    `;
  }

  return `
    <div class="measure-scene measure-cancel">
      <img alt="" class="scene-track cancel-curve" src="images/guide-track-curve.svg" />
      <img alt="" class="scene-track cancel-deadend" src="images/guide-track-deadend.svg" />
      ${renderTrainSvg("scene-train train-cancel", TRAIN_FILL_COLORS.measure)}
    </div>
  `;
}

function renderInstructionNextButton(label, action, nodeId) {
  return `
    <button class="primary-button instruction-next" data-action="${action}" data-node-id="${nodeId}" type="button">
      ${label}
    </button>
  `;
}

function getGameScreenNodeId() {
  if (appState.gameAccordionMode === "cancel-definition") return "cancel-definition";
  if (appState.gameAccordionMode === "turnback-definition") return "turnback-definition";
  if (appState.gameAccordionMode === "definition") return "109:1931";
  if (appState.gameAccordionOpen) return "95:16485";
  if (appState.gameDialogVisible) return "76:1283";
  return "95:3770";
}

function renderGameScreen() {
  return `
    <main class="game-viewport" data-name="5.1 - Primitive Mode" data-node-id="${getGameScreenNodeId()}">
      <section class="game-stage" aria-label="Primitive Mode Bahnnetz">
        <img alt="" class="game-map-base" src="${GAME_ASSETS.background}" />
        ${renderGameStationLabels()}
        ${renderGameBackButton()}
        ${renderGameRouteOverlay()}
        ${renderGameDisturbanceHotspot()}
        ${renderGameAlert()}
        ${renderGameTrains()}
        ${renderGamePauseControl()}
        ${renderGameAccordion()}
        ${isGameExplanationLocked() ? renderGameExplanationLock() : ""}
        ${appState.gameDialogVisible ? `${renderGameDialogBackdrop()}${renderGameDialog()}` : ""}
        ${renderActiveGameTooltip()}
      </section>
    </main>
  `;
}

function renderGameBackButton() {
  const isDisabled = isGameExplanationLocked();

  return `
    <button class="game-back-button${isDisabled ? " is-disabled" : ""}" data-action="go-previous-from-game" style="left: 78px; top: 63px;" type="button" aria-label="Zur&uuml;ck zur Anleitung" ${isDisabled ? "disabled" : ""}>
      <span aria-hidden="true">&larr;</span>
    </button>
  `;
}

function renderGameDecor() {
  return GAME_DECOR.map((item) => renderStageImage(item, "game-decor")).join("");
}

function renderGameTracks() {
  return GAME_TRACKS.map((item) => renderStageImage(item, "game-track")).join("");
}

function renderStageImage(item, className) {
  return `
    <img alt="" class="game-asset ${className}" src="${GAME_ASSETS[item.type]}" style="${stageStyle(item)}" />
  `;
}

function stageStyle(item) {
  const rotation = item.rotate ? `--asset-rotate: ${item.rotate}deg;` : "";
  return `left: ${item.x}px; top: ${item.y}px; width: ${item.w}px; height: ${item.h}px; ${rotation}`;
}

function renderGameStationLabels() {
  return GAME_LABELS.map(
    (label) => `
      <span class="game-station-label" style="left: ${label.x}px; top: ${label.y}px;">${label.text}</span>
    `,
  ).join("");
}

function renderGameAlert() {
  return `
    <button class="game-alert-circle" data-alert-tooltip="brugg" aria-label="St&ouml;rung in Berg anzeigen" style="left: 651px; top: 439px;" type="button">
      <span>!</span>
    </button>
  `;
}

function renderGameDisturbanceHotspot() {
  return `
    <button class="game-disturbance-hotspot primitive-disturbance-hotspot" data-alert-tooltip="brugg" aria-label="St&ouml;rung Bahnhof Berg anzeigen" type="button"></button>
  `;
}

function renderGameTrains() {
  const now = getGameNow();

  return GAME_TRAINS.map((train) => {
    const tooltipAttribute = train.disabled ? "" : `data-train-tooltip="${train.id}"`;
    const disabledClass = train.disabled ? " is-disabled" : "";
    const motion = getTrainMotionState(train, now);
    const style = [
      `left: ${formatPixel(motion.left)}`,
      `top: ${formatPixel(motion.top)}`,
      `width: ${train.w}px`,
      `height: ${train.h}px`,
      `--train-nudge-x: ${train.nudgeX}px`,
      `--train-nudge-y: ${train.nudgeY}px`,
      `--train-rotation: ${formatDegree(motion.rotation)}`,
    ].join("; ");

    return `
      <button class="game-train-button ${train.className}${disabledClass}" data-train-id="${train.id}" ${tooltipAttribute} aria-label="${train.label}" style="${style}" type="button">
        ${renderTrainSvg("game-train-image", train.fill)}
      </button>
    `;
  }).join("");
}

function renderGameAccordion() {
  const isDefinition = ["definition", "turnback-definition", "cancel-definition"].includes(appState.gameAccordionMode);
  const isExpanded = appState.gameAccordionOpen || isDefinition;
  const height = isExpanded ? 1006 : 61;
  const nodeId = isDefinition
    ? appState.gameAccordionMode === "turnback-definition"
      ? "turnback-definition"
      : appState.gameAccordionMode === "cancel-definition"
        ? "cancel-definition"
        : "109:1931"
    : isExpanded
      ? "95:16485"
      : "95:14342";
  const className = [
    "game-accordion",
    isExpanded ? "is-expanded" : "is-collapsed",
    isDefinition ? "is-definition" : "",
    isGameExplanationLocked() ? "is-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <aside class="${className}" data-node-id="${nodeId}" style="left: 1248px; top: 35px; width: 640px; height: ${height}px;" aria-label="Massnahmenplanung">
      ${isDefinition ? renderActiveDefinitionPanel() : renderGameAccordionOverview(isExpanded)}
    </aside>
  `;
}

function renderGamePauseControl() {
  const label = appState.gameTrainMotionStopped ? "Z&uuml;ge pausiert" : "Z&uuml;ge pausieren";

  return `
    <button class="game-pause-button${appState.gameTrainMotionStopped ? " is-paused" : ""}" data-action="pause-game-trains" style="left: 1095px; top: 35px;" type="button" aria-label="${label}">
      <span class="game-pause-icon" aria-hidden="true"><span></span><span></span></span>
      <span class="game-pause-label">${label}</span>
    </button>
  `;
}

function renderGameAccordionOverview(isExpanded) {
  const isDisabled = isGameExplanationLocked();

  return `
    <button class="game-accordion-header" data-action="toggle-game-accordion" type="button" aria-expanded="${isExpanded}" ${isDisabled ? 'aria-disabled="true" disabled' : ""}>
      <span class="game-accordion-heading">
        <span class="game-accordion-title">Massnahmeplan erstellen</span>
        ${isExpanded ? `<span class="game-accordion-intro">Erstellen Sie einen Massnahmenplan, indem Sie der KI Anweisungen geben und die Bedingungen festlegen, nach denen die Planung erfolgen soll.<br><br><strong>F&uuml;r Z&uuml;ge, f&uuml;r die keine Massnahme festgelegt wird, gilt:</strong> Sie warten vor der gesperrten Strecke, bis diese wieder freigegeben wird.</span>` : ""}
      </span>
      <span class="game-accordion-chevron" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    ${
      isExpanded
        ? `
          <div class="game-accordion-content" data-node-id="95:18591">
            ${renderGameMeasureItem({
              nodeId: "95:18592",
              title: "Umleitung",
              status: appState.gameRerouteSaved ? "Definiert" : "Noch nicht definiert",
              isSaved: appState.gameRerouteSaved,
              body:
                "Definieren Sie, unter welchen Bedingungen Z&uuml;ge umgeleitet werden sollen. Legen Sie dazu die Schritte und Rahmenbedingungen f&uuml;r Umleitungen fest.",
              button: "Umleitung definieren",
              action: "define-reroute",
            })}
            ${renderGameMeasureItem({
              nodeId: "95:18840",
              title: "Wenden",
              status: appState.gameTurnbackSaved ? "Definiert" : "Noch nicht definiert",
              isSaved: appState.gameTurnbackSaved,
              body:
                "Definieren Sie, unter welchen Bedingungen Z&uuml;ge gewendet werden sollen. Legen Sie dazu die Schritte und Rahmenbedingungen f&uuml;r Wendeman&ouml;ver fest.",
              button: "Wenden definieren",
              action: "define-turnback",
            })}
            ${renderGameMeasureItem({
              nodeId: "95:19052",
              title: "Ausfall",
              status: appState.gameCancelSaved ? "Definiert" : "Noch nicht definiert",
              isSaved: appState.gameCancelSaved,
              body:
                "Definieren Sie, unter welchen Bedingungen Z&uuml;ge ausfallen sollen. Legen Sie dazu die Planungsschritte und Rahmenbedingungen f&uuml;r Zugausf&auml;lle fest.",
              button: "Ausfall definieren",
              action: "define-cancel",
            })}
          </div>
          <button class="game-accordion-footer-button" ${hasSavedMeasureDefinitions() ? 'data-action="start-plan-execution"' : "disabled"} type="button">Massnahmenplan speichern</button>
        `
        : ""
    }
  `;
}

function renderGameMeasureItem({ nodeId, title, status, isSaved, body, button, action }) {
  const actionAttribute = action ? `data-action="${action}"` : "";
  const statusClass = isSaved ? "is-saved" : "";
  const statusLabelClass = isSaved ? "is-saved" : "";

  return `
    <article class="game-measure-item" data-node-id="${nodeId}">
      <div class="game-measure-title-row">
        <span>${title}</span>
        <span class="game-measure-status-group">
          <strong class="${statusLabelClass}">${status}</strong>
          <span class="game-measure-status ${statusClass}" aria-hidden="true"></span>
        </span>
      </div>
      <div class="game-measure-body-row">
        <p>${body}</p>
        <button class="game-measure-button" ${actionAttribute} type="button">${button}</button>
      </div>
    </article>
  `;
}

function renderActiveDefinitionPanel() {
  if (appState.gameAccordionMode === "cancel-definition") return renderCancelDefinitionPanel();
  if (appState.gameAccordionMode === "turnback-definition") return renderTurnbackDefinitionPanel();
  return renderRerouteDefinitionPanel();
}

function renderRerouteDefinitionPanel() {
  const maxDelayValue = getMeasureDefinitionValue("reroute", "conditions", "max-delay") || "60";

  return `
    <div class="reroute-definition-scroll" data-node-id="109:1931">
      <article class="reroute-definition-panel">
        <header class="reroute-definition-header" data-node-id="109:1932">
          <button class="definition-icon-button" data-action="back-to-accordion" aria-label="Zur&uuml;ck zur Massnahmenplanung" type="button">
            <span aria-hidden="true">&larr;</span>
          </button>
          <h2>Umleitung</h2>
        </header>
        <section class="reroute-section reroute-steps-section" data-node-id="109:1942">
          <h3>Schritte definieren</h3>
          <p>Definieren Sie Schritt f&uuml;r Schritt, was die KI machen soll. Nutzen Sie daf&uuml;r die vordefinierten Schritte und ziehen Sie sie in den Balken oder definieren Sie eigene Schritte.</p>
          ${renderDefinitionStepEditor("reroute", ["Suche geeignete Z&uuml;ge", "Suche geeignete Umleitungsrouten", "Machbarkeit &uuml;berpr&uuml;fen"])}
        </section>
        <section class="reroute-section reroute-conditions-section" data-node-id="109:1984">
          <h3>Rahmenbedingung definieren</h3>
          <p>Legen Sie fest, welche Bedingungen f&uuml;r eine geeignete Umleitung gelten. Nutzen Sie die vorgegebenen Kriterien oder definieren Sie eigene.</p>
          <div class="definition-subsection">
            <h4>Geeignete Z&uuml;ge</h4>
            ${renderDefinitionInput("reroute", "Bevorzugte Zugtypen", "Schnellzug, hohe Kapazit&auml;t etc.")}
            ${renderDefinitionInput("reroute", "Nicht bevorzugte Zugtypen", "G&uuml;terz&uuml;ge, wenig Kapa etc.")}
          </div>
          <div class="definition-subsection">
            <h4>Geeignete Umleitungsroute</h4>
            <div class="definition-slider-row">
              <label for="definition-delay-range">Max. Versp&auml;tung</label>
              <span data-definition-delay-value>${maxDelayValue} min.</span>
            </div>
            <input
              id="definition-delay-range"
              class="definition-delay-range"
              data-measure-definition-input="reroute"
              data-measure-definition-group="conditions"
              data-measure-definition-key="max-delay"
              min="0"
              max="60"
              step="10"
              value="${escapeAttribute(maxDelayValue)}"
              type="range"
            />
          </div>
          ${renderCustomConditionSection("reroute")}
        </section>
        <footer class="reroute-definition-actions">
          <button class="game-measure-button definition-save-button" data-action="save-reroute" type="button">Speichern</button>
        </footer>
      </article>
    </div>
  `;
}

function renderTurnbackDefinitionPanel() {
  return `
    <div class="reroute-definition-scroll" data-node-id="turnback-definition">
      <article class="reroute-definition-panel turnback-definition-panel">
        <header class="reroute-definition-header" data-node-id="turnback-definition-header">
          <button class="definition-icon-button" data-action="back-to-accordion" aria-label="Zur&uuml;ck zur Massnahmenplanung" type="button">
            <span aria-hidden="true">&larr;</span>
          </button>
          <h2>Wenden</h2>
        </header>
        <section class="reroute-section reroute-steps-section" data-node-id="turnback-definition-steps">
          <h3>Schritte definieren</h3>
          <p>Definieren Sie Schritt f&uuml;r Schritt, was die KI machen soll. Nutzen Sie daf&uuml;r die vordefinierten Schritte und ziehen Sie sie in den Balken oder definieren Sie eigene Schritte.</p>
          ${renderDefinitionStepEditor("turnback", ["Suche geeignete Z&uuml;ge", "Suche geeignete Wendepunkte", "Machbarkeit &uuml;berpr&uuml;fen"])}
        </section>
        <section class="reroute-section reroute-conditions-section" data-node-id="turnback-definition-conditions">
          <h3>Rahmenbedingung definieren</h3>
          <p>Legen Sie fest, welche Bedingungen f&uuml;r ein geeignetes Wendeman&ouml;ver gelten. Nutzen Sie die vorgegebenen Kriterien oder definieren Sie eigene.</p>
          <div class="definition-subsection">
            <h4>Geeignete Z&uuml;ge</h4>
            <div class="definition-input-grid">
              ${renderDefinitionInput("turnback", "Bevorzugte Zugtypen", "Regionalz&uuml;ge, hohe Kapazit&auml;t etc.")}
              ${renderDefinitionInput("turnback", "Nicht bevorzugte Zugtypen", "G&uuml;terz&uuml;ge, wenig Kapa etc.")}
            </div>
          </div>
          <div class="definition-subsection">
            <h4>Geeignete Wendepunkte</h4>
            <div class="definition-input-grid">
              ${renderDefinitionInput("turnback", "Bevorzugte Wendepunkte", "kurz vor der St&ouml;rung, passend zum Fahrplan etc.")}
              ${renderDefinitionInput("turnback", "Nicht bevorzugte Wendepunkte", "weit vor der St&ouml;rung etc.")}
            </div>
          </div>
          ${renderCustomConditionSection("turnback")}
        </section>
        <footer class="reroute-definition-actions">
          <button class="game-measure-button definition-save-button" data-action="save-turnback" type="button">Speichern</button>
        </footer>
      </article>
    </div>
  `;
}

function renderCancelDefinitionPanel() {
  return `
    <div class="reroute-definition-scroll" data-node-id="cancel-definition">
      <article class="reroute-definition-panel cancel-definition-panel">
        <header class="reroute-definition-header" data-node-id="cancel-definition-header">
          <button class="definition-icon-button" data-action="back-to-accordion" aria-label="Zur&uuml;ck zur Massnahmenplanung" type="button">
            <span aria-hidden="true">&larr;</span>
          </button>
          <h2>Ausfall</h2>
        </header>
        <section class="reroute-section reroute-steps-section" data-node-id="cancel-definition-steps">
          <h3>Schritte definieren</h3>
          <p>Definieren Sie Schritt f&uuml;r Schritt, was die KI machen soll. Nutzen Sie daf&uuml;r die vordefinierten Schritte und ziehen Sie sie in den Balken oder definieren Sie eigene Schritte.</p>
          ${renderDefinitionStepEditor("cancel", ["Suche geeignete Z&uuml;ge", "Suche geeignete Abstellorte", "Machbarkeit &uuml;berpr&uuml;fen"])}
        </section>
        <section class="reroute-section reroute-conditions-section" data-node-id="cancel-definition-conditions">
          <h3>Rahmenbedingung definieren</h3>
          <p>Legen Sie fest, welche Bedingungen f&uuml;r einen geeigneten Zugausfall gelten. Nutzen Sie die vorgegebenen Kriterien oder definieren Sie eigene.</p>
          <div class="definition-subsection">
            <h4>Geeignete Z&uuml;ge</h4>
            <div class="definition-input-grid">
              ${renderDefinitionInput("cancel", "Bevorzugte Zugtypen", "G&uuml;terzug etc.")}
              ${renderDefinitionInput("cancel", "Nicht bevorzugte Zugtypen", "viel Kapazit&auml;t, Personenz&uuml;ge")}
            </div>
          </div>
          <div class="definition-subsection">
            <h4>Geeignete Abstellorte</h4>
            <div class="definition-input-grid">
              ${renderDefinitionInput("cancel", "Bevorzugte Abstellorte", "hat Platz f&uuml;r G&uuml;terz&uuml;ge etc.")}
              ${renderDefinitionInput("cancel", "Nicht bevorzugte Abstellorte", "weit vom Zug weg")}
            </div>
          </div>
          ${renderCustomConditionSection("cancel")}
        </section>
        <footer class="reroute-definition-actions">
          <button class="game-measure-button definition-save-button" data-action="save-cancel" type="button">Speichern</button>
        </footer>
      </article>
    </div>
  `;
}

function renderDefinitionStepEditor(kind, chips) {
  const stepCount = getDefinitionStepCount(kind);

  return `
    <div class="definition-step-list" aria-label="Schritte definieren">
      ${Array.from({ length: stepCount }, (_, index) => renderRerouteStepDropzone(index + 1, kind)).join("")}
      <button class="definition-add-step" data-action="add-definition-step" data-measure-kind="${kind}" aria-label="Schritt hinzuf&uuml;gen" type="button">+</button>
    </div>
    <div class="definition-tags" aria-label="Vordefinierte Schritte">
      ${chips
        .map(
          (label) =>
            `<button class="definition-tag" data-definition-chip="${label}" draggable="true" type="button"><span>${label}</span><span aria-hidden="true">&times;</span></button>`,
        )
        .join("")}
    </div>
  `;
}

function renderCustomConditionSection(kind) {
  const isOpen = appState.activeCustomConditionKind === kind;

  return `
    <div class="definition-subsection definition-custom-condition">
      <h4>Weitere</h4>
      ${renderSavedCustomConditions(kind)}
      ${
        isOpen
          ? renderCustomConditionForm(kind)
          : `
            <button class="definition-custom-button" data-action="open-custom-condition" data-measure-kind="${kind}" type="button">
              <span>Eigene Rahmenbedingung definieren</span>
              <span aria-hidden="true">+</span>
            </button>
          `
      }
    </div>
  `;
}

function renderSavedCustomConditions(kind) {
  const entries = getCustomConditionEntries(kind);
  if (entries.length === 0) return "";

  return `
    <ul class="definition-custom-list" aria-label="Eigene Rahmenbedingungen">
      ${entries
        .map(
          ({ name, value }) => `
            <li>
              <strong>${escapeHtml(name)}</strong>
              <span>${escapeHtml(value)}</span>
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
}

function renderCustomConditionForm(kind) {
  const draft = appState.customConditionDrafts[kind] || { name: "", value: "" };
  const canSave = draft.name.trim() && draft.value.trim();

  return `
    <article class="definition-custom-form" data-node-id="195:2368" aria-label="Eigene Rahmenbedingung definieren">
      <label class="definition-custom-input-group" data-node-id="195:2369">
        <span>Name</span>
        <small>Geben Sie der Rahmenbedingung einen Namen</small>
        <input
          data-custom-condition-input
          data-custom-condition-kind="${kind}"
          data-custom-condition-field="name"
          type="text"
          placeholder="Bevorzugte Route"
          value="${escapeAttribute(draft.name)}"
        />
      </label>
      <label class="definition-custom-input-group" data-node-id="195:2405">
        <span>Wert</span>
        <small>Tragen Sie den gew&uuml;nschten Wert ein</small>
        <input
          data-custom-condition-input
          data-custom-condition-kind="${kind}"
          data-custom-condition-field="value"
          type="text"
          placeholder="Route 1"
          value="${escapeAttribute(draft.value)}"
        />
      </label>
      <div class="definition-custom-actions" data-node-id="195:2370">
        <button class="definition-form-button definition-form-button-subtle" data-action="cancel-custom-condition" type="button">Abbrechen</button>
        <button class="definition-form-button definition-form-button-primary" data-action="save-custom-condition" data-measure-kind="${kind}" ${canSave ? "" : "disabled"} type="button">Speichern</button>
      </div>
    </article>
  `;
}

function renderRerouteStepDropzone(stepNumber, kind) {
  const value = getMeasureDefinitionValue(kind, "steps", `step-${stepNumber}`);
  const filledClass = value.trim() ? " is-filled" : "";

  return `
    <div class="definition-step-row${filledClass}">
      <span class="definition-step-number">${stepNumber}</span>
      <input
        class="definition-step-dropzone${filledClass}"
        data-definition-step-input
        data-measure-definition-input="${kind}"
        data-measure-definition-group="steps"
        data-measure-definition-key="step-${stepNumber}"
        type="text"
        aria-label="Schritt ${stepNumber} definieren"
        placeholder="Ziehen Sie hier die vordefinierten Schritte hinein oder definieren Sie eigene"
        value="${escapeAttribute(value)}"
      />
    </div>
  `;
}

function renderDefinitionInput(kind, label, placeholder) {
  return `
    <label class="definition-input-group">
      <span>${label}</span>
      <input data-measure-definition-input="${kind}" data-measure-definition-group="conditions" data-measure-definition-key="${escapeAttribute(label)}" type="text" placeholder="${placeholder}" value="${escapeAttribute(getMeasureDefinitionValue(kind, "conditions", label))}" />
    </label>
  `;
}

function renderPlanExecutionScreen() {
  const state = appState.planExecutionState;
  const cards = getPlanExecutionCards();
  const progress = getPlanExecutionProgress(cards);
  const nodeId = state === "skeleton" ? "181:8462" : state === "done" ? "181:8607" : "181:2245";
  const showSubtitle = state !== "done";
  let itemIndex = 0;

  return `
    <main class="plan-execution-screen" data-node-id="${nodeId}">
      <section class="plan-execution-content">
        <header class="plan-execution-header">
          <h1>Massnahmeplan</h1>
          ${showSubtitle ? '<h2>Massnahmeplan wird erstellt<span class="animated-ellipsis" aria-hidden="true"></span><span class="sr-only">...</span></h2>' : ""}
        </header>
        <section class="plan-execution-grid" aria-label="Ausf&uuml;hrung des Massnahmeplans">
          ${cards
            .map((card) =>
              renderPlanExecutionCard(card, state, progress, () => {
                const current = itemIndex;
                itemIndex += 1;
                return current;
              }),
            )
            .join("")}
        </section>
      </section>
      <footer class="plan-execution-actions" data-name="Button Group">
        <button class="plan-button plan-button-neutral" data-action="cancel-plan-execution" type="button">Abbrechen</button>
        <button class="plan-button plan-button-primary" ${state === "done" ? 'data-action="go-plan-result"' : "disabled"} type="button">Weiter zum Ergebnis</button>
      </footer>
    </main>
  `;
}

function renderPlanResultScreen() {
  const resultCards = [
    {
      title: "Folgeversp&auml;tung",
      score: "40%",
      percent: 40,
      color: "#f5221f",
      text: "Es sind unn&ouml;tige Folgeversp&auml;tungen entstanden",
    },
    {
      title: "Anschlussverbindung",
      score: "20%",
      percent: 20,
      color: "#f5221f",
      text: "Mehrere Anschlussverbindungen gingen verloren",
    },
    {
      title: "Reisende erreichen ihr Ziel",
      score: "50%",
      percent: 50,
      color: "#f2c029",
      text: "Ein erheblicher Teil der Reisenden erreichte sein Ziel nicht wie geplant.",
    },
  ];

  return `
    <main class="plan-result-screen" data-node-id="177:2403" data-name="9 - Feedback">
      <h1>Ergebnis Ihres Massnahmenplans</h1>
      <section class="plan-result-grid" aria-label="Bewertung des Massnahmenplans">
        <article class="plan-result-summary" data-node-id="176:2190">
          <h2>Gesamtbewertung</h2>
          ${renderResultDonut("36.6 %", 36.6, "#f5221f", "is-large")}
          <p>Die gew&auml;hlten Massnahmen konnten die Auswirkungen der St&ouml;rung nur zu 36.6% begrenzen.</p>
        </article>
        ${resultCards
          .map(
            (card) => `
              <article class="plan-result-card">
                <h2>${card.title}</h2>
                ${renderResultDonut(card.score, card.percent, card.color)}
                <p>${card.text}</p>
              </article>
            `,
          )
          .join("")}
      </section>
      <footer class="plan-result-actions" data-name="Button Group">
        <button class="plan-button plan-button-primary" data-action="go-plan-end" type="button">Weiter</button>
      </footer>
    </main>
  `;
}

function renderPlanEndScreen() {
  return `
    <main class="plan-end-screen" data-node-id="179:1974" data-name="10 - End">
      <h1 data-node-id="179:1975">Kehren Sie zur Umfrage zur&uuml;ck</h1>
      <section class="plan-end-copy" data-node-id="179:1976" aria-label="Simulation beendet">
        <p>Vielen Dank, die Simulation ist beendet.</p>
        <p>Kehren Sie bitte zur Umfrage zur&uuml;ck, um die Studie fortzusetzen.</p>
        <p>Sie k&ouml;nnen nun dieses Fenster schliessen.</p>
      </section>
    </main>
  `;
}

function renderResultDonut(score, percent, color, className = "") {
  const progress = Math.max(0, Math.min(100, percent));

  return `
    <div class="result-donut ${className}" style="--result-progress: ${progress}%; --result-color: ${color};" aria-label="${score}">
      <span>${score}</span>
    </div>
  `;
}

function renderPlanExecutionCard(card, state, progress, nextIndex) {
  return `
    <article class="plan-execution-card" data-measure-kind="${card.kind}">
      <h2>${card.title}</h2>
      <div class="plan-execution-card-body">
        ${renderPlanExecutionSection("Rahmenbedingung", card.conditions, state, progress, nextIndex)}
        ${renderPlanExecutionSection("Schritte", card.steps, state, progress, nextIndex)}
      </div>
    </article>
  `;
}

function renderPlanExecutionSection(title, items, state, progress, nextIndex) {
  if (state === "skeleton") {
    return `
      <section class="plan-execution-section">
        <h3>${title}</h3>
        <div class="plan-skeleton-lines" aria-hidden="true">
          <span class="plan-skeleton-line is-long"></span>
          <span class="plan-skeleton-line is-short"></span>
          <span class="plan-skeleton-line is-medium"></span>
        </div>
      </section>
    `;
  }

  return `
    <section class="plan-execution-section">
      <h3>${title}</h3>
      <ul class="plan-execution-list">
        ${items.map((item) => renderPlanExecutionItem(item, state, progress, nextIndex())).join("")}
      </ul>
    </section>
  `;
}

function renderPlanExecutionItem(text, state, progress, index) {
  const isDone = state === "done" || index < progress;

  return `
    <li class="plan-execution-item" tabindex="0">
      <span class="plan-execution-item-text">${text}</span>
      ${isDone ? '<span class="plan-status-check" aria-label="Ausgef&uuml;hrt"></span>' : '<span class="plan-status-spinner" aria-label="Wird ausgef&uuml;hrt"></span>'}
    </li>
  `;
}

function getPlanExecutionCards() {
  return getMeasurePlanConfigs().map((config) => ({
    ...config,
    conditions: getPlanExecutionItems(config.kind, "conditions", config.saved),
    steps: getPlanExecutionItems(config.kind, "steps", config.saved),
  }));
}

function getMeasurePlanConfigs() {
  return [
    { kind: "reroute", title: "Umleiten", saved: appState.gameRerouteSaved },
    { kind: "turnback", title: "Wenden", saved: appState.gameTurnbackSaved },
    { kind: "cancel", title: "Ausfallen", saved: appState.gameCancelSaved },
  ];
}

function getPlanExecutionItems(kind, group, isSaved) {
  const groupValues = appState.measureDefinitions[kind]?.[group] || {};
  const values = Object.entries(groupValues)
    .map(([key, value]) => formatPlanExecutionValue(kind, group, key, value))
    .filter(Boolean);

  if (values.length > 0) return values;
  if (isSaved) return [group === "steps" ? "Schritte wurden definiert" : "Rahmenbedingung wurde definiert"];
  return ["Noch nicht definiert"];
}

function formatPlanExecutionValue(kind, group, key, value) {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return "";
  if (!isMeaningfulMeasureDefinitionValue(kind, group, key, trimmedValue)) return "";
  const safeValue = escapeHtml(trimmedValue);
  if (group !== "conditions") return safeValue;
  if (key.startsWith("custom:")) {
    const conditionName = escapeHtml(key.slice("custom:".length));
    return `Die eigene Rahmenbedingung &bdquo;${conditionName}&ldquo; wird mit folgendem Wert ber&uuml;cksichtigt: ${safeValue}.`;
  }

  const formatters = {
    reroute: {
      "Bevorzugte Zugtypen": (value) =>
        `Bei der Auswahl der Umleitungsroute werden bevorzugt folgende Zugtypen ber&uuml;cksichtigt: ${value}.`,
      "Nicht bevorzugte Zugtypen": (value) =>
        `Bei der Auswahl der Umleitungsroute werden folgende Zugtypen nach M&ouml;glichkeit vermieden: ${value}.`,
      "max-delay": (value) =>
        `Bei der Auswahl der Umleitungsroute wird darauf geachtet, dass die Z&uuml;ge nicht mehr als ${value} Minuten Versp&auml;tung erhalten.`,
    },
    turnback: {
      "Bevorzugte Zugtypen": (value) =>
        `Beim Wenden werden bevorzugt folgende Zugtypen ber&uuml;cksichtigt: ${value}.`,
      "Nicht bevorzugte Zugtypen": (value) =>
        `Beim Wenden werden folgende Zugtypen nach M&ouml;glichkeit vermieden: ${value}.`,
      "Bevorzugte Wendepunkte": (value) =>
        `Beim Wenden werden bevorzugt Wendepunkte gew&auml;hlt, die folgende Kriterien erf&uuml;llen: ${value}.`,
      "Nicht bevorzugte Wendepunkte": (value) =>
        `Beim Wenden werden Wendepunkte mit folgenden Eigenschaften nach M&ouml;glichkeit vermieden: ${value}.`,
    },
    cancel: {
      "Bevorzugte Zugtypen": (value) =>
        `Beim Ausfall werden bevorzugt folgende Zugtypen ber&uuml;cksichtigt: ${value}.`,
      "Nicht bevorzugte Zugtypen": (value) =>
        `Beim Ausfall werden folgende Zugtypen nach M&ouml;glichkeit vermieden: ${value}.`,
      "Bevorzugte Abstellorte": (value) =>
        `Beim Ausfall werden bevorzugt Abstellorte gew&auml;hlt, die folgende Kriterien erf&uuml;llen: ${value}.`,
      "Nicht bevorzugte Abstellorte": (value) =>
        `Beim Ausfall werden Abstellorte mit folgenden Eigenschaften nach M&ouml;glichkeit vermieden: ${value}.`,
    },
  };

  const formatter = formatters[kind]?.[key];
  return formatter ? formatter(safeValue) : `${escapeHtml(key)}: ${safeValue}`;
}

function getPlanExecutionItemCount(cards) {
  return cards.reduce((count, card) => count + card.conditions.length + card.steps.length, 0);
}

function getPlanExecutionProgress(cards) {
  const totalItems = getPlanExecutionItemCount(cards);
  if (appState.planExecutionState === "done") return totalItems;
  if (appState.planExecutionState !== "running" || !appState.planExecutionStartedAt) return 0;

  const elapsed = Math.max(0, Date.now() - appState.planExecutionStartedAt);
  const completed = Math.floor((elapsed / PLAN_EXECUTION_MS) * totalItems);

  return Math.min(totalItems, Math.max(1, completed));
}

function createEmptyMeasureDefinitions() {
  return {
    reroute: { conditions: {}, steps: {} },
    turnback: { conditions: {}, steps: {} },
    cancel: { conditions: {}, steps: {} },
  };
}

function createEmptyMeasureDefinitionStepCounts() {
  return {
    reroute: 3,
    turnback: 3,
    cancel: 3,
  };
}

function createEmptyCustomConditionDrafts() {
  return {
    reroute: { name: "", value: "" },
    turnback: { name: "", value: "" },
    cancel: { name: "", value: "" },
  };
}

function getMeasureDefinitionValue(kind, group, key) {
  return appState.measureDefinitions[kind]?.[group]?.[key] || "";
}

function getDefinitionStepCount(kind) {
  const configuredCount = appState.measureDefinitionStepCounts[kind] || 3;
  const stepValues = appState.measureDefinitions[kind]?.steps || {};
  const highestSavedStep = Object.keys(stepValues).reduce((highest, key) => {
    const match = key.match(/^step-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return Math.max(3, configuredCount, highestSavedStep);
}

function addDefinitionStep(kind) {
  if (!kind || !appState.measureDefinitionStepCounts[kind]) return;

  captureVisibleMeasureDefinitions();
  const nextStep = getDefinitionStepCount(kind) + 1;
  appState.measureDefinitionStepCounts[kind] = nextStep;
  render();

  requestAnimationFrame(() => {
    root.querySelector(`[data-measure-definition-input="${kind}"][data-measure-definition-key="step-${nextStep}"]`)?.focus();
  });
}

function saveMeasureDefinitionValue(target) {
  const kind = target.dataset.measureDefinitionInput;
  const group = target.dataset.measureDefinitionGroup;
  const key = target.dataset.measureDefinitionKey;

  if (!kind || !group || !key) return;
  if (!appState.measureDefinitions[kind]) appState.measureDefinitions[kind] = { conditions: {}, steps: {} };
  if (!appState.measureDefinitions[kind][group]) appState.measureDefinitions[kind][group] = {};

  appState.measureDefinitions[kind][group][key] = target.value.trim();
}

function saveCustomConditionDraftValue(target) {
  const kind = target.dataset.customConditionKind;
  const field = target.dataset.customConditionField;

  if (!kind || !field) return;
  if (!appState.customConditionDrafts[kind]) appState.customConditionDrafts[kind] = { name: "", value: "" };

  appState.customConditionDrafts[kind][field] = target.value;
}

function updateCustomConditionSaveButton(kind) {
  if (!kind) return;

  const draft = appState.customConditionDrafts[kind] || { name: "", value: "" };
  const button = root.querySelector(`[data-action="save-custom-condition"][data-measure-kind="${kind}"]`);
  if (button) button.disabled = !(draft.name.trim() && draft.value.trim());
}

function openCustomCondition(kind) {
  if (!kind || !appState.measureDefinitions[kind]) return;

  captureVisibleMeasureDefinitions();
  appState.activeCustomConditionKind = kind;
  if (!appState.customConditionDrafts[kind]) appState.customConditionDrafts[kind] = { name: "", value: "" };
  render();

  requestAnimationFrame(() => {
    root.querySelector(`[data-custom-condition-kind="${kind}"][data-custom-condition-field="name"]`)?.focus();
  });
}

function cancelCustomCondition() {
  if (appState.activeCustomConditionKind) {
    appState.customConditionDrafts[appState.activeCustomConditionKind] = { name: "", value: "" };
  }

  appState.activeCustomConditionKind = null;
  render();
}

function saveCustomCondition(kind) {
  if (!kind || !appState.measureDefinitions[kind]) return;

  const draft = appState.customConditionDrafts[kind] || { name: "", value: "" };
  const name = draft.name.trim();
  const value = draft.value.trim();
  if (!name || !value) return;

  captureVisibleMeasureDefinitions();
  appState.measureDefinitions[kind].conditions[`custom:${name}`] = value;
  appState.customConditionDrafts[kind] = { name: "", value: "" };
  appState.activeCustomConditionKind = null;
  updateMeasureDefinitionSavedState(kind);
  render();
}

function getCustomConditionEntries(kind) {
  const conditions = appState.measureDefinitions[kind]?.conditions || {};

  return Object.entries(conditions)
    .filter(([key, value]) => key.startsWith("custom:") && String(value || "").trim())
    .map(([key, value]) => ({
      name: key.slice("custom:".length),
      value,
    }));
}

function captureVisibleMeasureDefinitions() {
  root.querySelectorAll("[data-measure-definition-input]").forEach(saveMeasureDefinitionValue);
}

function hasSavedMeasureDefinitions() {
  return appState.gameRerouteSaved || appState.gameTurnbackSaved || appState.gameCancelSaved;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function renderGameDialog() {
  return `
    <article class="game-dialog" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title" data-action="dismiss-game-dialog" data-node-id="76:3433" style="left: 727px; top: 396px; width: 466px; min-height: 288px;">
      <button class="game-dialog-close" data-action="dismiss-game-dialog" aria-label="Dialog schliessen" type="button">&times;</button>
      <h2 id="game-dialog-title">Ausgangslage</h2>
      <p>Im Bahnnetz ist eine St&ouml;rung aufgetreten. Im n&auml;chsten Schritt sehen Sie die St&ouml;rung sowie die betroffenen Z&uuml;ge. Nehmen Sie sich einen Moment Zeit, um die Situation zu analysieren, bevor Sie einen Massnahmenplan erstellen.</p>
      <button class="primary-button game-dialog-button" data-action="dismiss-game-dialog" type="button">Ok</button>
    </article>
  `;
}

function renderGameDialogBackdrop() {
  return `<div class="game-dialog-backdrop" aria-hidden="true"></div>`;
}

function renderGameExplanationLock() {
  return `<div class="game-explanation-lock" aria-hidden="true"></div>`;
}

function renderActiveGameTooltip() {
  if (!appState.activeGameTooltip) return "";

  const tooltip = GAME_TOOLTIP_CONTENT[appState.activeGameTooltip];
  if (!tooltip) return "";
  const position = getGameTooltipPosition(appState.activeGameTooltip, getGameNow());
  const continueAction =
    appState.activeGameTooltip === "brugg" && appState.gameDisturbanceTooltipNeedsContinue
      ? "continue-disturbance-tooltip"
      : appState.gameRoutePreviewRunning && GAME_TOOLTIP_ORDER.includes(appState.activeGameTooltip)
        ? "continue-route-tooltip"
        : "";

  return `
    <article class="game-tooltip ${tooltip.arrow} ${tooltip.className || ""}" data-tooltip-id="${appState.activeGameTooltip}" data-node-id="${tooltip.nodeId}" style="left: ${formatPixel(position.x)}; top: ${formatPixel(position.y)}; width: ${tooltip.w}px; min-height: ${tooltip.h}px;">
      <h2>${tooltip.title}</h2>
      <p>${tooltip.body}</p>
      ${
        continueAction
          ? `<button class="primary-button game-tooltip-continue" data-action="${continueAction}" type="button">Weiter</button>`
          : ""
      }
    </article>
  `;
}

function renderGameRouteOverlay() {
  const route = GAME_ROUTES[appState.activeGameTooltip];
  if (!route) return "";
  const path = getGameRoutePath(appState.activeGameTooltip, getGameNow()) || route.path;

  return `
    <svg class="game-route-overlay" data-route-id="${appState.activeGameTooltip}" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs>
        <marker id="game-route-arrow" markerHeight="18" markerWidth="18" orient="auto" refX="15" refY="5" viewBox="0 0 16 10">
          <path d="M0 0 L16 5 L0 10 Z"></path>
        </marker>
      </defs>
      <path class="game-route-path" d="${path}" marker-end="url(#game-route-arrow)"></path>
      ${renderRouteDots(route)}
      ${renderRouteFlag(route)}
    </svg>
  `;
}

function renderRouteDots(route) {
  if (!route.dots) return "";

  return route.dots
    .map((dot) => `<circle class="game-route-dot" cx="${dot.x}" cy="${dot.y}" r="21.5"></circle>`)
    .join("");
}

function renderRouteFlag(route) {
  if (!route.flag) return "";

  return `
    <g class="game-route-flag" transform="translate(${route.flag.x} ${route.flag.y})">
      <path class="game-route-flag-wave" d="M0 12 C28 -6 49 28 78 12 V61 C49 76 28 43 0 61 Z"></path>
      <path class="game-route-flag-pole" d="M0 8 V92"></path>
    </g>
  `;
}

function sampleCubicPoints(start, controlA, controlB, end, steps = 12) {
  return Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    const inverse = 1 - t;

    return {
      x:
        inverse ** 3 * start.x +
        3 * inverse ** 2 * t * controlA.x +
        3 * inverse * t ** 2 * controlB.x +
        t ** 3 * end.x,
      y:
        inverse ** 3 * start.y +
        3 * inverse ** 2 * t * controlA.y +
        3 * inverse * t ** 2 * controlB.y +
        t ** 3 * end.y,
    };
  });
}

function createMotionMetrics(paths) {
  return Object.fromEntries(
    Object.entries(paths).map(([trainId, points]) => {
      let totalLength = 0;
      const segments = points.slice(0, -1).map((start, index) => {
        const end = points[index + 1];
        const length = Math.hypot(end.x - start.x, end.y - start.y);
        const segment = {
          start,
          end,
          length,
          startDistance: totalLength,
          endDistance: totalLength + length,
        };

        totalLength += length;
        return segment;
      });
      const stopDistance = getPathDistanceToPoint(segments, GAME_TRAIN_STOP_POINTS[trainId]);

      return [trainId, { points, segments, totalLength, stopDistance: stopDistance ?? totalLength }];
    }),
  );
}

function getPathDistanceToPoint(segments, point) {
  if (!point || !segments.length) return null;

  const closestMatch = segments.reduce((closest, segment) => {
    const deltaX = segment.end.x - segment.start.x;
    const deltaY = segment.end.y - segment.start.y;
    const lengthSquared = deltaX ** 2 + deltaY ** 2;
    const progress = lengthSquared
      ? Math.min(
          1,
          Math.max(
            0,
            ((point.x - segment.start.x) * deltaX + (point.y - segment.start.y) * deltaY) / lengthSquared,
          ),
        )
      : 0;
    const projectedPoint = {
      x: segment.start.x + deltaX * progress,
      y: segment.start.y + deltaY * progress,
    };
    const distanceToPoint = Math.hypot(projectedPoint.x - point.x, projectedPoint.y - point.y);
    const pathDistance = segment.startDistance + segment.length * progress;

    if (!closest || distanceToPoint < closest.distanceToPoint) {
      return { distanceToPoint, pathDistance };
    }

    return closest;
  }, null);

  return closestMatch?.pathDistance ?? null;
}

function getGameNow() {
  return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
}

function formatPixel(value) {
  return `${Number(value.toFixed(2))}px`;
}

function formatDegree(value) {
  return `${Number(value.toFixed(2))}deg`;
}

function getGameTrain(trainId) {
  return GAME_TRAINS.find((train) => train.id === trainId);
}

function getTrainMotionDistance(now = getGameNow()) {
  if (!appState.gameTrainMotionStarted || typeof appState.gameTrainMotionStartedAt !== "number") return 0;

  const start = appState.gameTrainMotionStartedAt;
  const end = appState.gameTrainMotionStopped ? appState.gameTrainMotionStoppedAt || now : now;

  return Math.max(0, ((end - start) / 1000) * GAME_TRAIN_SPEED_PX_PER_SECOND);
}

function getTrainMotionState(train, now = getGameNow()) {
  const baseState = {
    left: train.x,
    top: train.y,
    rotation: train.rotate || 0,
    distance: 0,
    point: { x: train.x + train.w / 2, y: train.y + train.h / 2 },
  };

  if (train.disabled || !GAME_TRAIN_MOTION_METRICS[train.id]) return baseState;

  const distance = getTrainMotionDistance(now);
  const sample = sampleMotionAt(train.id, distance);
  const rotation = getTrainRotation(sample.vector, train.rotate || 0);

  return {
    left: sample.point.x - train.w / 2,
    top: sample.point.y - train.h / 2,
    rotation,
    distance: sample.distance,
    point: sample.point,
  };
}

function sampleMotionAt(trainId, distance) {
  const metrics = GAME_TRAIN_MOTION_METRICS[trainId];
  const fallbackPoint = metrics?.points[0] || { x: 0, y: 0 };

  if (!metrics || metrics.segments.length === 0) {
    return {
      point: fallbackPoint,
      vector: { x: 0, y: -1 },
      distance: 0,
      segmentIndex: 0,
    };
  }

  const clampedDistance = Math.min(Math.max(distance, 0), metrics.stopDistance);
  const segmentIndex = metrics.segments.findIndex((segment) => clampedDistance <= segment.endDistance);
  const segment = metrics.segments[segmentIndex === -1 ? metrics.segments.length - 1 : segmentIndex];
  const localDistance = clampedDistance - segment.startDistance;
  const progress = segment.length > 0 ? localDistance / segment.length : 0;

  return {
    point: {
      x: segment.start.x + (segment.end.x - segment.start.x) * progress,
      y: segment.start.y + (segment.end.y - segment.start.y) * progress,
    },
    vector: {
      x: segment.end.x - segment.start.x,
      y: segment.end.y - segment.start.y,
    },
    distance: clampedDistance,
    segmentIndex: segmentIndex === -1 ? metrics.segments.length - 1 : segmentIndex,
  };
}

function getTrainRotation(vector, fallbackRotation) {
  if (!vector.x && !vector.y) return fallbackRotation;

  const angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI + 90;
  return angle > 180 ? angle - 360 : angle;
}

function getRemainingMotionPoints(trainId, now = getGameNow()) {
  const metrics = GAME_TRAIN_MOTION_METRICS[trainId];
  if (!metrics) return [];

  const train = getGameTrain(trainId);
  const sample = sampleMotionAt(trainId, getTrainMotionDistance(now));
  const remainingPoints = metrics.points.slice(sample.segmentIndex + 1);
  const startPoint = train ? getRouteBoxEdgePoint(train, sample) : sample.point;

  return [startPoint, ...remainingPoints];
}

function getGameRoutePath(trainId, now = getGameNow()) {
  return pointsToSvgPath(getRemainingMotionPoints(trainId, now));
}

function getRouteBoxEdgePoint(train, sample) {
  const vector = sample.vector || { x: 0, y: 0 };
  const halfWidth = train.w / 2 + GAME_TRAIN_ROUTE_BOX_OUTSET;
  const halfHeight = train.h / 2 + GAME_TRAIN_ROUTE_BOX_OUTSET;
  const absX = Math.abs(vector.x);
  const absY = Math.abs(vector.y);

  if (absX === 0 && absY === 0) return sample.point;

  const scale = Math.min(
    absX > 0 ? halfWidth / absX : Number.POSITIVE_INFINITY,
    absY > 0 ? halfHeight / absY : Number.POSITIVE_INFINITY,
  );

  return {
    x: sample.point.x + vector.x * scale,
    y: sample.point.y + vector.y * scale,
  };
}

function pointsToSvgPath(points) {
  if (points.length < 2) return "";

  const [start, ...rest] = points;
  return [
    `M${Number(start.x.toFixed(2))} ${Number(start.y.toFixed(2))}`,
    ...rest.map((point) => `L${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))}`),
  ].join(" ");
}

function getGameTooltipPosition(tooltipId, now = getGameNow()) {
  const tooltip = GAME_TOOLTIP_CONTENT[tooltipId];
  const train = getGameTrain(tooltipId);

  if (!tooltip) return { x: 0, y: 0 };
  if (!train) return { x: tooltip.x, y: tooltip.y };

  const motion = getTrainMotionState(train, now);
  return {
    x: tooltip.x + motion.left - train.x,
    y: tooltip.y + motion.top - train.y,
  };
}

function syncGameTrainMotion(now = getGameNow()) {
  if (appState.screen !== "game") return;

  GAME_TRAINS.forEach((train) => {
    const trainElement = root.querySelector(`[data-train-id="${train.id}"]`);
    if (!trainElement) return;

    const motion = getTrainMotionState(train, now);
    trainElement.style.left = formatPixel(motion.left);
    trainElement.style.top = formatPixel(motion.top);
    trainElement.style.setProperty("--train-rotation", formatDegree(motion.rotation));
  });

  syncActiveGameRouteMotion(now);
  syncActiveGameTooltipMotion(now);
}

function syncActiveGameRouteMotion(now = getGameNow()) {
  if (!appState.activeGameTooltip || !GAME_ROUTES[appState.activeGameTooltip]) return;

  const routePath = root.querySelector(".game-route-overlay .game-route-path");
  if (!routePath) return;

  const path = getGameRoutePath(appState.activeGameTooltip, now);
  if (path) routePath.setAttribute("d", path);
}

function syncActiveGameTooltipMotion(now = getGameNow()) {
  if (!appState.activeGameTooltip || appState.activeGameTooltip === "brugg") return;

  const tooltipElement = root.querySelector(`.game-tooltip[data-tooltip-id="${appState.activeGameTooltip}"]`);
  if (!tooltipElement) return;

  const position = getGameTooltipPosition(appState.activeGameTooltip, now);
  tooltipElement.style.left = formatPixel(position.x);
  tooltipElement.style.top = formatPixel(position.y);
}

function renderRailMap() {
  return `
    <section class="rail-map" aria-label="Railway map around Berg">
      <div class="map-vignette"></div>
      <div class="station-label station-wildegg">Wildegg</div>
      <div class="station-label station-turgi">Turgi</div>
      <div class="brugg-marker" aria-label="Disrupted station Berg">
        <span class="warning-ring">!</span>
        <span class="station-label station-brugg">Berg</span>
      </div>
      ${TRAINS.map(renderTrainMarker).join("")}
      <div class="map-status"><span class="status-dot"></span>Primitive mode</div>
    </section>
  `;
}

function renderTrainMarker(train) {
  const position = trainPositions[train.id];

  return `
    <div class="train-marker" style="--train-color: ${train.color}; top: ${position.top}; left: ${position.left};">
      <span class="train-body">
        <span class="train-window"></span>
        <span class="train-window"></span>
      </span>
      <span class="train-copy">
        <strong>${train.name}</strong>
        <span>${train.timeToDisruption} min to Berg</span>
      </span>
    </div>
  `;
}

function renderPrimitiveFlow() {
  return `
    <aside class="side-panel">
      ${renderProgressRail()}
      ${renderFlowPanel()}
    </aside>
  `;
}

function renderProgressRail() {
  const screenLabels = [
    "Message",
    "Trains",
    "Action",
    "Steps",
    "Conditions",
    "Analysis",
    "Plan",
    "Summary",
  ];

  return `
    <div class="progress-rail" aria-label="Step ${appState.flowScreen} of 8">
      ${screenLabels
        .map(
          (label, index) =>
            `<span class="${index + 1 <= appState.flowScreen ? "progress-dot active" : "progress-dot"}" title="${label}"></span>`,
        )
        .join("")}
    </div>
  `;
}

function renderFlowPanel() {
  if (appState.flowScreen === 1) return renderDisruptionMessage();
  if (appState.flowScreen === 2) return renderAffectedTrains();
  if (appState.flowScreen === 3) return renderSelectAction();
  if (appState.flowScreen === 4) return renderDefineSteps();
  if (appState.flowScreen === 5) return renderSetConditions();
  if (appState.flowScreen === 6) return renderAnalysisResults();
  if (appState.flowScreen === 7) return renderActionPlan();
  return renderFinalSummary();
}

function renderPanelSection({ eyebrow, title, content, footer }) {
  return `
    <div class="panel-section">
      <div class="panel-heading">
        <span>${eyebrow}</span>
        <h1>${title}</h1>
      </div>
      <div class="panel-content">${content}</div>
      ${footer ? `<div class="panel-footer">${footer}</div>` : ""}
    </div>
  `;
}

function renderDisruptionMessage() {
  return renderPanelSection({
    eyebrow: "Scenario",
    title: "Disruption at Berg station",
    content: `
      <div class="alert-card">
        <span class="alert-icon">!</span>
        <p>${SCENARIO_TEXT}</p>
      </div>
    `,
    footer: `<button class="primary-button" data-action="flow-screen" data-screen="2" type="button">Start CoPrime rAIL</button>`,
  });
}

function renderAffectedTrains() {
  return renderPanelSection({
    eyebrow: "Overview",
    title: "Affected trains",
    content: `
      <div class="table-shell">
        <table>
          <thead>
            <tr>
              <th>Train</th>
              <th>Passengers</th>
              <th>Time to disruption</th>
              <th>Time to next stop</th>
              <th>Connection importance</th>
            </tr>
          </thead>
          <tbody>
            ${TRAINS.map(
              (train) => `
                <tr>
                  <td><span class="train-swatch" style="background-color: ${train.color};"></span>${train.name}</td>
                  <td>${train.passengers}</td>
                  <td>${train.timeToDisruption} minutes</td>
                  <td>${train.timeToNextStop} minutes</td>
                  <td>${train.connectionImportance}</td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>
      </div>
      <p class="instruction-copy">Build an action plan by selecting an action, defining the AI analysis steps, and setting the conditions for the analysis.</p>
    `,
    footer: `<button class="primary-button" data-action="flow-screen" data-screen="3" type="button">Create action plan</button>`,
  });
}

function renderSelectAction() {
  return renderPanelSection({
    eyebrow: "Choice",
    title: "Select action",
    content: `
      <div class="action-grid">
        ${ACTION_ORDER.map((actionType) => {
          const action = ACTION_CONFIG[actionType];
          return `
            <article class="action-card">
              <div>
                <h3>${action.cardTitle}</h3>
                <p>${action.description}</p>
              </div>
              <button class="secondary-button" data-action="select-action" data-action-type="${actionType}" type="button">Select</button>
            </article>
          `;
        }).join("")}
      </div>
    `,
  });
}

function renderDefineSteps() {
  const action = ACTION_CONFIG[appState.selectedAction];
  if (!action) return renderSelectAction();

  const canContinue = appState.selectedStepIds.length > 0;

  return renderPanelSection({
    eyebrow: action.cardTitle,
    title: action.panelTitle,
    content: `
      <h2 class="section-title">Define analysis steps</h2>
      <div class="primitive-grid">
        ${action.steps
          .map((stepId) => {
            const step = PRIMITIVE_STEPS[stepId];
            const isSelected = appState.selectedStepIds.includes(stepId);
            return `
              <button class="${isSelected ? "primitive-card selected" : "primitive-card"}" data-action="toggle-step" data-step-id="${stepId}" type="button">
                <span>${step.label}</span>
                <small>${step.description}</small>
              </button>
            `;
          })
          .join("")}
      </div>
      <div class="sequence-block">
        <div class="sequence-heading">
          <span>Selected sequence</span>
          <strong>${appState.selectedStepIds.length}</strong>
        </div>
        ${renderStepSequence()}
      </div>
    `,
    footer: `<button class="primary-button" ${canContinue ? "" : "disabled"} data-action="flow-screen" data-screen="5" type="button">Continue to conditions</button>`,
  });
}

function renderStepSequence() {
  if (appState.selectedStepIds.length === 0) {
    return `<p class="empty-copy">Select at least one analysis step.</p>`;
  }

  return `
    <ol class="step-sequence">
      ${appState.selectedStepIds
        .map((stepId, index) => {
          const step = PRIMITIVE_STEPS[stepId];
          return `
            <li>
              <span class="step-index">${index + 1}</span>
              <span>${step.label}</span>
              <button data-action="toggle-step" data-step-id="${stepId}" type="button">Remove</button>
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

function renderSetConditions() {
  const delayIndex = Math.max(
    0,
    DELAY_OPTIONS.indexOf(appState.conditions.maxAdditionalDelay),
  );

  return renderPanelSection({
    eyebrow: "Framework",
    title: "Set framework conditions",
    content: `
      <div class="condition-group">
        <label class="range-label" for="delay-range">
          <span>Maximum additional delay</span>
          <strong>${appState.conditions.maxAdditionalDelay} minutes</strong>
        </label>
        <input id="delay-range" max="${DELAY_OPTIONS.length - 1}" min="0" step="1" type="range" value="${delayIndex}" />
        <div class="range-ticks">
          ${DELAY_OPTIONS.map((value) => `<span>${value}</span>`).join("")}
        </div>
      </div>
      ${renderToggleRow("preferHighPassengerTrains", "Prefer trains with many passengers")}
      ${renderToggleRow("preserveImportantConnections", "Preserve important connections")}
      ${renderToggleRow("avoidNetworkConflicts", "Avoid additional network conflicts")}
    `,
    footer: `<button class="primary-button" data-action="flow-screen" data-screen="6" type="button">Run analysis</button>`,
  });
}

function renderToggleRow(key, label) {
  return `
    <label class="toggle-row">
      <span>${label}</span>
      <input ${appState.conditions[key] ? "checked" : ""} data-condition-toggle="${key}" type="checkbox" />
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
    </label>
  `;
}

function renderAnalysisResults() {
  const action = ACTION_CONFIG[appState.selectedAction];
  if (!action) return renderSelectAction();

  const plannedTrainIds = getPlannedTrainIds();
  const canSave = appState.selectedResultTrainIds.some(
    (trainId) => !plannedTrainIds.has(trainId),
  );

  return renderPanelSection({
    eyebrow: "Mock analysis",
    title: "Analysis result",
    content: `
      <div class="condition-summary">
        <span>Max delay: ${appState.conditions.maxAdditionalDelay} min</span>
        <span>${appState.conditions.preferHighPassengerTrains ? "Passenger priority on" : "Passenger priority off"}</span>
        <span>${appState.conditions.preserveImportantConnections ? "Connections preserved" : "Connections flexible"}</span>
        <span>${appState.conditions.avoidNetworkConflicts ? "Conflict avoidance on" : "Conflict avoidance off"}</span>
      </div>
      <div class="table-shell results-table">
        <table>
          <thead>
            <tr>
              <th>Train</th>
              <th>Suitability</th>
              <th>Additional delay</th>
              <th>Reason</th>
              <th>Add to action plan</th>
            </tr>
          </thead>
          <tbody>
            ${TRAINS.map((train) => renderResultRow(train, action, plannedTrainIds)).join("")}
          </tbody>
        </table>
      </div>
    `,
    footer: `<button class="primary-button" ${canSave ? "" : "disabled"} data-action="save-action" type="button">Save action</button>`,
  });
}

function renderResultRow(train, action, plannedTrainIds) {
  const result = action.results[train.id];
  const isPlanned = plannedTrainIds.has(train.id);
  const isSelected = appState.selectedResultTrainIds.includes(train.id);
  const aboveLimit = result.additionalDelay > appState.conditions.maxAdditionalDelay;

  return `
    <tr>
      <td><span class="train-swatch" style="background-color: ${train.color};"></span>${train.name}</td>
      <td><span class="suitability ${result.suitability}">${result.suitability}</span></td>
      <td class="${aboveLimit ? "delay-warning" : ""}">
        +${result.additionalDelay} minutes
        ${aboveLimit ? "<small> above limit</small>" : ""}
      </td>
      <td>${result.reason}</td>
      <td>
        <label class="check-row">
          <input ${isSelected || isPlanned ? "checked" : ""} ${isPlanned ? "disabled" : ""} data-result-train="${train.id}" type="checkbox" />
          <span>${isPlanned ? "Already in plan" : "Add to action plan"}</span>
        </label>
      </td>
    </tr>
  `;
}

function renderActionPlan() {
  return renderPanelSection({
    eyebrow: "Plan",
    title: "Your action plan",
    content:
      appState.savedActions.length === 0
        ? `<p class="empty-copy">No trains have been added yet.</p>`
        : `<div class="plan-list">${appState.savedActions.map(renderPlanItem).join("")}</div>`,
    footer: `
      <div class="button-row">
        <button class="secondary-button" data-action="add-another-action" type="button">Add another action</button>
        <button class="primary-button" ${appState.savedActions.length === 0 ? "disabled" : ""} data-action="finish-plan" type="button">Finish plan</button>
      </div>
    `,
  });
}

function renderPlanItem(savedAction) {
  const train = getTrain(savedAction.trainId);
  const config = ACTION_CONFIG[savedAction.actionType];

  return `
    <article class="plan-item">
      <div class="plan-item-header">
        <span class="train-swatch" style="background-color: ${train.color};"></span>
        <div>
          <strong>${config.planLabel}</strong>
          <span>${train.name}</span>
        </div>
        <button data-action="remove-saved-action" data-action-id="${savedAction.id}" type="button">Remove</button>
      </div>
      <p>Expected additional delay: <strong>+${savedAction.additionalDelay} minutes</strong></p>
      <p>${savedAction.reason}</p>
    </article>
  `;
}

function renderFinalSummary() {
  const totalPassengers = appState.savedActions.reduce(
    (sum, action) => sum + getTrain(action.trainId).passengers,
    0,
  );
  const averageDelay =
    appState.savedActions.length === 0
      ? 0
      : Math.round(
          (appState.savedActions.reduce(
            (sum, action) => sum + action.additionalDelay,
            0,
          ) /
            appState.savedActions.length) *
            10,
        ) / 10;

  return renderPanelSection({
    eyebrow: "Complete",
    title: "Final action plan",
    content: `
      <div class="summary-grid">
        ${renderSummaryMetric("Trains included", appState.savedActions.length)}
        ${renderSummaryMetric("Total passengers affected", totalPassengers)}
        ${renderSummaryMetric("Average additional delay", `+${averageDelay} min`)}
      </div>
      <div class="plan-list compact">${appState.savedActions.map(renderFinalPlanItem).join("")}</div>
    `,
    footer: `<button class="primary-button" data-action="complete-task" type="button">Complete task</button>`,
  });
}

function renderSummaryMetric(label, value) {
  return `
    <div class="summary-metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderFinalPlanItem(savedAction) {
  const train = getTrain(savedAction.trainId);
  const config = ACTION_CONFIG[savedAction.actionType];

  return `
    <article class="plan-item">
      <div class="plan-item-header">
        <span class="train-swatch" style="background-color: ${train.color};"></span>
        <div>
          <strong>${config.planLabel}</strong>
          <span>${train.name}, +${savedAction.additionalDelay} minutes</span>
        </div>
      </div>
      <p>${savedAction.reason}</p>
    </article>
  `;
}

function handleGameCanvasClick(event) {
  if (appState.gameDialogVisible) return;
  if (isGameExplanationLocked()) return;

  if (event.target.closest(".game-tooltip")) return;

  if (appState.activeGameTooltip === "brugg") {
    hideGameTooltip();
    return;
  }

  if (appState.gameRoutePreviewRunning) {
    stopGameRoutePreviewSequence();
    hideGameTooltip();
    return;
  }

  if (appState.activeGameTooltip) {
    hideGameTooltip();
  }
}

function dismissGameDialog() {
  appState.gameDialogVisible = false;
  appState.gameTooltipIndex = -1;
  appState.gameDisturbanceTooltipNeedsContinue = true;
  appState.gameExplanationLocked = true;
  showGameTooltip("brugg", { autoHide: false });
}

function continueGameDisturbanceTooltip() {
  if (appState.activeGameTooltip !== "brugg") return;

  appState.gameDisturbanceTooltipNeedsContinue = false;
  hideGameTooltip({ startRoutePreview: true });
}

function continueGameRouteTooltip() {
  if (!appState.gameRoutePreviewRunning) return;

  showGameRoutePreview(appState.gameTooltipIndex + 1);
}

function showGameTooltip(tooltipId, options = {}) {
  const { autoHide = true } = options;
  appState.activeGameTooltip = tooltipId;
  render();

  if (autoHide) {
    scheduleGameTooltipHide(tooltipId);
  } else {
    clearGameTooltipTimer();
  }
}

function hideGameTooltip(options = {}) {
  const { startRoutePreview = false } = options;
  const hiddenTooltipId = appState.activeGameTooltip;

  appState.activeGameTooltip = null;
  clearGameTooltipTimer();

  if (startRoutePreview && hiddenTooltipId === "brugg") {
    startGameRoutePreviewSequence();
    return;
  }

  render();
}

function pauseGameTrains() {
  if (appState.gameDialogVisible) return;

  if (appState.gameTrainMotionStopped) {
    resumeGameTrainMotion();
  } else {
    stopGameTrainMotion();
  }

  render();
}

function toggleGameAccordion() {
  if (appState.gameDialogVisible) return;

  appState.gameAccordionOpen = !appState.gameAccordionOpen;
  appState.gameAccordionMode = "overview";

  if (appState.gameAccordionOpen) {
    stopGameTrainMotion();
    appState.activeGameTooltip = null;
    clearGameTooltipTimer();
    stopGameRoutePreviewSequence();
  }

  render();
}

function openRerouteDefinition() {
  if (appState.gameDialogVisible) return;

  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "definition";
  stopGameTrainMotion();
  appState.activeGameTooltip = null;
  clearGameTooltipTimer();
  stopGameRoutePreviewSequence();
  render();
}

function openTurnbackDefinition() {
  if (appState.gameDialogVisible) return;

  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "turnback-definition";
  stopGameTrainMotion();
  appState.activeGameTooltip = null;
  clearGameTooltipTimer();
  stopGameRoutePreviewSequence();
  render();
}

function openCancelDefinition() {
  if (appState.gameDialogVisible) return;

  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "cancel-definition";
  stopGameTrainMotion();
  appState.activeGameTooltip = null;
  clearGameTooltipTimer();
  stopGameRoutePreviewSequence();
  render();
}

function backToGameAccordion() {
  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "overview";
  render();
}

function saveGameReroute() {
  captureVisibleMeasureDefinitions();
  updateMeasureDefinitionSavedState("reroute");
  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "overview";
  render();
}

function saveGameTurnback() {
  captureVisibleMeasureDefinitions();
  updateMeasureDefinitionSavedState("turnback");
  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "overview";
  render();
}

function saveGameCancel() {
  captureVisibleMeasureDefinitions();
  updateMeasureDefinitionSavedState("cancel");
  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "overview";
  render();
}

function startPlanExecution() {
  if (!hasSavedMeasureDefinitions()) return;

  captureVisibleMeasureDefinitions();
  clearGameTooltipTimer();
  clearGameRoutePreviewTimer();
  clearGameTrainAnimationFrame();
  clearPlanExecutionTimers();

  appState.screen = "plan-execution";
  appState.planExecutionState = "skeleton";
  appState.planExecutionStartedAt = null;
  render();

  planSkeletonTimer = window.setTimeout(() => {
    if (appState.screen !== "plan-execution") return;

    appState.planExecutionState = "running";
    appState.planExecutionStartedAt = Date.now();
    render();
    planProgressTimer = window.setInterval(updatePlanExecutionProgress, PLAN_PROGRESS_TICK_MS);
  }, PLAN_SKELETON_MS);
}

function updatePlanExecutionProgress() {
  if (appState.screen !== "plan-execution") {
    clearPlanExecutionTimers();
    return;
  }

  if (!appState.planExecutionStartedAt) return;

  if (Date.now() - appState.planExecutionStartedAt >= PLAN_EXECUTION_MS) {
    appState.planExecutionState = "done";
    clearPlanExecutionTimers();
  }

  render();
}

function cancelPlanExecution() {
  clearPlanExecutionTimers();
  appState.screen = "game";
  appState.planExecutionState = "idle";
  appState.planExecutionStartedAt = null;
  appState.gameAccordionOpen = true;
  appState.gameAccordionMode = "overview";
  render();
}

function goPlanResult() {
  if (appState.planExecutionState !== "done") return;
  clearPlanExecutionTimers();
  appState.screen = "plan-result";
  render();
}

function goPlanEnd() {
  appState.screen = "plan-end";
  render();
}

function clearPlanExecutionTimers() {
  if (planSkeletonTimer) {
    window.clearTimeout(planSkeletonTimer);
    planSkeletonTimer = null;
  }

  if (planProgressTimer) {
    window.clearInterval(planProgressTimer);
    planProgressTimer = null;
  }
}

function updateMeasureDefinitionSavedState(kind) {
  const isSaved = hasMeaningfulMeasureDefinition(kind);

  if (kind === "cancel") {
    appState.gameCancelSaved = isSaved;
    return;
  }

  if (kind === "turnback") {
    appState.gameTurnbackSaved = isSaved;
    return;
  }

  if (kind === "reroute") {
    appState.gameRerouteSaved = isSaved;
  }
}

function hasMeaningfulMeasureDefinition(kind) {
  const definition = appState.measureDefinitions[kind];
  if (!definition) return false;

  return Object.entries(definition).some(([group, values]) =>
    Object.entries(values || {}).some(([key, value]) =>
      isMeaningfulMeasureDefinitionValue(kind, group, key, value),
    ),
  );
}

function isMeaningfulMeasureDefinitionValue(kind, group, key, value) {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) return false;

  if (kind === "reroute" && group === "conditions" && key === "max-delay") {
    return trimmedValue !== "60";
  }

  return true;
}

function resetGameState() {
  appState.gameDialogVisible = true;
  appState.activeGameTooltip = null;
  appState.gameTooltipIndex = -1;
  appState.gameDisturbanceTooltipNeedsContinue = false;
  appState.gameExplanationLocked = false;
  appState.gameRoutePreviewRunning = false;
  appState.gameTrainMotionStarted = false;
  appState.gameTrainMotionStartedAt = null;
  appState.gameTrainMotionStoppedAt = null;
  appState.gameTrainMotionStopped = false;
  appState.gameAccordionOpen = false;
  appState.gameAccordionMode = "overview";
  appState.gameRerouteSaved = false;
  appState.gameTurnbackSaved = false;
  appState.gameCancelSaved = false;
  appState.measureDefinitions = createEmptyMeasureDefinitions();
  appState.measureDefinitionStepCounts = createEmptyMeasureDefinitionStepCounts();
  appState.activeCustomConditionKind = null;
  appState.customConditionDrafts = createEmptyCustomConditionDrafts();
  appState.planExecutionState = "idle";
  appState.planExecutionStartedAt = null;
  clearGameTooltipTimer();
  clearGameRoutePreviewTimer();
  clearGameTrainAnimationFrame();
  clearPlanExecutionTimers();
}

function scheduleGameTooltipHide(tooltipId) {
  clearGameTooltipTimer();
  const autoHideMs = GAME_TOOLTIP_CONTENT[tooltipId]?.autoHideMs || GAME_TOOLTIP_HIDE_MS;

  gameTooltipTimer = window.setTimeout(() => {
    if (appState.screen !== "game") return;
    if (appState.activeGameTooltip !== tooltipId) return;

    if (tooltipId === "brugg") {
      appState.activeGameTooltip = null;
      appState.gameDisturbanceTooltipNeedsContinue = false;
      render();
      return;
    }

    appState.activeGameTooltip = null;
    render();
  }, autoHideMs);
}

function clearGameTooltipTimer() {
  if (!gameTooltipTimer) return;
  window.clearTimeout(gameTooltipTimer);
  gameTooltipTimer = null;
}

function startGameRoutePreviewSequence() {
  if (appState.screen !== "game" || appState.gameDialogVisible) return;

  clearGameTooltipTimer();
  clearGameRoutePreviewTimer();
  appState.gameExplanationLocked = true;
  appState.gameRoutePreviewRunning = true;
  showGameRoutePreview(0);
}

function showGameRoutePreview(index) {
  if (appState.screen !== "game") {
    stopGameRoutePreviewSequence();
    return;
  }

  if (index >= GAME_TOOLTIP_ORDER.length) {
    stopGameRoutePreviewSequence();
    appState.activeGameTooltip = null;
    appState.gameTooltipIndex = -1;
    startGameTrainMotion();
    render();
    return;
  }

  appState.gameTooltipIndex = index;
  appState.activeGameTooltip = GAME_TOOLTIP_ORDER[index];
  render();
}

function stopGameRoutePreviewSequence() {
  appState.gameRoutePreviewRunning = false;
  appState.gameExplanationLocked = false;
  clearGameRoutePreviewTimer();
}

function isGameExplanationLocked() {
  return appState.gameExplanationLocked;
}

function clearGameRoutePreviewTimer() {
  if (!gameRoutePreviewTimer) return;
  window.clearTimeout(gameRoutePreviewTimer);
  gameRoutePreviewTimer = null;
}

function startGameTrainMotion() {
  if (appState.screen !== "game" || appState.gameTrainMotionStopped || appState.gameTrainMotionStarted) return;

  appState.gameTrainMotionStarted = true;
  appState.gameTrainMotionStartedAt = getGameNow();
  appState.gameTrainMotionStoppedAt = null;
  syncGameTrainMotion(appState.gameTrainMotionStartedAt);
  ensureGameTrainMotionLoop();
}

function resumeGameTrainMotion() {
  if (!appState.gameTrainMotionStopped) return;

  const now = getGameNow();

  if (appState.gameTrainMotionStarted && typeof appState.gameTrainMotionStoppedAt === "number") {
    appState.gameTrainMotionStartedAt += now - appState.gameTrainMotionStoppedAt;
    appState.gameTrainMotionStoppedAt = null;
    appState.gameTrainMotionStopped = false;
    syncGameTrainMotion(now);
    ensureGameTrainMotionLoop();
    return;
  }

  appState.gameTrainMotionStoppedAt = null;
  appState.gameTrainMotionStopped = false;

  if (!appState.gameRoutePreviewRunning && !appState.activeGameTooltip) {
    startGameTrainMotion();
  }
}

function ensureGameTrainMotionLoop() {
  if (
    appState.screen !== "game" ||
    !appState.gameTrainMotionStarted ||
    appState.gameTrainMotionStopped ||
    gameTrainAnimationFrame
  ) {
    return;
  }

  gameTrainAnimationFrame = window.requestAnimationFrame(stepGameTrainMotion);
}

function stepGameTrainMotion(now) {
  gameTrainAnimationFrame = null;

  if (appState.screen !== "game" || !appState.gameTrainMotionStarted || appState.gameTrainMotionStopped) return;

  syncGameTrainMotion(now);
  if (!hasActiveGameTrainMotion(now)) return;
  ensureGameTrainMotionLoop();
}

function hasActiveGameTrainMotion(now = getGameNow()) {
  const distance = getTrainMotionDistance(now);

  return Object.values(GAME_TRAIN_MOTION_METRICS).some((metrics) => distance < metrics.stopDistance);
}

function stopGameTrainMotion() {
  if (appState.gameTrainMotionStopped) return;

  const now = getGameNow();

  appState.gameTrainMotionStoppedAt = appState.gameTrainMotionStarted ? now : null;
  appState.gameTrainMotionStopped = true;
  clearGameTrainAnimationFrame();
  syncGameTrainMotion(now);
}

function clearGameTrainAnimationFrame() {
  if (!gameTrainAnimationFrame) return;
  window.cancelAnimationFrame(gameTrainAnimationFrame);
  gameTrainAnimationFrame = null;
}

function updateGameStageScale() {
  const viewport = root.querySelector(".game-viewport");
  const stage = root.querySelector(".game-stage");
  if (!viewport || !stage) return;

  const viewportWidth = window.visualViewport?.width || viewport.clientWidth;
  const viewportHeight = window.visualViewport?.height || viewport.clientHeight;
  if (!viewportWidth || !viewportHeight) return;

  const scale = Math.min(
    viewportWidth / 1920,
    viewportHeight / 1080,
  );
  const left = Math.max(0, (viewportWidth - 1920 * scale) / 2);
  const top = Math.max(0, (viewportHeight - 1080 * scale) / 2);

  stage.style.setProperty("--game-scale", scale);
  stage.style.left = `${left}px`;
  stage.style.top = `${top}px`;
}

function selectAction(actionType) {
  appState.selectedAction = actionType;
  appState.selectedStepIds = [];
  appState.selectedResultTrainIds = [];
  appState.conditions = { ...initialConditions };
  setFlowScreen(4);
}

function toggleStep(stepId) {
  if (appState.selectedStepIds.includes(stepId)) {
    appState.selectedStepIds = appState.selectedStepIds.filter((id) => id !== stepId);
  } else {
    appState.selectedStepIds = [...appState.selectedStepIds, stepId];
  }
  render();
}

function toggleResultTrain(trainId) {
  if (getPlannedTrainIds().has(trainId)) return;

  if (appState.selectedResultTrainIds.includes(trainId)) {
    appState.selectedResultTrainIds = appState.selectedResultTrainIds.filter(
      (id) => id !== trainId,
    );
  } else {
    appState.selectedResultTrainIds = [...appState.selectedResultTrainIds, trainId];
  }
  render();
}

function saveAction() {
  if (!appState.selectedAction) return;

  const plannedTrainIds = getPlannedTrainIds();
  const results = ACTION_CONFIG[appState.selectedAction].results;
  const newActions = appState.selectedResultTrainIds
    .filter((trainId) => !plannedTrainIds.has(trainId))
    .map((trainId, index) => {
      const result = results[trainId];
      return {
        id: `${appState.selectedAction}-${trainId}-${Date.now()}-${index}`,
        actionType: appState.selectedAction,
        trainId,
        suitability: result.suitability,
        additionalDelay: result.additionalDelay,
        reason: result.reason,
        stepIds: [...appState.selectedStepIds],
        conditions: { ...appState.conditions },
      };
    });

  if (newActions.length === 0) return;

  appState.savedActions = [...appState.savedActions, ...newActions];
  appState.selectedResultTrainIds = [];
  setFlowScreen(7);
}

function removeSavedAction(actionId) {
  appState.savedActions = appState.savedActions.filter((action) => action.id !== actionId);
  render();
}

function addAnotherAction() {
  appState.selectedAction = null;
  appState.selectedStepIds = [];
  appState.selectedResultTrainIds = [];
  appState.conditions = { ...initialConditions };
  setFlowScreen(3);
}

function completeTask() {
  appState.selectedAction = null;
  appState.selectedStepIds = [];
  appState.selectedResultTrainIds = [];
  appState.savedActions = [];
  appState.conditions = { ...initialConditions };
  setFlowScreen(1);
}

function getTrain(trainId) {
  const train = TRAINS.find((item) => item.id === trainId);
  if (!train) throw new Error(`Unknown train id: ${trainId}`);
  return train;
}

function getPlannedTrainIds() {
  return new Set(appState.savedActions.map((action) => action.trainId));
}
