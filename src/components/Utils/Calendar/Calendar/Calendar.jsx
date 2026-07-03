import React, { useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { Button } from "../../Buttons/Button";
import styles from "./Calendar.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const stripTime = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value) ? null : stripTime(value);
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return isNaN(date) ? null : date;
    }
    const date = new Date(value);
    return isNaN(date) ? null : stripTime(date);
  }
  return null;
};

const formatIso = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (first, second) =>
  !!first && !!second && first.getTime() === second.getTime();

const isInRange = (date, start, end) => {
  if (!start || !end) return false;
  const [lo, hi] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
  return date.getTime() >= lo.getTime() && date.getTime() <= hi.getTime();
};

const Calendar = ({
  isOpen = true,
  mode = "single",
  value,
  onChange,
  onClose,
  minDate = "2024-01-01",
  maxDate,
}) => {
  const maxDay = useMemo(
    () => (maxDate ? stripTime(new Date(maxDate)) : stripTime(new Date())),
    [maxDate],
  );

  const minDay = useMemo(
    () => (minDate ? stripTime(new Date(minDate)) : new Date(2024, 0, 1)),
    [minDate]
  );

  const initialSingle = parseDate(value);
  const initialRange = value && typeof value === "object" && !(value instanceof Date)
    ? { start: parseDate(value.start), end: parseDate(value.end) }
    : { start: null, end: null };

  const [draftSingle, setDraftSingle] = useState(initialSingle);
  const [draftRange, setDraftRange] = useState(initialRange);
  const [activeField, setActiveField] = useState("start");

  const anchorDate = mode === "range"
    ? (draftRange.start || draftRange.end || new Date())
    : (draftSingle || new Date());

  const [viewYear, setViewYear] = useState(anchorDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchorDate.getMonth());

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "single") {
      const parsed = parseDate(value);
      setDraftSingle(parsed);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    } else if (value && typeof value === "object") {
      const next = { start: parseDate(value.start), end: parseDate(value.end) };
      setDraftRange(next);
      const anchor = next.start || next.end;
      if (anchor) {
        setViewYear(anchor.getFullYear());
        setViewMonth(anchor.getMonth());
      }
      setActiveField(next.start ? "end" : "start");
    } else {
      setDraftRange({ start: null, end: null });
      setActiveField("start");
    }
  }, [isOpen, value, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const today = stripTime(new Date());

  if (!isOpen) return null;

  const goPrevYear = () => {
    const nextYear = viewYear - 1;
    if (nextYear < minDay.getFullYear()) return;
    setViewYear(nextYear);
  };

  const goNextYear = () => {
    const nextYear = viewYear + 1;
    if (nextYear > maxDay.getFullYear()) return;
    setViewYear(nextYear);
  };

  const goPrevMonth = () => {
    let nextMonth = viewMonth - 1;
    let nextYear = viewYear;
    if (nextMonth < 0) { nextMonth = 11; nextYear -= 1; }
    
    if (nextYear < minDay.getFullYear() || (nextYear === minDay.getFullYear() && nextMonth < minDay.getMonth())) return;
    
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  };

  const goNextMonth = () => {
    let nextMonth = viewMonth + 1;
    let nextYear = viewYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }
    if (nextYear > maxDay.getFullYear() || (nextYear === maxDay.getFullYear() && nextMonth > maxDay.getMonth())) return;
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  };

  const prevYearDisabled = viewYear <= minDay.getFullYear();
  const nextYearDisabled = viewYear >= maxDay.getFullYear();
  const prevDisabled = viewYear === minDay.getFullYear() && viewMonth <= minDay.getMonth();
  const nextDisabled = viewYear === maxDay.getFullYear() && viewMonth >= maxDay.getMonth();

  const handleDayClick = (day, monthOffset, disabled) => {
    if (disabled) return;
    
    let clickMonth = viewMonth + monthOffset;
    let clickYear = viewYear;
    if (clickMonth > 11) { clickMonth -= 12; clickYear += 1; }

    const clicked = new Date(clickYear, clickMonth, day);

    if (mode === "single") {
      setDraftSingle(clicked);
      return;
    }

    if (activeField === "start") {
      const next = { ...draftRange, start: clicked };
      if (next.end && clicked.getTime() > next.end.getTime()) next.end = null;
      setDraftRange(next);
      setActiveField("end");
    } else {
      const next = { ...draftRange, end: clicked };
      if (next.start && clicked.getTime() < next.start.getTime()) {
        next.start = clicked;
        next.end = draftRange.start;
      }
      setDraftRange(next);
    }
  };

  const handleConfirm = () => {
    if (mode === "single") {
      onChange?.(formatIso(draftSingle));
    } else {
      onChange?.({
        start: formatIso(draftRange.start),
        end: formatIso(draftRange.end),
      });
    }
    onClose?.();
  };

  const handleReset = () => {
    if (mode === "single") {
      setDraftSingle(null);
      onChange?.("");
    } else {
      setDraftRange({ start: null, end: null });
      setActiveField("start");
      onChange?.({ start: "", end: "" });
    }
  };

  const renderMonthGrid = (monthOffset) => {
    let targetMonth = viewMonth + monthOffset;
    let targetYear = viewYear;
    if (targetMonth > 11) { targetMonth -= 12; targetYear += 1; }

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstWeekday = new Date(targetYear, targetMonth, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(<span key={`pad-${i}`} className={styles.pad} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      date.setHours(0, 0, 0, 0);
      const disabled = date.getTime() > maxDay.getTime();

      let selected = false;
      let inRange = false;
      let rangeStart = false;
      let rangeEnd = false;

      if (mode === "single") {
        selected = isSameDay(date, draftSingle);
      } else {
        const { start, end } = draftRange;
        if (start && end) {
          rangeStart = isSameDay(date, start);
          rangeEnd = isSameDay(date, end);
          inRange = !rangeStart && !rangeEnd && isInRange(date, start, end);
        } else if (start) {
          rangeStart = isSameDay(date, start);
        } else if (end) {
          rangeEnd = isSameDay(date, end);
        }
        selected = rangeStart || rangeEnd;
      }

      const isToday = isSameDay(date, today);

      const classes = [styles.cell];
      if (disabled) classes.push(styles.disabled);
      if (selected) classes.push(styles.selected);
      else if (isToday) classes.push(styles.today);
      if (inRange) classes.push(styles.inRange);
      if (rangeStart) classes.push(styles.rangeStart);
      if (rangeEnd) classes.push(styles.rangeEnd);

      cells.push(
        <div key={day} className={classes.join(" ")}>
          <button
            type="button"
            className={styles.cellButton}
            onClick={() => handleDayClick(day, monthOffset, disabled)}
            disabled={disabled}
          >
            {isToday && !selected ? <span className={styles.todayDot} /> : null}
            {day}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.monthWrapper}>
        <div className={styles.monthHeader}>
            <span className={styles.monthName}>{MONTH_NAMES[targetMonth]} {targetYear}</span>
        </div>
        <div className={styles.weekdays}>
          {WEEKDAY_LETTERS.map((letter, index) => (
            <span key={`${letter}-${index}`} className={styles.weekday}>{letter}</span>
          ))}
        </div>
        <div className={styles.grid}>{cells}</div>
      </div>
    );
  };

  return (
    <div className={styles.calendar} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.navBar}>
            <div className={styles.navGroup}>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={goPrevYear}
                    disabled={prevYearDisabled}
                    aria-label="Previous year"
                >
                    <MdKeyboardDoubleArrowLeft size={20} />
                </button>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={goPrevMonth}
                    disabled={prevDisabled}
                    aria-label="Previous month"
                >
                    <MdKeyboardArrowLeft size={20} />
                </button>
            </div>
            <div className={styles.navGroup}>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={goNextMonth}
                    disabled={nextDisabled}
                    aria-label="Next month"
                >
                    <MdKeyboardArrowRight size={20} />
                </button>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={goNextYear}
                    disabled={nextYearDisabled}
                    aria-label="Next year"
                >
                    <MdKeyboardDoubleArrowRight size={20} />
                </button>
            </div>
        </div>

        <div className={styles.body}>
            {renderMonthGrid(0)}
            {renderMonthGrid(1)}
        </div>
        
        <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleReset}>
                Reset
            </button>
            <Button variant="primary" className={styles.saveButton} onClick={handleConfirm}>
                Done
            </Button>
        </div>
    </div>
  );
};

export default Calendar;

