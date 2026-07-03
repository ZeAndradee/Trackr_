import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "./Chart.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const PRIMARY = "#158ef1";
const DAY_MS = 86400000;

const PRESETS = [
  { key: "1d", label: "1d", days: 1, granularity: "day" },
  { key: "5d", label: "5d", days: 5, granularity: "day" },
  { key: "1m", label: "1m", days: 30, granularity: "day" },
  { key: "1y", label: "1y", days: 365, granularity: "month" },
  { key: "5y", label: "5y", days: 1825, granularity: "month" },
  { key: "max", label: "max", days: Infinity, granularity: "month" },
];

const toDate = (v) => (v instanceof Date ? v : new Date(v));

const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatLabel = (date, granularity) => {
  if (granularity === "month") {
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TYPE_CONFIG = {
  user: { granularity: "day", minPresetDays: 0 },
  artist: { granularity: "month", minPresetDays: 30 },
};

const Chart = ({
  data = [],
  type = "user",
  title = null,
  renderHover,
  onRangeChange,
}) => {
  const { granularity, minPresetDays } = TYPE_CONFIG[type] || TYPE_CONFIG.user;
  const chartRef = useRef(null);
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [activePreset, setActivePreset] = useState("max");

  const normalized = useMemo(
    () =>
      data
        .map((d) => ({
          date: toDate(d.date),
          value: d.value ?? 0,
          meta: d.meta,
        }))
        .sort((a, b) => a.date - b.date),
    [data],
  );

  const totalSpanDays = useMemo(() => {
    if (normalized.length < 2) return 0;
    return (
      (normalized[normalized.length - 1].date - normalized[0].date) / DAY_MS
    );
  }, [normalized]);

  const maxSpanRef = useRef(0);
  if (totalSpanDays > maxSpanRef.current) {
    maxSpanRef.current = totalSpanDays;
  }

  const availablePresets = useMemo(() => {
    return PRESETS.filter((p) => {
      if (p.granularity === "day" && granularity === "month") return false;
      if (minPresetDays && p.days < minPresetDays) return false;
      return true;
    });
  }, [granularity, minPresetDays]);

  const slice = useMemo(() => {
    if (!normalized.length) return normalized;
    const preset = PRESETS.find((p) => p.key === activePreset);
    if (!preset || preset.days === Infinity) return normalized;
    const last = normalized[normalized.length - 1].date;
    const cutoff = last.getTime() - preset.days * DAY_MS;
    return normalized.filter((d) => d.date.getTime() >= cutoff);
  }, [normalized, activePreset]);

  const handlePresetClick = useCallback(
    (presetKey) => {
      setActivePreset(presetKey);
      if (!onRangeChange) return;
      if (presetKey === "max" || !normalized.length) {
        onRangeChange({ start: "", end: "" });
        return;
      }
      const preset = PRESETS.find((p) => p.key === presetKey);
      if (!preset) return;
      const last = normalized[normalized.length - 1].date;
      const cutoff = new Date(last.getTime() - preset.days * DAY_MS);
      onRangeChange({
        start: toIsoDate(cutoff),
        end: toIsoDate(last),
      });
    },
    [normalized, onRangeChange],
  );

  const labels = useMemo(() => slice.map((d, i) => i), [slice]);
  const values = useMemo(() => slice.map((d) => d.value), [slice]);
  const maxVal = useMemo(() => Math.max(1, ...values), [values]);

  const axisLabels = useMemo(() => {
    if (slice.length < 2) return [];
    const last = slice.length - 1;
    const mid = Math.floor(last / 2);
    return [
      { pct: 0, label: formatLabel(slice[0].date, granularity), align: "start" },
      { pct: 50, label: formatLabel(slice[mid].date, granularity), align: "center" },
      { pct: 100, label: formatLabel(slice[last].date, granularity), align: "end" },
    ];
  }, [slice, granularity]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          borderColor: PRIMARY,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: PRIMARY,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(21, 142, 241, 0.15)";
            const gradient = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, "rgba(21, 142, 241, 0.35)");
            gradient.addColorStop(1, "rgba(21, 142, 241, 0)");
            return gradient;
          },
        },
      ],
    }),
    [labels, values],
  );

  const externalTooltip = useCallback(
    (context) => {
      const { tooltip } = context;
      if (!tooltip || tooltip.opacity === 0) {
        setHover((prev) => (prev ? null : prev));
        return;
      }
      const idx = tooltip.dataPoints?.[0]?.dataIndex;
      if (idx == null) return;
      const point = slice[idx];
      if (!point) return;
      setHover({ x: tooltip.caretX, y: tooltip.caretY, point, index: idx });
    },
    [slice],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      layout: { padding: { top: 16, bottom: 0, left: 0, right: 0 } },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false, external: externalTooltip },
      },
      scales: {
        x: { display: false, grid: { display: false }, border: { display: false } },
        y: {
          display: false,
          beginAtZero: true,
          suggestedMax: maxVal + Math.max(1, Math.ceil(maxVal * 0.2)),
        },
      },
      elements: { line: { capBezierPoints: true } },
    }),
    [maxVal, externalTooltip],
  );

  const defaultHover = (point) => (
    <div className={styles.hoverText}>
      <span className={styles.hoverTrack}>{point.value}</span>
      <span className={styles.hoverMeta}>
        {formatLabel(point.date, granularity)}
      </span>
    </div>
  );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <div className={styles.presetGroup} role="tablist">
            {availablePresets.map((p) => {
              const insufficient =
                normalized.length > 0 &&
                p.days !== Infinity &&
                maxSpanRef.current < p.days;
              const isActive = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.presetButton} ${
                    isActive ? styles.presetButtonActive : ""
                  }`}
                  disabled={insufficient}
                  onClick={() => handlePresetClick(p.key)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.chartBox}>
        <Line ref={chartRef} data={chartData} options={options} />
        {hover && (
          <div
            className={styles.hoverCard}
            style={{ left: `${hover.x}px`, top: `${hover.y}px` }}
          >
            {renderHover
              ? renderHover(hover.point, hover.index)
              : defaultHover(hover.point)}
          </div>
        )}
      </div>
      {axisLabels.length > 0 && (
        <div className={styles.axisLabels}>
          {axisLabels.map((l) => (
            <span
              key={l.pct}
              className={styles.axisLabel}
              data-align={l.align}
              style={{ left: `${l.pct}%` }}
            >
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chart;
