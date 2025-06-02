import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './TermsPage.css';
import logo from '../../assets/imgs/nagai_logo.png'

export default function TermsPage() {
  const navigate = useNavigate();

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showError, setShowError] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);

  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.has_agreed_terms) {
      if (!user?.has_set_name) {
        navigate('/create-account');
      } else {
        navigate('/main');
      }
    }
  }, [navigate]);

  const handleAgreeAllChange = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setShowError(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.has_agreed_terms) {
      navigate('/create-account');
    }
  }, []);

  const handleAgreeIndividualCheck = (type: 'terms' | 'privacy', checked: boolean) => {
    if (type === 'terms') setAgreeTerms(checked);
    if (type === 'privacy') setAgreePrivacy(checked);

    if (!checked) {
      setAgreeAll(false);
    } else if ((type === 'terms' && agreePrivacy) || (type === 'privacy' && agreeTerms)) {
      setAgreeAll(true);
    }
  };

  const handleContinueClick = () => {
    if (!agreePrivacy || !agreeTerms) {
      setShowError(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    fetch(`https://${import.meta.env.VITE_API_URL}/users/agree-terms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update agreement status');
        return res.json();
      })
      .then(updatedUser => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/create-account');
      })
      .catch(err => {
        console.error(err);
        setShowError(true);
      });
  };

  const handleCancelClick = () => {
    navigate('/login-fail');
  };

  return (
    <motion.div
      className="terms-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="terms-logo">
        <img src={logo} alt="nagai_logo" />
      </div>

      {/* Terms Section */}
      <div className="terms-accordion-card">
        <motion.div
          className="terms-accordion-header"
          onClick={() => setOpenTerms(!openTerms)}
        >
          <span>Terms and Conditions</span>
          <span>{openTerms ? '▲' : '▼'}</span>
        </motion.div>

        {openTerms && (
          <motion.div
            className="terms-scroll-box-wrapper"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="terms-scroll-box">
              By creating an account, you agree to our Terms and Conditions. <br /><br />
              You consent to the use of your webcam for the purpose of real-time interaction and learning enhancement. <br />
              You also agree to allow the application to access and use your Google account information, such as your name and email, solely for identification purposes.
            </div>
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => handleAgreeIndividualCheck('terms', e.target.checked)}
              />
              I have read and agree to the Terms and Conditions.
            </label>
          </motion.div>
        )}
      </div>

      {/* Privacy Section */}
      <div className="terms-accordion-card">
        <div className="terms-accordion-header" onClick={() => setOpenPrivacy(!openPrivacy)}>
          <span>Privacy Agreement</span>
          <span>{openPrivacy ? '▲' : '▼'}</span>
        </div>

        {openPrivacy && (
          <motion.div
            className="terms-scroll-box-wrapper"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="terms-scroll-box">
              By continuing, you agree to the collection and use of your personal information, including your name, email, and activity data, as outlined in our Privacy Policy. <br /><br />
              Your information will be used solely for improving service quality and will not be shared with third parties without your consent. <br /><br />
              Also, the recorded video data of you will be stored for seven days on the server and removed after seven days it is recorded.
            </div>
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => handleAgreeIndividualCheck('privacy', e.target.checked)}
              />
              I have read and agree to the Privacy Statement.
            </label>
          </motion.div>
        )}
      </div>

      <div className="accordion-card agree-all-wrapper">
        <label className="terms-checkbox-label">
          <input
            type="checkbox"
            checked={agreeAll}
            onChange={(e) => handleAgreeAllChange(e.target.checked)}
          />
          Agree to all
        </label>

        {showError && (
          <div className="terms-error-message">
            You must agree to all terms and conditions before continuing.
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="terms-button-group">
        <button className="terms-cancel-button" onClick={handleCancelClick}>Cancel</button>
        <button className="terms-continue-button" onClick={handleContinueClick}>Continue</button>
      </div>
    </motion.div>
  );
}
