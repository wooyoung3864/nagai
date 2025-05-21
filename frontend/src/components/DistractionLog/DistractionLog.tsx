import React, { useEffect, useState } from 'react';
import './DistractionLog.css';
import { Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import DistractionLogDetail from './DistractionLogDetail';
import { useSupabase } from "../../contexts/SupabaseContext";

interface DistractionLogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LogEntry {
    id: number;
    timestamp: string;
    events: string;
    focusScore: number;
}

interface Distraction {
    id: number;
    timestamp: Date;
    session_id: number;
    focus_score: number;
    is_focused: boolean;
    observed_behaviors: string[];
    explanation: string;
    snapshot_url: string;
    user_id: number;
}
  

const DistractionLog: React.FC<DistractionLogProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sortField, setSortField] = useState<keyof LogEntry>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [distractionMap, setDistractionMap] = useState<Map<number, Distraction>>(new Map());
    const supabase = useSupabase();
    

    useEffect(() => {
        if (distractionMap.size === 0) return;

        const newLogs: LogEntry[] = Array.from(distractionMap.values()).map((distraction) => ({
            id: distraction.id,
            timestamp: new Date(distraction.timestamp).toLocaleString('en-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZoneName: 'short'
              }),
              events: Array.isArray(distraction.observed_behaviors)
                ? distraction.observed_behaviors.join(", ")
                : "N/A",
            focusScore: distraction.focus_score,
        }));

        console.log("distractionMap:", Array.from(distractionMap.values()));
        setLogs(newLogs);
    }, [distractionMap]);


    const handleSort = (field: keyof LogEntry) => {
        const order = field === sortField ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
        setSortField(field);
        setSortOrder(order);
        setLogs((prev) =>
            [...prev].sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            })
        );
    };


    const showDetail = (id: number) => {
      const log = logs.find((log) => log.id === id);
      if (log) setSelectedLog(log);
    };
    
    const handleBackToTable = () => {
      setSelectedLog(null);
    };


    const handleClose = () => {
        handleBackToTable();
        onClose();
    }

    
    // ✅ Always call hooks unconditionally
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
  
    useEffect(() => {
      const getDistractionData = async () => {
        const { data } = await supabase.auth.getSession();
        const access_token = data.session?.access_token;
        console.log("access token: ", access_token);
        if (!access_token) {
          console.error("No access token found");
          return;
        }
  
        const user = localStorage.getItem("user");
        const user_id_kv = user?.split(",")[3];
        const user_id = user_id_kv?.split(":")[1];
        console.log("User ID:", user_id);
  
        const payload = { "user_id":user_id, "access_token":access_token };
        console.log("payload: ", payload);

        try {
            const res = await fetch(`https://${import.meta.env.VITE_API_URL}/distractions/query`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              console.error("Failed to fetch distraction", await res.text());
              return;
            }
            const result: Distraction[] = await res.json(); 
                
            const map = new Map<number, Distraction>();
            result.forEach((entry) => {
              map.set(entry.id, entry);
            });
            setDistractionMap(map);
        
            console.log("Distraction Map:", map);
            
        } catch (err) {
            console.error("Error fetching data:", err);
        }

      };
      getDistractionData();
    }, [isOpen, supabase]);



    if (!isOpen && !selectedLog) return null;



    return (
        <>
            {!selectedLog && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-box scrollable distraction-log-expanded"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Distraction Log</h2>
                            <button className="close-button" onClick={onClose}>✕</button>
                        </div>
                        <div className="modal-body">
                            <Table className="styled-table" striped bordered hover>
                                <thead className="table-primary">
                                    <tr>
                                        <th scope="col" onClick={() => handleSort('id')}>
                                            # {sortField === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th scope="col" onClick={() => handleSort('timestamp')}>
                                            Date & Time {sortField === 'timestamp' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th scope="col" onClick={() => handleSort('events')}>
                                            Distraction Elements {sortField === 'events' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th scope="col" onClick={() => handleSort('focusScore')}>
                                            Estimated Focus Score {sortField === 'focusScore' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} onClick={() => showDetail(log.id)}>
                                            <th scope="row">{log.id}</th>
                                            <td >{log.timestamp}</td>
                                            <td>{log.events}</td>
                                            <td>{log.focusScore}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <Pagination size="sm">
                                {[1, 2, 3, 4, 5].map((number) => (
                                    <Pagination.Item key={number} active={number === 1}>
                                        {number}
                                    </Pagination.Item>
                                ))}
                            </Pagination>
                        </div>
                    </motion.div>
                </div>
            )}
            {selectedLog && (
                <DistractionLogDetail log={selectedLog} onBack={handleBackToTable} closeLog={handleClose}/>
            )}
        </>
    );
};

export default DistractionLog;