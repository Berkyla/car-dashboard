import React from "react";
const SpeedometerView = ({ speed, maxSpeed, needleAngle, outerRadius, innerRadius, centerX, centerY, totalMarks, }) => {
    const arrowLength = outerRadius - 8;
    const arrowWidth = 20;
    const contourColor = "#555"; // Цвет шкалы
    const angleOffset = Math.PI / 5; // Смещение шкалы
    // Ограничение скорости на цифровом дисплее (не больше maxSpeed)
    const displaySpeed = Math.min(maxSpeed, Math.round(speed));
    // Координаты для стрелки
    const tipX = centerX + Math.cos(needleAngle) * arrowLength;
    const tipY = centerY + Math.sin(needleAngle) * arrowLength;
    const baseLeftX = centerX + Math.cos(needleAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseLeftY = centerY + Math.sin(needleAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseRightX = centerX + Math.cos(needleAngle - Math.PI / 2) * (arrowWidth / 2);
    const baseRightY = centerY + Math.sin(needleAngle - Math.PI / 2) * (arrowWidth / 2);
    return (React.createElement("svg", { width: 375, height: 375 },
        React.createElement("circle", { cx: centerX, cy: centerY, r: outerRadius, fill: "#222", stroke: contourColor, strokeWidth: 6 }),
        Array.from({ length: totalMarks + 1 }).map((_, i) => {
            const value = (i * maxSpeed) / totalMarks;
            const angle = Math.PI / 2 + angleOffset + (2 * Math.PI * 0.8 * i) / totalMarks;
            const markX1 = centerX + Math.cos(angle) * (outerRadius - 20);
            const markY1 = centerY + Math.sin(angle) * (outerRadius - 20);
            const markX2 = centerX + Math.cos(angle) * outerRadius;
            const markY2 = centerY + Math.sin(angle) * outerRadius;
            const numberX = centerX + Math.cos(angle) * (outerRadius - 40);
            const numberY = centerY + Math.sin(angle) * (outerRadius - 40);
            const isVisible = value <= maxSpeed;
            return (React.createElement("g", { key: i },
                isVisible && (React.createElement("line", { x1: markX1, y1: markY1, x2: markX2, y2: markY2, stroke: i % 2 === 0 ? "#FFF" : contourColor, strokeWidth: i % 2 === 0 ? 3 : 2 })),
                isVisible && i % 2 === 0 && (React.createElement("text", { x: numberX, y: numberY, fill: "#FFF", fontSize: "20", fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, value))));
        }),
        React.createElement("polygon", { points: `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`, fill: "red" }),
        React.createElement("circle", { cx: centerX, cy: centerY, r: innerRadius, fill: "#000" }),
        React.createElement("text", { x: centerX, y: centerY - 10, fill: "#FFF", fontSize: "48", fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, displaySpeed),
        React.createElement("text", { x: centerX, y: centerY + 30, fill: "#FFF", fontSize: "24", fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, "km/h")));
};
export default SpeedometerView;
