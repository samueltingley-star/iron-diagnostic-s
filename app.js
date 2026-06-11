const diagnosticTrees = {
  slow_hydraulics: {
    title: "Hydraulics slow / weak",
    steps: [
      "Verify complaint: which functions are slow, all functions or one circuit only?",
      "Check hydraulic oil level, oil condition, and correct oil viscosity.",
      "Check suction restriction: collapsed hose, plugged suction screen, clogged filter, aerated oil.",
      "Check engine RPM under load.",
      "Install pressure gauge and test main relief pressure against machine spec.",
      "If pressure is low: check relief valve adjustment, pump compensator, pump wear, internal leakage.",
      "If pressure is correct but flow is low: perform a flow test if available.",
      "If only one function is weak: inspect spool, work-port relief, cylinder bypass, hose restriction, or attachment valve."
    ],
    likely: ["Low oil", "Plugged filter", "Suction leak", "Relief valve low", "Pump wear", "Cylinder bypass", "Engine RPM low"]
  },
  no_hydraulics: {
    title: "No hydraulic function",
    steps: [
      "Confirm safety lockout is off and operator presence switches are satisfied.",
      "Check hydraulic oil level.",
      "Listen for pump noise or coupling failure.",
      "Check pilot pressure or charge pressure if the machine uses pilot controls.",
      "Check hydraulic lockout solenoid power and ground.",
      "Check main pump shaft/coupler.",
      "Test main pressure at pump outlet if safe."
    ],
    likely: ["Hydraulic lockout active", "No pilot pressure", "Pump coupler failure", "Low oil", "Electrical interlock fault"]
  },
  overheating_hydraulics: {
    title: "Hydraulic oil overheating",
    steps: [
      "Check oil cooler for debris and fan operation.",
      "Verify oil level and oil type.",
      "Look for relief valve stuck open or constant bypassing.",
      "Check for dragging function, stuck spool, or attachment circuit deadheading.",
      "Check pump case drain flow if applicable.",
      "Inspect for internal leakage in cylinders, motors, valves, or pump."
    ],
    likely: ["Plugged cooler", "Fan issue", "Relief bypassing", "Wrong oil", "Internal leakage", "Stuck valve"]
  },
  drift: {
    title: "Cylinder drift / attachment drops",
    steps: [
      "Confirm drift with machine warm and engine off, controls neutral.",
      "Inspect for external leaks first.",
      "Secure and support attachment before testing.",
      "Isolate cylinder from valve if safe.",
      "If cylinder still drifts, suspect piston seal bypass.",
      "If drift stops when isolated, suspect control valve spool leakage or load check issue.",
      "Check holding valve/counterbalance valve if equipped."
    ],
    likely: ["Cylinder piston seal leak", "Control valve leakage", "Load check issue", "Holding valve issue"]
  },
  noise: {
    title: "Pump noise / cavitation",
    steps: [
      "Check hydraulic oil level.",
      "Inspect suction hose for collapse, loose clamps, or air leaks.",
      "Check inlet screen and filters.",
      "Look for foamy/aerated oil.",
      "Confirm correct oil viscosity for temperature.",
      "Do not run machine hard until suction issue is corrected."
    ],
    likely: ["Low oil", "Suction air leak", "Plugged suction screen", "Wrong oil", "Cavitation"]
  },
  no_crank: {
    title: "No crank / will not start",
    steps: [
      "Check battery open-circuit voltage.",
      "Load test battery or watch voltage drop while cranking.",
      "Check battery cables, grounds, and starter connections.",
      "Verify neutral safety, seat switch, brake switch, or hydraulic lockout requirements.",
      "Check start relay signal from key switch.",
      "Check voltage at starter solenoid while key is held to start.",
      "If signal and power are good, suspect starter/solenoid."
    ],
    likely: ["Weak battery", "Bad ground", "Bad starter relay", "Neutral safety switch", "Starter failure"]
  },
  custom: {
    title: "Custom symptom",
    steps: [
      "Write exact complaint and conditions: hot/cold, idle/full throttle, loaded/unloaded.",
      "Separate the problem: electrical, hydraulic, engine, drivetrain, or safety interlock.",
      "Check basics first: fluids, filters, battery, grounds, leaks, loose connectors, fault codes.",
      "Compare one good function to one bad function.",
      "Take pressure, voltage, or temperature readings before replacing parts.",
      "Change one thing at a time and retest."
    ],
    likely: ["Needs targeted testing"]
  }
};

function showTab(name, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector("#tab-" + name).classList.add("active");
  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function runDiagnostic() {
  const key = document.getElementById("symptom").value;
  const tree = diagnosticTrees[key];
  const result = document.getElementById("diagnosticResult");
  result.classList.remove("hidden");
  result.textContent =
    tree.title + "\n\nLikely causes:\n- " +
    tree.likely.join("\n- ") +
    "\n\nSuggested test path:\n" +
    tree.steps.map((s, i) => (i + 1) + ". " + s).join("\n");
}

function evaluateReadings() {
  const main = Number(document.getElementById("mainPressure").value);
  const pilot = Number(document.getElementById("pilotPressure").value);
  const voltage = Number(document.getElementById("voltage").value);
  const messages = [];

  if (main) {
    if (main < 2000) messages.push("Main pressure looks low for many heavy equipment hydraulic systems. Verify machine spec before adjusting anything.");
    else if (main > 5000) messages.push("Main pressure is high. Confirm spec and gauge accuracy. Overpressure can damage components.");
    else messages.push("Main pressure is within a common working range, but compare to the service manual spec.");
  }

  if (pilot) {
    if (pilot < 250) messages.push("Pilot/charge pressure may be low. This can cause weak or no hydraulic control response.");
    else if (pilot > 800) messages.push("Pilot/charge pressure seems high for many machines. Confirm spec.");
    else messages.push("Pilot/charge pressure looks plausible. Confirm with exact spec.");
  }

  if (voltage) {
    if (voltage < 12.2) messages.push("Battery voltage is low. Charge/load test battery before deeper electrical diagnosis.");
    else if (voltage >= 12.4 && voltage <= 12.8) messages.push("Battery voltage looks normal at rest.");
    else if (voltage > 14.8) messages.push("Voltage is high. Check charging system/regulator.");
  }

  if (!messages.length) messages.push("Enter pressure or voltage readings to evaluate.");

  const result = document.getElementById("readingResult");
  result.classList.remove("hidden");
  result.textContent = messages.join("\n");
}

function collectJob() {
  return {
    date: new Date().toLocaleString(),
    make: val("make"),
    model: val("model"),
    serial: val("serial"),
    hours: val("hours"),
    system: val("system"),
    symptom: document.getElementById("symptom").selectedOptions[0].text,
    complaint: val("complaint"),
    mainPressure: val("mainPressure"),
    pilotPressure: val("pilotPressure"),
    voltage: val("voltage"),
    codes: val("codes"),
    notes: val("notes"),
    finalFix: val("finalFix")
  };
}

function val(id) { return document.getElementById(id).value; }

function saveJob() {
  const jobs = JSON.parse(localStorage.getItem("ironDiagJobs") || "[]");
  jobs.unshift(collectJob());
  localStorage.setItem("ironDiagJobs", JSON.stringify(jobs));
  document.getElementById("saveStatus").textContent = "Saved on this phone.";
  renderJobs();
}

function renderJobs() {
  const jobs = JSON.parse(localStorage.getItem("ironDiagJobs") || "[]");
  const wrap = document.getElementById("jobs");
  if (!jobs.length) {
    wrap.innerHTML = '<p class="small">No saved jobs yet.</p>';
    return;
  }
  wrap.innerHTML = jobs.map(j => `
    <div class="job">
      <strong>${escapeHtml(j.make || "Unknown make")} ${escapeHtml(j.model || "")}</strong>
      <div class="small">${escapeHtml(j.date)} • ${escapeHtml(j.system)} • ${escapeHtml(j.symptom)}</div>
      <div>
        ${j.serial ? `<span class="badge">Serial: ${escapeHtml(j.serial)}</span>` : ""}
        ${j.hours ? `<span class="badge">Hours: ${escapeHtml(j.hours)}</span>` : ""}
        ${j.mainPressure ? `<span class="badge">Main PSI: ${escapeHtml(j.mainPressure)}</span>` : ""}
        ${j.pilotPressure ? `<span class="badge">Pilot PSI: ${escapeHtml(j.pilotPressure)}</span>` : ""}
        ${j.voltage ? `<span class="badge">Volts: ${escapeHtml(j.voltage)}</span>` : ""}
      </div>
      <p>${escapeHtml(j.complaint || j.notes || j.finalFix || "No notes entered.")}</p>
    </div>
  `).join("");
}

function exportJobs() {
  const jobs = localStorage.getItem("ironDiagJobs") || "[]";
  const blob = new Blob([jobs], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "irondDiag-jobs.json";
  a.click();
  URL.revokeObjectURL(url);
}

function clearJobs() {
  if (confirm("Clear all saved jobs on this phone?")) {
    localStorage.removeItem("ironDiagJobs");
    renderJobs();
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

renderJobs();
