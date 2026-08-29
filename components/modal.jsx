import { shortAddr } from "../utils.js";

export default function Modal({ item, userAddress, onClose, onBuy, onCancel }) {
  if (!item) return null;
  const isMine =
    userAddress && item.seller && item.seller.toLowerCase() === userAddress.toLowerCase();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal">
          <img
            className="modal-img"
            src={item.meta.image}
            onError={(e) => (e.target.style.opacity = 0.2)}
          />
          <div className="modal-body">
            <div className="card-id">TOKEN #{String(item.tokenId).padStart(4, "0")}</div>
            <h2 style={{ margin: "6px 0" }}>{item.meta.name || "Untitled"}</h2>
            <p className="desc-text">{item.meta.description || "Tidak ada deskripsi."}</p>
            {item.price != null && (
              <>
                <div className="card-meta" style={{ marginBottom: 16 }}>
                  <span className="price-tag" style={{ fontSize: 18 }}>{item.price} ETH</span>
                  <span className="seller-tag">Seller: {shortAddr(item.seller)}</span>
                </div>
                {isMine ? (
                  <button className="btn btn-danger btn-full" onClick={() => onCancel(item)}>
                    Batalkan Listing
                  </button>
                ) : (
                  <button className="btn btn-full" onClick={() => onBuy(item)}>
                    Beli Sekarang
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
