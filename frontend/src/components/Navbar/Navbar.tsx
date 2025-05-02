import React, { useState } from "react";
import { Menu, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {FileDoneOutlined} from "@ant-design/icons";
import axios from "axios";

const { useBreakpoint } = Grid;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Determine active menu item based on path
  let activeKey = "markets";
  if (location.pathname.startsWith("/chatbot")) activeKey = "chatbot";
  else if (location.pathname.startsWith("/news")) activeKey = "news";
  else if (location.pathname.startsWith("/screener")) activeKey = "markets";
  else if (location.pathname.startsWith("/profile")) activeKey = "profile";
  else if (location.pathname.startsWith("/reports")) activeKey = "reports";

  // Handle clicks (including logout)
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
        profile: "/profile",
        reports: "/reports",
      };
      if (routeMap[key]) navigate(routeMap[key]);
      setDrawerVisible(false);
    }
  };

  // Menu items (no icons)
  const items = [
    { key: "chatbot", label: "Chatbot" },
    { key: "news", label: "News" },
    { key: "markets", label: "Markets" },
    //{ key: "profile", label: "Profile" },
    {key: "reports", icon: <FileDoneOutlined/>, label: "Reports"},
    { key: "profile-logout", label: "Logout" }
  ];

  return (
      <div
          style={{
            width: "100%",
            height: 64,
            padding: "0 24px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "fixed",
            top: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
      >
        {/* Logo */}
        <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#1890ff",
              whiteSpace: "nowrap",
            }}
        >
          Investment<span style={{ color: "#000" }}>Helper-AI</span>
        </div>

        {/* Desktop Menu */}
        {screens.md ? (
            <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
              <Menu
                  mode="horizontal"
                  selectedKeys={[activeKey]}
                  items={items}
                  onClick={handleMenuClick}
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                    borderBottom: "none",
                    flex: "0 1 auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
              />
            </div>
        ) : (
            <>
              <MenuOutlined
                  onClick={() => setDrawerVisible(true)}
                  style={{ fontSize: 20, marginLeft: "auto" }}
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
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                />
              </Drawer>
            </>
        )}
      </div>
  );
};

export default Navbar;
