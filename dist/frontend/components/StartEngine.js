import React from "react";
const StartEngine = ({ isStarted, onToggle }) => {
    return (React.createElement("div", { className: `engine-indicator-wrapper ${isStarted ? "engine-on" : "engine-off"}`, onClick: () => onToggle(!isStarted) },
        React.createElement("span", { className: "engine-indicator-text" },
            "Engine",
            React.createElement("br", null),
            isStarted ? "STOP" : "START")));
};
export default StartEngine;
