import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";

import Header from "./components/Header.jsx";
import Tabs from "./components/Tabs.jsx";
import Modal from "./components/Modal.jsx";
import ToastWrap from "./components/ToastWrap.jsx";
import MarketplaceTab from "./components/tabs/MarketplaceTab.jsx";
import MintTab from "./components/tabs/MintTab.jsx";
import MyNFTsTab from "./components/tabs/MyNFTsTab.jsx";

import {
  NFT_ADDRESS, MARKETPLACE_ADDRESS, NFT_ABI, MARKET_ABI,
  SEPOLIA_CHAIN_ID, SEPOLIA_RPC, CONFIGURED
} from "./config.js";
import { fetchMetadata, buildDataURI } from "./utils.js";

export default function App() {
  const [tab, setTab] = useState("market");
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [listings, setListings] = useState([]);
  const [owned, setOwned] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [busy, setBusy] = useState(false);

  function toast(msg, type = "pending") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
    return id;
  }
  function removeToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  // read-only provider dipakai untuk browsing marketplace tanpa perlu connect wallet
  const readProvider = useMemo(() => new ethers.JsonRpcProvider(SEPOLIA_RPC), []);
  const readMarket = useMemo(() => new ethers.Contract(MARKETPLACE_ADDRESS, MARKET_ABI, readProvider), [readProvider]);
  const readNft = useMemo(() => new ethers.Contract(NFT_ADDRESS, NFT_ABI, readProvider), [readProvider]);

  const loadMarketplace = useCallback(async () => {
    if (!CONFIGURED) return;
    try {
      const count = Number(await readMarket.listingCount());
      const items = [];
      for (let i = 1; i <= count; i++) {
        const l = await readMarket.listings(i);
        if (!l.active) continue;
        let meta = { name: "Untitled", image: "", description: "" };
        try {
          const uri = await readNft.tokenURI(l.tokenId);
          meta = await fetchMetadata(uri);
        } catch (e) {}
        items.push({
          listingId: i,
          tokenId: Number(l.tokenId),
          price: ethers.formatEther(l.price),
          priceWei: l.price,
          seller: l.seller,
          meta
        });
      }
      setListings(items);
    } catch (e) {
      console.error(e);
    }
  }, [readMarket, readNft]);

  const loadMyNFTs = useCallback(async () => {
    if (!CONFIGURED || !userAddress || !nftContract) { setOwned([]); return; }
    const total = Number(await nftContract.totalSupply());
    const items = [];
    for (let i = 1; i <= total; i++) {
      try {
        const owner = await nftContract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const uri = await nftContract.tokenURI(i);
          const meta = await fetchMetadata(uri);
          items.push({ tokenId: i, meta });
        }
      } catch (e) {}
    }
    setOwned(items);
  }, [userAddress, nftContract]);

  useEffect(() => { loadMarketplace(); }, [loadMarketplace]);
  useEffect(() => {
    if (tab === "mine") loadMyNFTs();
    if (tab === "market") loadMarketplace();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function connectWallet() {
    if (!window.ethereum) {
      toast("MetaMask tidak terdeteksi. Install dulu ekstensinya.", "err");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
          });
        } catch (switchErr) {
          if (switchErr.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia",
                nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                rpcUrls: [SEPOLIA_RPC],
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
              }]
            });
          }
        }
      }
      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      setSigner(s);
      setUserAddress(addr);
      setNftContract(new ethers.Contract(NFT_ADDRESS, NFT_ABI, s));
      setMarketContract(new ethers.Contract(MARKETPLACE_ADDRESS, MARKET_ABI, s));
      toast("Wallet terhubung ke Sepolia", "ok");
    } catch (e) {
      console.error(e);
      toast("Gagal connect: " + (e.message || e), "err");
    }
  }

  async function handleMint(name, desc, img) {
    if (!signer) { toast("Connect wallet dulu", "err"); return; }
    setBusy(true);
    const id = toast("Mengirim transaksi mint...", "pending");
    try {
      const uri = buildDataURI(name, desc, img);
      const tx = await nftContract.mintNFT(userAddress, uri);
      await tx.wait();
      removeToast(id);
      toast("NFT berhasil di-mint!", "ok");
      loadMyNFTs(); loadMarketplace();
    } catch (e) {
      console.error(e);
      removeToast(id);
      toast("Mint gagal: " + (e.shortMessage || e.message || e), "err");
    }
    setBusy(false);
  }

  async function handleList(tokenId, priceStr) {
    if (!signer) { toast("Connect wallet dulu", "err"); return; }
    if (!priceStr || isNaN(priceStr)) { toast("Isi harga yang valid", "err"); return; }
    const id = toast("Approve NFT ke marketplace...", "pending");
    try {
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();
      const listTx = await marketContract.listItem(NFT_ADDRESS, tokenId, ethers.parseEther(priceStr));
      await listTx.wait();
      removeToast(id);
      toast(`NFT #${tokenId} berhasil di-list seharga ${priceStr} ETH`, "ok");
      loadMyNFTs(); loadMarketplace();
    } catch (e) {
      console.error(e);
      removeToast(id);
      toast("Listing gagal: " + (e.shortMessage || e.message || e), "err");
    }
  }

  async function handleBuy(item) {
    if (!signer) { toast("Connect wallet dulu", "err"); return; }
    const id = toast("Membeli NFT...", "pending");
    try {
      const tx = await marketContract.buyItem(item.listingId, { value: item.priceWei });
      await tx.wait();
      removeToast(id);
      toast("Pembelian berhasil!", "ok");
      setModalItem(null);
      loadMarketplace(); loadMyNFTs();
    } catch (e) {
      console.error(e);
      removeToast(id);
      toast("Beli gagal: " + (e.shortMessage || e.message || e), "err");
    }
  }

  async function handleCancel(item) {
    if (!signer) { toast("Connect wallet dulu", "err"); return; }
    const id = toast("Membatalkan listing...", "pending");
    try {
      const tx = await marketContract.cancelListing(item.listingId);
      await tx.wait();
      removeToast(id);
      toast("Listing dibatalkan", "ok");
      setModalItem(null);
      loadMarketplace();
    } catch (e) {
      console.error(e);
      removeToast(id);
      toast("Gagal cancel: " + (e.shortMessage || e.message || e), "err");
    }
  }

  return (
    <>
      <div className="ledger-strip"></div>
      <Header userAddress={userAddress} onConnect={connectWallet} />
      <Tabs active={tab} onChange={setTab} />
      <main>
        {!CONFIGURED && (
          <div className="config-warning">
            ⚠ Alamat contract belum diisi. Deploy dulu MyNFT.sol dan Marketplace.sol ke Sepolia,
            lalu isi NFT_ADDRESS dan MARKETPLACE_ADDRESS di <code>src/config.js</code>.
            Lihat README.md untuk panduan lengkap.
          </div>
        )}
        {tab === "market" && <MarketplaceTab listings={listings} onOpen={(l) => setModalItem(l)} />}
        {tab === "mine" && (
          <MyNFTsTab owned={owned} onOpen={(o) => setModalItem({ ...o, price: null })} onList={handleList} />
        )}
        {tab === "mint" && <MintTab onMint={handleMint} busy={busy} />}
      </main>
      <Modal item={modalItem} userAddress={userAddress} onClose={() => setModalItem(null)} onBuy={handleBuy} onCancel={handleCancel} />
      <ToastWrap toasts={toasts} />
    </>
  );
}
