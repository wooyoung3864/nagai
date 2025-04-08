import React, { useState } from "react";
import './FocusButton.css'
import '../../App.css';
import FocusLog from "../FocusLog/FocusLog";

export default function FocusButton(){
    const [focustime, setFocusTime] = useState("01:04:50");
    const [isFocusLogOpen, setFocusLogOpen] = useState(false);

    return (
        <div>
            <button className="FocusButton" onClick={() => setFocusLogOpen(true)}>
                <h3>Focus Time: {focustime}</h3>
            </button>

            <FocusLog
                isOpen={isFocusLogOpen}
                onClose={() => setFocusLogOpen(false)}
            />
        </div>
    )
}