import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountCreationPage.css';

export default function AccountCreationPage() {
  const navigate = useNavigate();
  
    const handleContinueClick = () => {
      // optional: auth logic here
      navigate('/main');
    };
    const handleCancelClick = () => {
      // optional: auth logic here
      navigate('/login-fail');
    };

  return (
    <div className="accountCreation-container">
      <div className="accountCreation-logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </div>

      <div className="accountCreation-form-content">
        <label htmlFor="accountCreation-name-input" className="accountCreation-name-label">What is your name?</label>
        <input
          id="accountCreation-name-input"
          type="text"
          className="accountCreation-name-input"
          defaultValue="Woohyoung Ji"
        />
      </div>

      <div className="accountCreation-button-group">
        <button className="accountCreation-cancel-button" onClick={handleCancelClick}>Cancel</button>
        <button className="accountCreation-continue-button" onClick={handleContinueClick}>Continue</button>
      </div>
    </div>
  );
}
