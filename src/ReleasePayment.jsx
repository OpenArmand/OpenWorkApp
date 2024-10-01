import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Web3 from "web3";
import L1ABI from "./L1ABI.json";
import JobContractABI from "./JobContractABI.json";
import "./ReleasePayment.css";

export default function ReleasePayment() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [releaseAmount, setReleaseAmount] = useState("");
  const [note, setNote] = useState("");
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();
  const [loadingT, setLoadingT] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading state

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
        setAccount(accounts[0]); // Set account when wallet is connected
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
        const web3 = new Web3("https://erpc.xinfin.network"); // Using the specified RPC endpoint
        const contractAddress = "0x00844673a088cBC4d4B4D0d63a24a175A2e2E637";
        const contract = new web3.eth.Contract(L1ABI, contractAddress);

        // Fetch job details
        const jobDetails = await contract.methods.getJobDetails(jobId).call();
        const ipfsHash = jobDetails.jobDetailHash;
        const ipfsData = await fetchFromIPFS(ipfsHash);

        // Fetch proposed amount using getApplicationProposedAmount
        const proposedAmountWei = await contract.methods
          .getApplicationProposedAmount(jobId)
          .call();

        // Fetch escrow amount using getJobEscrowAmount
        const escrowAmountWei = await contract.methods
          .getJobEscrowAmount(jobId)
          .call();

        // Convert amounts from wei to ether
        const proposedAmount = web3.utils.fromWei(proposedAmountWei, "ether");
        const currentEscrowAmount = web3.utils.fromWei(escrowAmountWei, "ether");

        const amountReleased = proposedAmount - currentEscrowAmount;

        setJob({
          jobId,
          employer: jobDetails.employer,
          escrowAmount: currentEscrowAmount,
          isJobOpen: jobDetails.isOpen,
          totalEscrowAmount: proposedAmount,
          amountLocked: currentEscrowAmount,
          amountReleased: amountReleased,
          ...ipfsData,
        });

        setLoading(false); // Stop loading animation after fetching data
      } catch (error) {
        console.error("Error fetching job details:", error);
        setLoading(false); // Ensure loading stops even if there is an error
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

  const formatAmount = (amount) => {
    if (parseFloat(amount) === 0) return "0"; // Handle zero value without decimal
    const roundedAmount = parseFloat(amount).toFixed(2); // Rounds to 2 decimal places
    return roundedAmount.length > 5 ? roundedAmount.slice(0, 8) : roundedAmount;
  };

 
  const handleReleasePayment = async () => {
    if (window.ethereum) {
      try {
       
        setLoadingT(true); // Start loader

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        const jobContractAddress = "0xdEF4B440acB1B11FDb23AF24e099F6cAf3209a8d";
        const jobContract = new web3.eth.Contract(
          JobContractABI,
          jobContractAddress
        );

        const amountInWei = web3.utils.toWei(releaseAmount, "ether");

        jobContract.methods
          .releasePartialPayment(jobId, amountInWei)
          .send({
            from: fromAddress,
            gasPrice: await web3.eth.getGasPrice(),
          })
          .on("receipt", function (receipt) {
            console.log("Transaction successful:", receipt);
            alert("Payment released successfully!");
            navigate(-1);
          })
          .on("error", function (error) {
            console.error("Error releasing payment:", error);
            alert("Error releasing payment. Check the console for details.");
          })
          .finally(() => {
            setLoadingT(false); // Stop loader
          });
      } catch (error) {
        console.error("Error releasing payment:", error);
        alert("Error releasing payment. Check the console for details.");
        setLoadingT(false); // Stop loader on error
      }
    } else {
      console.error("MetaMask not detected");
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  if (loadingT) {
    return (
      <div className="loading-containerT">
        <div className="loading-icon"><img src="/OWIcon.svg" alt="Loading..."/></div>
        <div className="loading-message">
          <h1 id="txText">Transaction in Progress</h1>
          <p id="txSubtext">If the transaction goes through, we'll redirect you to your contract</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <img src="/OWIcon.svg" alt="Loading..." className="loading-icon" />
      </div>
    );
  }

  if (!job) {
    return <div>Loading...</div>;
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
              <div className="walletAddressText">{formatWalletAddressH(walletAddress)}</div>
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

      <div className="release-payment-container">
        <div className="form-container-release">
          <div className="heading-container-release">
            <h1 id="rel-title">Release Payment</h1>
          </div>

          <div className="job-body">
            <div className="job-detail-sectionR">
              <div className="job-detail-item">
                <p>TOTAL AMOUNT PAID TO ESCROW</p>
                <p id="fetchedAmounts">
                  {job.totalEscrowAmount}{" "}
                  <img src="/xdc.png" alt="USDC" className="usdc-iconJD" />
                </p>
              </div>
              <div className="job-detail-item">
                <p>CURRENT AMOUNT LOCKED</p>
                <p id="fetchedAmounts">
                  {formatAmount(job.amountLocked)}{" "}
                  <img src="/xdc.png" alt="USDC" className="usdc-iconJD" />
                </p>
              </div>
              <div className="job-detail-item">
                <p>AMOUNT RELEASED</p>
                <p id="fetchedAmounts">
                  {job.amountReleased}{" "}
                  <img src="/xdc.png" alt="USDC" className="usdc-iconJD" />
                </p>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label></label>
            <div className="input-with-icon">
              <input
                type="number"
                step="0.01"
                placeholder="Amount to Release"
                value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)}
              />
              <img src="/xdc.png" alt="USDC" className="usdc-icon" />
            </div>
          </div>
          <div className="form-group">
            <label></label>
            <textarea
              placeholder="Add note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="release-button"
            onClick={handleReleasePayment}
          >
            Release {releaseAmount}
            <img src="/xdc.png" alt="USDC" className="usdc-icon" />
          </button>
        </div>
      </div>
    </>
  );
}
