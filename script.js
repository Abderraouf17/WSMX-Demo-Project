// Simple WSMX-style demo logic

// Example service registry
const services = [
  { name: "SkyJet Express", destination: "Paris",  price: 450, duration: 2.5, format: "XML" },
  { name: "EuroWings Plus",  destination: "Paris",  price: 520, duration: 2.0, format: "JSON" },
  { name: "AirMetro Light",   destination: "Paris",  price: 480, duration: 2.8, format: "SOAP" },
  { name: "BritAir Connect",  destination: "London", price: 380, duration: 1.5, format: "SOAP" },
  { name: "LondonFlyer",      destination: "London", price: 420, duration: 1.2, format: "JSON" },
  { name: "CityLink UK",      destination: "London", price: 390, duration: 1.7, format: "XML" },
  { name: "DesertSky",        destination: "Dubai",  price: 650, duration: 6.0, format: "XML" },
  { name: "GulfJet",          destination: "Dubai",  price: 720, duration: 5.5, format: "JSON" },
  { name: "OasisLines",       destination: "Dubai",  price: 690, duration: 5.8, format: "SOAP" }
];

const phaseElements = {
  discovery: document.getElementById('step-discovery'),
  selection: document.getElementById('step-selection'),
  mediation: document.getElementById('step-mediation'),
  execution: document.getElementById('step-execution')
};

const phaseStatus = {
  discovery: document.getElementById('status-discovery'),
  selection: document.getElementById('status-selection'),
  mediation: document.getElementById('status-mediation'),
  execution: document.getElementById('status-execution')
};

const phaseBodies = {
  discovery: document.getElementById('body-discovery'),
  selection: document.getElementById('body-selection'),
  mediation: document.getElementById('body-mediation'),
  execution: document.getElementById('body-execution')
};

const phaseProgress = {
  discovery: document.getElementById('progress-discovery'),
  selection: document.getElementById('progress-selection'),
  mediation: document.getElementById('progress-mediation'),
  execution: document.getElementById('progress-execution')
};

function setPhaseBody(phaseKey, lines) {
  const bodyEl = phaseBodies[phaseKey];
  if (!bodyEl) return;

  bodyEl.innerHTML = '';
  lines.forEach(text => {
    const lineDiv = document.createElement('div');
    lineDiv.textContent = text;
    bodyEl.appendChild(lineDiv);
  });
}

function resetPhases() {
  Object.keys(phaseStatus).forEach(key => {
    const statusEl = phaseStatus[key];
    const bodyEl = phaseBodies[key];
    const progressEl = phaseProgress[key];
    if (statusEl) {
      statusEl.textContent = 'Waiting';
      statusEl.classList.remove('running', 'done');
    }
    if (bodyEl) {
      if (key === 'discovery') bodyEl.textContent = 'Waiting to start discovery.';
      if (key === 'selection') bodyEl.textContent = 'Waiting to start selection.';
      if (key === 'mediation') bodyEl.textContent = 'Waiting to start mediation.';
      if (key === 'execution') bodyEl.textContent = 'Waiting to start execution.';
    }
    if (progressEl) {
      progressEl.classList.remove('loading', 'complete');
      progressEl.style.width = '0';
      progressEl.style.animationDuration = '';
    }
  });
}

function setCurrentPhase(phaseKey) {
  Object.entries(phaseElements).forEach(([key, el]) => {
    if (!el) return;
    el.classList.remove('active');
    if (key === phaseKey) {
      el.classList.add('active');
    }
  });

  // Mark previous phases as completed
  const order = ['discovery', 'selection', 'mediation', 'execution'];
  const currentIndex = order.indexOf(phaseKey);
  order.forEach((key, index) => {
    const el = phaseElements[key];
    if (!el) return;
    if (index < currentIndex) {
      el.classList.add('completed');
    } else if (index >= currentIndex) {
      el.classList.remove('completed');
    }
  });
}

function startPhase(phaseKey, message) {
  const statusEl = phaseStatus[phaseKey];
  const progressEl = phaseProgress[phaseKey];
  if (statusEl) {
    statusEl.textContent = 'Running';
    statusEl.classList.remove('done');
    statusEl.classList.add('running');
  }
  if (message) {
    const lines = Array.isArray(message) ? message : [message];
    setPhaseBody(phaseKey, lines);
  }
  if (progressEl) {
    progressEl.classList.remove('complete', 'loading');

    // Match animation duration to phase delay
    let durationMs = 900;
    if (phaseKey === 'discovery') durationMs = 1800;
    else if (phaseKey === 'selection') durationMs = 2400;
    else if (phaseKey === 'mediation') durationMs = 2000;
    else if (phaseKey === 'execution') durationMs = 2200;

    progressEl.style.animationDuration = `${durationMs}ms`;

    // restart animation by toggling class
    void progressEl.offsetWidth; // force reflow
    progressEl.classList.add('loading');
  }
}

function completePhase(phaseKey, message) {
  const statusEl = phaseStatus[phaseKey];
  const progressEl = phaseProgress[phaseKey];
  if (statusEl) {
    statusEl.textContent = 'Done';
    statusEl.classList.remove('running');
    statusEl.classList.add('done');
  }
  if (message) {
    const lines = Array.isArray(message) ? message : [message];
    setPhaseBody(phaseKey, lines);
  }
  if (progressEl) {
    progressEl.classList.remove('loading');
    progressEl.classList.add('complete');
  }

  // When execution is fully done, mark its top pill as completed (green)
  if (phaseKey === 'execution') {
    const execPill = phaseElements.execution;
    if (execPill) {
      execPill.classList.remove('active');
      execPill.classList.add('completed');
    }
  }
}

function renderDiscoveryCard(destination, discovered) {
  const body = phaseBodies.discovery;
  if (!body) return;

  body.innerHTML = '';

  const heading = document.createElement('div');
  heading.classList.add('phase-body-heading');
  heading.textContent = `Discovery(goal = "${destination}")`;
  body.appendChild(heading);

  const subtitle = document.createElement('div');
  subtitle.classList.add('phase-body-subtitle');
  subtitle.textContent = `Found ${discovered.length} services:`;
  body.appendChild(subtitle);

  discovered.forEach(s => {
    const row = document.createElement('div');
    row.classList.add('phase-body-row');

    const name = document.createElement('span');
    name.classList.add('badge', 'badge-name');
    name.textContent = s.name;

    const price = document.createElement('span');
    price.classList.add('badge', 'badge-price');
    price.textContent = `$${s.price}`;

    const duration = document.createElement('span');
    duration.classList.add('badge', 'badge-duration');
    duration.textContent = `${s.duration}h`;

    const format = document.createElement('span');
    format.classList.add('badge', 'badge-format');
    format.textContent = s.format;

    row.appendChild(name);
    row.appendChild(price);
    row.appendChild(duration);
    row.appendChild(format);
    body.appendChild(row);
  });
}

function renderSelectionCard(scored, selected) {
  const body = phaseBodies.selection;
  if (!body) return;

  body.innerHTML = '';

  const heading = document.createElement('div');
  heading.classList.add('phase-body-heading');
  heading.textContent = 'Selection(scores)';
  body.appendChild(heading);

  scored.forEach(s => {
    const row = document.createElement('div');
    row.classList.add('phase-body-row');

    const name = document.createElement('span');
    name.classList.add('badge', 'badge-name');
    name.textContent = s.name;

    const score = document.createElement('span');
    score.classList.add('badge', 'badge-score');
    score.textContent = `score = ${s.score.toFixed(2)}`;

    row.appendChild(name);
    row.appendChild(score);
    body.appendChild(row);
  });

  const best = document.createElement('div');
  best.classList.add('phase-body-highlight');

  const label = document.createElement('span');
  label.classList.add('best-label');
  label.textContent = 'Best service';

  const bestName = document.createElement('span');
  bestName.classList.add('best-name');
  bestName.textContent = selected.name;

  best.appendChild(label);
  best.appendChild(bestName);
  body.appendChild(best);
}

function renderMediationCard(selected) {
  const body = phaseBodies.mediation;
  if (!body) return;

  body.innerHTML = '';

  const heading = document.createElement('div');
  heading.classList.add('phase-body-heading');
  heading.textContent = 'Mediation(format)';
  body.appendChild(heading);

  const row = document.createElement('div');
  row.classList.add('phase-body-row');

  const original = document.createElement('span');
  original.classList.add('badge', 'badge-format');
  original.textContent = `original = ${selected.format}`;
  row.appendChild(original);

  const action = document.createElement('span');
  action.classList.add('badge', 'badge-action');
  if (selected.format !== 'JSON') {
    action.textContent = `convert ${selected.format} → JSON`;
  } else {
    action.textContent = 'no conversion needed';
  }
  row.appendChild(action);

  body.appendChild(row);
}

function renderExecutionCard(selected) {
  const body = phaseBodies.execution;
  if (!body) return;

  body.innerHTML = '';

  const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

  const heading = document.createElement('div');
  heading.classList.add('phase-body-heading');
  heading.textContent = 'Execution(invoke)';
  body.appendChild(heading);

  const call = document.createElement('div');
  call.classList.add('phase-body-row', 'invoke-row');
  call.textContent = `invokeService("${selected.name}")`;
  body.appendChild(call);

  const result = document.createElement('div');
  result.classList.add('phase-body-highlight', 'result-highlight');

  const resultLabel = document.createElement('span');
  resultLabel.classList.add('result-label');
  resultLabel.textContent = 'Result';

  const resultText = document.createElement('span');
  resultText.classList.add('result-text');
  resultText.textContent = `Flight booked via ${selected.name} (Booking Number : #${bookingId})`;

  result.appendChild(resultLabel);
  result.appendChild(resultText);
  body.appendChild(result);
}

function runWSMX() {
  // 🔥 SERVICE REGISTRY (like WSMX repository)
  resetPhases();
  const destination = document.getElementById('destination').value;

  // 🔍 DISCOVERY
  setCurrentPhase('discovery');
  startPhase('discovery', `Looking for flights to ${destination}...`);
  // Slightly longer delays to feel more "real-time"
  setTimeout(() => {
    const discovered = services.filter(s => s.destination === destination);

    if (discovered.length === 0) {
      completePhase('discovery', [
        'Discovery summary:',
        'User goal: Find best flight to ' + destination,
        'No services found for this destination.'
      ]);
      return;
    }

    renderDiscoveryCard(destination, discovered);
    completePhase('discovery');

    // 🎯 SELECTION (multi-criteria scoring)
    setCurrentPhase('selection');
    startPhase('selection', 'Evaluating and scoring candidate services...');
    setTimeout(() => {
      const scored = discovered.map(s => {
        const score = s.price * 0.7 + s.duration * 10 * 0.3; // weighted
        return { ...s, score };
      });

      const selected = scored.reduce((best, s) => s.score < best.score ? s : best);
      renderSelectionCard(scored, selected);
      completePhase('selection');

      // 🔄 MEDIATION
      setCurrentPhase('mediation');
      startPhase('mediation', `Checking data/format compatibility for ${selected.name}...`);
      setTimeout(() => {
        renderMediationCard(selected);
        completePhase('mediation');

        // ⚡ EXECUTION
        setCurrentPhase('execution');
        startPhase('execution', `Invoking ${selected.name}...`);
        setTimeout(() => {
          renderExecutionCard(selected);
          completePhase('execution');
        }, 2200);

      }, 2000);

    }, 2400);

  }, 1800);
}
