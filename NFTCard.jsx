import { shortAddr } from "../utils.js";

export default function NFTCard({ tokenId, meta, price, seller, isMine, onOpen }) {
  return (
    <div className="card" onClick={onOpen}>
      <div className="card-img-wrap">
        <img
          className="card-img"
          src={meta.image}
          onError={(e) => (e.target.style.opacity = 0.2)}
        />
        <div className="card-overlay">
          <button className="btn btn-sm">
            {price ? (isMine ? "Kelola" : "Beli") : "Lihat"}
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="card-id">TOKEN #{String(tokenId).padStart(4, "0")}</div>
        <div className="card-name">{meta.name || "Untitled"}</div>
        {price != null && (
          <div className="card-meta">
            <span className="price-tag">{price} ETH</span>
            {seller && <span className="seller-tag">{shortAddr(seller)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
