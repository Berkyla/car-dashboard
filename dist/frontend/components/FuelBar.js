import React from "react";
const FuelBar = ({ fuelLevel }) => {
    const barWidth = 300; // Ширина шкалы
    // Ограничиваем значение уровня топлива
    const clampedFuelLevel = Math.min(Math.max(fuelLevel, 0), 100);
    const filledWidth = (clampedFuelLevel / 100) * barWidth; // Длина заполненной шкалы
    return (React.createElement("div", { className: "fuel-bar-container relative", style: { width: `${barWidth}px` } },
        React.createElement("div", { className: "fuel-bar bg-gray-800 border border-white rounded-full h-4 relative overflow-hidden" },
            React.createElement("div", { className: "fuel-bar-level h-full", style: {
                    width: `${filledWidth}px`,
                    backgroundColor: "#FFFFFF",
                    transition: "width 0.3s ease", // Ускоренная анимация белой шкалы
                } })),
        React.createElement("div", { className: "fuel-bar-indicator absolute top-[-20px] bg-red-500 text-white font-bold text-sm px-2 py-1 rounded", style: {
                left: `${filledWidth}px`,
                transform: "translateX(-50%)",
                transition: "left 1s ease", // Обычная скорость для красного индикатора
            } },
            Math.round(clampedFuelLevel),
            "%")));
};
export default FuelBar;
