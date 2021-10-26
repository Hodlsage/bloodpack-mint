import "./styles.css";
import { useState } from "react";
import "./main";

export default function App() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenId, setTokenId] = useState("");

  return (
    <div className="App">
      <h1>Opensea sdk test</h1>
      <input
        type="text"
        placeholder="tokenAddress"
        onChange={(event) => {
          setTokenAddress(event.target.value);
        }}
      />
      <br />
      <input
        type="text"
        placeholder="tokenId"
        onChange={(event) => {
          setTokenId(event.target.value);
        }}
      />
      <br />
      <button
        onClick={() => {
          const url = new URL(window.location.href);
          url.pathname = `assets/${tokenAddress}/${tokenId}`;
          window.history.pushState({}, "", url.toString());
        }}
      >
        go
      </button>
      <div className="container">
        <div className="TradeStation--price-container">
          TradeStation--price-container
        </div>
      </div>
    </div>
  );
}
