import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { readLab } from "./lab";
import "./styles/global.css";

// Set before the first render, so a link with ?palette=… paints in that
// palette from the start instead of fading over from the default cream
// (body transitions its colours; App keeps this in sync after that).
const initial = readLab();
document.documentElement.dataset.palette = initial.palette;
document.documentElement.dataset.shift = initial.shift;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
