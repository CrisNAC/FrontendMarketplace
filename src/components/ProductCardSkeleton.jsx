export const ProductCardSkeleton = () => (
  <div
    className="animate-pulse"
    style={{
      backgroundColor: "#FEF7FF",
      height: "320px",
      borderRadius: "12px",
      border: "1px solid #CAC4D0",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <div style={{ height: "220px", backgroundColor: "#e8e0f0", flexShrink: 0 }} />
    <div style={{ padding: "8px 12px 12px 12px", flexShrink: 0 }}>
      <div style={{ height: "14px", backgroundColor: "#ddd6e8", borderRadius: "6px", marginBottom: "8px" }} />
      <div style={{ height: "12px", width: "55%", backgroundColor: "#ddd6e8", borderRadius: "6px", marginBottom: "10px" }} />
      <div style={{ height: "32px", backgroundColor: "#ddd6e8", borderRadius: "8px" }} />
    </div>
  </div>
);
