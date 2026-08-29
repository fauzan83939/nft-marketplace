const TABS = [
  ["market", "Marketplace"],
  ["mine", "NFT Saya"],
  ["mint", "Mint Baru"]
];

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs">
      {TABS.map(([key, label]) => (
        <button
          key={key}
          className={active === key ? "active" : ""}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
