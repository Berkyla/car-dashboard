import React from "react";
const Odometer = ({ mileage }) => {
    return (React.createElement("div", { className: "odometer-container" },
        React.createElement("span", { className: "odometer-label" }, "ODO"),
        React.createElement("div", { className: "odometer-value" },
            mileage.toFixed(1),
            " ",
            React.createElement("span", { className: "odometer-unit" }, "\u043A\u043C"))));
};
export default Odometer;
