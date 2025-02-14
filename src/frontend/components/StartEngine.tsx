import React from "react";

interface StartEngineProps {
  isStarted: boolean;
  onToggle: (state: boolean) => void;
}

const StartEngine: React.FC<StartEngineProps> = ({ isStarted, onToggle }) => {
  return (
    <div
      className={`engine-indicator-wrapper ${isStarted ? "engine-on" : "engine-off"}`}
      onClick={() => onToggle(!isStarted)}
    >
      <span className="engine-indicator-text">
        Engine<br />
        {isStarted ? "STOP" : "START"}
      </span>
    </div>
  );
};

export default StartEngine;
