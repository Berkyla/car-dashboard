import React from "react";
const BatteryIndicator = ({ chargeLevel, voltage, isCharging, }) => {
    const segmentCount = 3; // Количество сегментов
    const activeSegments = Math.ceil((chargeLevel / 100) * segmentCount);
    return (React.createElement("div", { className: "battery-indicator-container" },
        React.createElement("div", { className: "battery-status" },
            React.createElement("div", { className: "battery-case" }, [...Array(segmentCount)].map((_, index) => (React.createElement("div", { key: index, className: `battery-segment ${index < activeSegments ? `active segment-${index + 1}` : ""}` })))),
            React.createElement("span", { className: "battery-charge" },
                chargeLevel.toFixed(0),
                "%")),
        React.createElement("div", { className: "battery-info" },
            isCharging && React.createElement("span", { className: "battery-icon" }, "\u26A1"),
            React.createElement("span", { className: "battery-voltage" },
                voltage.toFixed(1),
                " V"))));
};
export default BatteryIndicator;
