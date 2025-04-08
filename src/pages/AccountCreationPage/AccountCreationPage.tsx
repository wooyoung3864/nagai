import React from 'react';
import './AccountCreationPage.css';

export default function AccountCreationPage() {
  return (
    <div className="accountCreation-container">
      <div className="logo">
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
        <button className="accountCreation-cancel-button">Cancel</button>
        <button className="accountCreation-continue-button">Continue</button>
      </div>
    </div>
  );
}
