import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Web3 from "web3";
import L1ABI from "./L1ABI.json"; // Import the L1 contract ABI
import "./JobDeepView.css";

export default function JobInfo() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);


  const handleCopyToClipboard = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        alert("Address copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Check if user is already connected to MetaMask
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setDropdownVisible(false);
  };

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const web3 = new Web3("https://erpc.xinfin.network"); // Using the RPC URL
        const contractAddress = "0x00844673a088cBC4d4B4D0d63a24a175A2e2E637"; // Address of the OpenWorkL1 contract
        const contract = new web3.eth.Contract(L1ABI, contractAddress);

        // Fetch job details
        const jobDetails = await contract.methods.getJobDetails(jobId).call();
        const ipfsHash = jobDetails.jobDetailHash;

        // Fetch the job taker's address using the selected application ID
        const selectedApplicationID = jobDetails.selectedApplicationID;
        const jobTaker = await contract.methods
          .getApplicationApplicant(selectedApplicationID)
          .call();

        const ipfsData = await fetchFromIPFS(ipfsHash);

        setJob({
          jobId,
          employer: jobDetails.employer,
          escrowAmount: web3.utils.fromWei(jobDetails.escrowAmount, "ether"),
          isJobOpen: jobDetails.isOpen,
          taker: jobTaker,
          ...ipfsData,
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    }

    fetchJobDetails();
  }, [jobId]);

  const fetchFromIPFS = async (hash) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data from IPFS:", error);
      return {};
    }
  };

  const handleNavigation = () => {
    window.open("https://drive.google.com/file/d/1tdpuAM3UqiiP_TKJMa5bFtxOG4bU_6ts/view", "_blank");
    
  };


  function formatWalletAddress(address) {
    if (!address) return "";
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}....${end}`;
  }

  if (!job) {
    return (
      <div className="loading-container">
        <img src="/OWIcon.svg" alt="Loading..." className="loading-icon" />
      </div>
    );
  }
  return (
    <>
      <header className="headerVJ">
        <Link to="/" className="logoMarkVJ">
          <img src="/OWIcon.svg" alt="OWToken Icon" />
        </Link>
        {walletAddress ? (
          <div className="dropdownButtonContainer">
            <div
              className={`dropdownButton ${dropdownVisible ? "clicked" : ""}`}
              onClick={toggleDropdown}
            >
              <img
                src="/dropimage.svg"
                alt="Dropdown Icon"
                className="dropdownIcon"
              />
              <div className="walletAddressText">{walletAddress}</div>
              <img src="/down.svg" alt="Down Icon" className="dropdownIcon" />
            </div>
            {dropdownVisible && (
              <div className="dropdownMenu">
                <div className="dropdownMenuItem" onClick={handleNavigation}>
                  <span
                    className="dropdownMenuItemText-home"
                    style={{ color: "#868686" }}
                  >
                    Read Whitepaper
                  </span>
                  <img
                    src="/OWToken.svg"
                    alt="Cross Icon"
                    className="dropdownMenuItemIcon-home"
                  />
                </div>
                <div className="dropdownMenuItem" onClick={disconnectWallet}>
                  <span
                    className="dropdownMenuItemText"
                    style={{ color: "firebrick" }}
                  >
                    Disconnect Wallet
                  </span>
                  <img
                    src="/cross.svg"
                    alt="Cross Icon"
                    className="dropdownMenuItemIcon"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src="/connect.svg"
            alt="Connect Button"
            id="connectButtonVJ"
            className="connectButton"
            onClick={connectWallet}
          />
        )}
      </header>

      <div className="info-container">
        <div className="info-content">
          <div className="newTitle">
             <div className="titleTop">
              <Link className="goBack" to={`/job-details/${jobId}`}><img className="goBackImage" src="/back.svg" alt="Back Button" /></Link>  
              <div className="titleText">{job.title}</div>
             </div>
             <div className="titleBottom"><p>  Contract ID:{" "}
             {formatWalletAddress("0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d")}
             </p><img src="/copy.svg" className="copyImage" onClick={() =>
                     handleCopyToClipboard(
                       "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d"
                     )
                   }
                   /></div>
           </div>

          <div className="info-cardJ">
            <h2 className="sectionTitle">Job Details</h2>
            <div className="detail-row">
              <span className="detail-label">FROM</span>
              <span className="detail-value-address">
                <img src="/person.svg" alt="JobGiver" className="Job" />
                <p>{formatWalletAddress(job.employer)}</p>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">TO</span>
              <span className="detail-value-address" style={{ height: "47px" }}>
                <img src="/person.svg" alt="JobTaker" className="Job" />
                {formatWalletAddress(job.taker)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">COST</span>
              <span className="detail-value" style={{ height: "47px" }}>
                {job.escrowAmount}{" "}
                <img src="/xdc.png" alt="Info" className="infoIcon" />
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">DESCRIPTION</span>
              <div className="detail-value description-value">
                <p>Here's a list of things I need:</p>
                <ul className="description-list">
                  <p>{job.description}</p>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
