require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);

// const contractABI = require('./contract-abi.js');
let contractABI = require('./contract-abi.json');
// contractABI = JSON.parse(contractABI);
const contractAddress = '0x0994e5a6C7dc61173eCDC19c3A3dc3379302D58b';

export const cropClashContract = new web3.eth.Contract(contractABI, contractAddress);
cropClashContract.handleRevert = true;

// console.log(cropClashContract);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const obj = {
        status: '👆🏽 Select a quantity to mint. Max: 10',
        address: addressArray[0]
      };
      return obj;
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message
      };
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your browser.
            </a>
          </p>
        </span>
      )
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_accounts'
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: '👆🏽 Select a quantity to mint. Max: 10'
        };
      } else {
        return {
          address: '',
          status: '🦊 Connect to Metamask using the top right button.'
        };
      }
    } catch (err) {
      return {
        address: '',
        status: '😥 ' + err.message
      };
    }
  } else {
    return {
      address: '',
      status: (
        <span>
          <p>
            {' '}
            🦊{' '}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your browser.
            </a>
          </p>
        </span>
      )
    };
  }
};

export const mintToken = async (address, qty) => {
  cropClashContract.handleRevert = true;
  const costOfNFTS = qty * 100000000000000000;
  const checkTotal = await cropClashContract.methods.maximumAllowedTokensPerPurchase().call();
  const currentBalance = await web3.eth.getBalance(address);
  if (currentBalance > costOfNFTS) {
    if (parseInt(qty) <= parseInt(checkTotal)) {
      const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        data: cropClashContract.methods.mint(address, qty).encodeABI(), //make call to NFT smart contract
        value: '0x' + costOfNFTS.toString(16)
      };

      //sign transaction via Metamask
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [ transactionParameters ]
        });

        return {
          success: true,
          status: '✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/' + txHash
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          status: '😥 Something went wrong: ' + error.message
        };
      }
    } else {
      return {
        success: false,
        status: 'Tried to mint more than maximum'
      };
    }
  } else {
    return {
      success: false,
      status: '😢 Insufficient Funds.'
    };
  }
};

export const setActive = async () => {
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    data: cropClashContract.methods.setActive(true).encodeABI() //make call to NFT smart contract
  };
  //sign transaction via Metamask
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [ transactionParameters ]
    });
    return {
      success: true,
      status: '✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/' + txHash
    };
  } catch (error) {
    return {
      success: false,
      status: '😥 Something went wrong: ' + error.message
    };
  }
};
