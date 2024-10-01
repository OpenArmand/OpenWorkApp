import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Web3 from "web3";
import JobContractABI from "./JobContractABI.json";
import "./DirectContractForm.css";
import { useWalletConnection } from "./functions/useWalletConnection"; // Manages wallet connection logic
import { formatWalletAddress } from "./functions/formatWalletAddress"; // Utility function to format wallet address

const contractAddress = "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d";

export default function DirectContractForm() {
  const { walletAddress, connectWallet, disconnectWallet } = useWalletConnection();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobTaker, setJobTaker] = useState("");
  const [amount, setAmount] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loadingT, setLoadingT] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate


  const handleNavigation = () => {
    window.open(  "https://drive.google.com/file/d/1tdpuAM3UqiiP_TKJMa5bFtxOG4bU_6ts/view",
      "_blank",
    );
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.ethereum) {
      try {
        setLoadingT(true); // Start loader

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        const jobDetails = {
          title: jobTitle,
          description: jobDescription,
          type: jobType,
          jobTaker: jobTaker,
          amount: amount,
          jobGiver: fromAddress,
        };

        const response = await pinJobDetailsToIPFS(jobDetails);

        if (response && response.IpfsHash) {
          const jobDetailHash = response.IpfsHash;
          console.log("IPFS Hash:", jobDetailHash);

          const contract = new web3.eth.Contract(
            JobContractABI,
            contractAddress,
          );
          const amountInWei = web3.utils.toWei(amount, "ether");

          contract.methods
            .enterDirectContract(jobDetailHash, jobTaker)
            .send({
              from: fromAddress,
              value: amountInWei,
              gasPrice: await web3.eth.getGasPrice(),
            })
            .on("receipt", function (receipt) {
              const events = receipt.events.ContractEntered;
              if (events && events.returnValues) {
                const jobId = events.returnValues.jobId;
                console.log("Job ID from event:", jobId);

                navigate(`/job-details/${jobId}`);
              }
            })
            .on("error", function (error) {
              console.error("Error sending transaction:", error);
            })
            .finally(() => {
              setLoadingT(false); // Stop loader when done
            });
        } else {
          console.error("Failed to pin job details to IPFS");
          setLoadingT(false); // Stop loader on error
        }
      } catch (error) {
        console.error("Error sending transaction:", error);
        setLoadingT(false); // Stop loader on error
      }
    } else {
      console.error("MetaMask not detected");
      setLoadingT(false); // Stop loader if MetaMask is not detected
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

  const pinJobDetailsToIPFS = async (jobDetails) => {
    try {
      const response = await fetch('https://open-work-server-armandpoonawal1.replit.app/api/pinata/pinJobDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobDetails),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error pinning to IPFS:', error);
      return null;
    }
  };


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
                {formatWalletAddress(walletAddress)}
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
            id="connectButton"
            className="connectButton"
            style={{ width: "115px", height: "45px" }}
            onClick={connectWallet}
          />
        )}
      </header>

      <div className="form-containerDC">
        <div className="form-navigationDC">
          <Link to="/" className="backButtonDC">
            <img
              src="/back.svg"
              alt="Back"
              className="backIconDC"
              style={{ width: "45px", height: "45px" }}
            />
          </Link>
          <div className="formTitleDC">Create a Direct Contract</div>
        </div>
        <p id="pDC2">
          Enter in a contract directly with someone you know here. This gives
          access to OpenWork's dispute resolution and helps build profile
          strength for both parties.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-groupDC">
            <label></label>
            <input
              type="text"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="form-groupDC">
            <label></label>
            <textarea
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-groupDC">
            <label></label>
            <input
              type="text"
              placeholder="Job Type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            />
          </div>
          <div className="form-groupDC">
            <label></label>
            <input
              type="text"
              placeholder="Wallet Address of the Job Taker"
              value={jobTaker}
              onChange={(e) => setJobTaker(e.target.value)}
            />
          </div>
          <div className="form-groupDC amountDC">
            <label></label>
            <input
              id="amountInput"
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-buttonDC">
            Enter Contract
          </button>
        </form>
      </div>
    </>
  );
}
