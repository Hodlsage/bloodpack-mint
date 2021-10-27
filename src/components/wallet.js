import React from 'react';
import { useEffect, useState } from 'react';
import { cropClashContract, connectWallet, getCurrentWalletConnected, mintToken, setActive } from '../util/interact.js';

const Wallet = () => {
  const [ walletAddress, setWallet ] = useState('');
  const [ status, setStatus ] = useState('');
  const [ message, setMessage ] = useState('');
  const [ newMessage, setNewMessage ] = useState('');
  const [ mintQty, setMintQty ] = useState(1);
  //called only once
  useEffect(async () => {
    // const message = await loadCurrentMessage();
    // setMessage(message);
    addSmartContractListener();

    const { address, status } = await getCurrentWalletConnected();
    setMessage('Connected to MetaMask');
    setWallet(address);
    setStatus(status);

    addWalletListener();
  }, []);

  function addSmartContractListener() {
    cropClashContract.events.AssetMinted({}, (error, data) => {
      if (error) {
        setStatus('😥 ' + error.message);
      } else {
        console.log(data);
        setMessage(data.returnValues[1]);
        setNewMessage('');
        setStatus('🎉 Your message has been updated!');
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          setWallet('');
          setStatus('🦊 Connect to Metamask using the top right button.');
        }
      });
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    // const { status } = await updateMessage(walletAddress, newMessage);
    // setStatus(status);
  };

  return (
    <div id="container">
      {/* <img id="logo" src={alchemylogo} /> */}
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          'Connected: ' + String(walletAddress).substring(0, 6) + '...' + String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: '50px' }}>Status:</h2>
      <p>{message}</p>

      <h2 style={{ paddingTop: '18px' }}>Mint:</h2>

      <div>
        <input type="number" placeholder="1" max="10" value={mintQty} onChange={(e) => setMintQty(e.target.value)} />
        <p id="status">{status}</p>
        <button
          onClick={() =>
            mintToken(walletAddress, mintQty).then((message) => {
              setMessage(message.status);
            })}
        >
          Mint Token
        </button>
        {/* <button onClick={() => setActive(walletAddress)}>Set Active</button> */}
      </div>
    </div>
  );
};

export default Wallet;
