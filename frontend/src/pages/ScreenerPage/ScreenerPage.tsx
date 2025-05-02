import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tabs, Input, Spin } from "antd";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;
const API_BASE = "https://investmenthelper-ai-backend.up.railway.app";




const ScreenerPage: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currencyCards, setCurrencyCards] = useState<any[]>([]);
  const [loadingCurrency, setLoadingCurrency] = useState(true);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoriteSearch, setFavoriteSearch] = useState("");

  const navigate = useNavigate();

  // Inject TradingView ticker
  useEffect(() => {
    const container = document.getElementById(
      "tradingview-widget-container"
    );
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = "true";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.text = JSON.stringify({
      symbols: [
        { description: "Bitcoin/TL", proName: "BINANCE:BTCTRY" },
        { description: "Ethereum/TL", proName: "OKX:ETHTRY" },
        { description: "Gold/TL", proName: "FX_IDC:XAUTRY" },
        { description: "Silver/TL", proName: "FX_IDC:XAGTRY" },
        { description: "Brent Oil", proName: "CAPITALCOM:OIL_BRENT" },
        { description: "BIST Banking Index", proName: "BIST:XBANK" },
        { description: "BIST Industrial Index", proName: "BIST:XUSIN" },
        { description: "BIST Technology Index", proName: "BIST:XUTEK" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      autosize: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      colorTheme: "light",
      locale: "en",
    });
    container.appendChild(script);
  }, []);

  // Fetch favorites
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/favorites/get`, { withCredentials: true })
      .then((res) => setFavorites(res.data.favoriteCompanies || []))
      .catch(console.error)
      .finally(() => setFavoritesLoading(false));
  }, []);

  // Toggle favorite
  const toggleFavorite = async (ticker: string) => {
    const endpoint = favorites.includes(ticker)
      ? "/api/favorites/remove"
      : "/api/favorites/add";
    try {
      const res = await axios.post(
        `${API_BASE}${endpoint}`,
        new URLSearchParams({ company: ticker }),
        { withCredentials: true }
      );
      setFavorites(res.data.favoriteCompanies || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch stocks
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/api/stocks/`)
      .then((res) => {
        const withKeys = res.data.map((item: any, i: number) => ({
          ...item,
          key: i + 1,
          day: item.dayChange,
          month: item.monthChange * 100,
          year: item.yearChange * 100,
        }));
        console.log(withKeys);
        setStockData(withKeys);
        setFilteredData(withKeys);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch currency cards
  useEffect(() => {
    setLoadingCurrency(true);
    axios
      .get(`${API_BASE}/api/currency/`)
      .then((res) => {
        const cards: any[] = [];
        Object.entries(res.data).forEach(([ticker, prices]) => {
          if (!Array.isArray(prices) || prices.length === 0) return;
          const first = prices[0] as number;
          const last = (prices as number[]).slice(-1)[0];
          const changePct = ((last - first) / first) * 100;
          cards.push({
            name: ticker,
            value: last.toFixed(2),
            change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
            graphData: (prices as number[]).map((v) => ({ value: v })),
          });
        });
        setCurrencyCards(cards.length ? cards : fallbackMarketData);
      })
      .catch(console.error)
      .finally(() => setLoadingCurrency(false));
  }, []);

  const handleRowClick = (rec: any) => {
    navigate(`/tradingView/${rec.ticker}`);
  };

  const onSearch = (v: string) => {
    setFilteredData(
      stockData.filter((item) =>
        item.company.toLowerCase().includes(v.toLowerCase())
      )
    );
  };

  const columns: ColumnsType<any> = [
    { title: "#", dataIndex: "key", width: 50 },
    {
      title: "Company",
      dataIndex: "company",
      render: (txt, rec) => (
        <div>
          <strong>{txt}</strong>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>
            {rec.ticker}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (p: number) => `${p.toFixed(2)} TL`,
    },
    {
      title: "1D %",
      dataIndex: "day",
      render: (v: number) => (
        <span
          style={{
            color: v >= 0 ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      ),
    },
    {
      title: "1M %",
      dataIndex: "month",
      render: (v: number) => (
        <span
          style={{
            color: v >= 0 ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      ),
    },
    {
      title: "YTD %",
      dataIndex: "year",
      render: (v: number) => (
        <span
          style={{
            color: v >= 0 ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      ),
    },
    { title: "M Cap", dataIndex: "marketCap" },
    {
      title: "Favorites",
      key: "fav",
      width: 120,
      align: "center",
      render: (_, rec) => {
        const fav = favorites.includes(rec.ticker);
        const Icon = fav ? StarFilled : StarOutlined;
        return (
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(rec.ticker);
            }}
            style={{
              fontSize: 16,
              color: fav ? "#faad14" : "#aaa",
              cursor: "pointer",
            }}
          />
        );
      },
    },
  ];

  const tableLoading = loading || favoritesLoading;
  const favoriteRows = stockData.filter((x) =>
    favorites.includes(x.ticker)
  );
  const filteredFavoriteRows = favoriteRows.filter((x) =>
    x.company.toLowerCase().includes(favoriteSearch.toLowerCase())
  );

  return (
    <div style={{
      backgroundColor: "#f5f7fa",
      minHeight: "100vh",
      paddingTop: 64,
      padding: 24,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Navbar />

      {/* TradingView */}
      <div
        id="tradingview-widget-container"
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          maxWidth: 1200,
          height: 60,
          margin: "0 auto",
          zIndex: 1000
        }}
      />

      {/* Market Cards */}
      <div style={{
        width: "100%",
        maxWidth: 1200,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 16,
        margin: "16px 0",
        paddingTop: 80
      }}>
  {loadingCurrency ? (
    <Spin />
  ) : (
    currencyCards.map((item, idx) => {
      // Determine line color based on price change
      const lineColor = item.change.startsWith("-")
        ? "var(--color-error)"    // red for negative
        : "var(--color-success)"; // green for positive

      return (
        <div key={idx} style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "transform 0.2s",
          cursor: "pointer"
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div>{item.name}</div>
          <div>{item.value}</div>
          <div
            style={{
              color: item.change.startsWith("-") ? "red" : "green",
              fontWeight: "bold"
            }}
          >
            {item.change}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={item.graphData}>
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Line
                type="monotone"
                dataKey="value"
                dot={false}
                strokeWidth={2}
                stroke={lineColor}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    })
  )}
</div>


      {/* Screener Tabs */}
      <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto" }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Companies" key="1">
            <Spin spinning={tableLoading}>
              <div style={{
                width: "100%",
                maxWidth: 1200,
                margin: "16px auto",
                padding: 8,
                backgroundColor: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "center"
              }}>
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => onSearch(e.target.value)}
                  style={{ width: "100%", maxWidth: 400 }}
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredData}
                loading={tableLoading}
                scroll={{ x: 'max-content', y: 400 }}
                pagination={false}
                rowKey="key"
                sticky
                onRow={(rec) => ({
                  onClick: () => handleRowClick(rec),
                  style: { cursor: "pointer" },
                })}
              />
            </Spin>
          </TabPane>
          <TabPane tab="My Favorites" key="2">
            <Spin spinning={tableLoading}>
              <div style={{
                width: "100%",
                maxWidth: 1200,
                margin: "16px auto",
                padding: 8,
                backgroundColor: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "center"
              }}>
                <Input
                  placeholder="Search favorites..."
                  prefix={<SearchOutlined />}
                  value={favoriteSearch}
                  onChange={(e) => setFavoriteSearch(e.target.value)}
                  style={{ width: "100%", maxWidth: 400 }}
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredFavoriteRows}
                loading={tableLoading}
                scroll={{ x: 'max-content', y: 400 }}
                pagination={false}
                rowKey="key"
                sticky
                onRow={(rec) => ({
                  onClick: () => handleRowClick(rec),
                  style: { cursor: "pointer" },
                })}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ScreenerPage;
