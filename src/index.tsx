import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import "normalize.css";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 1,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
