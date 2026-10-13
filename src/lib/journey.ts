import type { DiscoveryCategory, Concern } from "./types";

export type RoutineSchedule = "am" | "pm" | "anytime";

export type TrackedProduct = {
  productId: string;
  productName: string;
  category: string;
  schedule: RoutineSchedule;
  stepOrder: number;
  frequencyNote?: string;
  addedAt: string;
};

export type RoutineCompletionLog = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  schedule: RoutineSchedule;
  productId: string;
  completedAt: string; // ISO string
};

export type ProgressCheckIn = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  concern: string;
  category: DiscoveryCategory;
  rating: number; // 1 (Minimal / very calm) to 5 (Severe / very active)
  status: "better" | "same" | "worse";
  irritation: boolean;
  irritationDetails?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ReminderSetting = {
  enabled: boolean;
  timeAm?: string; // e.g. "08:00"
  timePm?: string; // e.g. "20:00"
  checkInDay?: number; // 0 (Sun) to 6 (Sat)
};

export type JourneyProfile = {
  category: DiscoveryCategory;
  primaryConcern: string;
  secondaryConcerns?: string[];
  startDate: string; // 'YYYY-MM-DD'
  notes?: string;
};

export type JourneyData = {
  version: 1;
  profile: JourneyProfile;
  trackedProducts: TrackedProduct[];
  completionLogs: RoutineCompletionLog[];
  checkIns: ProgressCheckIn[];
  reminders: ReminderSetting;
  updatedAt: string;
};

export const DEFAULT_JOURNEY_STORAGE_KEY = "bodywise_wellness_journey_v1";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatHumanDate(dateStr: string): string {
  try {
    const date = parseDateString(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getDaysBetween(earlierDateStr: string, laterDateStr: string): number {
  const d1 = parseDateString(earlierDateStr).getTime();
  const d2 = parseDateString(laterDateStr).getTime();
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates routine consistency metrics across the last N days.
 */
export function calculateRoutineConsistency(
  trackedProducts: TrackedProduct[],
  logs: RoutineCompletionLog[],
  windowDays = 14
): {
  consistencyRate: number; // 0 to 100 percentage
  activeDaysCount: number;
  windowDays: number;
  currentStreak: number;
  totalCompletions: number;
  todayCompletedCount: number;
  todayTotalScheduled: number;
} {
  const todayStr = getTodayDateString();
  const todayScheduled = trackedProducts.length;

  if (trackedProducts.length === 0) {
    return {
      consistencyRate: 0,
      activeDaysCount: 0,
      windowDays,
      currentStreak: 0,
      totalCompletions: 0,
      todayCompletedCount: 0,
      todayTotalScheduled: 0,
    };
  }

  // Count completions today
  const todayLogs = logs.filter((l) => l.date === todayStr);
  const todayCompletedProductIds = new Set(todayLogs.map((l) => l.productId));
  const todayCompletedCount = todayCompletedProductIds.size;

  // Build daily active map for streak and window consistency
  const activeDaysSet = new Set(logs.map((l) => l.date));

  // Window consistency
  let activeInWindow = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (activeDaysSet.has(dateKey)) {
      activeInWindow++;
    }
  }

  const consistencyRate = Math.round((activeInWindow / windowDays) * 100);

  // Calculate current streak
  let streak = 0;
  let checkDate = new Date();
  // If not completed today yet, check from yesterday so user doesn't lose streak before day ends
  const hasToday = activeDaysSet.has(todayStr);
  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 90; i++) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (activeDaysSet.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    consistencyRate,
    activeDaysCount: activeInWindow,
    windowDays,
    currentStreak: streak,
    totalCompletions: logs.length,
    todayCompletedCount,
    todayTotalScheduled: todayScheduled,
  };
}

export type JourneyInsight = {
  id: string;
  type: "positive" | "steady" | "attention" | "guidance";
  title: string;
  description: string;
};

/**
 * Generates objective, evidence-grounded insights based on actual recorded history.
 * Explains patterns without claiming that a product caused the change or fabricating recovery percentages.
 */
export function generateJourneyInsights(journey: JourneyData): JourneyInsight[] {
  const insights: JourneyInsight[] = [];
  const checkIns = [...journey.checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const consistency = calculateRoutineConsistency(
    journey.trackedProducts,
    journey.completionLogs,
    14
  );

  // 1. Initial State / Empty Check-ins
  if (checkIns.length === 0) {
    insights.push({
      id: "no-checkins",
      type: "guidance",
      title: "Establish Your Baseline",
      description:
        "No check-ins have been recorded yet. Logging your first check-in will establish a self-reported starting reference for your concerns.",
    });
    return insights;
  }

  // 2. Early Phase Guidance (1 to 2 check-ins)
  if (checkIns.length < 3) {
    const latest = checkIns[checkIns.length - 1];
    insights.push({
      id: "early-phase",
      type: "guidance",
      title: "Early Observation Period",
      description: `You have logged ${checkIns.length} check-in${checkIns.length > 1 ? "s" : ""}. Most topical routines require 4 to 8 weeks before consistent patterns emerge. Continue logging weekly observations.`,
    });

    if (latest.irritation) {
      insights.push({
        id: "early-irritation",
        type: "attention",
        title: "Discomfort Noted",
        description:
          "You recorded mild irritation or discomfort. Introduce one new formula at a time and consider spacing exfoliating actives across different days.",
      });
    }
    return insights;
  }

  // 3. Multi Check-in Trajectory Analysis
  const recentSlice = checkIns.slice(-3);
  const earliestSlice = checkIns.slice(0, 2);

  const avgRecent =
    recentSlice.reduce((sum, c) => sum + c.rating, 0) / recentSlice.length;
  const avgEarliest =
    earliestSlice.reduce((sum, c) => sum + c.rating, 0) / earliestSlice.length;
  const diff = avgRecent - avgEarliest;

  // Rating decrease: 1 is mild/calm, 5 is severe -> decrease means improving concern
  if (diff <= -0.75) {
    insights.push({
      id: "concern-reduction",
      type: "positive",
      title: "Ratings Trend Lower",
      description:
        "Your self-reported concern ratings have decreased across recent check-ins, indicating calmer skin sensations or reduced concern severity over this period.",
    });
  } else if (diff >= 0.75) {
    insights.push({
      id: "concern-increase",
      type: "attention",
      title: "Ratings Trend Higher",
      description:
        "Your self-reported concern ratings have risen recently. If you introduced new actives or environmental factors shifted, consider paring down to essentials while monitoring comfort.",
    });
  } else {
    // Steady ratings
    if (consistency.consistencyRate >= 65) {
      insights.push({
        id: "consistent-steady",
        type: "steady",
        title: "Consistent Application Observed",
        description:
          "Your routine consistency has been high, while your self-reported concern ratings remain unchanged. Active ingredients typically require sustained application over several weeks to demonstrate observable differences.",
      });
    } else {
      insights.push({
        id: "ratings-stable",
        type: "steady",
        title: "Stable Self-Reported Ratings",
        description:
          "Your ratings have remained largely steady across recent observations without significant upward or downward spikes.",
      });
    }
  }

  // 4. Rating Volatility Check
  const ratings = checkIns.map((c) => c.rating);
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance =
    ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 1.25 && checkIns.length >= 4) {
    insights.push({
      id: "high-variance",
      type: "guidance",
      title: "Fluctuating Observations",
      description:
        "Your recent check-in ratings vary considerably from week to week. Noting external factors such as weather, travel, or sleep may help identify day-to-day influences.",
    });
  }

  // 5. Irritation History
  const recentIrritations = checkIns.slice(-3).filter((c) => c.irritation);
  if (recentIrritations.length >= 2) {
    insights.push({
      id: "recurring-irritation",
      type: "attention",
      title: "Recurring Discomfort Recorded",
      description:
        "You recorded irritation or discomfort across multiple recent check-ins. Consider pausing leave-on exfoliants, sticking with gentle barrier support, and consulting a dermatologist if redness persists.",
    });
  }

  return insights;
}

export type ForecastPoint = {
  date: string;
  rating: number;
  isForecast: boolean;
  label: string;
};

export type ForecastResult = {
  eligible: boolean;
  reason?: string;
  totalCheckIns: number;
  daysSpan: number;
  trendSlope?: number; // delta per week
  recentTrendDescription?: string;
  dataPoints: ForecastPoint[];
  forecastNotice?: string;
};

/**
 * Calculates a cautious progress forecast only when at least 4 check-ins spanning 21+ days are available.
 * Clearly separates recorded observations from illustrative projections.
 */
export function calculateCautiousForecast(checkIns: ProgressCheckIn[]): ForecastResult {
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length < 4) {
    const days =
      sorted.length >= 2
        ? getDaysBetween(sorted[0].date, sorted[sorted.length - 1].date)
        : 0;
    return {
      eligible: false,
      reason: `At least 4 weekly check-ins spanning 3 weeks are required before an observational trend is meaningful (currently ${sorted.length} recorded over ${days} days).`,
      totalCheckIns: sorted.length,
      daysSpan: days,
      dataPoints: sorted.map((c) => ({
        date: c.date,
        rating: c.rating,
        isForecast: false,
        label: formatHumanDate(c.date),
      })),
    };
  }

  const firstDateStr = sorted[0].date;
  const lastDateStr = sorted[sorted.length - 1].date;
  const daysSpan = getDaysBetween(firstDateStr, lastDateStr);

  if (daysSpan < 21) {
    return {
      eligible: false,
      reason: `Observations must span at least 21 days (3 weeks) to establish a trend (currently spanning ${daysSpan} days). Continue checking in weekly.`,
      totalCheckIns: sorted.length,
      daysSpan,
      dataPoints: sorted.map((c) => ({
        date: c.date,
        rating: c.rating,
        isForecast: false,
        label: formatHumanDate(c.date),
      })),
    };
  }

  // Calculate weekly time steps and linear regression slope
  // x_i = days from first check-in / 7
  const xVals = sorted.map((c) => getDaysBetween(firstDateStr, c.date) / 7);
  const yVals = sorted.map((c) => c.rating);
  const n = sorted.length;

  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);
  const sumXY = xVals.reduce((acc, x, i) => acc + x * yVals[i], 0);
  const sumXX = xVals.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Trend description
  let recentTrendDescription = "Observational ratings are steady.";
  if (slope <= -0.15) {
    recentTrendDescription = "Observational ratings indicate a gentle downward trend (less active concern).";
  } else if (slope >= 0.15) {
    recentTrendDescription = "Observational ratings indicate an upward trend in concern severity.";
  }

  // Create historical data points
  const dataPoints: ForecastPoint[] = sorted.map((c) => ({
    date: c.date,
    rating: c.rating,
    isForecast: false,
    label: formatHumanDate(c.date),
  }));

  // Project 1 and 2 weeks ahead cautiously (dampen slope by 30% to avoid over-promising)
  const lastX = xVals[xVals.length - 1];
  const lastDate = parseDateString(lastDateStr);

  const dampenedSlope = slope * 0.7;

  // Week +1
  const nextDate1 = new Date(lastDate);
  nextDate1.setDate(nextDate1.getDate() + 7);
  const nextDate1Str = `${nextDate1.getFullYear()}-${String(nextDate1.getMonth() + 1).padStart(2, "0")}-${String(nextDate1.getDate()).padStart(2, "0")}`;
  const projectedRating1 = Math.max(
    1,
    Math.min(5, Math.round((intercept + (lastX + 1) * dampenedSlope) * 10) / 10)
  );

  dataPoints.push({
    date: nextDate1Str,
    rating: projectedRating1,
    isForecast: true,
    label: `${formatHumanDate(nextDate1Str)} (Illustrative)`,
  });

  // Week +2
  const nextDate2 = new Date(lastDate);
  nextDate2.setDate(nextDate2.getDate() + 14);
  const nextDate2Str = `${nextDate2.getFullYear()}-${String(nextDate2.getMonth() + 1).padStart(2, "0")}-${String(nextDate2.getDate()).padStart(2, "0")}`;
  const projectedRating2 = Math.max(
    1,
    Math.min(5, Math.round((intercept + (lastX + 2) * dampenedSlope) * 10) / 10)
  );

  dataPoints.push({
    date: nextDate2Str,
    rating: projectedRating2,
    isForecast: true,
    label: `${formatHumanDate(nextDate2Str)} (Illustrative)`,
  });

  return {
    eligible: true,
    totalCheckIns: sorted.length,
    daysSpan,
    trendSlope: Math.round(slope * 100) / 100,
    recentTrendDescription,
    dataPoints,
    forecastNotice:
      "This illustrative projection reflects your recent self-reported ratings and does not guarantee medical results, cure dates, or diagnosis. Tolerance and environmental variables can alter real-world response.",
  };
}

/**
 * Generates an iCalendar (.ics) string for routine or weekly check-in reminders.
 */
export function generateCalendarIcs(options: {
  title: string;
  description: string;
  recurrence: "DAILY" | "WEEKLY";
  hour: number;
  minute: number;
}): string {
  const now = new Date();
  const start = new Date(now);
  start.setHours(options.hour, options.minute, 0, 0);

  const formatIcsTime = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const dtStart = formatIcsTime(start);
  const dtStamp = formatIcsTime(now);
  const uid = `bodywise-match-${Date.now()}@bodywisematch.app`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bodywise Match//Wellness Journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `RRULE:FREQ=${options.recurrence};INTERVAL=1`,
    `SUMMARY:${options.title}`,
    `DESCRIPTION:${options.description.replace(/\n/g, "\\n")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}
