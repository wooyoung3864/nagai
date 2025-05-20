import React, { useEffect, useState } from 'react';
import './FocusLog.css';
import Calendar from '../Calendar/Calendar';
import { motion } from 'framer-motion';

interface FocusLogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyData {
  date: string;
  focusTime: string;
  focusCycle: number;
  focusScore?: number;
}

const FocusLog: React.FC<FocusLogProps> = ({ isOpen, onClose }) => {
  const [focusData, setFocusData] = useState<DailyData[]>([]);
  const [avgScore, setAvgScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFocusData = async () => {
      try {
        const userId = localStorage.getItem('user_id');  
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          console.error("Missing user_id or token in localStorage");
          return;
        }

        const response = await fetch("https://nagai-backend.onrender.com/focus/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            aggregate: false
          })
        });

        if (!response.ok) {
          console.error("Failed to fetch focus data:", response.statusText);
          return;
        }

        const data = await response.json();

        const map = new Map<string, { secs: number, scoreSum: number, count: number }>();
        data.forEach((entry: any) => {
          const date = entry.timestamp.slice(0, 10); // "YYYY-MM-DD"
          if (!map.has(date)) {
            map.set(date, { secs: 0, scoreSum: 0, count: 0 });
          }
          const item = map.get(date)!;
          item.secs += entry.focus_secs;
          if (entry.focus_score !== null && entry.focus_score !== undefined) {
            item.scoreSum += entry.focus_score;
            item.count += 1;
          }
        });

        const result: DailyData[] = [];
        let totalScore = 0, scoreCount = 0;

        map.forEach((value, date) => {
          const hours = Math.floor(value.secs / 3600);
          const mins = Math.floor((value.secs % 3600) / 60);
          const timeStr = `${hours}h ${mins}m`;
          const cycle = value.secs / 60 / 25.0;
          const score = value.count ? Math.round(value.scoreSum / value.count) : undefined;
          if (score !== undefined) {
            totalScore += score;
            scoreCount++;
          }

          result.push({
            date,
            focusTime: timeStr,
            focusCycle: parseFloat(cycle.toFixed(1)),
            focusScore: score
          });
        });

        setFocusData(result);
        setAvgScore(scoreCount ? Math.round(totalScore / scoreCount) : null);
      } catch (error) {
        console.error("Error fetching focus data:", error);
      }
    };

    fetchFocusData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Focus Log</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <Calendar data={focusData} />
          {avgScore !== null && (
            <div className="average-score">Average Focus Score: <strong>{avgScore}</strong></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FocusLog;
