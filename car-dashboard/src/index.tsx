import React from "react";
import ReactDOM from "react-dom/client";
import App from "./frontend/components/App";
import "./styles.css";

// Получаем корневой элемент и создаём корень React
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with ID 'root' not found");
}

const root = ReactDOM.createRoot(rootElement);

// Рендерим основное приложение
root.render(<App />);
