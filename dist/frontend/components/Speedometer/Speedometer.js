import React from "react";
import SpeedometerView from "./SpeedometerView";
const Speedometer = ({ speed, maxSpeed }) => {
    const width = 375;
    const height = 375;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 10;
    const innerRadius = outerRadius * 0.65;
    const totalMarks = 20;
    const angleOffset = Math.PI / 5; // Смещение шкалы
    // Ограничиваем скорость в пределах maxSpeed
    const clampedSpeed = Math.min(speed, maxSpeed);
    // Рассчитываем угол стрелки (0% → 0°; 100% → 160°)
    const calculateRotation = (speed) => {
        const percentage = speed / maxSpeed;
        return Math.PI / 2 + percentage * (2 * Math.PI * 0.8);
    };
    const needleAngle = calculateRotation(clampedSpeed) + angleOffset;
    return (React.createElement(SpeedometerView, { speed: clampedSpeed, needleAngle: needleAngle, outerRadius: outerRadius, innerRadius: innerRadius, centerX: centerX, centerY: centerY, totalMarks: totalMarks, maxSpeed: maxSpeed }));
};
export default Speedometer;
