import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import DirectContractForm from "./DirectContractForm";
import ViewJobs from "./ViewJobs";
import SingleJobDetails from "./SingleJobDetails";
import JobDeepView from "./JobDeepView";
import ReleasePayment from "./ReleasePayment";
import JobUpdate from "./JobUpdate";
import AddUpdate from "./AddUpdate";

// Importing custom hooks and utility functions to modularize the logic for better separation of concerns
import { useWalletConnection } from "./functions/useWalletConnection"; // Manages wallet connection logic
import { useDropdown } from "./functions/useDropdown"; // Manages dropdown visibility and toggling
import { useHoverEffect } from "./functions/useHoverEffect"; // Manages hover states for radial buttons
import { useMobileDetection } from "./functions/useMobileDetection"; // Detects if the user is on a mobile device
import { formatWalletAddress } from "./functions/formatWalletAddress"; // Utility function to format wallet address
import { useButtonHover } from "./functions/useButtonHover"; // Custom hook for handling button hover events

function MainPage() {
  // Using the useWalletConnection hook to handle wallet-related state and logic
  const { walletAddress, connectWallet, disconnectWallet } = useWalletConnection();

  // Using the useDropdown hook to manage dropdown visibility state
  const { dropdownVisible, toggleDropdown } = useDropdown();

  // Using the useHoverEffect hook to manage the button hover effects
  const { hovering, setHovering, buttonsVisible, setButtonsVisible, buttonFlex } = useHoverEffect();

  // Detects if the user is on a mobile device
  const isMobile = useMobileDetection();

  // State to track if the core element is being hovered over
  const [coreHovered, setCoreHovered] = useState(false);

  // Hook from react-router-dom to handle navigation between pages
  const navigate = useNavigate();

  // Function to navigate to the View Jobs page, passing state if needed
  const handleViewJobs = () => {
    navigate("/view-jobs", { state: { jobs, loading } });
  };

  // Initializing hover effect logic for buttons using a custom hook
  useButtonHover();

  // Function to handle navigation to the whitepaper when selected in the dropdown menu
  const handleNavigation = () => {
    window.open("https://drive.google.com/file/d/1tdpuAM3UqiiP_TKJMa5bFtxOG4bU_6ts/view", "_blank");
  };

  return (
    <main className="container-home">
      {/* Conditional rendering of the mobile warning if the user is on a mobile device */}
      {isMobile && (
        <div className="mobile-warning" style={{ height: '1000px', width: '100%', fontFamily: 'Satoshi', fontSize: '25px' }} >
          {/* Header section for the mobile warning */}
          <div style={{height: '64px', width: '100%', borderBottom:'2px solid whitesmoke', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img style={{ height: '25px', width: '180px' }} src="/Logo.jpg" alt="Openwork Logo" id="logo-home"/>
          </div>
          <div id="warning-body">
            <img style={{ height: '80px', width: '80px' }} src="/screen.svg" alt="Openwork Logo" id="logo-home"/>
            <h1 id="mobile-heading">Desktop Only Feature</h1>
            <p id="mobile-sub">This feature is currently not supported on mobile devices</p>
          </div>
        </div>
      )}

      <header className="header-home">
        {/* Logo for the desktop view */}
        <img
          src="/Logo.jpg"
          alt="Openwork Logo"
          id="logo-home"
          className={`logo-home ${hovering ? "hidden-home" : "visible-home"}`} // Toggle visibility on hover
        />
        {/* OWToken icon */}
        <img
          src="/OWIcon.svg"
          alt="OWToken Icon"
          id="owToken-home"
          className={hovering ? "visible-home" : ""} // Visibility depends on hover state
        />

        {/* Wallet connected, display the wallet address and dropdown menu */}
        {walletAddress ? (
          <div className="dropdownButtonContainer-home">
            <div className={`dropdownButton-home ${dropdownVisible ? "clicked-home" : ""}`} onClick={toggleDropdown}>
              <img src="/dropimage.svg" alt="Dropdown Icon" className="dropdownIcon-home" />
              {/* Formatted wallet address is displayed */}
              <div className="walletAddressText-home">{formatWalletAddress(walletAddress)}</div>
              <img src="/down.svg" alt="Down Icon" className="dropdownIcon-home" />
            </div>

            {/* Dropdown menu visible when dropdown is active */}
            {dropdownVisible && (
              <div className="dropdownMenu-home">
                <div className="dropdownMenuItem-home" onClick={handleNavigation}>
                  <span className="dropdownMenuItemText-home" style={{ color: "#868686" }}>Read Whitepaper</span>
                  <img src="/OWToken.svg" alt="Cross Icon" className="dropdownMenuItemIcon-home" />
                </div>
                <div className="dropdownMenuItem-home" onClick={disconnectWallet}>
                  <span className="dropdownMenuItemText-home" style={{ color: "firebrick" }}>Disconnect Wallet</span>
                  <img src="/cross.svg" alt="Cross Icon" className="dropdownMenuItemIcon-home" />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Connect button if no wallet is connected
          <img src="/connect.svg" alt="Connect Button" id="connectButton-home" className="connectButton-home" onClick={connectWallet} />
        )}
      </header>

      {/* Radial menu section */}
      <div className="theCircle-home">
        <img src="/RadiantGlow.png" alt="Radiant Glow" id="radiantGlow-home" />

        {/* Core element with hover effects */}
        <div
          id="core-home"
          onMouseEnter={() => {
            setButtonsVisible(true);
            setCoreHovered(true);
          }}
          onMouseLeave={() => {
            setButtonsVisible(false);
            setCoreHovered(false);
          }}
        >
          <img src="/core.svg" alt="The Core" className="core-image" />
          <img src="/core-hovered2.svg" alt="The Core Hovered" className="core-image core-hovered-image" />
        </div>


        {/* Left button with hover functionality */}
        <Link
          to="/direct-contract"
          id="buttonLeft-home"
          className={`buttonContainer-home ${buttonsVisible ? "visible-home" : ""}`}
          onMouseEnter={() => setButtonsVisible(true)} // Show buttons on hover
          onMouseLeave={() => setButtonsVisible(false)} // Hide buttons on hover out
          style={{ display: buttonFlex ? "flex" : undefined }} // Conditionally apply flex display
        >
          <img src="/radial-button.svg" alt="Button Left" className="buttonImage-home" />
          <img src="/dc.svg" alt="Icon" className="buttonIcon-home" />
          <span className="buttonText-home2">Direct Contract</span>
        </Link>

        {/* Right button with hover functionality */}
        <Link
          to="/view-jobs"
          id="buttonRight-home"
          className={`buttonContainer-home ${buttonsVisible ? "visible-home" : ""}`}
          onMouseEnter={() => setButtonsVisible(true)}
          onMouseLeave={() => setButtonsVisible(false)}
          style={{ display: buttonFlex ? "flex" : undefined }}
        >
          <img src="/radial-button.svg" alt="Button Right" className="buttonImage-home" />
          <img src="/jobs.svg" alt="Icon" className="buttonIcon-home" />
          <span className="buttonText-home2">View Jobs</span>
        </Link>

        {/* Hover text prompting user to hover over the radial menu */}
        <div id="hoverText-home" style={{ display: buttonFlex ? "none" : "flex" }}>Hover to get started</div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Define routes for different pages */}
      <Route path="/" element={<MainPage />} />
      <Route path="/direct-contract" element={<DirectContractForm />} />
      <Route path="/view-jobs" element={<ViewJobs />} />
      <Route path="/job-details/:jobId" element={<SingleJobDetails />} />
      <Route path="/job-deep-view/:jobId" element={<JobDeepView />} />
      <Route path="/release-payment/:jobId" element={<ReleasePayment />} />
      <Route path="/job-update/:jobId" element={<JobUpdate />} />
      <Route path="/add-update/:jobId" element={<AddUpdate />} />
    </Routes>
  );
}
