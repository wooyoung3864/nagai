import { useState } from 'react';
import './DistractionsButton.css';
import '../../App.css';
import DistractionLog from '../DistractionLog/DistractionLog';

export default function DistractionsButton() {
    const [cnt, _] = useState(30);
    const [isDistractionLogOpen, setDistractionLogOpen] = useState(false);

    return (
        <div className="distractions-btn-wrap">
            <button className="distractions" color='eb6565' onClick={() => setDistractionLogOpen(true)}>
                <div>
                <svg width="35px" height="30px" viewBox="0 0 512.00 512.00" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" fill="#ffffff" stroke="#ffffff" strokeWidth="0.00512">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0" fill='#eb6565'></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="23.552"></g>
                    <g id="SVGRepo_iconCarrier"><path fill="#fcd34d" d="M12.51 470.379L234.371 16.008c6.439-13.187 25.17-13.363 31.855-.299l232.51 454.371c6.064 11.849-2.542 25.92-15.853 25.92H28.512c-13.164 0-21.778-13.791-16.002-25.621z"></path>
                    <path fill="#fcd34d2B3B47" d="M284.332 173L272.15 336.498c-.911 12.233-11.567 21.411-23.8 20.499c-11.116-.828-19.706-9.707-20.499-20.499L215.668 173c-1.413-18.961 12.813-35.478 31.774-36.89s35.478 12.813 36.89 31.774c.124 1.662.109 3.5 0 5.116zM250 391.873c-17.432 0-31.564 14.131-31.564 31.564C218.436 440.869 232.568 455 250 455s31.564-14.131 31.564-31.564c0-17.432-14.132-31.563-31.564-31.563z"></path>
                    </g>
                </svg>
                </div>
                <h3>Distractions</h3>
                <div className='distraction-circle'>
                    <div className='distraction-text'>
                        {cnt}
                    </div>
                </div>
            </button>
            <DistractionLog
                isOpen={isDistractionLogOpen}
                onClose={() => setDistractionLogOpen(false)}
            />
        </div>
    );
}