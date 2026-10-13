import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRoutineConsistency,
  generateJourneyInsights,
  calculateCautiousForecast,
  generateCalendarIcs,
  type JourneyData,
  type ProgressCheckIn,
  type TrackedProduct,
  type RoutineCompletionLog,
} from "../src/lib/journey";

test("routine consistency: empty tracked products returns zero metrics", () => {
  const result = calculateRoutineConsistency([], []);
  assert.equal(result.consistencyRate, 0);
  assert.equal(result.currentStreak, 0);
  assert.equal(result.todayCompletedCount, 0);
  assert.equal(result.todayTotalScheduled, 0);
});

test("routine consistency: correctly tracks daily completions and window percentage", () => {
  const tracked: TrackedProduct[] = [
    {
      productId: "prod_1",
      productName: "Salicylic Acid Cleanser",
      category: "Face cleanser",
      schedule: "am",
      stepOrder: 1,
      addedAt: "2026-10-01",
    },
    {
      productId: "prod_2",
      productName: "Ceramide Moisturiser",
      category: "Face moisturiser",
      schedule: "pm",
      stepOrder: 2,
      addedAt: "2026-10-01",
    },
  ];

  const now = new Date();
  const formatD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const todayStr = formatD(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatD(yesterday);

  const logs: RoutineCompletionLog[] = [
    {
      id: "l1",
      date: todayStr,
      schedule: "am",
      productId: "prod_1",
      completedAt: new Date().toISOString(),
    },
    {
      id: "l2",
      date: yesterdayStr,
      schedule: "pm",
      productId: "prod_2",
      completedAt: new Date().toISOString(),
    },
  ];

  const metrics = calculateRoutineConsistency(tracked, logs, 14);
  assert.equal(metrics.todayCompletedCount, 1);
  assert.equal(metrics.todayTotalScheduled, 2);
  assert.equal(metrics.activeDaysCount, 2);
  assert.ok(metrics.currentStreak >= 2);
  assert.equal(metrics.consistencyRate, Math.round((2 / 14) * 100));
});

test("journey insights: empty check-ins returns baseline guidance", () => {
  const journey: JourneyData = {
    version: 1,
    profile: {
      category: "face",
      primaryConcern: "Acne-prone skin",
      startDate: "2026-10-01",
    },
    trackedProducts: [],
    completionLogs: [],
    checkIns: [],
    reminders: { enabled: true },
    updatedAt: "2026-10-01",
  };

  const insights = generateJourneyInsights(journey);
  assert.equal(insights.length, 1);
  assert.equal(insights[0].id, "no-checkins");
  assert.equal(insights[0].type, "guidance");
});

test("journey insights: detects lower concern rating trajectory across multiple check-ins", () => {
  const checkIns: ProgressCheckIn[] = [
    {
      id: "c1",
      date: "2026-09-01",
      concern: "Acne-prone skin",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-01",
    },
    {
      id: "c2",
      date: "2026-09-08",
      concern: "Acne-prone skin",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-08",
    },
    {
      id: "c3",
      date: "2026-09-15",
      concern: "Acne-prone skin",
      category: "face",
      rating: 2,
      status: "better",
      irritation: false,
      createdAt: "2026-09-15",
    },
    {
      id: "c4",
      date: "2026-09-22",
      concern: "Acne-prone skin",
      category: "face",
      rating: 2,
      status: "better",
      irritation: false,
      createdAt: "2026-09-22",
    },
  ];

  const journey: JourneyData = {
    version: 1,
    profile: {
      category: "face",
      primaryConcern: "Acne-prone skin",
      startDate: "2026-09-01",
    },
    trackedProducts: [],
    completionLogs: [],
    checkIns,
    reminders: { enabled: true },
    updatedAt: "2026-09-22",
  };

  const insights = generateJourneyInsights(journey);
  const positive = insights.find((i) => i.id === "concern-reduction");
  assert.ok(positive, "Should find positive rating trajectory insight");
  assert.equal(positive?.type, "positive");
});

test("cautious forecasting: requires at least 4 check-ins spanning 21 days", () => {
  // Test 1: Only 3 check-ins
  const threeCheckIns: ProgressCheckIn[] = [
    {
      id: "1",
      date: "2026-09-01",
      concern: "Acne marks",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-01",
    },
    {
      id: "2",
      date: "2026-09-15",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "better",
      irritation: false,
      createdAt: "2026-09-15",
    },
    {
      id: "3",
      date: "2026-09-30",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "same",
      irritation: false,
      createdAt: "2026-09-30",
    },
  ];

  const res1 = calculateCautiousForecast(threeCheckIns);
  assert.equal(res1.eligible, false);
  assert.match(res1.reason || "", /At least 4 weekly check-ins/);

  // Test 2: 4 check-ins but too close together (span < 21 days)
  const quickCheckIns: ProgressCheckIn[] = [
    {
      id: "1",
      date: "2026-09-01",
      concern: "Acne marks",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-01",
    },
    {
      id: "2",
      date: "2026-09-04",
      concern: "Acne marks",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-04",
    },
    {
      id: "3",
      date: "2026-09-08",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "better",
      irritation: false,
      createdAt: "2026-09-08",
    },
    {
      id: "4",
      date: "2026-09-12",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "same",
      irritation: false,
      createdAt: "2026-09-12",
    },
  ];

  const res2 = calculateCautiousForecast(quickCheckIns);
  assert.equal(res2.eligible, false);
  assert.match(res2.reason || "", /span at least 21 days/);

  // Test 3: 4 check-ins spanning 28 days (eligible!)
  const eligibleCheckIns: ProgressCheckIn[] = [
    {
      id: "1",
      date: "2026-09-01",
      concern: "Acne marks",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-01",
    },
    {
      id: "2",
      date: "2026-09-08",
      concern: "Acne marks",
      category: "face",
      rating: 4,
      status: "same",
      irritation: false,
      createdAt: "2026-09-08",
    },
    {
      id: "3",
      date: "2026-09-18",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "better",
      irritation: false,
      createdAt: "2026-09-18",
    },
    {
      id: "4",
      date: "2026-09-29",
      concern: "Acne marks",
      category: "face",
      rating: 3,
      status: "same",
      irritation: false,
      createdAt: "2026-09-29",
    },
  ];

  const res3 = calculateCautiousForecast(eligibleCheckIns);
  assert.equal(res3.eligible, true);
  assert.ok(typeof res3.trendSlope === "number");
  assert.ok(res3.dataPoints.some((p) => p.isForecast));
  assert.ok(res3.forecastNotice?.includes("does not guarantee medical results"));
});

test("calendar export: produces valid iCalendar (.ics) format with recurrence rule", () => {
  const ics = generateCalendarIcs({
    title: "Bodywise Daily Routine",
    description: "Daily skincare reminder.",
    recurrence: "DAILY",
    hour: 8,
    minute: 30,
  });

  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("SUMMARY:Bodywise Daily Routine"));
  assert.ok(ics.includes("RRULE:FREQ=DAILY;INTERVAL=1"));
  assert.ok(ics.includes("END:VCALENDAR"));
});
