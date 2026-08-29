import { useState } from "react";

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MintTab({ onMint, busy }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imgMode, setImgMode] = useState("url"); // "url" | "upload"
  const [img, setImg] = useState("");
  const [preview, setPreview] = useState("");
  const [supply, setSupply] = useState("1");
  const [fileError, setFileError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    // batasi ukuran file supaya gas mint tidak terlalu besar (gambar disimpan langsung on-chain)
    if (file.size > 300 * 1024) {
      setFileError("Ukuran file terlalu besar (maks ±300 KB). Kompres dulu gambarnya, atau pakai mode URL.");
      return;
    }
    try {
      const dataUrl = await fileToDataURL(file);
      setImg(dataUrl);
      setPreview(dataUrl);
    } catch (err) {
      setFileError("Gagal membaca file gambar.");
    }
  }

  function handleUrlChange(value) {
    setImg(value);
    setPreview(value);
  }

  function switchMode(mode) {
    setImgMode(mode);
    setImg("");
    setPreview("");
    setFileError("");
  }

  const supplyNum = Math.max(1, Math.min(50, parseInt(supply, 10) || 1));

  return (
    <section>
      <h2>Mint NFT Baru</h2>
      <div className="panel">
        <label>Nama NFT</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Genesis Rock #1" />

        <label>Deskripsi</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi singkat NFT kamu" />

        <label>Gambar</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            className={imgMode === "url" ? "btn btn-sm" : "btn btn-sm btn-ghost"}
            onClick={() => switchMode("url")}
          >
            Pakai URL
          </button>
          <button
            type="button"
            className={imgMode === "upload" ? "btn btn-sm" : "btn btn-sm btn-ghost"}
            onClick={() => switchMode("upload")}
          >
            Upload File
          </button>
        </div>

        {imgMode === "url" ? (
          <input
            value={img}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://... (link gambar publik)"
          />
        ) : (
          <>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6 }}>
              Gambar disimpan langsung on-chain, jadi usahakan file kecil (di bawah ±300 KB) supaya biaya gas tidak mahal.
            </div>
          </>
        )}
        {fileError && (
          <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>{fileError}</div>
        )}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ marginTop: 10, width: 100, height: 100, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }}
            onError={() => setFileError("URL gambar tidak valid / tidak bisa dimuat.")}
          />
        )}

        <label>Jumlah (Supply)</label>
        <input
          type="number"
          min="1"
          max="50"
          value={supply}
          onChange={(e) => setSupply(e.target.value)}
          placeholder="1"
        />
        <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6 }}>
          Tiap NFT tetap unik (token ID beda-beda), tapi pakai nama/gambar yang sama. Maks 50 sekaligus.
        </div>

        <button
          className="btn btn-full"
          style={{ marginTop: 18 }}
          disabled={busy || !name || !img}
          onClick={() => {
            onMint(name, desc, img, supplyNum);
            setName(""); setDesc(""); setImg(""); setPreview(""); setSupply("1");
          }}
        >
          {busy ? "Memproses..." : supplyNum > 1 ? `Mint ${supplyNum} NFT` : "Mint NFT"}
        </button>
      </div>
    </section>
  );
}
