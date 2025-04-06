import React from 'react';

export default function AccountCreationPage() {
  return (
    <div className="name-edit-container">
      <div className="logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </div>

      <div className="form-content">
        <label htmlFor="name-input" className="name-label">What is your name?</label>
        <input
          id="name-input"
          type="text"
          className="name-input"
          defaultValue="Woohyoung Ji"
        />
      </div>

      <div className="button-group">
        <button className="cancel-button">Cancel</button>
        <button className="continue-button">Continue</button>
      </div>
    </div>
  );
}
