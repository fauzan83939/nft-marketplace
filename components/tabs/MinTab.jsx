import { useState } from "react";

export default function MintTab({ onMint, busy }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");

  return (
    <section>
      <h2>Mint NFT Baru</h2>
      <div className="panel">
        <label>Nama NFT</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Genesis Rock #1" />
        <label>Deskripsi</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi singkat NFT kamu" />
        <label>URL Gambar</label>
        <input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://... (link gambar publik)" />
        <button
          className="btn btn-full"
          style={{ marginTop: 18 }}
          disabled={busy || !name || !img}
          onClick={() => {
            onMint(name, desc, img);
            setName(""); setDesc(""); setImg("");
          }}
        >
          {busy ? "Memproses..." : "Mint NFT"}
        </button>
      </div>
    </section>
  );
}
