import React from 'react';
import './Calendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DailyData {
  date: string;
  focusTime: string;
  distractions: string[];
}

interface Props {
  year: number;
  month: number; // 0-indexed (0 = Jan)
  data: DailyData[];
}



const Calendar: React.FC<Props> = ({ year, month, data }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfWeek(year, month);

  const getDataForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.find((d) => d.date === dateStr);
  };

  const calendarDays = Array.from({ length: startDay + daysInMonth }).map((_, i) => {
    const dayNum = i - startDay + 1;
    const dayData = getDataForDate(dayNum);

    return (
      <div key={i} className="calendar-cell">
        {i < startDay ? (
          ''
        ) : (
          <div>
            <strong>{dayNum}</strong>
            <div className="focus-time">{dayData?.focusTime}</div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="calendar">
        <h3>{month} {year}</h3>
        <div className="calendar-header">
            {daysOfWeek.map((day) => (
                <div key={day} className="calendar-cell header">
                    {day}
                </div>
            ))}
        </div>
        <div className="calendar-grid">{calendarDays}</div>
    </div>
  );
};

export default Calendar;
