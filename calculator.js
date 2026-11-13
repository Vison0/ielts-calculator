/* Core IELTS calculation logic — ported from Band9Prep, no APIs. */

const BAND_SCORES = [0,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9];

const LISTENING_TABLE = [
  [39,40,9],[37,38,8.5],[35,36,8],[32,34,7.5],[30,31,7],[26,29,6.5],
  [23,25,6],[18,22,5.5],[16,17,5],[13,15,4.5],[10,12,4],
];
const ACADEMIC_READING_TABLE = [
  [39,40,9],[37,38,8.5],[35,36,8],[33,34,7.5],[30,32,7],[27,29,6.5],
  [23,26,6],[19,22,5.5],[15,18,5],[13,14,4.5],[10,12,4],
];
const GENERAL_READING_TABLE = [
  [40,40,9],[39,39,8.5],[37,38,8],[36,36,7.5],[34,35,7],[32,33,6.5],
  [30,31,6],[27,29,5.5],[23,26,5],[19,22,4.5],[15,18,4],
];

function lookupBand(correct, table) {
  for (const [lo, hi, band] of table) {
    if (correct >= lo && correct <= hi) return band;
  }
  if (correct < table[table.length - 1][0]) return 3.5;
  return 0;
}

function calculateOverallBand(scores) {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 2) / 2; // official: nearest 0.5
}

function getBandLabel(band) {
  if (band >= 9) return "Expert";
  if (band >= 8) return "Very Good";
  if (band >= 7) return "Good";
  if (band >= 6) return "Competent";
  if (band >= 5) return "Modest";
  if (band >= 4) return "Limited";
  return "Below 4";
}

/* ---- UI wiring ---- */
function fillSelect(el, def) {
  BAND_SCORES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s.toFixed(1);
    if (s === def) o.selected = true;
    el.appendChild(o);
  });
}

let testType = "academic";
const $ = (id) => document.getElementById(id);

["inL","inR","inW","inS"].forEach((id) => fillSelect($(id), 6));
["rawW","rawS"].forEach((id) => fillSelect($(id), 6));

function renderTables() {
  const render = (id, data) => {
    $(id).innerHTML = "<tr><th>Correct</th><th>Band</th></tr>" + data.map(([lo,hi,b]) =>
      `<tr><td>${lo === hi ? lo : lo + "–" + hi}</td><td><b>${b.toFixed(1)}</b></td></tr>`).join("");
  };
  render("tblL", LISTENING_TABLE);
  render("tblA", ACADEMIC_READING_TABLE);
  render("tblG", GENERAL_READING_TABLE);
}

function updateOverall() {
  const v = [$("inL").value, $("inR").value, $("inW").value, $("inS").value].map(Number);
  const b = calculateOverallBand(v);
  $("outOverall").textContent = b.toFixed(1);
  $("outOverallLabel").textContent = getBandLabel(b);
}

function updateRaw() {
  const table = testType === "academic" ? ACADEMIC_READING_TABLE : GENERAL_READING_TABLE;
  const l = $("rawL").value === "" ? null : lookupBand(Number($("rawL").value), LISTENING_TABLE);
  const r = $("rawR").value === "" ? null : lookupBand(Number($("rawR").value), table);
  const w = Number($("rawW").value), s = Number($("rawS").value);
  $("testTypeLabel").textContent = testType === "academic" ? "Academic" : "General Training";
  if (l === null && r === null) { $("outRaw").textContent = "–"; $("outRawLabel").textContent = ""; $("rawBreakdown").innerHTML = ""; return; }
  const parts = [l ?? 0, r ?? 0, w, s];
  const b = calculateOverallBand(parts);
  $("outRaw").textContent = b.toFixed(1);
  $("outRawLabel").textContent = getBandLabel(b);
  $("rawBreakdown").innerHTML = ["L","R","W","S"].map((k,i) =>
    `<span>${k}: ${(parts[i]).toFixed(1)}</span>`).join("");
}

["inL","inR","inW","inS"].forEach((id) => $(id).addEventListener("change", updateOverall));
["rawL","rawR","rawW","rawS"].forEach((id) => $(id).addEventListener("input", updateRaw));
$("btnAcademic").addEventListener("click", () => { testType = "academic"; $("btnAcademic").classList.add("active"); $("btnGeneral").classList.remove("active"); updateRaw(); });
$("btnGeneral").addEventListener("click", () => { testType = "general"; $("btnGeneral").classList.add("active"); $("btnAcademic").classList.remove("active"); updateRaw(); });
$("tabOverall").addEventListener("click", () => { $("panelOverall").classList.remove("hidden"); $("panelRaw").classList.add("hidden"); $("tabOverall").classList.add("active"); $("tabRaw").classList.remove("active"); });
$("tabRaw").addEventListener("click", () => { $("panelRaw").classList.remove("hidden"); $("panelOverall").classList.add("hidden"); $("tabRaw").classList.add("active"); $("tabOverall").classList.remove("active"); });
$("resetOverall").addEventListener("click", () => { ["inL","inR","inW","inS"].forEach((id) => $(id).value = "6"); updateOverall(); });
$("resetRaw").addEventListener("click", () => { $("rawL").value = ""; $("rawR").value = ""; $("rawW").value = "6"; $("rawS").value = "6"; updateRaw(); });

renderTables(); updateOverall(); updateRaw();
