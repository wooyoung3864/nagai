import { useState } from "react";
import './FocusButton.css'
import '../../App.css';
import FocusLog from "../FocusLog/FocusLog";

export default function FocusButton({ focusTime }: { focusTime: string }) {
    const [isFocusLogOpen, setFocusLogOpen] = useState(false);

    return (
        <div className="focus-btn-wrap">
            <button className="focus-button" onClick={() => setFocusLogOpen(true)}>
                <h3>Focus Time: { focusTime }</h3>
            </button>

            <FocusLog
                isOpen={isFocusLogOpen}
                onClose={() => setFocusLogOpen(false)}
            />
        </div>
    )
}