import * as LucideIcons from "lucide-react";
import PropTypes from "prop-types";

export const ICON_OPTIONS = [
    { name: "Tag",              Icon: LucideIcons.Tag },
    { name: "Laptop",           Icon: LucideIcons.Laptop },
    { name: "Smartphone",       Icon: LucideIcons.Smartphone },
    { name: "Tv",               Icon: LucideIcons.Tv },
    { name: "Shirt",            Icon: LucideIcons.Shirt },
    { name: "Gem",              Icon: LucideIcons.Gem },
    { name: "Palette",          Icon: LucideIcons.Palette },
    { name: "Music",            Icon: LucideIcons.Music },
    { name: "BookOpen",         Icon: LucideIcons.BookOpen },
    { name: "Home",             Icon: LucideIcons.Home },
    { name: "UtensilsCrossed",  Icon: LucideIcons.UtensilsCrossed },
    { name: "Gamepad2",         Icon: LucideIcons.Gamepad2 },
    { name: "Bike",             Icon: LucideIcons.Bike },
    { name: "Car",              Icon: LucideIcons.Car },
    { name: "Baby",             Icon: LucideIcons.Baby },
    { name: "Globe",            Icon: LucideIcons.Globe },
    { name: "Wrench",           Icon: LucideIcons.Wrench },
];

export function CategoryIcon({ name, size = 18, color = "var(--primary-dark)" }) {
    const Icon = (name && LucideIcons[name]) ? LucideIcons[name] : LucideIcons.Tag;
    return <Icon size={size} color={color} />;
}

CategoryIcon.propTypes = {
    name: PropTypes.string,
    size: PropTypes.number,
    color: PropTypes.string,
};

export function IconPicker({ value, onChange, disabled }) {
    const handleKeyDown = (e, iconName) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) onChange(iconName);
        }
    };

    return (
        <div>
            <label id="icon-picker-label" style={{ fontSize: "13px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0", display: "block" }}>
                Ícono
            </label>
            <div 
                role="radiogroup"
                aria-labelledby="icon-picker-label"
                style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", maxHeight: "180px", overflowY: "auto", padding: "4px" }}
            >
                {ICON_OPTIONS.map(({ name, Icon }) => {
                    const selected = value === name;
                    return (
                        <div
                            key={name}
                            role="radio"
                            aria-checked={selected}
                            aria-label={name}
                            tabIndex={disabled ? -1 : 0}
                            onClick={() => !disabled && onChange(name)}
                            onKeyDown={(e) => handleKeyDown(e, name)}
                            style={{ 
                                padding: "10px 6px", 
                                borderRadius: "8px", 
                                border: `2px solid ${selected ? "var(--primary-dark)" : "#e5e7eb"}`, 
                                backgroundColor: selected ? "#f0fdf4" : "white", 
                                cursor: disabled ? "default" : "pointer", 
                                display: "flex", 
                                flexDirection: "column", 
                                alignItems: "center", 
                                gap: "4px", 
                                transition: "border-color 0.15s",
                                opacity: disabled ? 0.5 : 1,
                            }}
                        >
                            <Icon size={18} color={selected ? "var(--primary-dark)" : "#9ca3af"} />
                            <span style={{ fontSize: "9px", color: selected ? "var(--primary-dark)" : "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                {name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

IconPicker.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

IconPicker.defaultProps = {
    disabled: false,
};