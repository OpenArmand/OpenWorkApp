import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Web3 from "web3";
import L1ABI from "./L1ABI.json";
import JobContractABI from "./JobContractABI.json";
import "./AddUpdate.css";
import { formatWalletAddress } from "./functions/formatWalletAddress"; // Utility function to format wallet address
import { useWalletConnection } from "./functions/useWalletConnection"; // Manages wallet connection logic
import { useMobileDetection } from "./functions/useMobileDetection"; // Detects if the user is on a mobile device

const contractAddress = "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d";

export default function AddUpdate() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null); // Add state to store job details
  const [updateText, setUpdateText] = useState("");
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [account, setAccount] = useState(null); // Add this line to define the account state
  const [loadingT, setLoadingT] = useState("");
  // Using the useWalletConnection hook to handle wallet-related state and logic
  const { walletAddress, connectWallet, disconnectWallet } = useWalletConnection();
  // Detects if the user is on a mobile device
  const isMobile = useMobileDetection();

  function formatWalletAddressH(address) {
    if (!address) return "";
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}....${end}`;
  }


  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleUpdateChange = (e) => {
    setUpdateText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingT(true); // Start loader
      console.log("loaderT true!!");
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      const updateDetails = {
        jobId,
        jobTaker: fromAddress,
        jobUpdate: updateText,
        jobGiver: fromAddress,
        date: new Date().toISOString(), // Adding current timestamp
      };

      const response = await pinUpdateDetailsToIPFS(updateDetails);

      if (response && response.IpfsHash) {
        const updateHash = response.IpfsHash;
        console.log("IPFS Hash:", updateHash);

        const contract = new web3.eth.Contract(JobContractABI, contractAddress);

        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await contract.methods
          .submitWork(jobId, updateHash)
          .estimateGas({ from: fromAddress });

        await contract.methods.submitWork(jobId, updateHash).send({
          from: fromAddress,
          gas: gasEstimate,
          gasPrice: gasPrice, // Use legacy gas price
        });

        console.log("Transaction successful");
        setLoadingT(false); // Stop loader when done
        navigate(`/job-update/${jobId}`);
      } else {
        console.error("Failed to pin update details to IPFS");
        setLoadingT(false); // Stop loader on error
        console.log("loaderT false..");
      }
    } catch (error) {
      console.error("Error submitting update:", error);
      setLoadingT(false); // Stop loader on error
      console.log("loaderT false..");
    }
  };

  const handleNavigation = () => {
    window.open(
      "https://drive.google.com/file/d/1tdpuAM3UqiiP_TKJMa5bFtxOG4bU_6ts/view",
      "_blank",
    );
  };

  const pinUpdateDetailsToIPFS = async (updateDetails) => {
    const url = `https://open-work-server-armandpoonawal1.replit.app/api/pinata/pinUpdateDetails`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDetails),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error pinning to IPFS:", error);
      return null;
    }
  };


  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);

        const contractAddressl1 = "0x00844673a088cBC4d4B4D0d63a24a175A2e2E637";
        const contract = new web3.eth.Contract(L1ABI, contractAddressl1);

        const jobDetails = await contract.methods.getJobDetails(jobId).call();
        const ipfsHash = jobDetails.jobDetailHash;
        const ipfsData = await fetchFromIPFS(ipfsHash);

        setJob({
          jobId,
          employer: jobDetails.employer,
          escrowAmount: web3.utils.fromWei(jobDetails.escrowAmount, "ether"),
          isJobOpen: jobDetails.isOpen,
          title: ipfsData.title, // Add title from IPFS data
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

  if (loadingT) {
    return (
      <div className="loading-containerT">
        <div className="loading-icon">
          <img src="/OWIcon.svg" alt="Loading..." />
        </div>
        <div className="loading-message">
          <h1 id="txText">Transaction in Progress</h1>
          <p id="txSubtext">
            If the transaction goes through, we'll redirect you to your contract
          </p>
        </div>
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
            <Link className="goBack" to={`/job-update/${jobId}`}>
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

      <div className="add-update-container">
        <div className="content-wrapper">
          <div className="update-form-container">
            <div className="contract-info">
              <h2>Add New Update</h2>
            </div>
            <form className="add-update-form" onSubmit={handleSubmit}>
              <textarea
                id="update-text"
                placeholder="Job Update Description"
                value={updateText}
                onChange={handleUpdateChange}
                required
              ></textarea>

              <button type="submit" className="submit-update-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
