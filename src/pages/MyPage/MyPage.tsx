import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

import './MyPage.css'

export default function MyPage() {
    const handleSaveClick = () => {
        //Save name
    };
    const handleCancelClick = () => {
        //cancel editing name
    };

    const handleSignOut = () => {
        //sign out
    }

    return (
        <>
            <Navbar/>
            <div className="myPage-container">
                <div className="myPage-form-content">
                    <label htmlFor="myPage-name-input" className="myPage-name-label">Name</label>
                    <input
                        id="myPage-name-input"
                        type="text"
                        className="myPage-name-input"
                        defaultValue="Woohyoung Ji"
                    />
                </div>  
                <div className="myPage-button-group">
                    <button className="myPage-cancel-button" onClick={handleCancelClick}>Cancel</button>
                    <button className="myPage-continue-button" onClick={handleSaveClick}>Save</button>
                </div>
                <div className='myPage-container'>
                    <button className='myPage-underline' onClick={handleSignOut}>Sign out</button>
                </div>
            </div>
        </>
    );
}
