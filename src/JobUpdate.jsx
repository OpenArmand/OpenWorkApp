import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Web3 from "web3";
import L1ABI from "./L1ABI.json";
import "./JobUpdate.css";

export default function JobUpdate() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  function formatWalletAddressH(address) {
    if (!address) return "";
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}....${end}`;
  }

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
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
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

  function formatWalletAddress(address) {
    if (!address) return "";
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}....${end}`;
  }

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

  const toggleCardExpansion = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  function formatWalletAddressH(address) {
    if (!address) return "";
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}....${end}`;
  }

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const web3 = new Web3(
          new Web3.providers.HttpProvider("https://erpc.xinfin.network"),
        );

        const contractAddress = "0x00844673a088cBC4d4B4D0d63a24a175A2e2E637";
        const contract = new web3.eth.Contract(L1ABI, contractAddress);

        const jobDetails = await contract.methods.getJobDetails(jobId).call();
        const ipfsHash = jobDetails.jobDetailHash;
        const ipfsData = await fetchFromIPFS(ipfsHash);

        setJob({
          jobId,
          employer: jobDetails.employer,
          escrowAmount: web3.utils.fromWei(jobDetails.escrowAmount, "ether"),
          isJobOpen: jobDetails.isOpen,
          title: ipfsData.title,
          jobTaker: ipfsData.jobTaker, // Fetch jobTaker from IPFS data
          ...ipfsData,
        });

        const submissionIDs = await contract.methods
          .getJobSubmissionIDs(jobId)
          .call();
        const jobUpdates = await Promise.all(
          submissionIDs.map(async (submissionID) => {
            const submission = await contract.methods
              .getWorkSubmission(submissionID)
              .call();
            const submissionHash = submission.submissionHash;
            const submissionData = await fetchFromIPFS(submissionHash);
            return {
              ...submission,
              ...submissionData,
            };
          }),
        );

        setUpdates(jobUpdates);
        setLoading(false); // Stop loading animation after fetching data
      } catch (error) {
        console.error("Error fetching job details and updates:", error);
        setLoading(false); // Ensure loading stops even if there is an error
      }
    }

    fetchJobDetails();
  }, [jobId]);

  const handleNavigation = () => {
    window.open(
      "https://drive.google.com/file/d/1tdpuAM3UqiiP_TKJMa5bFtxOG4bU_6ts/view",
      "_blank",
    );
  };

  const fetchFromIPFS = async (hash) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data from IPFS:", error);
      return {};
    }
  };

  if (loading) {
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
              <div className="walletAddressText">
                {formatWalletAddressH(walletAddress)}
              </div>
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

      {job && (
        <div className="newTitle">
          <div className="titleTop">
            <Link className="goBack" to={`/job-details/${jobId}`}>
              <img className="goBackImage" src="/back.svg" alt="Back Button" />
            </Link>
            <div className="titleText">{job.title}</div>
          </div>
          <div className="titleBottom">
            <p>
              {" "}
              Contract ID:{" "}
              {formatWalletAddress(
                "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d",
              )}
            </p>
            <img
              src="/copy.svg"
              className="copyImage"
              onClick={() =>
                handleCopyToClipboard(
                  "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d",
                )
              }
            />
          </div>
        </div>
      )}

      <div className="job-update-container">
        <div className="job-update-main">
          <div className="job-update-header">
            <h1>Job Updates</h1>
            {walletAddress.toLowerCase() === job?.jobTaker.toLowerCase() && (
              <Link to={`/add-update/${jobId}`} className="add-update-button">
                <img
                  src="/AddUpdateButton.svg"
                  alt="Add New Update"
                  className="add-update-image"
                />
              </Link>
            )}
          </div>

          <div className="job-update-content">
            {updates.length > 0 ? (
              updates.map((update, index) => (
                <div key={index} className="job-update-card">
                  <div className="job-update-info">
                    <img
                      src="/person.svg"
                      alt="Person Icon"
                      className="personIcon"
                    />
                    <p className="job-update-text">
                      <strong>{formatWalletAddress(update.worker)}</strong>{" "}
                      submitted work!
                    </p>
                    <img
                      src="/down.svg"
                      alt="Expand Icon"
                      className="downIcon"
                      onClick={() => toggleCardExpansion(index)}
                    />
                  </div>
                  <p className="job-update-date">
                    {new Date(update.date).toLocaleDateString()}
                  </p>
                  {expandedCard === index && (
                    <div className="job-update-details">
                      <p className="submission-title">SUBMISSION</p>
                      <p className="submission-description">
                        {update.jobUpdate}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No updates given yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
