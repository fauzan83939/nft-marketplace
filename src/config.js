export const NFT_ADDRESS = "0xe7e935C136EaE0c39de3E469bB162a72b76Ab78C";
export const MARKETPLACE_ADDRESS = "0x9883235BFdAD7405290e484f2fc35d07aF15A88F";

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
export const SEPOLIA_RPC = "https://rpc.sepolia.org";

export const NFT_ABI = [
  "function mintNFT(address recipient, string tokenURI) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)"
];

export const MARKET_ABI = [
  "function listItem(address nftContract, uint256 tokenId, uint256 price) external returns (uint256)",
  "function buyItem(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function listingCount() external view returns (uint256)",
  "function listings(uint256) external view returns (address seller,address nftContract,uint256 tokenId,uint256 price,bool active)"
];

export const CONFIGURED =
  !NFT_ADDRESS.includes("0000000000000000000000000000000000") &&
  !MARKETPLACE_ADDRESS.includes("0000000000000000000000000000000000");
