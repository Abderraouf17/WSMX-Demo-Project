// Mock WSMX-style execution logic (for explanation only)
// This file is not loaded by index.html; it's just to show the
// algorithmic idea of Discovery → Selection → Mediation → Execution.

// --- Domain model ---------------------------------------------------

/**
 * Example service description.
 * In real WSMX this would be an ontology-backed semantic description.
 */
class Service {
  constructor({ id, name, destination, price, durationHours, format }) {
    this.id = id;
    this.name = name;
    this.destination = destination;      // semantic concept: DestinationCity
    this.price = price;                  // semantic concept: TicketPrice
    this.durationHours = durationHours;  // semantic concept: FlightDuration
    this.format = format;                // e.g. "JSON", "XML", "SOAP"
  }
}

/**
 * Example user goal: "find best flight to X".
 * In real WSMX this would be a WSML goal.
 */
class UserGoal {
  constructor({ destination }) {
    this.destination = destination;
  }
}

// --- Mock service registry -----------------------------------------

const SERVICE_REGISTRY = [
  new Service({
    id: "s1",
    name: "SkyJet Express",
    destination: "Paris",
    price: 450,
    durationHours: 2.5,
    format: "XML"
  }),
  new Service({
    id: "s2",
    name: "EuroWings Plus",
    destination: "Paris",
    price: 520,
    durationHours: 2.0,
    format: "JSON"
  }),
  new Service({
    id: "s2b",
    name: "AirMetro Light",
    destination: "Paris",
    price: 480,
    durationHours: 2.8,
    format: "SOAP"
  }),
  new Service({
    id: "s3",
    name: "BritAir Connect",
    destination: "London",
    price: 380,
    durationHours: 1.5,
    format: "SOAP"
  }),
  new Service({
    id: "s4",
    name: "LondonFlyer",
    destination: "London",
    price: 420,
    durationHours: 1.2,
    format: "JSON"
  }),
  new Service({
    id: "s5",
    name: "CityLink UK",
    destination: "London",
    price: 390,
    durationHours: 1.7,
    format: "XML"
  }),
  new Service({
    id: "s6",
    name: "OasisLines",
    destination: "Dubai",
    price: 690,
    durationHours: 5.8,
    format: "SOAP"
  })
];

// --- 1. Discovery ---------------------------------------------------

/**
 * Discovery component: finds all services whose semantic description
 * satisfies the user goal.
 */
function discoverServices(goal, registry = SERVICE_REGISTRY) {
  // In real WSMX this would use reasoning over WSML ontologies.
  // Here we approximate it with a simple filter on destination.
  return registry.filter(service => service.destination === goal.destination);
}

// --- 2. Selection ---------------------------------------------------

/**
 * Selection component: evaluates discovered services and picks the
 * "best" one according to some utility function.
 */
function selectBestService(discovered) {
  if (discovered.length === 0) return null;

  // Example multi-criteria score: lower is better
  return discovered
    .map(service => {
      const priceWeight = 0.7;
      const durationWeight = 0.3;
      const score = service.price * priceWeight +
                    service.durationHours * 10 * durationWeight;
      return { service, score };
    })
    .reduce((best, current) =>
      current.score < best.score ? current : best
    ).service;
}

// --- 3. Mediation ---------------------------------------------------

/**
 * Mediation component: adapts heterogenous data/format/protocol so
 * that the selected service can be invoked uniformly.
 */
function mediateService(selectedService) {
  if (!selectedService) return null;

  // In real WSMX this would involve ontology mediation, data mapping,
  // and possibly protocol/format conversion.
  // Here we just ensure we end up with JSON.
  if (selectedService.format === "JSON") {
    return selectedService; // no mediation needed
  }

  // Mock mediation step: return a shallow copy with unified format.
  return new Service({
    ...selectedService,
    format: "JSON"
  });
}

// --- 4. Execution ---------------------------------------------------

/**
 * Execution component: actually invokes the mediated service.
 */
function executeService(service) {
  if (!service) {
    return { success: false, message: "No service available" };
  }

  // Real WSMX would send a message over the chosen protocol
  // to the service endpoint and handle the response.
  // We mock this with a synthetic success result.
  return {
    success: true,
    provider: service.name,
    message: `Flight booked to ${service.destination} via ${service.name}`
  };
}

// --- Orchestration: complete WSMX-style flow -----------------------

/**
 * High-level orchestration of the four main WSMX steps.
 */
function runWSMXFlow(destination) {
  const goal = new UserGoal({ destination });

  // 1) Discovery
  const discovered = discoverServices(goal);

  // 2) Selection
  const best = selectBestService(discovered);

  // 3) Mediation
  const mediated = mediateService(best);

  // 4) Execution
  const result = executeService(mediated);

  return { goal, discovered, best, mediated, result };
}

// Example usage (for reference only, not executed automatically):
// const flow = runWSMXFlow("Paris");
// console.log(flow);
