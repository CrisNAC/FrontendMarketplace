const VARIANTS = {
  commerce: {
    bg: "#FEF7FF",
    border: "#CAC4D0",
    imgBg: "#e8e0f0",
    textBg: "#ddd6e8",
  },
  search: {
    bg: "#f5f5f5",
    border: "#e5e7eb",
    imgBg: "#e5e7eb",
    textBg: "#d1d5db",
    width: "100%",
  },
};

export const ProductCardSkeleton = ({ variant = "commerce" }) => {
  const v = VARIANTS[variant];
  return (
    <div
      className="animate-pulse"
      style={{
        backgroundColor: v.bg,
        height: "320px",
        borderRadius: "12px",
        border: `1px solid ${v.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...(v.width && { width: v.width }),
      }}
    >
      <div style={{ height: "220px", backgroundColor: v.imgBg, flexShrink: 0 }} />
      <div style={{ padding: "8px 12px 12px 12px", flexShrink: 0 }}>
        <div style={{ height: "14px", backgroundColor: v.textBg, borderRadius: "6px", marginBottom: "8px" }} />
        <div style={{ height: "12px", width: "55%", backgroundColor: v.textBg, borderRadius: "6px", marginBottom: "10px" }} />
        <div style={{ height: "32px", backgroundColor: v.textBg, borderRadius: "8px" }} />
      </div>
    </div>
  );
};
