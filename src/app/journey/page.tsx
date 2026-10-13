"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Download,
  Camera,
  Layers,
  ArrowRight,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useApp } from "@/components/providers";
import { Eyebrow, Notice, EmptyState, ButtonLink } from "@/components/ui";
import { products } from "@/data/products";
import {
  type JourneyData,
  type TrackedProduct,
  type ProgressCheckIn,
  type RoutineCompletionLog,
  type RoutineSchedule,
  DEFAULT_JOURNEY_STORAGE_KEY,
  getTodayDateString,
  formatHumanDate,
  calculateRoutineConsistency,
  generateJourneyInsights,
  calculateCautiousForecast,
  generateCalendarIcs,
} from "@/lib/journey";
import {
  saveJournalPhoto,
  getJournalPhotos,
  deleteJournalPhoto,
  clearAllJournalPhotos,
  type JournalPhoto,
} from "@/lib/photo-storage";
import type { DiscoveryCategory } from "@/lib/types";

export default function JourneyPage() {
  const { answers } = useApp();

  // Core Journey State
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active view filters
  const [routineTab, setRoutineTab] = useState<"all" | "am" | "pm">("all");
  const [showForecast, setShowForecast] = useState(true);

  // Modals
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<ProgressCheckIn | null>(null);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Photo Journal State
  const [photos, setPhotos] = useState<JournalPhoto[]>([]);
  const [selectedPhotoA, setSelectedPhotoA] = useState<string | null>(null);
  const [selectedPhotoB, setSelectedPhotoB] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [uploadNote, setUploadNote] = useState("");

  // Product Picker state
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [addSchedule, setAddSchedule] = useState<RoutineSchedule>("am");
  const [addFrequency, setAddFrequency] = useState("Daily");

  // Check-In Form State
  const [checkInDate, setCheckInDate] = useState(getTodayDateString());
  const [checkInConcern, setCheckInConcern] = useState("");
  const [checkInRating, setCheckInRating] = useState<number>(3);
  const [checkInStatus, setCheckInStatus] = useState<"better" | "same" | "worse">("same");
  const [checkInIrritation, setCheckInIrritation] = useState(false);
  const [checkInIrritationDetails, setCheckInIrritationDetails] = useState("");
  const [checkInNote, setCheckInNote] = useState("");

  // Setup Form State
  const [setupCategory, setSetupCategory] = useState<DiscoveryCategory>("face");
  const [setupConcern, setSetupConcern] = useState("Acne-prone skin");
  const [setupStartDate, setSetupStartDate] = useState(getTodayDateString());

  // 1. Initial Load from LocalStorage and IndexedDB
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_JOURNEY_STORAGE_KEY);
      if (saved) {
        setJourney(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load journey data:", e);
    } finally {
      setIsLoaded(true);
    }

    // Load photos
    loadPhotos();
  }, []);

  async function loadPhotos() {
    try {
      const loaded = await getJournalPhotos();
      setPhotos(loaded);
      if (loaded.length >= 2) {
        setSelectedPhotoA(loaded[loaded.length - 1].id); // oldest
        setSelectedPhotoB(loaded[0].id); // newest
      }
    } catch {
      // IndexedDB may be disabled in private mode
    }
  }

  // Save changes to localStorage
  function persistJourney(updated: JourneyData) {
    setJourney(updated);
    try {
      localStorage.setItem(DEFAULT_JOURNEY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save journey data:", e);
    }
  }

  // Start Journey from Discovery Quiz Answers
  function initializeFromQuiz() {
    const category: DiscoveryCategory =
      answers.discoveryCategory && answers.discoveryCategory !== "all"
        ? answers.discoveryCategory
        : "face";

    const concern =
      answers.selectedConcerns && answers.selectedConcerns.length > 0
        ? String(answers.selectedConcerns[0])
        : answers.concern || "General skincare discovery";

    const newJourney: JourneyData = {
      version: 1,
      profile: {
        category,
        primaryConcern: concern,
        secondaryConcerns:
          answers.selectedConcerns?.map(String).filter((c) => c !== concern) || [],
        startDate: getTodayDateString(),
        notes: `Started from personalised Match recommendations.`,
      },
      trackedProducts: [],
      completionLogs: [],
      checkIns: [],
      reminders: {
        enabled: true,
        timeAm: "08:00",
        timePm: "21:00",
        checkInDay: 0, // Sunday
      },
      updatedAt: new Date().toISOString(),
    };

    persistJourney(newJourney);
    setShowSetupModal(false);
  }

  // Manual Quick Setup
  function handleManualSetup() {
    const newJourney: JourneyData = {
      version: 1,
      profile: {
        category: setupCategory,
        primaryConcern: setupConcern,
        startDate: setupStartDate,
      },
      trackedProducts: [],
      completionLogs: [],
      checkIns: [],
      reminders: {
        enabled: true,
        timeAm: "08:00",
        timePm: "21:00",
        checkInDay: 0,
      },
      updatedAt: new Date().toISOString(),
    };

    persistJourney(newJourney);
    setShowSetupModal(false);
  }

  // Delete All Journey Data
  async function handleDeleteJourney() {
    try {
      localStorage.removeItem(DEFAULT_JOURNEY_STORAGE_KEY);
      await clearAllJournalPhotos();
      setPhotos([]);
      setJourney(null);
      setShowDeleteConfirm(false);
    } catch (e) {
      console.error("Failed to delete journey:", e);
    }
  }

  // Toggle Routine Completion for Today
  function toggleRoutineItem(productId: string, schedule: RoutineSchedule) {
    if (!journey) return;
    const today = getTodayDateString();
    const existingIndex = journey.completionLogs.findIndex(
      (log) => log.date === today && log.productId === productId
    );

    let updatedLogs: RoutineCompletionLog[];
    if (existingIndex >= 0) {
      // Remove completion
      updatedLogs = journey.completionLogs.filter((_, idx) => idx !== existingIndex);
    } else {
      // Add completion
      const newLog: RoutineCompletionLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: today,
        schedule,
        productId,
        completedAt: new Date().toISOString(),
      };
      updatedLogs = [...journey.completionLogs, newLog];
    }

    persistJourney({
      ...journey,
      completionLogs: updatedLogs,
      updatedAt: new Date().toISOString(),
    });
  }

  // Add Product to Tracked Routine
  function handleAddProduct() {
    if (!journey || !selectedProductToAdd) return;
    const productObj = products.find((p) => p.id === selectedProductToAdd);
    if (!productObj) return;

    // Avoid duplicates
    if (journey.trackedProducts.some((tp) => tp.productId === productObj.id)) {
      alert("This product is already in your routine tracker.");
      return;
    }

    const newTracked: TrackedProduct = {
      productId: productObj.id,
      productName: productObj.name,
      category: productObj.category,
      schedule: addSchedule,
      stepOrder: journey.trackedProducts.length + 1,
      frequencyNote: addFrequency,
      addedAt: new Date().toISOString(),
    };

    persistJourney({
      ...journey,
      trackedProducts: [...journey.trackedProducts, newTracked],
      updatedAt: new Date().toISOString(),
    });

    setSelectedProductToAdd("");
    setShowAddProductModal(false);
  }

  // Remove Product from Tracked Routine
  function handleRemoveProduct(productId: string) {
    if (!journey) return;
    persistJourney({
      ...journey,
      trackedProducts: journey.trackedProducts.filter((p) => p.productId !== productId),
      updatedAt: new Date().toISOString(),
    });
  }

  // Open Check-in Modal
  function openNewCheckInModal() {
    setEditingCheckIn(null);
    setCheckInDate(getTodayDateString());
    setCheckInConcern(journey?.profile.primaryConcern || "Acne-prone skin");
    setCheckInRating(3);
    setCheckInStatus("same");
    setCheckInIrritation(false);
    setCheckInIrritationDetails("");
    setCheckInNote("");
    setShowCheckInModal(true);
  }

  function openEditCheckInModal(checkIn: ProgressCheckIn) {
    setEditingCheckIn(checkIn);
    setCheckInDate(checkIn.date);
    setCheckInConcern(checkIn.concern);
    setCheckInRating(checkIn.rating);
    setCheckInStatus(checkIn.status);
    setCheckInIrritation(checkIn.irritation);
    setCheckInIrritationDetails(checkIn.irritationDetails || "");
    setCheckInNote(checkIn.note || "");
    setShowCheckInModal(true);
  }

  // Save Check-in (Add or Edit)
  function handleSaveCheckIn() {
    if (!journey) return;

    if (editingCheckIn) {
      // Edit existing
      const updatedCheckIns = journey.checkIns.map((item) =>
        item.id === editingCheckIn.id
          ? {
              ...item,
              date: checkInDate,
              concern: checkInConcern,
              rating: checkInRating,
              status: checkInStatus,
              irritation: checkInIrritation,
              irritationDetails: checkInIrritation ? checkInIrritationDetails : "",
              note: checkInNote.trim(),
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      persistJourney({
        ...journey,
        checkIns: updatedCheckIns,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new check-in
      const newCheckIn: ProgressCheckIn = {
        id: `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: checkInDate,
        concern: checkInConcern,
        category: journey.profile.category,
        rating: checkInRating,
        status: checkInStatus,
        irritation: checkInIrritation,
        irritationDetails: checkInIrritation ? checkInIrritationDetails : "",
        note: checkInNote.trim(),
        createdAt: new Date().toISOString(),
      };

      persistJourney({
        ...journey,
        checkIns: [...journey.checkIns, newCheckIn],
        updatedAt: new Date().toISOString(),
      });
    }

    setShowCheckInModal(false);
  }

  // Delete a Check-in
  function handleDeleteCheckIn(id: string) {
    if (!journey) return;
    persistJourney({
      ...journey,
      checkIns: journey.checkIns.filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    });
  }

  // Photo Upload Handler
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      if (!dataUrl) return;

      try {
        await saveJournalPhoto(dataUrl, getTodayDateString(), uploadNote);
        setUploadNote("");
        await loadPhotos();
      } catch (err) {
        alert("Could not save photo to local browser storage.");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Delete Photo
  async function handleDeletePhoto(id: string) {
    try {
      await deleteJournalPhoto(id);
      await loadPhotos();
    } catch (e) {
      console.error(e);
    }
  }

  // Download iCalendar
  function downloadCalendarReminder(type: "routine" | "checkin") {
    let icsContent = "";
    if (type === "routine") {
      icsContent = generateCalendarIcs({
        title: "Bodywise Match Daily Routine",
        description: "Reminder to complete your tracked skincare and wellness steps.",
        recurrence: "DAILY",
        hour: 8,
        minute: 0,
      });
    } else {
      icsContent = generateCalendarIcs({
        title: "Bodywise Match Weekly Progress Check-in",
        description: "Take 1 minute to record how your skin and concerns felt this week.",
        recurrence: "WEEKLY",
        hour: 10,
        minute: 0,
      });
    }

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bodywise-${type}-reminder.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (!isLoaded) {
    return (
      <div className="container page-space">
        <div className="journey-loading">Loading your wellness journey…</div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: EMPTY STATE FOR NEW USERS
  // =========================================================================
  if (!journey) {
    const hasQuizAnswers = answers.discoveryCategory || answers.selectedConcerns?.length;

    return (
      <div className="container page-space">
        <header className="page-heading">
          <Eyebrow>YOUR PERSONAL WELLNESS COMPANION</Eyebrow>
          <h1>My Wellness Journey</h1>
          <p>
            Connect personalized product discovery with daily routine consistency,
            weekly progress check-ins, and evidence-grounded insights.
          </p>
        </header>

        <div className="journey-empty-hero">
          <div className="journey-empty-card">
            <span className="journey-empty-icon">
              <Sparkles size={28} />
            </span>
            <h2>No journey started yet</h2>
            <p>
              Your wellness journey is completely private and saved only on this browser.
              Track products at your own pace without arbitrary usage pressure.
            </p>

            <div className="journey-empty-actions">
              {hasQuizAnswers ? (
                <button
                  type="button"
                  className="button journey-btn-primary"
                  onClick={initializeFromQuiz}
                >
                  <Sparkles size={16} /> Use My Match Quiz Preferences
                </button>
              ) : (
                <ButtonLink href="/discover" className="button">
                  Take Personalised Match Quiz <ArrowRight size={16} />
                </ButtonLink>
              )}

              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowSetupModal(true)}
              >
                Set Up Journey Directly
              </button>
            </div>
          </div>

          <div className="journey-features-preview">
            <div className="feature-mini-card">
              <CheckCircle2 size={20} className="feature-mini-icon" />
              <h3>Custom Routine Tracker</h3>
              <p>Add products from the verified catalogue. Select morning or evening timing that fits your life.</p>
            </div>
            <div className="feature-mini-card">
              <Calendar size={20} className="feature-mini-icon" />
              <h3>Weekly Progress Check-Ins</h3>
              <p>Log concern ratings (1–5) and track comfort changes over time without exaggerated claims.</p>
            </div>
            <div className="feature-mini-card">
              <ShieldCheck size={20} className="feature-mini-icon" />
              <h3>100% Private &amp; Local</h3>
              <p>All routines, notes, and photos stay on your device. Never shared or sent to AI servers.</p>
            </div>
          </div>
        </div>

        {/* Setup Modal */}
        {showSetupModal && (
          <div className="journey-modal-backdrop" role="dialog" aria-modal="true">
            <div className="journey-modal">
              <div className="journey-modal-header">
                <h3>Set Up Your Wellness Journey</h3>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowSetupModal(false)}
                  aria-label="Close setup modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="journey-modal-body">
                <div className="form-group">
                  <label htmlFor="setup-category">Care Category</label>
                  <select
                    id="setup-category"
                    value={setupCategory}
                    onChange={(e) => setSetupCategory(e.target.value as DiscoveryCategory)}
                  >
                    <option value="face">Face Care</option>
                    <option value="body">Body Care</option>
                    <option value="hair">Hair &amp; Scalp Care</option>
                    <option value="underarm">Underarm Care</option>
                    <option value="wellness">Nutrition &amp; Wellness</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="setup-concern">Primary Concern to Track</label>
                  <input
                    id="setup-concern"
                    type="text"
                    value={setupConcern}
                    onChange={(e) => setSetupConcern(e.target.value)}
                    placeholder="e.g. Acne marks, uneven texture, scalp dryness"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="setup-start-date">Journey Start Date</label>
                  <input
                    id="setup-start-date"
                    type="date"
                    value={setupStartDate}
                    onChange={(e) => setSetupStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="journey-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowSetupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleManualSetup}
                >
                  Create Journey
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE WELLNESS JOURNEY DASHBOARD
  // =========================================================================
  const consistency = calculateRoutineConsistency(
    journey.trackedProducts,
    journey.completionLogs,
    14
  );

  const insights = generateJourneyInsights(journey);
  const forecast = calculateCautiousForecast(journey.checkIns);

  const today = getTodayDateString();
  const todayLogs = journey.completionLogs.filter((l) => l.date === today);
  const todayCompletedSet = new Set(todayLogs.map((l) => l.productId));

  // Filter tracked products by tab
  const displayedTracked = journey.trackedProducts.filter((tp) => {
    if (routineTab === "all") return true;
    return tp.schedule === routineTab || tp.schedule === "anytime";
  });

  // Calculate next check-in reminder
  const latestCheckIn = journey.checkIns.length > 0
    ? [...journey.checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  return (
    <div className="container page-space">
      {/* Dashboard Top Header */}
      <header className="journey-header">
        <div className="journey-header-copy">
          <Eyebrow>
            <span className="blue-dot" /> PERSONAL WELLNESS TRACKER
          </Eyebrow>
          <h1>My Wellness Journey</h1>
          <p className="journey-subtitle">
            Tracking <strong>{journey.profile.primaryConcern}</strong> across{" "}
            <span className="category-pill-label">{journey.profile.category} care</span> · Started{" "}
            {formatHumanDate(journey.profile.startDate)}
          </p>
        </div>

        <div className="journey-header-actions">
          <button
            type="button"
            className="button journey-btn-cta"
            onClick={openNewCheckInModal}
          >
            <Plus size={16} /> Log Weekly Check-In
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setShowAddProductModal(true)}
          >
            <Plus size={15} /> Add Product
          </button>
          <button
            type="button"
            className="button button-ghost journey-btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            title="Reset or delete journey"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </header>

      {/* Top Level Metric Cards */}
      <div className="journey-metrics-grid">
        <div className="journey-metric-card">
          <div className="metric-header">
            <span className="metric-title">Routine Consistency</span>
            <CheckCircle2 size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{consistency.consistencyRate}%</div>
          <p className="metric-sub">
            {consistency.activeDaysCount} of {consistency.windowDays} days active in the past 2 weeks
          </p>
        </div>

        <div className="journey-metric-card">
          <div className="metric-header">
            <span className="metric-title">Current Streak</span>
            <Clock size={16} className="metric-icon" />
          </div>
          <div className="metric-value">
            {consistency.currentStreak}{" "}
            <small>{consistency.currentStreak === 1 ? "day" : "days"}</small>
          </div>
          <p className="metric-sub">
            {consistency.todayCompletedCount > 0
              ? "Completed steps today"
              : "Pending routine today"}
          </p>
        </div>

        <div className="journey-metric-card">
          <div className="metric-header">
            <span className="metric-title">Last Check-In</span>
            <Calendar size={16} className="metric-icon" />
          </div>
          {latestCheckIn ? (
            <>
              <div className="metric-value rating-val">
                Rating {latestCheckIn.rating}
                <small>/5</small>
              </div>
              <p className="metric-sub">
                {formatHumanDate(latestCheckIn.date)} · Trend: {latestCheckIn.status}
              </p>
            </>
          ) : (
            <>
              <div className="metric-value text-muted">None</div>
              <p className="metric-sub">Weekly check-in awaiting your first observation</p>
            </>
          )}
        </div>

        <div className="journey-metric-card">
          <div className="metric-header">
            <span className="metric-title">Products Tracked</span>
            <Layers size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{journey.trackedProducts.length}</div>
          <p className="metric-sub">
            From verified Be Bodywise catalogue
          </p>
        </div>
      </div>

      {/* =====================================================================
          UPPER DASHBOARD: BALANCED 2-COLUMN PRIMARY WORKSPACE
          Left: Daily Routine Tracker | Right: Self-Reported Progress Curve
         ===================================================================== */}
      <div className="journey-upper-grid">
        {/* PRIMARY COLUMN 1: Daily Routine Tracker */}
        <section className="journey-section-card routine-section-card" aria-labelledby="routine-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">ACTIVE PROTOCOL</div>
              <h2 id="routine-heading">Daily Routine Tracker</h2>
              <p className="section-desc">
                Check off products as you use them. No rigid schedule imposed.
              </p>
            </div>
            <div className="routine-tabs" role="tablist" aria-label="Routine filters">
              <button
                type="button"
                className={`tab-chip ${routineTab === "all" ? "active" : ""}`}
                onClick={() => setRoutineTab("all")}
              >
                All ({journey.trackedProducts.length})
              </button>
              <button
                type="button"
                className={`tab-chip ${routineTab === "am" ? "active" : ""}`}
                onClick={() => setRoutineTab("am")}
              >
                Morning (AM)
              </button>
              <button
                type="button"
                className={`tab-chip ${routineTab === "pm" ? "active" : ""}`}
                onClick={() => setRoutineTab("pm")}
              >
                Evening (PM)
              </button>
            </div>
          </div>

          {/* Today's completion status bar */}
          <div className="routine-today-status">
            <div className="today-status-text">
              <strong>Today&apos;s Progress:</strong>{" "}
              {consistency.todayCompletedCount} of {consistency.todayTotalScheduled} steps completed
            </div>
            <div className="today-progress-bar">
              <div
                className="today-progress-fill"
                style={{
                  width: `${
                    consistency.todayTotalScheduled > 0
                      ? Math.min(100, Math.round((consistency.todayCompletedCount / consistency.todayTotalScheduled) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Tracked product items list */}
          {displayedTracked.length === 0 ? (
            <div className="routine-empty-box">
              <p>No products tracked for this timing.</p>
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => setShowAddProductModal(true)}
              >
                <Plus size={14} /> Add Product to Tracker
              </button>
            </div>
          ) : (
            <div className="routine-item-list">
              {displayedTracked.map((item) => {
                const isCompletedToday = todayCompletedSet.has(item.productId);
                return (
                  <div
                    key={item.productId}
                    className={`routine-item-row ${isCompletedToday ? "completed" : ""}`}
                  >
                    <button
                      type="button"
                      className={`routine-check-btn ${isCompletedToday ? "checked" : ""}`}
                      onClick={() => toggleRoutineItem(item.productId, item.schedule)}
                      aria-label={`Mark ${item.productName} as ${isCompletedToday ? "incomplete" : "completed"} today`}
                    >
                      {isCompletedToday ? <Check size={16} /> : null}
                    </button>

                    <div className="routine-item-info">
                      <div className="routine-item-title-row">
                        <Link
                          href={`/products/${item.productId}`}
                          className="routine-product-name"
                        >
                          {item.productName}
                        </Link>
                        <span className={`schedule-badge ${item.schedule}`}>
                          {item.schedule.toUpperCase()}
                        </span>
                      </div>
                      <div className="routine-item-meta">
                        <span>{item.category}</span>
                        <span>·</span>
                        <span>{item.frequencyNote || "As tolerated"}</span>
                      </div>
                    </div>

                    <div className="routine-item-actions">
                      <button
                        type="button"
                        className="icon-button icon-subtle"
                        onClick={() => handleRemoveProduct(item.productId)}
                        title="Remove from routine tracker"
                        aria-label={`Remove ${item.productName} from routine tracker`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PRIMARY COLUMN 2: Self-Reported Progress Curve */}
        <section className="journey-section-card curve-section-card" aria-labelledby="chart-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">OBSERVATIONAL TRAJECTORY</div>
              <h2 id="chart-heading">Self-Reported Progress Curve</h2>
              <p className="section-desc">
                Ratings scale: 1 (Minimal concern) to 5 (High concern severity).
              </p>
            </div>
          </div>

          {journey.checkIns.length === 0 ? (
            <div className="chart-empty-state">
              <Calendar size={24} className="text-muted" />
              <p>Log your first check-in to generate your progress timeline.</p>
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={openNewCheckInModal}
              >
                Log First Observation
              </button>
            </div>
          ) : (
            <div className="journey-chart-wrapper">
              {/* Visual SVG Progress Chart */}
              <ProgressSvgChart
                checkIns={journey.checkIns}
                forecastPoints={showForecast && forecast.eligible ? forecast.dataPoints : []}
              />

              {/* Forecast Status and Boundary Messaging */}
              <div className="forecast-status-card">
                <div className="forecast-card-top">
                  <span className="forecast-pill">
                    {forecast.eligible ? "OBSERVATIONAL TREND" : "OBSERVATION PHASE"}
                  </span>
                  {forecast.eligible && (
                    <label className="forecast-toggle">
                      <input
                        type="checkbox"
                        checked={showForecast}
                        onChange={(e) => setShowForecast(e.target.checked)}
                      />
                      <span>Show 2-Wk Projection</span>
                    </label>
                  )}
                </div>

                {forecast.eligible ? (
                  <div className="forecast-eligible-text">
                    <p>
                      <strong>Recent Slope:</strong> {forecast.recentTrendDescription}
                    </p>
                    <p className="forecast-fineprint">
                      <ShieldCheck size={14} /> {forecast.forecastNotice}
                    </p>
                  </div>
                ) : (
                  <div className="forecast-ineligible-text">
                    <Info size={14} />
                    <p>{forecast.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================================
          LOWER DASHBOARD: CLEAN FULL-WIDTH STACKED SECTIONS
          Eliminates lower whitespace gaps & creates guided visual hierarchy
         ===================================================================== */}
      <div className="journey-stacked-sections">
        {/* PRIMARY SECTION: Check-In History */}
        <section className="journey-section-card" aria-labelledby="history-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">RECORDED OBSERVATIONS</div>
              <div className="card-top-title-row">
                <h2 id="history-heading">Check-In History</h2>
                <span className="card-count-tag">
                  {journey.checkIns.length} {journey.checkIns.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <p className="section-desc">
                Chronological log of your weekly ratings, comfort updates, and personal notes.
              </p>
            </div>
            {/* Reduced secondary CTA: small and subtle */}
            <button
              type="button"
              className="button-subtle-cta"
              onClick={openNewCheckInModal}
            >
              <Plus size={13} /> New Entry
            </button>
          </div>

          {journey.checkIns.length === 0 ? (
            <p className="small-muted">No check-ins logged yet. Use the button above to record your first weekly entry.</p>
          ) : (
            <div className="checkin-timeline">
              {[...journey.checkIns]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item) => (
                  <div key={item.id} className="timeline-entry">
                    <div className="timeline-marker">
                      <span className={`rating-dot rating-${item.rating}`} />
                    </div>
                    <div className="timeline-card">
                      <div className="timeline-card-header">
                        <div>
                          <span className="timeline-date">{formatHumanDate(item.date)}</span>
                          <span className="timeline-concern">{item.concern}</span>
                        </div>
                        <div className="timeline-badge-group">
                          <span className={`status-pill status-${item.status}`}>
                            {item.status.toUpperCase()}
                          </span>
                          <span className={`rating-score-badge rating-${item.rating}`}>
                            {item.rating} / 5
                          </span>
                        </div>
                      </div>

                      {item.irritation && (
                        <div className="timeline-irritation-alert">
                          <AlertCircle size={14} />
                          <span>
                            Discomfort recorded
                            {item.irritationDetails ? `: ${item.irritationDetails}` : ""}
                          </span>
                        </div>
                      )}

                      {item.note && <p className="timeline-note">&ldquo;{item.note}&rdquo;</p>}

                      <div className="timeline-entry-actions">
                        <button
                          type="button"
                          className="text-button text-sm"
                          onClick={() => openEditCheckInModal(item)}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="text-button text-sm text-danger"
                          onClick={() => handleDeleteCheckIn(item.id)}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* SECONDARY SECTION: Progress Insights */}
        <section className="journey-section-card secondary-card" aria-labelledby="insights-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">PATTERN RECOGNITION</div>
              <div className="card-top-title-row">
                <h2 id="insights-heading">Progress Insights</h2>
                <span className="insights-count-badge">
                  <Sparkles size={13} /> {insights.length} {insights.length === 1 ? "Insight" : "Insights"}
                </span>
              </div>
              <p className="section-desc">
                Evidence-grounded observations derived from your recorded history and consistency.
              </p>
            </div>
          </div>

          <div className="insights-deck">
            {insights.map((insight) => (
              <div key={insight.id} className={`insight-card insight-${insight.type}`}>
                <div className="insight-card-header">
                  <span className="insight-icon">
                    {insight.type === "positive" && <TrendingDown size={16} />}
                    {insight.type === "steady" && <Minus size={16} />}
                    {insight.type === "attention" && <AlertCircle size={16} />}
                    {insight.type === "guidance" && <Info size={16} />}
                  </span>
                  <h4>{insight.title}</h4>
                </div>
                <p>{insight.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECONDARY SECTION: Private Local Photo Journal */}
        <section className="journey-section-card secondary-card" aria-labelledby="photo-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">VISUAL REFERENCE</div>
              <h2 id="photo-heading">Private Photo Journal</h2>
              <p className="section-desc">
                Saved only in browser storage (IndexedDB). Never sent to any AI or cloud server.
              </p>
            </div>
            <div className="photo-header-actions">
              {photos.length >= 2 && (
                <button
                  type="button"
                  className={`button button-sm ${compareMode ? "button-primary" : "button-secondary"}`}
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <Eye size={14} /> {compareMode ? "Close Side-by-Side" : "Compare Two Dates"}
                </button>
              )}
              <label className="button button-sm button-secondary photo-upload-btn">
                <Camera size={14} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="photo-empty-box">
              <Camera size={22} className="text-muted" />
              <p>No photos uploaded yet. Capture weekly progress shots for private visual reference.</p>
            </div>
          ) : (
            <div className="photo-journal-view">
              {compareMode && photos.length >= 2 ? (
                <div className="photo-side-by-side">
                  <div className="compare-column">
                    <label>Photo A (Reference):</label>
                    <select
                      value={selectedPhotoA || ""}
                      onChange={(e) => setSelectedPhotoA(e.target.value)}
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatHumanDate(p.date)} {p.note ? `- ${p.note}` : ""}
                        </option>
                      ))}
                    </select>
                    {selectedPhotoA && (
                      <div className="compare-img-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photos.find((p) => p.id === selectedPhotoA)?.dataUrl}
                          alt="Reference observation"
                        />
                      </div>
                    )}
                  </div>

                  <div className="compare-column">
                    <label>Photo B (Current):</label>
                    <select
                      value={selectedPhotoB || ""}
                      onChange={(e) => setSelectedPhotoB(e.target.value)}
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatHumanDate(p.date)} {p.note ? `- ${p.note}` : ""}
                        </option>
                      ))}
                    </select>
                    {selectedPhotoB && (
                      <div className="compare-img-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photos.find((p) => p.id === selectedPhotoB)?.dataUrl}
                          alt="Current observation"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="photo-thumbnail-grid">
                  {photos.map((p) => (
                    <div key={p.id} className="photo-thumb-card">
                      <div className="photo-thumb-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.dataUrl} alt={`Progress photo ${p.date}`} />
                      </div>
                      <div className="photo-thumb-meta">
                        <span className="photo-date">{formatHumanDate(p.date)}</span>
                        <button
                          type="button"
                          className="icon-button icon-subtle text-danger"
                          onClick={() => handleDeletePhoto(p.id)}
                          aria-label={`Delete photo from ${p.date}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECONDARY SECTION: Reminders & Calendar Sync */}
        <section className="journey-section-card secondary-card" aria-labelledby="reminders-heading">
          <div className="journey-card-top">
            <div>
              <div className="card-eyebrow-mini">SCHEDULE &amp; SYNC</div>
              <h2 id="reminders-heading">Reminders &amp; Calendar Export</h2>
              <p className="section-desc">
                Keep your consistency steady with device calendar sync alerts.
              </p>
            </div>
          </div>

          <div className="reminders-action-row">
            <div className="reminder-box">
              <div className="reminder-box-content">
                <h4>Daily Routine Reminder</h4>
                <p>Sync an 8:00 AM daily alert to your calendar to stay regular.</p>
              </div>
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => downloadCalendarReminder("routine")}
              >
                <Download size={14} /> Add Daily to Calendar (.ics)
              </button>
            </div>

            <div className="reminder-box">
              <div className="reminder-box-content">
                <h4>Weekly Progress Check-In</h4>
                <p>Sunday 10:00 AM calendar alert to record your skin updates.</p>
              </div>
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={() => downloadCalendarReminder("checkin")}
              >
                <Download size={14} /> Add Weekly to Calendar (.ics)
              </button>
            </div>
          </div>

          <div className="reminder-disclaimer">
            <Info size={14} />
            <span>
              In-app reminders notify you while the app is open. The downloaded .ics file
              syncs directly to Apple Calendar, Google Calendar, or Outlook for system alerts.
            </span>
          </div>
        </section>

        {/* SECONDARY SECTION: Privacy & Storage Card */}
        <div className="journey-privacy-notice">
          <ShieldCheck size={18} />
          <div>
            <strong>Private On-Device Storage:</strong>
            <p>
              Your routines, check-in ratings, notes, and photos are saved exclusively in your browser.
              Nothing is ever shared or sent to AI servers. If you clear browser storage or switch devices, this data will reset.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MODALS
         ===================================================================== */}

      {/* MODAL 1: Check-in Modal */}
      {showCheckInModal && (
        <div className="journey-modal-backdrop" role="dialog" aria-modal="true">
          <div className="journey-modal">
            <div className="journey-modal-header">
              <h3>{editingCheckIn ? "Edit Progress Check-In" : "Weekly Progress Check-In"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowCheckInModal(false)}
                aria-label="Close check-in modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="journey-modal-body">
              <div className="form-group">
                <label htmlFor="checkin-date">Observation Date</label>
                <input
                  id="checkin-date"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkin-concern">Concern Being Tracked</label>
                <input
                  id="checkin-concern"
                  type="text"
                  value={checkInConcern}
                  onChange={(e) => setCheckInConcern(e.target.value)}
                  placeholder="e.g. Acne-prone skin"
                  required
                />
              </div>

              <div className="form-group">
                <label>Self-Reported Concern Severity (1 to 5):</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`rating-btn ${checkInRating === num ? "selected" : ""}`}
                      onClick={() => setCheckInRating(num)}
                    >
                      <span className="rating-num">{num}</span>
                      <span className="rating-caption">
                        {num === 1 && "Very Calm"}
                        {num === 2 && "Mild"}
                        {num === 3 && "Moderate"}
                        {num === 4 && "Active"}
                        {num === 5 && "Pronounced"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Compared to Last Week:</label>
                <div className="status-selector">
                  {(["better", "same", "worse"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`status-btn ${checkInStatus === opt ? "selected" : ""}`}
                      onClick={() => setCheckInStatus(opt)}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkInIrritation}
                    onChange={(e) => setCheckInIrritation(e.target.checked)}
                  />
                  <span>Did you experience any redness, stinging, or discomfort?</span>
                </label>
              </div>

              {checkInIrritation && (
                <div className="form-group">
                  <label htmlFor="irritation-details">Discomfort Details (Optional)</label>
                  <input
                    id="irritation-details"
                    type="text"
                    value={checkInIrritationDetails}
                    onChange={(e) => setCheckInIrritationDetails(e.target.value)}
                    placeholder="e.g. Tingling after evening serum"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="checkin-note">Personal Observation Note (Optional)</label>
                <textarea
                  id="checkin-note"
                  rows={3}
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="e.g. Skin felt well hydrated this week. Drank extra water."
                />
              </div>
            </div>

            <div className="journey-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowCheckInModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={handleSaveCheckIn}
              >
                {editingCheckIn ? "Update Check-In" : "Save Check-In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Product to Tracker Modal */}
      {showAddProductModal && (
        <div className="journey-modal-backdrop" role="dialog" aria-modal="true">
          <div className="journey-modal">
            <div className="journey-modal-header">
              <h3>Add Product to Routine Tracker</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddProductModal(false)}
                aria-label="Close product modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="journey-modal-body">
              <div className="form-group">
                <label htmlFor="product-search">Select Product from Catalogue (87 items)</label>
                <input
                  id="product-search"
                  type="text"
                  placeholder="Search products by name or category…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="product-search-input"
                />

                <div className="product-picker-list">
                  {products
                    .filter((p) =>
                      productSearch
                        ? p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase())
                        : true
                    )
                    .slice(0, 15)
                    .map((p) => {
                      const isSelected = selectedProductToAdd === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`picker-product-item ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedProductToAdd(p.id)}
                        >
                          <div>
                            <strong>{p.name}</strong>
                            <small>{p.category}</small>
                          </div>
                          {isSelected && <Check size={16} className="text-blue" />}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="form-group">
                <label>Usage Timing:</label>
                <div className="schedule-selector">
                  {(["am", "pm", "anytime"] as const).map((sched) => (
                    <button
                      key={sched}
                      type="button"
                      className={`status-btn ${addSchedule === sched ? "selected" : ""}`}
                      onClick={() => setAddSchedule(sched)}
                    >
                      {sched === "am" && "Morning (AM)"}
                      {sched === "pm" && "Evening (PM)"}
                      {sched === "anytime" && "Anytime"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="frequency-note">Frequency Note (Optional):</label>
                <input
                  id="frequency-note"
                  type="text"
                  value={addFrequency}
                  onChange={(e) => setAddFrequency(e.target.value)}
                  placeholder="e.g. Daily, 2-3x weekly, Alternate days"
                />
              </div>
            </div>

            <div className="journey-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowAddProductModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                disabled={!selectedProductToAdd}
                onClick={handleAddProduct}
              >
                Add to Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Journey Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="journey-modal-backdrop" role="dialog" aria-modal="true">
          <div className="journey-modal">
            <div className="journey-modal-header">
              <h3 className="text-danger">Delete My Wellness Journey</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Close delete modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="journey-modal-body">
              <p>
                Are you sure you want to delete your saved journey? This will remove all
                tracked routines, weekly check-in logs, and locally saved progress photos
                from this browser.
              </p>
              <p className="text-danger small">This action cannot be undone.</p>
            </div>

            <div className="journey-modal-footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep My Journey
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={handleDeleteJourney}
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SVG PROGRESS CHART COMPONENT
// =========================================================================
function ProgressSvgChart({
  checkIns,
  forecastPoints,
}: {
  checkIns: ProgressCheckIn[];
  forecastPoints: { date: string; rating: number; isForecast: boolean; label: string }[];
}) {
  const chartId = useId();
  const sortedHistorical = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Combine historical and forecast points
  const points =
    forecastPoints.length > 0
      ? forecastPoints
      : sortedHistorical.map((c) => ({
          date: c.date,
          rating: c.rating,
          isForecast: false,
          label: formatHumanDate(c.date),
        }));

  const width = 500;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  // Rating maps 1 (calm) -> bottom or top?
  // 1 is minimal concern, 5 is severe concern.
  // Standard chart: Y=5 at top, Y=1 at bottom.
  const getY = (val: number) => {
    const norm = (val - 1) / 4; // 0 (rating 1) to 1 (rating 5)
    return paddingY + innerH - norm * innerH;
  };

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingX + innerW / 2;
    return paddingX + (idx / (points.length - 1)) * innerW;
  };

  // Build SVG paths
  // Separate into historical line and forecast line
  const histPoints = points.filter((p) => !p.isForecast);
  const forePoints = points.filter((p) => p.isForecast);

  const histPathD = histPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.rating)}`)
    .join(" ");

  // Forecast path connects from the last historical point
  let forePathD = "";
  if (forePoints.length > 0 && histPoints.length > 0) {
    const lastHistIdx = histPoints.length - 1;
    const lastHistPoint = histPoints[lastHistIdx];
    forePathD = `M ${getX(lastHistIdx)} ${getY(lastHistPoint.rating)} `;
    forePoints.forEach((p, fi) => {
      const idx = lastHistIdx + 1 + fi;
      forePathD += `L ${getX(idx)} ${getY(p.rating)} `;
    });
  }

  return (
    <div className="svg-chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="progress-svg-chart"
        aria-label="Progress graph of concern ratings over time"
      >
        <defs>
          <linearGradient id={`${chartId}-area-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#075A94" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#075A94" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines for ratings 1 to 5 */}
        {[1, 2, 3, 4, 5].map((level) => {
          const y = getY(level);
          return (
            <g key={level} className="chart-gridline-group">
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E2EDF5"
                strokeWidth="1"
                strokeDasharray={level === 3 ? "2 2" : "none"}
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {level}
              </text>
            </g>
          );
        })}

        {/* Historical Line */}
        {histPoints.length > 1 && (
          <path
            d={histPathD}
            fill="none"
            stroke="#075A94"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Forecast Line (Dashed) */}
        {forePathD && (
          <path
            d={forePathD}
            fill="none"
            stroke="#075A94"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}

        {/* Historical Data Dots */}
        {histPoints.map((p, i) => {
          const cx = getX(i);
          const cy = getY(p.rating);
          return (
            <g key={`hist-${p.date}-${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="#FFFFFF"
                stroke="#075A94"
                strokeWidth="2.5"
              />
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                className="chart-x-label"
              >
                {p.date.slice(5)}
              </text>
            </g>
          );
        })}

        {/* Forecast Data Dots */}
        {forePoints.map((p, fi) => {
          const idx = histPoints.length + fi;
          const cx = getX(idx);
          const cy = getY(p.rating);
          return (
            <g key={`fore-${p.date}-${fi}`}>
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                fill="#E8F5FC"
                stroke="#075A94"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <text
                x={cx}
                y={height - 8}
                textAnchor="middle"
                className="chart-x-label forecast-x"
              >
                +W{fi + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
