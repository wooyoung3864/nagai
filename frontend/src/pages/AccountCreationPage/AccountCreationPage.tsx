import React, { ChangeEvent, JSX, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { motion } from 'framer-motion';
import './AccountCreationPage.css';

export default function AccountCreationPage(): JSX.Element {
  const navigate = useNavigate();
  const { name, setName } = useUser();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.has_set_name) {
      navigate('/main');
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.has_agreed_terms) {
      navigate('/terms');
    } else if (user?.has_set_name) {
      navigate('/main');
    }
  }, [navigate]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setError('Name cannot be empty.');
    } else if (value.length > 30) {
      setError('Name cannot exceed 30 characters.');
    } else {
      setError('');
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleContinueClick = () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (name.length > 30) {
      setError('Name cannot exceed 30 characters.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    fetch(`${import.meta.env.VITE_API_URL}/users/set-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, full_name: name }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to set name');
        return res.json();
      })
      .then(updatedUser => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate('/main');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to update name. Please try again.');
      });
  };

  const handleCancelClick = () => {
    navigate('/login-fail');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleContinueClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, error]);

  return (
    <motion.div
      className="accountCreation-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="accountCreation-logo">
        <img src="src/assets/imgs/nagai_logo.png" alt="nagai_logo" />
      </div>

      <div className="accountCreation-form-content">
        <label htmlFor="accountCreation-name-input" className="accountCreation-name-label">
          What is your name?
        </label>
        <input
          id="accountCreation-name-input"
          type="text"
          className="accountCreation-name-input"
          placeholder="John Doe"
          value={name}
          onChange={handleNameChange}
        />
        <div className="accountCreation-char-count">{name.length} / 30</div>
        {error && <div className="accountCreation-error">{error}</div>}
      </div>

      <div className="accountCreation-button-group">
        <button className="accountCreation-cancel-button" onClick={handleCancelClick}>
          Cancel
        </button>
        <button
          className="accountCreation-continue-button"
          onClick={handleContinueClick}
          disabled={!!error || !name.trim()}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
