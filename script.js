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

function formatDurationHours(durationHours) {
  if (durationHours == null || isNaN(durationHours)) return 'N/A';
  const totalMinutes = Math.max(0, Math.round(durationHours * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function attachServiceIds(services) {
  return services.map((s, index) => ({
    ...s,
    id: index + 1
  }));
}

// Initialize date picker: today as minimum selectable date
(function initFlightDatePicker() {
  const dateInput = document.getElementById('flight-date');
  if (!dateInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  dateInput.min = todayStr;
})();

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

  discovered.forEach((s, index) => {
    const id = s.id != null ? s.id : index + 1;
    const row = document.createElement('div');
    row.classList.add('phase-body-row');

    const idBadge = document.createElement('span');
    idBadge.classList.add('badge', 'badge-id');
    idBadge.textContent = `#${id}`;

    const name = document.createElement('span');
    name.classList.add('badge', 'badge-name');
    name.textContent = s.name;

    const price = document.createElement('span');
    price.classList.add('badge', 'badge-price');
    price.textContent = `$${s.price}`;

    const duration = document.createElement('span');
    duration.classList.add('badge', 'badge-duration');
    duration.textContent = formatDurationHours(s.duration);

    const format = document.createElement('span');
    format.classList.add('badge', 'badge-format');
    format.textContent = s.format;

    row.appendChild(idBadge);
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

  scored.forEach((s, index) => {
    const id = s.id != null ? s.id : index + 1;
    const row = document.createElement('div');
    row.classList.add('phase-body-row');

    const idBadge = document.createElement('span');
    idBadge.classList.add('badge', 'badge-id');
    idBadge.textContent = `#${id}`;

    const name = document.createElement('span');
    name.classList.add('badge', 'badge-name');
    name.textContent = s.name;

    const score = document.createElement('span');
    score.classList.add('badge', 'badge-score');
    score.textContent = `score = ${s.score.toFixed(2)}`;

    row.appendChild(idBadge);
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

function renderExecutionCard(selected, mediated) {
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
  const providerName = mediated && mediated.provider ? mediated.provider : selected.name;
  resultText.textContent = `Booking confirmed (Number: #${bookingId})`;

  result.appendChild(resultLabel);
  result.appendChild(resultText);

  const details = document.createElement('div');
  details.classList.add('result-details');
  const cost = mediated && mediated.cost != null ? mediated.cost : selected.price;
  const time = mediated && mediated.time != null ? mediated.time : selected.duration;
  details.textContent = `Provider: ${providerName} • Price: $${cost} • Duration: ${formatDurationHours(time)}`;
  result.appendChild(details);

  body.appendChild(result);
}

// Optional: real flight API integration (demo)
// Configure your free API key and endpoint here.
// Example provider: aviationstack.com (free tier with API key)
const CITY_TO_AIRPORT_IATA = {
  Paris: 'CDG',
  London: 'LHR',
  Dubai: 'DXB',
  'New York': 'JFK',
  Tokyo: 'HND',
  Istanbul: 'IST',
  Cairo: 'CAI'
};

// For this demo we fix the origin to Riyadh, Saudi Arabia
// (King Khalid International Airport, RUH).
const ORIGIN_AIRPORT_IATA = 'RUH';

// IMPORTANT: this key is for your demo only; in real
// apps you should NOT expose it in frontend code.
const FLIGHT_API_KEY = '12cb845e7cda182c4f4772f9fcb5d74b';

async function fetchRealFlightsForDestination(destination, date) {
  const arrivalIata = CITY_TO_AIRPORT_IATA[destination];
  if (!arrivalIata) {
    return null; // no mapping → skip live call
  }
  if (!FLIGHT_API_KEY || FLIGHT_API_KEY.startsWith('YOUR_')) {
    return null; // key not configured → skip
  }

  // Use the simplest query that worked reliably with this key:
  // filter by destination airport only and limit the number of results.
  // (We keep the chosen date only for UI/explanation, not as an API filter.)
  let url = `https://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(FLIGHT_API_KEY)}&arr_iata=${encodeURIComponent(arrivalIata)}&limit=3`;

  const response = await fetch(url);
  if (!response.ok) {
    // 403 is common if the key/plan doesn’t allow this
    // kind of request (e.g., HTTPS-only, quota, etc.).
    throw new Error(`Flight API error: ${response.status}`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.data)) {
    return null;
  }
  return data.data;
}

function mediateRealFlight(service) {
  return {
    provider: service.name,
    cost: service.price,
    time: service.duration
  };
}

// Map a real API flight into a "service-like" object so the
// existing selection/mediation/execution logic can still work.
function mapFlightToServiceObject(apiFlight, destination) {
  const airlineName = apiFlight.airline && apiFlight.airline.name
    ? apiFlight.airline.name
    : 'Unknown airline';
  const flightNum = apiFlight.flight && (apiFlight.flight.iata || apiFlight.flight.number)
    ? apiFlight.flight.iata || apiFlight.flight.number
    : 'N/A';

  let durationHours = 3;
  try {
    const depTime = apiFlight.departure && apiFlight.departure.scheduled
      ? Date.parse(apiFlight.departure.scheduled)
      : NaN;
    const arrTime = apiFlight.arrival && apiFlight.arrival.scheduled
      ? Date.parse(apiFlight.arrival.scheduled)
      : NaN;
    if (!isNaN(depTime) && !isNaN(arrTime) && arrTime > depTime) {
      durationHours = (arrTime - depTime) / (1000 * 60 * 60);
    }
  } catch (_) {
    // keep default duration
  }

  // Demo-only pseudo price so we can still apply the same score rule.
  const pseudoPrice = 350 + Math.round(Math.random() * 300);

  const formats = ['JSON', 'XML', 'SOAP'];
  const randomFormat = formats[Math.floor(Math.random() * formats.length)];

  return {
    name: `${airlineName} ${flightNum}`,
    destination,
    price: pseudoPrice,
    duration: durationHours,
    format: randomFormat,
    // keep a reference to the raw API object in case you
    // want to inspect it later
    _apiFlight: apiFlight
  };
}

function appendRealFlightsToDiscoveryCard(flights, destination, date) {
  if (!flights || flights.length === 0) return;
  const body = phaseBodies.discovery;
  if (!body) return;

  const heading = document.createElement('div');
  heading.classList.add('phase-body-heading');
  if (date) {
    heading.textContent = `Live API flights (demo) from Riyadh → ${destination} on ${date}`;
  } else {
    heading.textContent = `Live API flights (demo) from Riyadh → ${destination}`;
  }
  body.appendChild(heading);

  flights.slice(0, 3).forEach(f => {
    const row = document.createElement('div');
    row.classList.add('phase-body-row');

    const airline = document.createElement('span');
    airline.classList.add('badge', 'badge-name');
    airline.textContent = f.airline && f.airline.name ? f.airline.name : 'Unknown airline';

    const flight = document.createElement('span');
    flight.classList.add('badge', 'badge-score');
    const flightNum = f.flight && (f.flight.iata || f.flight.number);
    flight.textContent = flightNum ? `Flight ${flightNum}` : 'Flight N/A';

    const arrival = document.createElement('span');
    arrival.classList.add('badge', 'badge-duration');
    const arrAirport = f.arrival && (f.arrival.airport || f.arrival.iata);
    arrival.textContent = arrAirport ? `→ ${arrAirport}` : 'Destination N/A';

    row.appendChild(airline);
    row.appendChild(flight);
    row.appendChild(arrival);
    body.appendChild(row);
  });
}

function appendExecutionApiError(message) {
  const body = phaseBodies.execution;
  if (!body) return;

  const errorDiv = document.createElement('div');
  errorDiv.classList.add('phase-body-row');
  errorDiv.textContent = message || 'Could not load live flight data (check API key / CORS).';
  body.appendChild(errorDiv);
}

function runSelectionMediationExecution(candidates) {
  // 🎯 SELECTION (multi-criteria scoring)
  setCurrentPhase('selection');
  startPhase('selection', 'Evaluating and scoring candidate services...');
  setTimeout(() => {
    const scored = candidates.map(s => {
      const score = s.price * 0.7 + s.duration * 10 * 0.3; // weighted
      return { ...s, score };
    });

    const selected = scored.reduce((best, s) => s.score < best.score ? s : best);
    renderSelectionCard(scored, selected);
    completePhase('selection');

    const mediated = mediateRealFlight(selected);

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
        renderExecutionCard(selected, mediated);
        completePhase('execution');
      }, 2200);

    }, 2000);

  }, 2400);
}

function runWSMX() {
  // 🔥 SERVICE REGISTRY (like WSMX repository)
  resetPhases();
  const destination = document.getElementById('destination').value;
  const dateInput = document.getElementById('flight-date');
  if (!dateInput || !dateInput.value) {
    alert('Please choose a flight date (today or later) before running the search.');
    return;
  }

  const flightDate = dateInput.value;

  // Extra guard against manually-entered past dates
  const selectedDate = new Date(flightDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    alert('Flight date cannot be in the past.');
    return;
  }

  // 🔍 DISCOVERY
  setCurrentPhase('discovery');
  startPhase('discovery', `Looking for flights to ${destination}...`);
  // Slightly longer delays to feel more "real-time"
  setTimeout(() => {
    const discovered = services.filter(s => s.destination === destination);

    // Try to use real API flights first.
    fetchRealFlightsForDestination(destination, flightDate)
      .then(flights => {
        if (flights && flights.length) {
          // Convert real flights into service-like objects and
          // run the rest of the pipeline on them.
          const realServices = flights.map(f => mapFlightToServiceObject(f, destination));
          const candidates = attachServiceIds(realServices);
          renderDiscoveryCard(destination, candidates);
          // We avoid duplicating the list: the discovery card already
          // shows airline, price, and duration based on live data.
          completePhase('discovery');
          runSelectionMediationExecution(candidates);
        } else {
          // If no live flights, fallback to the original mock services
          // when they exist; otherwise report that nothing was found.
          if (discovered.length) {
            const candidates = attachServiceIds(discovered);
            renderDiscoveryCard(destination, candidates);
            completePhase('discovery');
            runSelectionMediationExecution(candidates);
          } else {
            completePhase('discovery', [
              'Discovery summary:',
              'User goal: Find best flight to ' + destination,
              'No live flights returned by API and no local demo services configured for this destination.'
            ]);
          }
        }
      })
      .catch(err => {
        console.error(err);
        // On API error, stick to the original mock flow when possible.
        if (discovered.length) {
          const candidates = attachServiceIds(discovered);
          renderDiscoveryCard(destination, candidates);
          completePhase('discovery');
          runSelectionMediationExecution(candidates);
        } else {
          completePhase('discovery', [
            'Discovery summary:',
            'User goal: Find best flight to ' + destination,
            'Live API failed and no local demo services are configured for this destination.'
          ]);
        }
      });

  }, 1800);
}
