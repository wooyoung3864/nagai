import React from 'react';
import WebcamFeed from '../components/WebcamFeed/WebcamFeed';
import Timer from '../components/Timer/Timer';
import GestureHelp from '../components/GestureHelp/GestureHelp';
import Distractions from '../components/distractions/Distractions';

export default function MainPage(){
    return (
        <div className="main-content">
        <div className="left-column">
          <div className="webcam-wrapper">
            <WebcamFeed />
            <GestureHelp />
            <Distractions />
          </div>
          <Timer />
        </div>
      </div>
    )
}