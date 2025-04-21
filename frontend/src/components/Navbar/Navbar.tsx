import React, { useState } from "react";
import { Menu, Drawer, Grid } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  MenuOutlined,
  RobotOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const { useBreakpoint } = Grid;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  let activeKey = "markets";
  if (location.pathname.startsWith("/chatbot")) activeKey = "chatbot";
  else if (location.pathname.startsWith("/news")) activeKey = "news";
  else if (location.pathname.startsWith("/screener")) activeKey = "markets";

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === "profile-logout") {
      await axios.post(
        "https://investmenthelper-ai-backend.up.railway.app/api/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("email");
      navigate("/login");
    } else {
      const routeMap: Record<string, string> = {
        chatbot: "/chatbot",
        news: "/news",
        markets: "/screener",
      };
      if (routeMap[key]) navigate(routeMap[key]);
      setDrawerVisible(false);
    }
  };

  const items = [
    { key: "chatbot", icon: <RobotOutlined />, label: "Chatbot" },
    { key: "news", icon: <ReadOutlined />, label: "News" },
    { key: "markets", icon: <BarChartOutlined />, label: "Markets" },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      children: [{ key: "profile-logout", label: "Logout" }],
    },
  ];

  return (
    <div className="navbar">
      <div className="navbar-logo">
        Investment<span className="navbar-highlight">Helper‑AI</span>
      </div>

      {screens.md ? (
        <Menu
          mode="horizontal"
          selectedKeys={[activeKey]}
          className="navbar-menu"
          items={items}
          onClick={handleMenuClick}
        />
      ) : (
        <>
          <MenuOutlined
            className="navbar-hamburger"
            onClick={() => setDrawerVisible(true)}
          />
          <Drawer
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="vertical"
              selectedKeys={[activeKey]}
              items={items}
              onClick={handleMenuClick}
            />
          </Drawer>
        </>
      )}
    </div>
  );
};

export default Navbar;
