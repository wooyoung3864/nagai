import React, { ChangeEvent, JSX, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion'; 
import './MyPage.css'
import { useUser } from '../../contexts/UserContext';

export default function MyPage() {
    const { name, setName } = useUser();
    const [error, setError] = useState<string>('');
    const [tempName, setTempName] = useState<string>(name);

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
    };

    const handleCancelClick = () => {
        setTempName(name);
    };

    const handleSignOut = () => {
        //sign out
    }

    return (
        <>
            <Navbar/>
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
                <div className="myPage-char-count">{name.length} / 30</div>
                    {error && <div className="myPage-error">{error}</div>}
                </div>
                <div className="myPage-button-group">
                    <button className="myPage-cancel-button" onClick={handleCancelClick}>Cancel</button>
                    <button className="myPage-continue-button" onClick={handleSaveClick}>Save</button>
                </div>
                
                <button className='myPage-underline' onClick={handleSignOut}>Sign out</button>
            </motion.div>
        </>
    );
}
