import React, { useEffect, useState } from 'react';
import './FocusLog.css';
import Calendar from '../Calendar/Calendar';
import { motion } from 'framer-motion';
import { useSupabase } from "../../contexts/SupabaseContext";

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
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const supabase = useSupabase();

  

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFocusData = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        console.error("No access_token found"); 
        return;
      }
      console.log("✅ Supabase token:", token);

      try {
        const userId = localStorage.getItem('user_id');

        if (!userId || !token) {
          console.error("Missing user_id or token in localStorage");
          return;
        }

        const response = await fetch("https://nagai.onrender.com/sessions/monthly-focus-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            year,
            month,
            access_token: token
          })
        });

        if (!response.ok) {
          console.error("Failed to fetch focus data:", response.statusText);
          return;
        }

        const data = await response.json();
        const result: DailyData[] = [];
        const map = new Map<string, { secs: number, scoreSum: number, count: number }>();
        console.log("📦 raw response from backend:", data);
        data.forEach((entry: any) => {
          const date = entry.day; 
          const secs = entry.total_focus_secs || 0;

          const hours = Math.floor(secs / 3600);
          const mins = Math.floor((secs % 3600) / 60);
          const timeStr = `${hours}h ${mins}m`;
          const cycle = secs / 60 / 25.0;

          result.push({
            date,
            focusTime: timeStr,
            focusCycle: parseFloat(cycle.toFixed(1)),
            focusScore: undefined 
          });
        });

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
        result.forEach(d => {
          console.log(`🔍 ${d.date} → ${d.focusTime}`);
        });
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
