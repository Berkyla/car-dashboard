import React from "react";
const TempBar = ({ temperature, minTemperature, maxTemperature, }) => {
    const barWidth = 300; // Ширина шкалы
    // Ограничиваем значение температуры
    const clampedTemperature = Math.min(Math.max(temperature, minTemperature), maxTemperature);
    // Длина заполненной шкалы
    const filledWidth = ((clampedTemperature - minTemperature) /
        (maxTemperature - minTemperature)) *
        barWidth;
    // Общее время анимации
    const animationDuration = "0.3s"; // Синхронизированная длительность анимации
    return (React.createElement("div", { className: "temp-bar-container relative", style: { width: `${barWidth}px` } },
        React.createElement("div", { className: "temp-bar bg-gray-800 border border-white rounded-full h-4 relative overflow-hidden" },
            React.createElement("div", { className: "temp-bar-level h-full", style: {
                    width: `${filledWidth}px`,
                    backgroundColor: "#FFFFFF",
                    transition: `width ${animationDuration} ease`, // Синхронизированная анимация шкалы
                } })),
        React.createElement("div", { className: "temp-bar-indicator absolute top-[-20px] bg-red-500 text-white font-bold text-sm px-2 py-1 rounded", style: {
                left: `${filledWidth}px`,
                transform: "translateX(-50%)",
                transition: `left ${animationDuration} ease`, // Синхронизированная анимация индикатора
            } },
            Math.round(clampedTemperature),
            "\u00B0C"),
        React.createElement("div", { className: "temp-bar-labels flex justify-between text-white text-xs mt-2" },
            React.createElement("span", null,
                minTemperature,
                "\u00B0C"),
            React.createElement("span", null,
                maxTemperature,
                "\u00B0C"))));
};
export default TempBar;
