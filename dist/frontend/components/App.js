import React from "react";
import DualGauge from "./DualGauge";
import Speedometer from "./Speedometer/Speedometer";
import Tachometer from "./Tachometer/Tachometer";
import StartEngine from "./StartEngine";
import BatteryIndicator from "./BatteryIndicator";
import Odometer from "./Odometer";
import { useDashboardLogic } from "./hooks/useDashboardLogic";
const App = () => {
    const { engineStarted, setEngineStarted, currentValues, mileage } = useDashboardLogic();
    return (React.createElement("div", { className: "dashboard-container" },
        React.createElement("img", { src: "frontend/assets/images/dashboard_background.png", alt: "Dashboard Background", className: "dashboard-background dashboard-layer" }),
        React.createElement("img", { src: "frontend/assets/images/dashboard_frame.png", alt: "Dashboard Frame", className: "dashboard-frame dashboard-layer" }),
        React.createElement("div", { className: "engine-indicator" },
            React.createElement(StartEngine, { isStarted: engineStarted, onToggle: (state) => setEngineStarted(state) }),
            React.createElement("img", { src: engineStarted
                    ? "frontend/assets/images/engine_on_indicator.png"
                    : "frontend/assets/images/engine_off_indicator.png", alt: engineStarted ? "Engine On" : "Engine Off", className: "engine-indicator dashboard-layer" })),
        React.createElement("div", { className: "blinkers-indicator movable" },
            React.createElement("img", { src: "frontend/assets/images/blinkers_indicator.png", alt: "Blinkers Indicator", className: "blinkers-indicator dashboard-layer" })),
        React.createElement("div", { className: "battery-indicator-position" },
            React.createElement(BatteryIndicator, { chargeLevel: currentValues.batteryLevel * 100, voltage: currentValues.voltage, isCharging: true })),
        React.createElement("div", { className: "dashboard-content" },
            React.createElement("div", { className: "gauge-container gauge-left" },
                React.createElement(Tachometer, { rpm: currentValues.rpm, maxRpm: 8000 })),
            React.createElement("div", { className: "gauge-container gauge-center" },
                React.createElement(Speedometer, { speed: currentValues.speed, maxSpeed: 200 })),
            React.createElement("div", { className: "gauge-container gauge-right" },
                React.createElement(DualGauge, { temperature: currentValues.temperature, maxTemperature: 130, fuelLevel: currentValues.fuelLevel, maxFuelLevel: 1 }))),
        React.createElement("div", { className: "odometer-position" },
            React.createElement(Odometer, { mileage: mileage }))));
};
export default App;
