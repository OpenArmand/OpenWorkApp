import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  return (
    <main className="container">
      <header className="header">
        <img src="/Logo.jpg" alt="Openwork Logo" id="logo" />
        {walletAddress ? (
          <div className="walletAddress">{walletAddress}</div>
        ) : (
          <img 
            src="/connect.svg" 
            alt="Connect Button" 
            id="connectButton" 
            onClick={connectWallet} 
          />
        )}
      </header>
      <img src="/RadiantGlow.png" alt="Radiant Glow" id="radiantGlow" />
      <img src="/Core.png" alt="The Core" id="core" />
      <Link to="/direct-contract" id="buttonLeft" className="buttonContainer">
        <img src="/Core.png" alt="Button Left" className="buttonImage" />
        <img src="/dc.svg" alt="Icon" className="buttonIcon" />
        <span className="buttonText">Direct Contract</span>
      </Link>
      <div id="buttonRight" className="buttonContainer">
        <img src="/Core.png" alt="Button Right" className="buttonImage" />
        <img src="/jobs.svg" alt="Icon" className="buttonIcon" />
        <span className="buttonText">View Jobs</span>
      </div>
    </main>
  );
}

export default MainPage;
