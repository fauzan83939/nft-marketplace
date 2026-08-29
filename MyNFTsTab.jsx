import { useState } from "react";

export default function MyNFTsTab({ owned, onOpen, onList }) {
  const [prices, setPrices] = useState({});

  return (
    <section>
      <h2>NFT Milik Saya</h2>
      {owned.length === 0 ? (
        <div className="empty-state">Kamu belum punya NFT. Coba mint dulu di tab Mint.</div>
      ) : (
        <div className="grid">
          {owned.map((o) => (
            <div className="card" key={o.tokenId}>
              <div className="card-img-wrap" onClick={() => onOpen(o)}>
                <img
                  className="card-img"
                  src={o.meta.image}
                  onError={(e) => (e.target.style.opacity = 0.2)}
                />
              </div>
              <div className="card-body">
                <div className="card-id">TOKEN #{String(o.tokenId).padStart(4, "0")}</div>
                <div className="card-name">{o.meta.name}</div>
                <div className="list-row" onClick={(e) => e.stopPropagation()}>
                  <input
                    placeholder="Harga (ETH)"
                    value={prices[o.tokenId] || ""}
                    onChange={(e) => setPrices({ ...prices, [o.tokenId]: e.target.value })}
                  />
                  <button className="btn btn-sm" onClick={() => onList(o.tokenId, prices[o.tokenId])}>
                    List
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
