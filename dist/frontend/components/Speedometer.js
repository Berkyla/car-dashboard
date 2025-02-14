import React from "react";
const Speedometer = ({ speed, maxSpeed }) => {
    const width = 375; // Размер спидометра
    const height = 375;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 10;
    const innerRadius = outerRadius * 0.65; // Уменьшенный размер внутреннего круга
    const totalMarks = 20; // Всего меток для основного спидометра
    const contourColor = "#555"; // Цвет контура и промежуточных меток
    const angleOffset = Math.PI / 5; // Смещение на 60 градусов по часовой стрелке
    // Расчет угла поворота стрелки
    const calculateRotation = (speed) => {
        const percentage = Math.min(speed / maxSpeed, 1); // Ограничиваем значение до 1 (100%)
        return Math.PI / 2 + percentage * (2 * Math.PI * 0.8); // Ограничение угла до 0–200
    };
    const needleAngle = calculateRotation(speed) + angleOffset;
    // Координаты для треугольной стрелки
    const arrowLength = outerRadius - 8; // Длина стрелки чуть меньше радиуса
    const arrowWidth = 20; // Ширина основания стрелки
    const tipX = centerX + Math.cos(needleAngle) * arrowLength;
    const tipY = centerY + Math.sin(needleAngle) * arrowLength;
    const baseLeftX = centerX + Math.cos(needleAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseLeftY = centerY + Math.sin(needleAngle + Math.PI / 2) * (arrowWidth / 2);
    const baseRightX = centerX + Math.cos(needleAngle - Math.PI / 2) * (arrowWidth / 2);
    const baseRightY = centerY + Math.sin(needleAngle - Math.PI / 2) * (arrowWidth / 2);
    return (React.createElement("svg", { width: width, height: height },
        React.createElement("circle", { cx: centerX, cy: centerY, r: outerRadius, fill: "#222", stroke: contourColor, strokeWidth: 6 }),
        React.createElement("polygon", { points: `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`, fill: "red" }),
        React.createElement("circle", { cx: centerX, cy: centerY, r: innerRadius, fill: "#000" }),
        Array.from({ length: totalMarks + 1 }).map((_, i) => {
            const value = (i * maxSpeed) / totalMarks; // Значение на метке
            const angle = Math.PI / 2 + angleOffset + (2 * Math.PI * 0.8 * i) / totalMarks; // Угол с учетом смещения
            const markX1 = centerX + Math.cos(angle) * (outerRadius - 20);
            const markY1 = centerY + Math.sin(angle) * (outerRadius - 20);
            const markX2 = centerX + Math.cos(angle) * outerRadius;
            const markY2 = centerY + Math.sin(angle) * outerRadius;
            const numberX = centerX + Math.cos(angle) * (outerRadius - 40);
            const numberY = centerY + Math.sin(angle) * (outerRadius - 40);
            // Отображаем дополнительные деления только от 0 до 200
            const isVisible = value <= 200;
            return (React.createElement("g", { key: i },
                isVisible && (React.createElement("line", { x1: markX1, y1: markY1, x2: markX2, y2: markY2, stroke: i % 2 === 0 ? "#FFF" : contourColor, strokeWidth: i % 2 === 0 ? 3 : 2 })),
                isVisible && i % 2 === 0 && (React.createElement("text", { x: numberX, y: numberY, fill: "#FFF", fontSize: "20" // Увеличенный размер цифр
                    , fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, value))));
        }),
        React.createElement("text", { x: centerX, y: centerY - 10, fill: "#FFF", fontSize: "48" // Значительно увеличенный размер текста
            , fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, Math.round(speed)),
        React.createElement("text", { x: centerX, y: centerY + 30, fill: "#FFF", fontSize: "24", fontWeight: "bold", textAnchor: "middle", alignmentBaseline: "middle" }, "km/h")));
};
export default Speedometer;
