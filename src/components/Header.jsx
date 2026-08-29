import { shortAddr } from "../utils.js";

export default function Header({ userAddress, onConnect }) {
  return (
    <header>
      <div className="brand">
        <div className="brand-mark">◆</div>
        <div className="brand-text">
          <h1>Forge</h1>
          <span>NFT MINI-MARKET</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="net-badge">
          <span className="pulse-dot"></span> SEPOLIA TESTNET
        </div>
        {userAddress ? (
          <div className="wallet-chip">{shortAddr(userAddress)}</div>
        ) : (
          <button className="btn" onClick={onConnect}>Connect Wallet</button>
        )}
      </div>
    </header>
  );
}
