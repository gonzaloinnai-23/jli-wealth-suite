import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   SNAP SLIDER
============================================================ */
function SnapSlider({ steps, value, onChange, labels, formatValue }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const valueToIndex = (v) => {
    let closestIdx = 0;
    let closestDiff = Infinity;
    steps.forEach((s, i) => {
      const d = Math.abs(s - v);
      if (d < closestDiff) {
        closestDiff = d;
        closestIdx = i;
      }
    });
    return closestIdx;
  };

  const currentIdx = valueToIndex(value);
  const pctForIdx = (i) => (i / (steps.length - 1)) * 100;

  const handlePointerPos = useCallback(
    (clientX) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawIdx = pct * (steps.length - 1);
      onChange(steps[Math.round(rawIdx)]);
    },
    [steps, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      handlePointerPos(x);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, handlePointerPos]);

  const startDrag = (e) => {
    e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    handlePointerPos(x);
    setIsDragging(true);
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="snap-slider-wrap"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ cursor: isDragging ? "grabbing" : "pointer" }}
      >
        <div className="snap-slider-track" />
        <div className="snap-slider-fill" style={{ width: `${pctForIdx(currentIdx)}%` }} />
        <div className="snap-dots">
          {ZZmapZZ(steps, (s, i) => {
            const isActive = i === currentIdx;
            const isPassed = i < currentIdx;
            return (
              <div
                key={i}
                className={`snap-dot ${isActive ? "active" : ""} ${isPassed ? "passed" : ""}`}
                onClick={(e) => { e.stopPropagation(); onChange(s); }}
                title={formatValue ? formatValue(s) : s}
              />
            );
          })}
        </div>
      </div>
      {labels && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 6, fontSize: 11, color: "#a8a89e",
          fontVariantNumeric: "tabular-nums",
        }}>
          {ZZmapZZ(labels, (l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   YEAR RANGE PICKER
============================================================ */
function YearRangePicker({ totalYears, startYear, endYear, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragInitialRange, setDragInitialRange] = useState(null);

  const yearFromPos = (clientX) => {
    if (!trackRef.current) return 1;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.max(1, Math.min(totalYears, Math.round(pct * (totalYears - 1)) + 1));
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      if (dragging === "start") {
        const y = yearFromPos(x);
        onChange(Math.min(y, endYear), endYear);
      } else if (dragging === "end") {
        const y = yearFromPos(x);
        onChange(startYear, Math.max(y, startYear));
      } else if (dragging === "range" && dragStartX !== null && dragInitialRange) {
        const rect = trackRef.current.getBoundingClientRect();
        const cellWidth = rect.width / (totalYears - 1);
        const deltaCells = Math.round((x - dragStartX) / cellWidth);
        const newStart = Math.max(1, Math.min(totalYears - (dragInitialRange.end - dragInitialRange.start), dragInitialRange.start + deltaCells));
        const newEnd = newStart + (dragInitialRange.end - dragInitialRange.start);
        onChange(newStart, newEnd);
      }
    };
    const handleUp = () => { setDragging(null); setDragStartX(null); setDragInitialRange(null); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, startYear, endYear, totalYears, onChange, dragStartX, dragInitialRange]);

  const startPct = ((startYear - 1) / (totalYears - 1)) * 100;
  const endPct = ((endYear - 1) / (totalYears - 1)) * 100;

  return (
    <div style={{ padding: "24px 0 8px" }}>
      <div ref={trackRef} style={{ position: "relative", height: 48, cursor: dragging === "range" ? "grabbing" : "default" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, background: "#ebebe4", borderRadius: 999, transform: "translateY(-50%)" }} />
        <div
          onMouseDown={(e) => { e.preventDefault(); setDragging("range"); setDragStartX(e.clientX); setDragInitialRange({ start: startYear, end: endYear }); }}
          onTouchStart={(e) => { setDragging("range"); setDragStartX(e.touches[0].clientX); setDragInitialRange({ start: startYear, end: endYear }); }}
          style={{
            position: "absolute", top: "50%", left: `${startPct}%`,
            width: `${endPct - startPct}%`, height: 4,
            background: "#0a0a0a", borderRadius: 999,
            transform: "translateY(-50%)", cursor: "grab",
            transition: dragging ? "none" : "all 0.15s ease",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
          {Array.from({ length: totalYears }, (_, i) => {
            const year = i + 1;
            const inRange = year >= startYear && year <= endYear;
            const dotSize = totalYears <= 15 ? 6 : totalYears <= 30 ? 5 : 4;
            return (
              <div key={i} style={{
                width: dotSize, height: dotSize, borderRadius: "50%",
                background: inRange ? "#0a0a0a" : "#fff",
                border: `2px solid ${inRange ? "#0a0a0a" : "#c9c9c0"}`,
                zIndex: 1, flexShrink: 0, transition: "all 0.2s ease",
              }} />
            );
          })}
        </div>
        <div
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragging("start"); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging("start"); }}
          style={{
            position: "absolute", top: "50%", left: `${startPct}%`,
            width: 24, height: 24, borderRadius: "50%",
            background: "#fff", border: "2px solid #0a0a0a",
            transform: "translate(-50%, -50%)", cursor: "ew-resize",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)", zIndex: 3,
            transition: dragging === "start" ? "none" : "transform 0.15s ease",
          }}
        />
        <div
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragging("end"); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging("end"); }}
          style={{
            position: "absolute", top: "50%", left: `${endPct}%`,
            width: 24, height: 24, borderRadius: "50%",
            background: "#fff", border: "2px solid #0a0a0a",
            transform: "translate(-50%, -50%)", cursor: "ew-resize",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)", zIndex: 3,
            transition: dragging === "end" ? "none" : "transform 0.15s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#a8a89e", fontVariantNumeric: "tabular-nums" }}>
        {Array.from({ length: totalYears }, (_, i) => {
          const year = i + 1;
          const inRange = year >= startYear && year <= endYear;
          const isEndpoint = year === startYear || year === endYear;
          const showLabel = totalYears <= 15
            ? true
            : year === 1 || year === totalYears || year % 5 === 0 || isEndpoint;
          return (
            <span key={i} style={{
              color: inRange ? "#0a0a0a" : "#a8a89e",
              fontWeight: inRange ? 500 : 400,
              transition: "color 0.2s ease",
              width: 20, textAlign: "center",
              visibility: showLabel ? "visible" : "hidden",
            }}>
              {year}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN
   Reference file: artifact original limpiado de los wrappers
   `[xxx](http://xxx)` que dejó el copiado de markdown.
   Al integrar bajo /src se portará a TypeScript.
============================================================ */
export default function WealthPlanningWorkflow() {
  const visibleYears = 10;
  const maxYear = 40;
  const [currentStep, setCurrentStep] = useState(0);

  const expenseSteps = [1000, 2000, 3000, 4000, 5000, 7000, 9000, 11000, 13000, 15000, 17000, 19000, 21000, 23000, 25000];
  const incomeSteps = [0, 1000, 2000, 3000, 5000, 7000, 10000, 13000, 16000, 20000, 25000];
  const psmSteps = [5000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 650000, 800000, 1000000, 1200000, 1400000, 1600000, 1800000, 2000000];
  const eduSteps = [5000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 75000, 90000, 110000, 130000, 150000];
  const retirementYearsSteps = [1, 2, 3, 5, 7, 10, 12, 15, 18, 20, 25, 30, 35, 40];
  const retirementDurationSteps = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const intergenSteps = [500000, 1000000, 2000000, 3000000, 5000000, 7500000, 10000000, 15000000, 20000000, 30000000, 50000000, 75000000, 100000000];

  const [monthlyExpense, setMonthlyExpense] = useState(9000);
  const [displayedExpense, setDisplayedExpense] = useState(9000);
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [displayedIncome, setDisplayedIncome] = useState(3000);
  const [psmValue, setPsmValue] = useState(500000);
  const [displayedPsm, setDisplayedPsm] = useState(500000);
  const [psmUserTouched, setPsmUserTouched] = useState(false);
  const [eduPerYear, setEduPerYear] = useState(30000);
  const [displayedEdu, setDisplayedEdu] = useState(30000);
  const [eduStartYear, setEduStartYear] = useState(5);
  const [eduEndYear, setEduEndYear] = useState(10);
  const [yearsToRetirement, setYearsToRetirement] = useState(15);
  const [retirementMultiplier, setRetirementMultiplier] = useState(25);
  const [intergenCapital, setIntergenCapital] = useState(5000000);
  const [displayedIntergen, setDisplayedIntergen] = useState(5000000);

  const [expenseManual, setExpenseManual] = useState("");
  const [incomeManual, setIncomeManual] = useState("");
  const [psmManual, setPsmManual] = useState("");
  const [eduManual, setEduManual] = useState("");
  const [intergenManual, setIntergenManual] = useState("");

  const [confirmedExpense, setConfirmedExpense] = useState(null);
  const [confirmedIncome, setConfirmedIncome] = useState(null);
  const [confirmedPsm, setConfirmedPsm] = useState(null);
  const [confirmedEdu, setConfirmedEdu] = useState(null);
  const [confirmedRetirement, setConfirmedRetirement] = useState(null);
  const [confirmedIntergen, setConfirmedIntergen] = useState(null);

  const [mnvStart, setMnvStart] = useState(1);
  const [mnvDuration, setMnvDuration] = useState(2);
  const [psmStart, setPsmStart] = useState(1);
  const [psmDuration, setPsmDuration] = useState(3);
  const [eduStart, setEduStart] = useState(5);
  const [eduDuration, setEduDuration] = useState(6);
  const [retStart, setRetStart] = useState(15);
  const [retDuration, setRetDuration] = useState(1);
  const [intergenStart, setIntergenStart] = useState(11);
  const [intergenDuration, setIntergenDuration] = useState(1);

  const [customObjectives, setCustomObjectives] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newObjName, setNewObjName] = useState("");
  const [newObjAmount, setNewObjAmount] = useState("");

  const [mnvAnnualOverride, setMnvAnnualOverride] = useState(null);
  const [psmTotalOverride, setPsmTotalOverride] = useState(null);
  const [eduAnnualOverride, setEduAnnualOverride] = useState(null);
  const [retCapitalOverride, setRetCapitalOverride] = useState(null);
  const [intergenOverride, setIntergenOverride] = useState(null);

  useEffect(() => {
    const diff = monthlyExpense - displayedExpense;
    if (Math.abs(diff) < 1) return setDisplayedExpense(monthlyExpense);
    const t = setTimeout(() => setDisplayedExpense((p) => p + diff / 6), 16);
    return () => clearTimeout(t);
  }, [monthlyExpense, displayedExpense]);
  useEffect(() => {
    const diff = monthlyIncome - displayedIncome;
    if (Math.abs(diff) < 1) return setDisplayedIncome(monthlyIncome);
    const t = setTimeout(() => setDisplayedIncome((p) => p + diff / 6), 16);
    return () => clearTimeout(t);
  }, [monthlyIncome, displayedIncome]);
  useEffect(() => {
    const diff = psmValue - displayedPsm;
    if (Math.abs(diff) < 1) return setDisplayedPsm(psmValue);
    const t = setTimeout(() => setDisplayedPsm((p) => p + diff / 6), 16);
    return () => clearTimeout(t);
  }, [psmValue, displayedPsm]);
  useEffect(() => {
    const diff = eduPerYear - displayedEdu;
    if (Math.abs(diff) < 1) return setDisplayedEdu(eduPerYear);
    const t = setTimeout(() => setDisplayedEdu((p) => p + diff / 6), 16);
    return () => clearTimeout(t);
  }, [eduPerYear, displayedEdu]);

  useEffect(() => {
    const diff = intergenCapital - displayedIntergen;
    if (Math.abs(diff) < 1) return setDisplayedIntergen(intergenCapital);
    const t = setTimeout(() => setDisplayedIntergen((p) => p + diff / 6), 16);
    return () => clearTimeout(t);
  }, [intergenCapital, displayedIntergen]);

  useEffect(() => {
    if (psmUserTouched) return;
    if (confirmedExpense === null) return;
    const annualMnv = confirmedExpense * 12;
    const suggested = annualMnv * 5;
    const clamped = Math.max(5000, Math.min(2000000, suggested));
    let closest = psmSteps[0];
    let minDiff = Infinity;
    psmSteps.forEach((s) => {
      const d = Math.abs(s - clamped);
      if (d < minDiff) { minDiff = d; closest = s; }
    });
    setPsmValue(closest);
  }, [confirmedExpense, psmUserTouched]);

  const baseMonthlyExpense = confirmedExpense ?? monthlyExpense;
  const annualExpense = mnvAnnualOverride ?? baseMonthlyExpense * 12;
  const annualIncome = confirmedIncome !== null ? confirmedIncome * 12 : 0;
  const mnvGross = annualExpense * mnvDuration;
  const mnvNet = confirmedIncome !== null ? Math.max(0, mnvGross - annualIncome * mnvDuration) : mnvGross;
  const psmAmount = psmTotalOverride ?? (confirmedPsm ?? 0);
  const eduAnnual = eduAnnualOverride ?? (confirmedEdu ?? 0);
  const eduTotal = eduAnnual * eduDuration;

  const retirementCapital = retCapitalOverride ?? baseMonthlyExpense * 12 * retirementMultiplier;
  const intergenInvestable = intergenOverride ?? (confirmedIntergen ?? 0);

  const formatUSD = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const formatShort = (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };
  const formatWithCommas = (n) => new Intl.NumberFormat("en-US").format(n);

  const objectives = [];
  if (confirmedExpense !== null) {
    objectives.push({
      id: "mnv", code: "MNV", name: "Mantener Nivel de Vida",
      startYear: mnvStart, duration: mnvDuration,
      capital: mnvNet, capitalGross: mnvGross,
      color: "#0a0a0a",
      annualPerYear: annualExpense, perYearLabel: "gasto anual",
    });
  }
  if (confirmedPsm !== null) {
    objectives.push({
      id: "psm", code: "PSM", name: "Por Si Las Moscas",
      startYear: psmStart, duration: psmDuration,
      capital: psmAmount, color: "#2d2d2d",
      isLumpSum: true, perYearLabel: "total",
    });
  }
  if (confirmedEdu !== null) {
    objectives.push({
      id: "edu", code: "EDU", name: "Educación de los hijos",
      startYear: eduStart, duration: eduDuration,
      capital: eduTotal, color: "#4a3f2a",
      annualPerYear: eduAnnual, perYearLabel: "por año",
    });
  }
  if (confirmedRetirement !== null) {
    objectives.push({
      id: "ret", code: "JUB", name: "Jubilación",
      startYear: retStart, duration: retirementMultiplier,
      capital: retirementCapital, color: "#1a3a2e",
      annualPerYear: baseMonthlyExpense * 12, perYearLabel: "gasto anual",
    });
  }
  customObjectives.forEach((obj) => {
    objectives.push({
      ...obj,
      isLumpSum: true,
      perYearLabel: "monto",
      isCustom: true,
    });
  });

  const capitalNeeded = objectives.reduce((s, o) => s + o.capital, 0);
  const intergenAmount = Math.max(0, intergenInvestable - capitalNeeded);
  const capitalDeficit = Math.max(0, capitalNeeded - intergenInvestable);

  if (confirmedIntergen !== null && intergenAmount > 0) {
    objectives.push({
      id: "intergen", code: "INT", name: "Capital Intergeneracional",
      startYear: intergenStart, duration: intergenDuration,
      capital: intergenAmount, color: "#5c4a7a",
      isLumpSum: true, isMilestone: true, perYearLabel: "excedente",
    });
  }

  const handleConfirmStep0 = () => { setConfirmedExpense(monthlyExpense); setCurrentStep(1); };
  const handleConfirmStep1 = () => { setConfirmedIncome(monthlyIncome); setCurrentStep(2); };
  const handleConfirmStep2 = () => {
    setConfirmedPsm(psmValue); setPsmStart(1); setPsmDuration(3); setCurrentStep(3);
  };
  const handleConfirmStep3 = () => {
    setConfirmedEdu(eduPerYear);
    setEduStart(eduStartYear);
    setEduDuration(eduEndYear - eduStartYear + 1);
    setCurrentStep(4);
  };
  const handleConfirmStep4 = () => {
    setConfirmedRetirement(yearsToRetirement);
    setRetStart(yearsToRetirement);
    setRetDuration(1);
    setCurrentStep(5);
  };
  const handleConfirmStep5 = () => {
    setConfirmedIntergen(intergenCapital);
    setIntergenStart(11);
    setIntergenDuration(1);
    setCurrentStep(6);
  };
  const handleBack = () => {
    if (currentStep === 1) { setCurrentStep(0); setConfirmedExpense(null); }
    else if (currentStep === 2) { setCurrentStep(1); setConfirmedIncome(null); }
    else if (currentStep === 3) { setCurrentStep(2); setConfirmedPsm(null); }
    else if (currentStep === 4) { setCurrentStep(3); setConfirmedEdu(null); }
    else if (currentStep === 5) { setCurrentStep(4); setConfirmedRetirement(null); }
    else if (currentStep === 6) { setCurrentStep(5); setConfirmedIntergen(null); }
  };

  const applyManual = (raw, setter, min, max) => {
    const p = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(p) && p >= min && p <= max) setter(p);
  };

  const ganttTrackRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  const TOTAL_COLUMNS = 11;

  const yearToColumn = (year) => Math.min(year, visibleYears + 1);
  const columnSpanFor = (startYear, duration) => {
    const endYear = startYear + duration - 1;
    const startCol = yearToColumn(startYear);
    const endCol = yearToColumn(endYear);
    return { startCol, span: endCol - startCol + 1 };
  };

  useEffect(() => {
    if (!dragState) return;
    const handleMove = (e) => {
      if (!ganttTrackRef.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = ganttTrackRef.current.getBoundingClientRect();
      const innerWidth = rect.width - 12;
      const cellWidth = innerWidth / TOTAL_COLUMNS;
      const deltaX = x - dragState.startX;
      const deltaCells = Math.round(deltaX / cellWidth);

      if (dragState.mode === "resize-right") {
        let newDuration = Math.max(1, dragState.initialDuration + deltaCells);
        newDuration = Math.min(newDuration, maxYear - dragState.initialStart + 1);
        setDurationFor(dragState.id, newDuration);
      } else if (dragState.mode === "resize-left") {
        let newStart = dragState.initialStart + deltaCells;
        const endYear = dragState.initialStart + dragState.initialDuration - 1;
        newStart = Math.max(1, Math.min(endYear, newStart));
        const newDuration = endYear - newStart + 1;
        setStartFor(dragState.id, newStart);
        setDurationFor(dragState.id, newDuration);
      } else if (dragState.mode === "move") {
        let newStart = dragState.initialStart + deltaCells;
        newStart = Math.max(1, Math.min(maxYear - dragState.initialDuration + 1, newStart));
        setStartFor(dragState.id, newStart);
      }
    };
    const handleUp = () => setDragState(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    document.body.style.cursor = dragState.mode === "move" ? "grabbing" : "ew-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragState]);

  const setStartFor = (id, val) => {
    if (id === "mnv") setMnvStart(val);
    else if (id === "psm") setPsmStart(val);
    else if (id === "edu") setEduStart(val);
    else if (id === "ret") setRetStart(val);
    else if (id === "intergen") setIntergenStart(val);
    else if (id.startsWith("custom-")) {
      setCustomObjectives((prev) =>
        prev.map((o) => (o.id === id ? { ...o, startYear: val } : o))
      );
    }
  };
  const setDurationFor = (id, val) => {
    if (id === "mnv") setMnvDuration(val);
    else if (id === "psm") setPsmDuration(val);
    else if (id === "edu") setEduDuration(val);
    else if (id === "ret") setRetirementMultiplier(val);
    else if (id === "intergen") setIntergenDuration(val);
    else if (id.startsWith("custom-")) {
      setCustomObjectives((prev) =>
        prev.map((o) => (o.id === id ? { ...o, duration: val } : o))
      );
    }
  };

  const [editingAmount, setEditingAmount] = useState(null);
  const [amountDraft, setAmountDraft] = useState("");

  const startEditAmount = (obj) => {
    setEditingAmount(obj.id);
    let cur;
    if (obj.id === "mnv") cur = Math.round(annualExpense);
    else if (obj.id === "psm") cur = Math.round(psmAmount);
    else if (obj.id === "edu") cur = Math.round(eduAnnual);
    else if (obj.id === "ret") cur = Math.round(retirementCapital);
    else if (obj.id === "intergen") cur = Math.round(intergenAmount);
    else if (obj.id.startsWith("custom-")) cur = Math.round(obj.capital);
    setAmountDraft(formatWithCommas(cur));
  };
  const commitAmountEdit = (id) => {
    const parsed = parseInt(amountDraft.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      if (id === "mnv") setMnvAnnualOverride(parsed);
      else if (id === "psm") setPsmTotalOverride(parsed);
      else if (id === "edu") setEduAnnualOverride(parsed);
      else if (id === "ret") setRetCapitalOverride(parsed);
      else if (id === "intergen") setIntergenOverride(parsed);
      else if (id.startsWith("custom-")) {
        setCustomObjectives((prev) =>
          prev.map((o) => (o.id === id ? { ...o, capital: parsed } : o))
        );
      }
    }
    setEditingAmount(null);
    setAmountDraft("");
  };

  const handleCreateCustom = () => {
    const trimmedName = newObjName.trim();
    const parsed = parseInt(newObjAmount.replace(/[^0-9]/g, ""), 10);
    if (!trimmedName || isNaN(parsed) || parsed <= 0) return;

    const code = trimmedName.slice(0, 3).toUpperCase();
    const colorPool = ["#3a5a8c", "#7a4a4a", "#4a7a5a", "#7a6a4a", "#5a4a7a", "#8c5a3a"];
    const color = colorPool[customObjectives.length % colorPool.length];

    const newObj = {
      id: `custom-${Date.now()}`,
      code,
      name: trimmedName,
      startYear: 1,
      duration: 1,
      capital: parsed,
      color,
    };
    setCustomObjectives((prev) => [...prev, newObj]);
    setMixOverrides({});
    setNewObjName("");
    setNewObjAmount("");
    setShowAddModal(false);
  };

  const totalCapital = objectives.reduce((s, o) => s + o.capital, 0);
  const objectivesOnlyTotal = objectives
    .filter((o) => o.id !== "intergen")
    .reduce((s, o) => s + o.capital, 0);
  const objectivesOnlyCount = objectives.filter((o) => o.id !== "intergen").length;

  const yearlyHorizon = 30;
  const computeYearlySpend = (year) => {
    let total = 0;
    objectives.forEach((obj) => {
      if (obj.id === "intergen") return;
      const start = obj.startYear;
      const end = obj.startYear + obj.duration - 1;
      if (year < start || year > end) return;
      if (obj.id === "mnv") {
        total += annualExpense;
      } else if (obj.id === "edu") {
        total += eduAnnual;
      } else if (obj.id === "psm") {
        total += obj.capital / obj.duration;
      } else if (obj.id === "ret") {
        if (year === start) total += obj.capital;
      }
    });
    return total;
  };
  const yearlySpends = Array.from({ length: yearlyHorizon }, (_, i) =>
    computeYearlySpend(i + 1)
  );
  const maxYearlySpend = Math.max(...yearlySpends, 1);

  const [mixOverrides, setMixOverrides] = useState({});

  const computeDefaultSplit = (obj) => {
    if (obj.id === "mnv") {
      return { mm: obj.capital, fi: 0, rv: 0 };
    }
    if (obj.id === "psm") {
      return {
        mm: obj.capital * 0.4,
        fi: obj.capital * 0.4,
        rv: obj.capital * 0.2,
      };
    }
    if ((obj.isLumpSum || obj.isMilestone) && !(obj.isCustom && obj.duration > 1)) {
      const y = obj.startYear;
      if (y === 1) return { mm: obj.capital, fi: 0, rv: 0 };
      if (y >= 2 && y <= 3) return { mm: 0, fi: obj.capital, rv: 0 };
      return { mm: 0, fi: 0, rv: obj.capital };
    }
    const perYear = obj.capital / obj.duration;
    let mm = 0,
      fi = 0,
      rv = 0;
    for (let y = obj.startYear; y < obj.startYear + obj.duration; y++) {
      if (y === 1) mm += perYear;
      else if (y >= 2 && y <= 3) fi += perYear;
      else rv += perYear;
    }
    return { mm, fi, rv };
  };

  const getSplit = (obj) => {
    const def = computeDefaultSplit(obj);
    const ov = mixOverrides[obj.id];
    if (!ov) return def;
    return {
      mm: obj.capital * ov.mm,
      fi: obj.capital * ov.fi,
      rv: obj.capital * ov.rv,
    };
  };

  const assetTotals = objectives.reduce(
    (acc, obj) => {
      const s = getSplit(obj);
      acc.mm += s.mm;
      acc.fi += s.fi;
      acc.rv += s.rv;
      return acc;
    },
    { mm: 0, fi: 0, rv: 0 }
  );
  const assetGrandTotal = assetTotals.mm + assetTotals.fi + assetTotals.rv;

  const pctOf = (n) => (assetGrandTotal > 0 ? (n / assetGrandTotal) * 100 : 0);

  const updateCardMix = (cardId, newSplit) => {
    const sum = newSplit.mm + newSplit.fi + newSplit.rv;
    if (sum <= 0) return;
    setMixOverrides((prev) => ({
      ...prev,
      [cardId]: {
        mm: newSplit.mm / sum,
        fi: newSplit.fi / sum,
        rv: newSplit.rv / sum,
      },
    }));
  };
  const resetCardMix = (cardId) => {
    setMixOverrides((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  // NOTE: el JSX completo del return (top bar, preguntas, gantt, mix de
  // activos) está en el mensaje original del usuario. Para integración
  // bajo /src se portará tal cual con tipos, sin tocar la lógica.
  return null;
}
