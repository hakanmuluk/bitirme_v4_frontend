// frontend/src/pages/Chatbot/Chatbot.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Chatbot.css";

const Chatbot: React.FC = () => {
  const username = localStorage.getItem("email");
  const chainlitHost = "https://investmenthelper-ai-backend.up.railway.app";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetch(
      `${chainlitHost}/chat/header-auth?email=${encodeURIComponent(
        username
      )}`,
      {
        method: "GET",
        credentials: "include",
        redirect: "manual",
      }
    )
      .then(() => setReady(true))
      .catch(console.error);
  }, [username]);

  const iframeSrc = ready ? `${chainlitHost}/chainlit` : "about:blank";

  return (
    <div className="chatbot-page">
      <Navbar />
      <div className="chatbot-content">
        <iframe
          id="chainlit-frame"
          src={iframeSrc}
          title="Chatbot"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Chatbot;
