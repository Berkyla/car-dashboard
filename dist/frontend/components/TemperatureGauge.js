import React from "react";
const TemperatureGauge = ({ temperature, maxTemperature, }) => {
    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const minTemperature = 50; // Минимальная температура
    const totalRange = maxTemperature - minTemperature;
    // Ограничение значения температуры
    const clampedTemperature = Math.min(Math.max(temperature, minTemperature), maxTemperature);
    // Угол стрелки
    const tempAngle = (-4 * Math.PI) / 3 +
        ((clampedTemperature - minTemperature) / totalRange) *
            ((2 * Math.PI) / 3);
    // Координаты для треугольной стрелки
    const arrowLength = radius - 5; // Длина стрелки почти до контура
    const arrowWidth = 20; // Ширина основания стрелки
    const tipX = centerX + Math.cos(tempAngle) * arrowLength;
    const tipY = centerY + Math.sin(tempAngle) * arrowLength;
    const baseLeftX = centerX + Math.cos(tempAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseLeftY = centerY + Math.sin(tempAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseRightX = centerX + Math.cos(tempAngle - Math.PI / 2) * (arrowWidth / 2);
    const baseRightY = centerY + Math.sin(tempAngle - Math.PI / 2) * (arrowWidth / 2);
    return (React.createElement("svg", { width: width, height: height },
        React.createElement("circle", { cx: centerX, cy: centerY, r: radius, fill: "#222", stroke: "#555", strokeWidth: 4 }),
        React.createElement("path", { d: `
          M ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * radius}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * radius}
          A ${radius} ${radius} 0 0 1
          ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * radius}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * radius}
          L ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * (radius - 10)}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3)) * (radius - 10)}
          A ${radius - 10} ${radius - 10} 0 0 0
          ${centerX + Math.cos((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * (radius - 10)}
          ${centerY + Math.sin((-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * 0.75) * (radius - 10)}
          Z
        `, fill: "#FF0000", stroke: "none" }),
        React.createElement("polygon", { points: `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`, fill: "#FF0000" }),
        Array.from({ length: 5 }).map((_, i) => {
            const value = minTemperature + (totalRange / 4) * i; // Метки
            const angle = (-4 * Math.PI) / 3 + ((2 * Math.PI) / 3) * (i / 4); // Углы
            const x1 = centerX + Math.cos(angle) * (radius - 20);
            const y1 = centerY + Math.sin(angle) * (radius - 20);
            const x2 = centerX + Math.cos(angle) * radius;
            const y2 = centerY + Math.sin(angle) * radius;
            const textX = centerX + Math.cos(angle) * (radius - 45);
            const textY = centerY + Math.sin(angle) * (radius - 45);
            return (React.createElement("g", { key: `temp-tick-${i}` },
                React.createElement("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#fff", strokeWidth: 2 }),
                React.createElement("text", { x: textX, y: textY, fill: "#fff", fontSize: "16px", fontWeight: "bold", textAnchor: "middle", dominantBaseline: "middle" }, Math.round(value))));
        }),
        Array.from({ length: 4 }).map((_, i) => {
            const angle = (-4 * Math.PI) / 3 +
                ((2 * Math.PI) / 3) * ((i + 0.5) / 4); // Углы между видимыми метками
            const x1 = centerX + Math.cos(angle) * (radius - 20);
            const y1 = centerY + Math.sin(angle) * (radius - 20);
            const x2 = centerX + Math.cos(angle) * radius;
            const y2 = centerY + Math.sin(angle) * radius;
            return (React.createElement("line", { key: `invisible-tick-${i}`, x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#555", strokeWidth: 1 }));
        }),
        React.createElement("circle", { cx: centerX, cy: centerY, r: radius / 2, fill: "#000" })));
};
export default TemperatureGauge;
