import React, { useEffect, useState } from 'react';
import './DistractionLog.css';
import { Table } from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import DistractionLogEntry from './DistractionLogEntry/DistractionLogEntry';

interface FocusLogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface LogEntry {
    id: number;
    timestamp: string;
    events: string;
    focusScore: number;
}

const DistractionLog: React.FC<FocusLogProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [sortField, setSortField] = useState<keyof LogEntry>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
        // Simulated fetch data
        setLogs([
            {
                id: 1,
                timestamp: 'March 10, 2025, 12:13 AM',
                events: 'using phone, sleeping',
                focusScore: 20,
            },
            {
                id: 2,
                timestamp: 'March 11, 2025, 10:05 PM',
                events: 'tab switching, looking away',
                focusScore: 40,
            },
        ]);
    }, []);

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

    if (!isOpen) return null;

    return (
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
                                <tr key={log.id}>
                                    <th scope="row">{log.id}</th>
                                    <td>{log.timestamp}</td>
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
    );
};

export default DistractionLog;