import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsPage.css'


export default function TermsPage() {
  const navigate = useNavigate();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showError, setShowError] = useState(false);


  const handleContinueClick = () => {
    if(!agreePrivacy || !agreeTerms){
      //window.alert("Terms and Conditions Agreement Required!");
      setShowError(true);
      return;
    }
    setShowError(false);
    // optional: auth logic here
    navigate('/account-creation');
  };
  const handleCancelClick = () => {
    // optional: auth logic here
    navigate('/login-fail');
  };
  return (
    <div className="terms-container">
      <div className="terms-logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </div>
      <p />
      <h2>Terms and Conditions</h2>
      <p></p>
      <div className="terms-scroll-box">
        By creating an account, you agree to our Terms and Conditions. <br /><br />
        You consent to the use of your webcam for the purpose of real-time interaction and learning enhancement. <br />
        You also agree to allow the application to access and use your Google account information, such as your name and email, solely for identification purposes.
      </div>
      <label className="terms-checkbox-label">
        <input 
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />
        I have read and agree to the Terms and Conditions.
      </label>
      <h2>Privacy Agreement</h2>
      <p></p>
      <div className="terms-scroll-box">
        By continuing, you agree to the collection and use of your personal information, including your name, email, and activity data, as outlined in our Privacy Policy. <br /><br />
        Your information will be used solely for improving service quality and will not be shared with third parties without your consent.<br /><br />
        Also, the recorded video data of you will be stored for seven days on the server and removed after seven days it is recorded. 
        </div>
      <label className="terms-checkbox-label">
      <input 
          type="checkbox"
          checked={agreePrivacy}
          onChange={(e) => setAgreePrivacy(e.target.checked)}
        />
        I have read and agree to the Privacy Statement.
      </label>

      {showError && (
        <div className="terms-error-message">
          You must agree to all terms and conditions before continuing.
        </div>
      )}

      <div className="terms-button-group">
        <button className="terms-cancel-button" onClick={handleCancelClick}>Cancel</button>
        <button className="terms-continue-button" onClick={handleContinueClick}>Continue</button>
      </div>
    </div>
  );
}
