import React from 'react';

export default function TermsPage() {
  return (
    <div className="terms-container">
      <div className="logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </div>
      <h2>Terms and Conditions</h2>

      <div className="scroll-box">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
      </div>
      <label className="checkbox-label">
        <input type="checkbox" />
        I have read and agree to the Terms and Conditions.
      </label>

      <div className="scroll-box">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Morbi in orci ac odio ultrices ullamcorper. Cras...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
        Praesent feugiat metus ut lorem blandit, nec semper leo tincidunt...
      </div>
      <label className="checkbox-label">
        <input type="checkbox" />
        I have read and agree to the Privacy Statement.
      </label>

      <div className="button-group">
        <button className="cancel-button">Cancel</button>
        <button className="continue-button">Continue</button>
      </div>
    </div>
  );
}
