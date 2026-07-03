import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './CompactCalendar.module.css';

const CompactCalendar = ({ value, onChange, onClose }) => {
    const [currentDate, setCurrentDate] = useState(value || new Date());
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
    const [yearRange, setYearRange] = useState(() => {
        const year = (value || new Date()).getFullYear();
        return { start: year - (year % 10), end: year - (year % 10) + 9 };
    });
    const calendarRef = useRef(null);

    useEffect(() => {
        if (value) {
            setCurrentDate(value);
        }
    }, [value]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        if (viewMode === 'days') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (viewMode === 'months') {
            setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
        } else if (viewMode === 'years') {
            setYearRange(prev => ({ start: prev.start - 10, end: prev.end - 10 }));
        }
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        if (viewMode === 'days') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (viewMode === 'months') {
            setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
        } else if (viewMode === 'years') {
            setYearRange(prev => ({ start: prev.start + 10, end: prev.end + 10 }));
        }
    };

    const handleDateClick = (day, isDisabled, e) => {
        e.stopPropagation();
        if (isDisabled) return;

        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onChange(newDate);
        if (onClose) onClose();
    };

    const renderHeader = () => {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const today = new Date();
        const minYear = 1900;

        let isPrevDisabled = false;
        let isNextDisabled = false;

        if (viewMode === 'days') {
            isPrevDisabled = (currentDate.getFullYear() === minYear && currentDate.getMonth() === 0);
            isNextDisabled = (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth());
        } else if (viewMode === 'months') {
            isPrevDisabled = currentDate.getFullYear() <= minYear;
            isNextDisabled = currentDate.getFullYear() >= today.getFullYear();
        } else if (viewMode === 'years') {
            isPrevDisabled = yearRange.start <= minYear;
            isNextDisabled = yearRange.end >= today.getFullYear();
        }

        const handleHeaderClick = (e) => {
            e.stopPropagation();
            if (viewMode === 'days') {
                setViewMode('months');
            } else if (viewMode === 'months') {
                setYearRange({
                    start: currentDate.getFullYear() - (currentDate.getFullYear() % 10),
                    end: currentDate.getFullYear() - (currentDate.getFullYear() % 10) + 9
                });
                setViewMode('years');
            } else {
                setViewMode('days');
            }
        };

        const renderTitle = () => {
            if (viewMode === 'days') return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            if (viewMode === 'months') return currentDate.getFullYear().toString();
            return `${yearRange.start} - ${yearRange.end}`;
        };

        return (
            <div className={styles.header}>
                <button
                    type="button"
                    className={`${styles.navButton} ${isPrevDisabled ? styles.disabledNav : ''}`}
                    onClick={isPrevDisabled ? (e) => e.stopPropagation() : handlePrevMonth}
                >
                    <FaChevronLeft size={10} />
                </button>
                <span className={styles.currentMonthYear} onClick={handleHeaderClick}>
                    {renderTitle()}
                </span>
                <button
                    type="button"
                    className={`${styles.navButton} ${isNextDisabled ? styles.disabledNav : ''}`}
                    onClick={isNextDisabled ? (e) => e.stopPropagation() : handleNextMonth}
                >
                    <FaChevronRight size={10} />
                </button>
            </div>
        );
    };

    const renderDaysOfWeek = () => {
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return (
            <div className={styles.daysOfWeek}>
                {days.map(day => (
                    <div key={day} className={styles.dayOfWeek}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const _daysInMonth = daysInMonth(year, month);
        const _firstDay = firstDayOfMonth(year, month);

        const cells = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedValue = value || new Date();
        selectedValue.setHours(0, 0, 0, 0);

        for (let i = 0; i < _firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className={styles.emptyCell}></div>);
        }

        for (let i = 1; i <= _daysInMonth; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);

            const isSelected = date.getTime() === selectedValue.getTime();
            const isToday = date.getTime() === today.getTime();

            const minAllowedDate = new Date(1900, 0, 1).getTime();
            const isDisabled = date.getTime() > today.getTime() || date.getTime() < minAllowedDate;

            cells.push(
                <div
                    key={i}
                    className={`
                    ${styles.cell} 
                    ${isSelected ? styles.selected : ''} 
                    ${isToday ? styles.today : ''}
                    ${isDisabled ? styles.disabled : ''}
                `}
                    onClick={(e) => handleDateClick(i, isDisabled, e)}
                >
                    {i}
                </div>
            );
        }

        return <div className={styles.grid}>{cells}</div>;
    };

    const renderMonths = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        const minYear = 1900;

        return (
            <div className={styles.monthGrid}>
                {months.map((month, index) => {
                    const isDisabled = (currentDate.getFullYear() === minYear && index < 0) || // Months < 0 is impossible, so Jan is ok.
                        (currentDate.getFullYear() === today.getFullYear() && index > today.getMonth());

                    const isSelected = currentDate.getMonth() === index;

                    return (
                        <div
                            key={month}
                            className={`${styles.monthCell} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isDisabled) return;
                                setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                                setViewMode('days');
                            }}
                        >
                            {month}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderYears = () => {
        const years = [];
        const today = new Date();
        const minYear = 1900;

        for (let i = yearRange.start; i <= yearRange.end; i++) {
            const isDisabled = i < minYear || i > today.getFullYear();
            const isSelected = currentDate.getFullYear() === i;

            years.push(
                <div
                    key={i}
                    className={`${styles.yearCell} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isDisabled) return;
                        setCurrentDate(new Date(i, currentDate.getMonth(), 1));
                        setViewMode('months');
                    }}
                >
                    {i}
                </div>
            );
        }

        return <div className={styles.yearGrid}>{years}</div>;
    };

    return (
        <div className={styles.calendarContainer} ref={calendarRef}>
            {renderHeader()}
            {viewMode === 'days' && (
                <>
                    {renderDaysOfWeek()}
                    {renderCells()}
                </>
            )}
            {viewMode === 'months' && renderMonths()}
            {viewMode === 'years' && renderYears()}
        </div>
    );
};

export default CompactCalendar;
