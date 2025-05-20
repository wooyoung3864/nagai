import React from 'react';
import { motion } from 'framer-motion';
import './DistractionLog.css';
import { Button } from 'react-bootstrap';
import distractionImg from '../../assets/imgs/joo_studying.jpg';

interface LogEntry {
  id: number;
  timestamp: string;
  events: string;
  focusScore: number;
}

interface DetailModalProps {
  log: LogEntry;
  onBack: () => void;
  closeLog: () => void;
}

const DistractionLogDetail: React.FC<DetailModalProps> = ({ log, onBack, closeLog }) => {
  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-box scrollable distraction-log-expanded"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Distraction Detail - #{log.id}</h2>
          <button className="close-button" onClick={closeLog}>✕</button>
        </div>
        <div className="modal-body">
          <p><strong>Date & Time:</strong> {log.timestamp}</p>
          <p><strong>Distraction Elements:</strong> {log.events}</p>
          <p><strong>Focus Score:</strong> {log.focusScore}</p>
        </div>
        <div  className='justify-content-center'>
            <img className='distraction-img' src={distractionImg} alt='Images are deleted after 7 days'></img>
        </div>
        <div className="modal-footer justify-content-center">
          <Button variant="secondary" onClick={onBack}>← Back to Log</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DistractionLogDetail;
