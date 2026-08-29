import NFTCard from "../NFTCard.jsx";

export default function MarketplaceTab({ listings, onOpen }) {
  const floor = listings.length
    ? Math.min(...listings.map((l) => parseFloat(l.price)))
    : null;

  return (
    <section>
      <div className="hero">
        <div>
          <h2>Sedang Dijual</h2>
          <p>Jelajahi NFT yang di-list di marketplace ini — Sepolia testnet.</p>
        </div>
        <div className="stats">
          <div className="stat"><b>{listings.length}</b><span>Listed</span></div>
          <div className="stat"><b>{floor != null ? floor : "—"}</b><span>Floor (ETH)</span></div>
        </div>
      </div>
      {listings.length === 0 ? (
        <div className="empty-state">
          Belum ada NFT yang dijual. Mint dan list NFT pertamamu dulu.
        </div>
      ) : (
        <div className="grid">
          {listings.map((l) => (
            <NFTCard
              key={l.listingId}
              tokenId={l.tokenId}
              meta={l.meta}
              price={l.price}
              seller={l.seller}
              onOpen={() => onOpen(l)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
