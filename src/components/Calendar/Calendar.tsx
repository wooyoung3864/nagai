import React, { useEffect, useState } from 'react';
import './Calendar.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getMonth(month: number){
    return monthsOfYear[month];
}

interface DailyData {
  date: string;
  focusTime: string;
}

interface Props {
  data: DailyData[];
}

function getDate() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    return `${year}/${month}`;
}


const Calendar: React.FC<Props> = ({data}) => {
  const date = getDate();
  const [y, m] = date.split('/');
  const [year, setYear] = useState(parseInt(y));
  const [month, setMonth] = useState(parseInt(m));
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfWeek(year, month);

  const getDataForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.find((d) => d.date === dateStr);
  };

  const pastMonth = () => {
    setMonth(prevMonth => {
      if (prevMonth === 0) {
        setYear(prevYear => prevYear - 1);
        return 11;
      } else {
        return prevMonth - 1;
      }
    });
  };
  
  const nextMonth = () => {
    setMonth(prevMonth => {
      if (prevMonth === 11) {
        setYear(prevYear => prevYear + 1);
        return 0;
      } else {
        return prevMonth + 1;
      }
    });
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

  useEffect(() => {
    const handleKeyChangeMonth = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        pastMonth();
      } else if (event.key === "ArrowRight") {
        nextMonth();
      }
    };
  
    window.addEventListener("keydown", handleKeyChangeMonth);
    return () => {
      window.removeEventListener("keydown", handleKeyChangeMonth);
    };
  }, []);

  return (
    <div className="calendar">
        <div className='month'>
            <button onClick={() => pastMonth()}>
            <svg fill="#000000" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"></path> </g></svg>
            </button>
            <h3>{getMonth(month)} {year}</h3>
            <button onClick={() => nextMonth()}>
            <svg fill="#000000" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_222_" d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z"></path> </g></svg>
            </button>
        </div>
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
