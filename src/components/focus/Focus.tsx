import React, { useState } from "react";
import './Focus.css'

export default function Focus(){
    const [focustime, setFocusTime] = useState("01:04:50");
    return (
        <button className="FocusButton">
            <h3>Focus Time: {focustime}</h3>
        </button>
    )
}