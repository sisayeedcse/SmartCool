// Unit and integration tests for SmartCool simulation logic and accounting consistency
import assert from "node:assert/strict";

// Helper functions replicating context logic for standalone Node test execution
const round2 = (val) => Math.round((val + Number.EPSILON) * 100) / 100;
const round1 = (val) => Math.round((val + Number.EPSILON) * 10) / 10;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const formatNum = (n, d = 2) => Number(n).toFixed(d);

function calculateRoomMetrics(r, tariff, ef) {
  const normalKwh = round2(r.en);
  const smartKwh = round2(r.e);
  const savedKwh = round2(normalKwh - smartKwh);
  const savingsPercent = normalKwh > 0 ? round1((savedKwh / normalKwh) * 100) : 0;
  const normalCost = round2(normalKwh * tariff);
  const smartCost = round2(smartKwh * tariff);
  const savedCost = round2(savedKwh * tariff);
  const normalCo2 = round2(normalKwh * ef);
  const smartCo2 = round2(smartKwh * ef);
  const savedCo2 = round2(savedKwh * ef);

  return {
    normalKwh,
    smartKwh,
    savedKwh,
    savingsPercent,
    normalCost,
    smartCost,
    savedCost,
    normalCo2,
    smartCo2,
    savedCo2,
  };
}

function calculateFacilityTotals(rooms, tariff, ef) {
  const roomMetrics = rooms.map((r) => calculateRoomMetrics(r, tariff, ef));

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.occ).length;
  const totalAcs = rooms.reduce((s, r) => s + r.acs.length, 0);
  const onAcs = rooms.reduce((s, r) => s + r.acs.filter((a) => a.on).length, 0);
  const totalPowerKw = round2(rooms.reduce((s, r) => s + r.acs.reduce((pSum, a) => pSum + a.p, 0), 0));

  const totalNormalEnergyKwh = round2(roomMetrics.reduce((s, m) => s + m.normalKwh, 0));
  const totalSmartEnergyKwh = round2(roomMetrics.reduce((s, m) => s + m.smartKwh, 0));
  const totalSavedEnergyKwh = round2(totalNormalEnergyKwh - totalSmartEnergyKwh);
  const savingsPercent = totalNormalEnergyKwh > 0 ? round1((totalSavedEnergyKwh / totalNormalEnergyKwh) * 100) : 0;

  const totalNormalCostBdt = round2(totalNormalEnergyKwh * tariff);
  const totalSmartCostBdt = round2(totalSmartEnergyKwh * tariff);
  const totalSavedCostBdt = round2(totalSavedEnergyKwh * tariff);

  const totalNormalCo2Kg = round2(totalNormalEnergyKwh * ef);
  const totalSmartCo2Kg = round2(totalSmartEnergyKwh * ef);
  const totalSavedCo2Kg = round2(totalSavedEnergyKwh * ef);

  return {
    totalRooms,
    occupiedRooms,
    totalAcs,
    onAcs,
    totalPowerKw,
    totalNormalEnergyKwh,
    totalSmartEnergyKwh,
    totalSavedEnergyKwh,
    savingsPercent,
    totalNormalCostBdt,
    totalSmartCostBdt,
    totalSavedCostBdt,
    totalNormalCo2Kg,
    totalSmartCo2Kg,
    totalSavedCo2Kg,
  };
}

function stepRoom(r, currentMin, settings) {
  const was = r.occ;
  const n = r.force != null ? r.force : false;
  r.occ = n;

  // Vacancy timer logic capped at settings.vac
  if (n) {
    r.vac = 0;
  } else {
    r.vac = Math.min(settings.vac, r.vac + 1);
  }

  // AC control logic
  r.acs.forEach((a) => {
    if (a.mode === "auto") {
      if (n) {
        a.on = true;
      } else if (r.vac >= settings.vac) {
        a.on = false;
      }
    }
  });
}

// -------------------------------------------------------------
// Test 1: Data consistency across all views & accounting rules
// -------------------------------------------------------------
function testDataConsistencyAcrossViews() {
  const tariff = 10;
  const ef = 0.696;

  const sampleRooms = [
    { id: "1", name: "Room 101", acs: [{ on: true, p: 1.1 }, { on: true, p: 1.0 }], en: 4.82, e: 4.32, occ: true },
    { id: "2", name: "Room 102", acs: [{ on: false, p: 0 }], en: 2.50, e: 1.80, occ: false },
    { id: "3", name: "Room 103", acs: [{ on: true, p: 1.2 }, { on: true, p: 1.1 }, { on: false, p: 0 }], en: 7.20, e: 5.10, occ: true },
    { id: "4", name: "Room 104", acs: [{ on: false, p: 0 }, { on: false, p: 0 }], en: 5.30, e: 3.90, occ: false },
  ];

  const totals = calculateFacilityTotals(sampleRooms, tariff, ef);
  const roomMetrics = sampleRooms.map((r) => calculateRoomMetrics(r, tariff, ef));

  // 1. Totals must equal the sum of room rows
  const sumNormalKwh = round2(roomMetrics.reduce((acc, m) => acc + m.normalKwh, 0));
  const sumSmartKwh = round2(roomMetrics.reduce((acc, m) => acc + m.smartKwh, 0));
  const sumSavedKwh = round2(roomMetrics.reduce((acc, m) => acc + m.savedKwh, 0));

  assert.equal(totals.totalNormalEnergyKwh, sumNormalKwh, "Total normal kWh must equal sum of room normal kWh");
  assert.equal(totals.totalSmartEnergyKwh, sumSmartKwh, "Total smart kWh must equal sum of room smart kWh");
  assert.equal(totals.totalSavedEnergyKwh, sumSavedKwh, "Total saved kWh must equal sum of room saved kWh");

  // 2. Saved = normal - smart
  assert.equal(totals.totalSavedEnergyKwh, round2(totals.totalNormalEnergyKwh - totals.totalSmartEnergyKwh));

  // 3. Cost = kWh * tariff
  assert.equal(totals.totalNormalCostBdt, round2(totals.totalNormalEnergyKwh * tariff));
  assert.equal(totals.totalSmartCostBdt, round2(totals.totalSmartEnergyKwh * tariff));
  assert.equal(totals.totalSavedCostBdt, round2(totals.totalSavedEnergyKwh * tariff));

  // 4. CO2e = kWh * emission factor
  assert.equal(totals.totalNormalCo2Kg, round2(totals.totalNormalEnergyKwh * ef));
  assert.equal(totals.totalSmartCo2Kg, round2(totals.totalSmartEnergyKwh * ef));
  assert.equal(totals.totalSavedCo2Kg, round2(totals.totalSavedEnergyKwh * ef));

  // 5. Consistent rounding: formatNum string lengths
  roomMetrics.forEach((m) => {
    assert.equal(formatNum(m.normalKwh, 2), m.normalKwh.toFixed(2));
    assert.equal(formatNum(m.smartKwh, 2), m.smartKwh.toFixed(2));
    assert.equal(formatNum(m.savedKwh, 2), m.savedKwh.toFixed(2));
    assert.equal(formatNum(m.savingsPercent, 1), m.savingsPercent.toFixed(1));
  });

  console.log("PASS: Data consistency and accounting rules verified.");
}

// -------------------------------------------------------------
// Test 2: Vacancy timer counts up, caps at configured limit, triggers shutoff
// -------------------------------------------------------------
function testVacancyTimerExpiryAndCap() {
  const settings = { vac: 5, tariff: 10, ef: 0.696, set: 24, ms: 1500 };
  const room = {
    id: "1",
    name: "Room 101",
    force: false, // simulated vacant
    occ: false,
    vac: 0,
    acs: [{ mode: "auto", on: true }, { mode: "auto", on: true }],
  };

  // Step 1 to 4 minutes: timer counts up, ACs remain on
  for (let min = 1; min <= 4; min++) {
    stepRoom(room, 600 + min, settings);
    assert.equal(room.vac, min, `At minute ${min}, vac timer should be ${min}`);
    assert.equal(room.acs[0].on, true, "AC should remain on during grace period");
  }

  // Step at minute 5: reaches configured delay, ACs turn off
  stepRoom(room, 605, settings);
  assert.equal(room.vac, 5, "At 5 minutes, vac timer should equal configured delay (5)");
  assert.equal(room.acs[0].on, false, "AC should turn off at vacancy timeout");
  assert.equal(room.acs[1].on, false, "AC should turn off at vacancy timeout");

  // Step beyond 5 minutes (e.g. 10 minutes total): vac timer must NEVER exceed configured limit (no 10:00 / 05:00)
  for (let min = 6; min <= 15; min++) {
    stepRoom(room, 600 + min, settings);
    assert.equal(room.vac, 5, `At minute ${min}, vac timer must remain capped at ${settings.vac}`);
    assert.equal(room.acs[0].on, false, "AC must remain off while vacant");
  }

  console.log("PASS: Vacancy timer cap at configured delay and auto-shutoff verified.");
}

// -------------------------------------------------------------
// Test 3: Motion returns before expiry and resets timer
// -------------------------------------------------------------
function testMotionReturnResetsTimer() {
  const settings = { vac: 5, tariff: 10, ef: 0.696, set: 24, ms: 1500 };
  const room = {
    id: "1",
    name: "Room 101",
    force: false,
    occ: false,
    vac: 0,
    acs: [{ mode: "auto", on: true }],
  };

  // Step 3 minutes vacant
  for (let min = 1; min <= 3; min++) {
    stepRoom(room, 600 + min, settings);
  }
  assert.equal(room.vac, 3, "Timer should be at 3 min before reoccupation");

  // Motion returns at minute 4
  room.force = true;
  stepRoom(room, 604, settings);

  assert.equal(room.occ, true, "Room should be occupied");
  assert.equal(room.vac, 0, "Vacancy timer must reset to 0 immediately when motion returns");
  assert.equal(room.acs[0].on, true, "AC must remain on when reoccupied");

  console.log("PASS: Motion return timer reset verified.");
}

// Run all tests
testDataConsistencyAcrossViews();
testVacancyTimerExpiryAndCap();
testMotionReturnResetsTimer();
console.log("All frontend simulation context tests passed successfully!");
