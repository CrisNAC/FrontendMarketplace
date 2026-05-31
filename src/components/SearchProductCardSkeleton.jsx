export const SearchProductCardSkeleton = () => (
  <div
    className="animate-pulse"
    style={{
      backgroundColor: "#f5f5f5",
      height: "320px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: "100%",
    }}
  >
    <div style={{ height: "220px", backgroundColor: "#e5e7eb", flexShrink: 0 }} />
    <div style={{ padding: "8px 12px 12px 12px", flexShrink: 0 }}>
      <div style={{ height: "14px", backgroundColor: "#d1d5db", borderRadius: "6px", marginBottom: "8px" }} />
      <div style={{ height: "12px", width: "55%", backgroundColor: "#d1d5db", borderRadius: "6px", marginBottom: "10px" }} />
      <div style={{ height: "32px", backgroundColor: "#d1d5db", borderRadius: "8px" }} />
    </div>
  </div>
);
