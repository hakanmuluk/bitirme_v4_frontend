import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import ScreenerPage from "./pages/ScreenerPage/ScreenerPage";
import TradingViewPage from "./pages/TradingViewPage/TradinViewPage";
import NewsPage from "./pages/NewsPage/NewsPage";
import ChatbotPage from "./pages/ChatbotPage/ChatbotPage";
import './global.css';

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
          {/* Default to LoginPage */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Other routes accessible after login */}
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/tradingview/:stockId" element={<TradingViewPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
