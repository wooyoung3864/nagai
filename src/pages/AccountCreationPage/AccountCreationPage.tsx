import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AccountCreationPage.css';

export default function AccountCreationPage() {
  const navigate = useNavigate();
  
  const handleContinueClick = () => {
    navigate('/main');
  };

  const handleCancelClick = () => {
    navigate('/login-fail');
  };

  return (
    <motion.div
      className="accountCreation-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* logo */}
      <motion.div
        className="accountCreation-logo"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </motion.div>

      {/* naming form */}
      <motion.div
        className="accountCreation-form-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label htmlFor="accountCreation-name-input" className="accountCreation-name-label">
          What is your name?
        </label>
        <input
          id="accountCreation-name-input"
          type="text"
          className="accountCreation-name-input"
          defaultValue="Woohyoung Ji"
        />
      </motion.div>

      {/*button group*/}
      <motion.div
        className="accountCreation-button-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button className="accountCreation-cancel-button" onClick={handleCancelClick}>Cancel</button>
        <button className="accountCreation-continue-button" onClick={handleContinueClick}>Continue</button>
      </motion.div>
    </motion.div>
  );
}
