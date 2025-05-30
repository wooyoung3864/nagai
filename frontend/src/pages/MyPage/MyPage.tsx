// frontend/src/pages/MyPage/Mypage.tsx
import { ChangeEvent, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import './MyPage.css';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';


export default function MyPage() {
  const { name, setName } = useUser();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(name);
  const navigate = useNavigate();
  const supabase = useSupabase();

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
    setTempName(value);
    validateName(value);
    setSuccess(false);
  };

  const handleSaveClick = () => {
    if (!tempName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (tempName.length > 30) {
      setError('Name cannot exceed 30 characters.');
      return;
    }
    setError('');
    setName(tempName);
    localStorage.setItem('userName', tempName);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleCancelClick = () => {
    if (tempName !== name) {
      setShowCancelModal(true);
    } else {
      setTempName(name);
      navigate('/main');
    }
  };

  const handleConfirmDiscard = () => {
    setTempName(name);
    setError('');
    setSuccess(false);
    setShowCancelModal(false);
  };

  const handleSignOut = async () => {
    // sign out logic
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('supabase.auth.nagai');
    navigate('/');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSaveClick();
      } else if (event.key === 'Escape') {
        if (tempName !== name && !showCancelModal) {
          setShowCancelModal(true);
        } else if (tempName === name) {
          navigate('/main');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tempName, name, navigate, showCancelModal]);

  return (
    <>
      <Navbar />
      <motion.div
        className="myPage-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="myPage-form-content">
          <label htmlFor="myPage-name-input" className="myPage-name-label">
            Name
          </label>
          <input
            id="myPage-name-input"
            type="text"
            className="myPage-name-input"
            placeholder={name}
            value={tempName}
            onChange={handleNameChange}
          />
          <div className="myPage-char-count">{tempName.length} / 30</div>
          {error && <div className="myPage-error">{error}</div>}
          {success && <div className="myPage-success">Name saved successfully.</div>}
        </div>
        <div className="myPage-button-group">
          <button className="myPage-cancel-button" onClick={handleCancelClick}>
            Cancel
          </button>
          <button
            className="myPage-continue-button"
            onClick={handleSaveClick}
            disabled={
              !!error || !tempName.trim() || tempName === name
            }
          >
            Save
          </button>
        </div>

        <button className="myPage-underline" onClick={handleSignOut}>
          Sign out
        </button>

        {showCancelModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-box-sm modal-centered"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="modal-title">Discard unsaved changes?</h3>
              <p className="modal-message">Your changes will be lost. Are you sure?</p>
              <div className="modal-footer">
                <button onClick={() => setShowCancelModal(false)} className='back-button'>No, go back</button>
                <button onClick={handleConfirmDiscard} className="danger-button">
                  Yes, discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
}
