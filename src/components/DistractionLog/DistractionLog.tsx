import React, { useEffect, useState } from 'react';
import './DistractionLog.css';
import  {Table}  from 'react-bootstrap';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';


interface FocusLogProps {
    isOpen: boolean;
    onClose: () => void;
}

let active = 1;
let items = [];
for (let number = 1; number <= 5; number++) {
    items.push(
        <Pagination.Item key={number} active={number === active}>
            {number}
        </Pagination.Item>,
    );
}

const paginationBasic = (
    <div>
        <Pagination size="sm">{items}</Pagination>
    </div>
);

const changeOrder = () => {
    //changing order of items
}

const DistractionLog: React.FC<FocusLogProps> = ({ isOpen, onClose }) => {
    
    
    if (!isOpen) return null;   
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if(event.key === "Escape"){
                onClose();
            }
        };    
        window.addEventListener("keydown", handleKeyDown);    
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []); 

    return (
        <div className="modal-overlay">
            <motion.div 
                className="modal-box"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                    <div className="modal-header">
                        <button className='button' onClick={changeOrder}>
                            <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 914.033 914.033"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="1.8280660000000002"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M207.662,220.88l41.768-42.272v424.896c-0.265,16.902,1.556,171.724,150.079,298.022c9.878,8.4,21.96,12.507,33.984,12.506 c14.863-0.001,29.638-6.281,40.021-18.491c18.783-22.088,16.104-55.221-5.984-74.005c-47.693-40.557-81.191-89.007-99.565-144.003 c-13.235-39.615-13.559-68.864-13.554-71.907l0.021-0.31V179.859l42.171,41.668c10.232,10.11,23.567,15.155,36.898,15.155 c13.541,0,27.077-5.207,37.347-15.6c20.379-20.625,20.18-53.866-0.445-74.245L337.128,15.155 c-20.625-20.379-53.866-20.18-74.245,0.445L132.971,147.08c-20.379,20.625-20.18,53.866,0.445,74.245 S187.283,241.505,207.662,220.88z"></path> <path d="M664.606,310.528c0.265-16.902-1.556-171.723-150.079-298.022c-22.088-18.783-55.222-16.104-74.005,5.984 c-18.783,22.089-16.104,55.221,5.984,74.005c47.693,40.557,81.191,89.007,99.565,144.003 c13.235,39.615,13.559,68.864,13.554,71.907l-0.021,0.31v425.458l-42.171-41.668c-20.625-20.379-53.865-20.18-74.245,0.445 c-20.379,20.625-20.18,53.866,0.445,74.245l133.272,131.683c9.83,9.713,23.089,15.155,36.899,15.155c0.104,0,0.211,0,0.314-0.001 c13.924-0.083,27.244-5.695,37.03-15.599l129.912-131.48c20.379-20.625,20.18-53.866-0.445-74.245s-53.866-20.18-74.244,0.445 l-41.769,42.271L664.606,310.528L664.606,310.528z"></path> </g> </g></svg>
                        </button>
                        <h2 className="modal-title">Distraction Log</h2>
                        <button className="close-button" onClick={onClose}>✕</button>
                    </div>
                    <div className="modal-body">
                        <Table striped bordered hover>
                            <thead className='table-primary'>
                                <th scope='col'>#</th>
                                <th scope='col'>Date & Time</th>
                                <th scope='col'>Distraction Elements</th>
                                <th scope='col'>Estimated Focus Score</th>
                            </thead>
                            <tbody>
                                
                                <tr>
                                    <th scope='row'>1</th>
                                    <td>March 10, 2025, 12:13 AM</td>
                                    <td>using phone, sleeping</td>
                                    <td>20</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div className="modal-footer justify-content-center">
                        {paginationBasic}
                    </div>
            </motion.div>
        </div>
    );
};

export default DistractionLog;
