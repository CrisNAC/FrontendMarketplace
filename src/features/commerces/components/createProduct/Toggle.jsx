import { useEffect, useState } from "react";

export default function Toggle({
  isOn: controlledIsOn,
  onToggle,
  disabled = false,
  label = "Activar configuracion",
}) {
  const isControlled = typeof controlledIsOn === "boolean";
  const [internalIsOn, setInternalIsOn] = useState(Boolean(controlledIsOn));

  useEffect(() => {
    if (isControlled) {
      setInternalIsOn(Boolean(controlledIsOn));
    }
  }, [controlledIsOn, isControlled]);

  const isOn = isControlled ? Boolean(controlledIsOn) : internalIsOn;

  const handleToggle = () => {
    if (disabled) return;

    const nextValue = !isOn;
    if (!isControlled) {
      setInternalIsOn(nextValue);
    }
    if (onToggle) {
      onToggle(nextValue);
    }
  };

  const bgColor = isOn ? "bg-green-500" : "bg-gray-300";
  
  // Agregamos !rounded-full y !border-none para sobreescribir Bootstrap
  const buttonBaseClasses = "relative inline-flex h-7 w-12 flex-shrink-0 items-center cursor-pointer !rounded-full !border-none px-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  
  const circlePosition = isOn ? "translate-x-5" : "translate-x-0";
  
  // Agregamos !rounded-full al círculo interno también
  const circleBaseClasses = "pointer-events-none inline-block h-5 w-5 transform !rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={handleToggle}
      disabled={disabled}
      className={`${bgColor} ${buttonBaseClasses}`}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`${circlePosition} ${circleBaseClasses}`}
      />
    </button>
  );
}