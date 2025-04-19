import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

const Chatbot: React.FC = () => {
  const username = localStorage.getItem("email");
  const chainlitHost = "https://investmenthelper-ai-backend.up.railway.app";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!username) return;
    // 1) hit header-auth to set the cookie
    fetch(`${chainlitHost}/chat/header-auth?email=${encodeURIComponent(username)}`, {
      method: "GET",
      credentials: "include",   // <= this is critical
      redirect: "manual"        // we don't actually follow the 307 here
    })
      .then(() => setReady(true))
      .catch(console.error);
  }, [username]);

  // 2) once ready, point iframe at the real Chainlit UI
  const iframeSrc = ready
    ? `${chainlitHost}/chainlit`   // this is your mounted Chainlit app
    : "about:blank";

  return (
    <>
      <Navbar />
      <div style={{ marginTop: 60, height: "calc(100vh - 60px)" }}>
        <iframe
          id="chainlit-frame"
          src={iframeSrc}
          title="Chatbot"
          style={{ width: "100%", height: "100%", border: "none" }}
          sandbox="allow-scripts allow-same-origin"  // allow cookies & JS
        />
      </div>
    </>
  );
};

export default Chatbot;
