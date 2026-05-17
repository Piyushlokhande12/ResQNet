import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "leaflet/dist/leaflet.css"; // ← Must be before index.css
import "./index.css";

import App from "./App";
import { store } from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(

    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  
);