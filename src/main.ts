/* eslint-disable import/no-extraneous-dependencies */
import { OpenSeaPort, Network } from "opensea-js";
import { OrderSide } from "opensea-js/lib/types";

type PushState = typeof window.history.pushState;
type ReplaceState = typeof window.history.replaceState;

window.history.pushState = ((f) =>
  function pushState(...args: Parameters<PushState>) {
    const ret = f.apply(window.history, args);
    window.dispatchEvent(new Event("pushState"));
    window.dispatchEvent(new Event("locationChange"));
    return ret;
  })(window.history.pushState);

window.history.replaceState = ((f) =>
  function replaceState(...args: Parameters<ReplaceState>) {
    const ret = f.apply(window.history, args);
    window.dispatchEvent(new Event("replaceState"));
    window.dispatchEvent(new Event("locationChange"));
    return ret;
  })(window.history.replaceState);

window.addEventListener("popstate", () => {
  window.dispatchEvent(new Event("locationChange"));
});

function addStyle(styles: string): void {
  const css = document.createElement("style");
  css.appendChild(document.createTextNode(styles));
  document.getElementsByTagName("head")[0].appendChild(css);
}

const BUTTON_CLASS_NAME = "qubic-button";

addStyle(`
  .${BUTTON_CLASS_NAME} {
    margin-top: 8px;
    width: 100%;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 20px;
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(32, 129, 226);
    color: rgb(32, 129, 226);
  }
`);

// This example provider won't let you make transactions, only read-only calls:

const ASSET_REGEX = new RegExp("/assets/([\\d\\w]+)/([\\d\\w]+)");

async function main() {
  const [, tokenAddress, tokenId] =
    ASSET_REGEX.exec(window.location.href) || [];

  // window.alert(JSON.stringify({ tokenAddress, tokenId }));
  if (!tokenAddress || !tokenId) {
    return;
  }

  async function buyIt({
    tokenAddress,
    tokenId
  }: {
    tokenAddress: string;
    tokenId: string;
  }) {
    const seaport = new OpenSeaPort(window.ethereum, {
      networkName: Network.Rinkeby
    });
    console.log("buyIt");
    try {
      if (window.ethereum.isMetaMask) {
        window.ethereum.request({ method: "eth_requestAccounts" });
      }

      const [accountAddress] =
        ((await window.ethereum?.request({
          method: "eth_accounts"
        })) as string[]) || [];
      console.log(accountAddress);
      const { orders } = await seaport.api.getOrders({
        asset_contract_address: tokenAddress,
        token_id: tokenId,
        side: OrderSide.Sell
      });
      console.log(orders);

      const order = orders[orders.length - 1];

      // const order = await seaport.api.getOrder({ side: OrderSide.Sell, ... })
      const transactionHash = await seaport.fulfillOrder({
        order,
        accountAddress
      });
      window.alert(JSON.stringify({ transactionHash }));
    } catch (error) {
      console.error(error);
    }

    // (window as any).ReactNativeWebView?.postMessage(
    //   JSON.stringify({
    //     action: 'OPENSEA_BUY',
    //     payload: {
    //       tokenAddress,
    //       tokenId,
    //       accountAddress,
    //     },
    //   }),
    // );
  }

  function createBuyButton() {
    const buyButton = document.createElement("button");
    buyButton.innerHTML = "Buy With Qubic";
    buyButton.className = BUTTON_CLASS_NAME;
    buyButton.onclick = (event) => {
      event.preventDefault();
      buyIt({ tokenAddress, tokenId });
    };
    document
      .querySelector(".TradeStation--price-container")
      ?.parentElement?.appendChild(buyButton);
  }

  let intervalId = 0;
  window.clearInterval(intervalId);
  intervalId = window.setInterval(() => {
    if (document.querySelector(".TradeStation--price-container")) {
      window.clearInterval(intervalId);
      if (document.querySelector(`.${BUTTON_CLASS_NAME}`)) {
        return;
      }
      createBuyButton();
    }
  }, 100);
}

main();

window.addEventListener("locationChange", () => {
  main();
});

export {};
