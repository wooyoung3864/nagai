import React, { useState } from "react";
import './FocusButton.css'
import '../../App.css';

export default function FocusButton(){
    const [focustime, setFocusTime] = useState("01:04:50");
    return (
        <button className="focus-button">
            <h3>Focus Time: {focustime}</h3>
        </button>
    )
}