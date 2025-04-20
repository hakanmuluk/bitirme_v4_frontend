// frontend/src/pages/ScreenerPage/ScreenerPage.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tabs, Input, Spin } from "antd";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import "./ScreenerPage.css";

const { TabPane } = Tabs;
const API_BASE = "https://investmenthelper-ai-backend.up.railway.app";

const fallbackMarketData = [
  {
    name: "S&P 500",
    value: "5,648.40",
    change: "+0.44%",
    graphData: [
      { value: 5600 },
      { value: 5625 },
      { value: 5648 },
      { value: 5640 },
      { value: 5650 },
    ],
  },
  {
    name: "Nasdaq 100",
    value: "17,713.53",
    change: "+1.13%",
    graphData: [
      { value: 17600 },
      { value: 17680 },
      { value: 17713 },
      { value: 17700 },
      { value: 17750 },
    ],
  },
  {
    name: "VIX",
    value: "15.00",
    change: "-4.15%",
    graphData: [
      { value: 16.5 },
      { value: 15.8 },
      { value: 15.0 },
      { value: 14.9 },
      { value: 14.5 },
    ],
  },
];

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
      render: (p: number) => `$${p.toFixed(2)}`,
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
      className: "no-wrap-header", 
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
    <div className="screener-page">
      <Navbar />

      {/* TradingView */}
      <div className="ticker-wrapper">
        <div className="ticker-overlay ticker-overlay-left" />
        <div
          id="tradingview-widget-container"
          className="tradingview-widget-container"
        >
          <div className="tradingview-widget-container__widget" />
        </div>
        <div className="ticker-overlay ticker-overlay-right" />
      </div>

      {/* Market Cards */}
      <div className="market-cards">
  {loadingCurrency ? (
    <Spin />
  ) : (
    currencyCards.map((item, idx) => {
      // Determine line color based on price change
      const lineColor = item.change.startsWith("-")
        ? "var(--color-error)"    // red for negative
        : "var(--color-success)"; // green for positive

      return (
        <div key={idx} className="market-card">
          <div className="market-title">{item.name}</div>
          <div className="market-value">{item.value}</div>
          <div
            className={`market-change ${
              item.change.startsWith("-") ? "negative" : "positive"
            }`}
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
      <div className="screener-tabs">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Companies" key="1">
            <Spin spinning={tableLoading}>
              <div className="screener-header">
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => onSearch(e.target.value)}
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
              <div className="screener-header">
                <Input
                  placeholder="Search favorites..."
                  prefix={<SearchOutlined />}
                  value={favoriteSearch}
                  onChange={(e) => setFavoriteSearch(e.target.value)}
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
