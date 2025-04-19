import React from "react";
import { Menu } from "antd";
import { BarChartOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active key based on the current path.
  let activeKey = "markets"; // default key
  if (location.pathname.startsWith("/chatbot")) {
    activeKey = "chatbot";
  } else if (location.pathname.startsWith("/news")) {
    activeKey = "news";
  } else if (location.pathname.startsWith("/screener")) {
    activeKey = "markets";
  }
  // You can adjust or extend these conditions as needed.

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === "profile-logout") {
      try {
        await axios.post("https://investmenthelper-ai-backend.up.railway.app/api/logout", {
          withCredentials: true,
        });
        // Clear the username from localStorage on logout
        localStorage.removeItem("email");
        navigate("/login");
      } catch (error) {
        console.error("Logout error", error);
      }
    } else {
      // Map keys to their routes.
      const routeMap: { [key: string]: string } = {
        chatbot: "/chatbot",
        news: "/news",
        markets: "/screener",
      };
      if (routeMap[key]) {
        navigate(routeMap[key]);
      }
    }
  };

  const items = [
    {
      key: "chatbot",
      icon: <SettingOutlined />,
      label: "Chatbot",
    },
    {
      key: "markets",
      icon: <BarChartOutlined />,
      label: "Markets",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      children: [
        {
          key: "profile-logout",
          label: "Logout",
        },
      ],
    },
  ];

  return (
    <div className="navbar">
      <div className="navbar-logo">
        Investment<span className="navbar-highlight">Helper-AI</span>
      </div>
      <Menu
        mode="horizontal"
        defaultSelectedKeys={[activeKey]}
        selectedKeys={[activeKey]}
        className="navbar-menu"
        items={items}
        onClick={handleMenuClick}
        overflowedIndicator={null}
      />
    </div>
  );
};

export default Navbar;
