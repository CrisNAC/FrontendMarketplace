import * as LucideIcons from "lucide-react";

export const ICON_OPTIONS = [
    { name: "Tag",              Icon: LucideIcons.Tag },
    { name: "Laptop",           Icon: LucideIcons.Laptop },
    { name: "Smartphone",       Icon: LucideIcons.Smartphone },
    { name: "Tv",               Icon: LucideIcons.Tv },
    { name: "Watch",            Icon: LucideIcons.Watch },
    { name: "Shirt",            Icon: LucideIcons.Shirt },
    { name: "Gem",              Icon: LucideIcons.Gem },
    { name: "ShoppingBag",      Icon: LucideIcons.ShoppingBag },
    { name: "Palette",          Icon: LucideIcons.Palette },
    { name: "Camera",           Icon: LucideIcons.Camera },
    { name: "Music",            Icon: LucideIcons.Music },
    { name: "BookOpen",         Icon: LucideIcons.BookOpen },
    { name: "Home",             Icon: LucideIcons.Home },
    { name: "Coffee",           Icon: LucideIcons.Coffee },
    { name: "UtensilsCrossed",  Icon: LucideIcons.UtensilsCrossed },
    { name: "Heart",            Icon: LucideIcons.Heart },
    { name: "Gamepad2",         Icon: LucideIcons.Gamepad2 },
    { name: "Dumbbell",         Icon: LucideIcons.Dumbbell },
    { name: "Bike",             Icon: LucideIcons.Bike },
    { name: "Car",              Icon: LucideIcons.Car },
    { name: "Baby",             Icon: LucideIcons.Baby },
    { name: "Dog",              Icon: LucideIcons.Dog },
    { name: "Leaf",             Icon: LucideIcons.Leaf },
    { name: "Globe",            Icon: LucideIcons.Globe },
    { name: "Wrench",           Icon: LucideIcons.Wrench },
];

export function CategoryIcon({ name, size = 18, color = "var(--primary-dark)" }) {
    const Icon = (name && LucideIcons[name]) ? LucideIcons[name] : LucideIcons.Tag;
    return <Icon size={size} color={color} />;
}

export function IconPicker({ value, onChange, disabled }) {
    return (
        <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>Ícono</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", maxHeight: "180px", overflowY: "auto", padding: "4px" }}>
                {ICON_OPTIONS.map(({ name, Icon }) => {
                    const selected = value === name;
                    return (
                        <button key={name} type="button" onClick={() => !disabled && onChange(name)} title={name} disabled={disabled}
                            style={{ padding: "10px 6px", borderRadius: "8px", border: `2px solid ${selected ? "var(--primary-dark)" : "#e5e7eb"}`, backgroundColor: selected ? "#f0fdf4" : "white", cursor: disabled ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", transition: "border-color 0.15s" }}>
                            <Icon size={18} color={selected ? "var(--primary-dark)" : "#9ca3af"} />
                            <span style={{ fontSize: "9px", color: selected ? "var(--primary-dark)" : "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                {name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}