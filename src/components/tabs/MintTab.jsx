import { useState } from "react";

// Kecilkan & kompres gambar lewat canvas supaya ukurannya kecil (aman buat disimpan on-chain),
// apapun ukuran/resolusi file aslinya.
function resizeImageFile(file, maxDim = 220, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        } else {
          if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
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
  const [processing, setProcessing] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    setProcessing(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setImg(dataUrl);
      setPreview(dataUrl);
    } catch (err) {
      setFileError("Gagal memproses gambar. Coba file lain.");
    }
    setProcessing(false);
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
              {processing
                ? "Memproses & mengecilkan gambar..."
                : "Gambar otomatis dikecilkan & dikompres sebelum disimpan on-chain, jadi ukuran file asli tidak masalah."}
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
          disabled={busy || processing || !name || !img}
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
