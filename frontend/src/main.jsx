import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")).render(
<div>
  <Helmet>
    <meta name="viewport" content="width=device-width, initial-scale=1.1" />

  </Helmet>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </div>

);
