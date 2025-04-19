import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tabs, Input, Spin, Row, Col } from "antd";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import "./ScreenerPage.css";

const { TabPane } = Tabs;
const API_BASE = "https://investmenthelper-ai-backend.up.railway.app";

// (Optional) Keep static data as fallback
const fallbackMarketData = [
  {
    name: "S&P 500",
    value: "5,648.40",
    change: "+0.44%",
    graphData: [{ value: 5600 }, { value: 5625 }, { value: 5648 }, { value: 5640 }, { value: 5650 }],
  },
  {
    name: "Nasdaq 100",
    value: "17,713.53",
    change: "+1.13%",
    graphData: [{ value: 17600 }, { value: 17680 }, { value: 17713 }, { value: 17700 }, { value: 17750 }],
  },
  {
    name: "VIX",
    value: "15.00",
    change: "-4.15%",
    graphData: [{ value: 16.5 }, { value: 15.8 }, { value: 15.0 }, { value: 14.9 }, { value: 14.5 }],
  },
];

const ScreenerPage: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currencyCards, setCurrencyCards] = useState<any[]>([]);
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>(true);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<boolean>(true);
  const [favoriteSearch, setFavoriteSearch] = useState<string>("");

  const navigate = useNavigate();

  // Inject TradingView ticker‑tape widget under Navbar
  useEffect(() => {
    const container = document.getElementById("tradingview-widget-container");
    if (!container) return;

    // ←— if we've already loaded once, bail out
    if (container.dataset.loaded) return;
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
        { description: "TCMB Interest Rate", proName: "ECONOMICS:TRINTR" }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "en"
    });
    container.appendChild(script);
  }, []);

  // Fetch user's favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/favorites/get`,
          { withCredentials: true }
        );
        setFavorites(res.data.favoriteCompanies || []);
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Toggle favorite by calling API
  const toggleFavorite = async (ticker: string) => {
    try {
      const endpoint = favorites.includes(ticker)
        ? "/api/favorites/remove"
        : "/api/favorites/add";
      const res = await axios.post(
        `${API_BASE}${endpoint}`,
        new URLSearchParams({ company: ticker }),
        { withCredentials: true }
      );
      setFavorites(res.data.favoriteCompanies || []);
    } catch (err) {
      console.error("Failed to update favorites", err);
    }
  };

  // Fetch stocks data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/stocks/`);
        const withKeys = res.data.map((item: any, idx: number) => ({
          ...item,
          key: idx + 1,
          day: item.dayChange,
          month: item.monthChange * 100,
          year: item.yearChange * 100
        }));
        setStockData(withKeys);
        setFilteredData(withKeys);
      } catch (err) {
        console.error("Failed to fetch stock data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch currency data and prepare cards
  useEffect(() => {
    const fetchCurrencyData = async () => {
      setLoadingCurrency(true);
      try {
        const res = await axios.get(`${API_BASE}/api/currency/`);
        const data = res.data;
        const cards: any[] = [];
        Object.entries(data).forEach(([ticker, prices]) => {
          if (!Array.isArray(prices) || prices.length === 0) return;
          const first = prices[0] as number;
          const last = prices[prices.length - 1] as number;
          const changePct = ((last - first) / first) * 100;
          cards.push({
            name: ticker,
            value: last.toFixed(2),
            change: (changePct >= 0 ? "+" : "") + changePct.toFixed(2) + "%",
            graphData: (prices as number[]).map(value => ({ value }))
          });
        });
        setCurrencyCards(cards.length ? cards : fallbackMarketData);
      } catch (err) {
        console.error("Failed to fetch currency data", err);
        setCurrencyCards(fallbackMarketData);
      } finally {
        setLoadingCurrency(false);
      }
    };
    fetchCurrencyData();
  }, []);

  const handleRowClick = (record: any) => {
    navigate(`/tradingView/${record.ticker}`);
  };

  const onSearch = (value: string) => {
    setFilteredData(
      stockData.filter(item =>
        item.company.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Define table columns
  const columns: ColumnsType<any> = [
    { title: "#", dataIndex: "key", width: 50 },
    {
      title: "Company",
      dataIndex: "company",
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>{record.ticker}</div>
        </div>
      )
    },
    { title: "Price", dataIndex: "price", render: (p: number) => `$${p.toFixed(2)}` },
    {
      title: "1D %",
      dataIndex: "day",
      render: (val: number) => (
        <span style={{ color: val >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
        </span>
      )
    },
    {
      title: "1M %",
      dataIndex: "month",
      render: (val: number) => (
        <span style={{ color: val >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
        </span>
      )
    },
    {
      title: "YTD %",
      dataIndex: "year",
      render: (val: number) => (
        <span style={{ color: val >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {val >= 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
        </span>
      )
    },
    { title: "M Cap", dataIndex: "marketCap" },
    {
      title: "Favorites",
      key: "favorite",
      width: 80,
      align: "center",
      render: (_, record) => {
        const isFav = favorites.includes(record.ticker);
        const Icon = isFav ? StarFilled : StarOutlined;
        return (
          <Icon
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(record.ticker);
            }}
            style={{ fontSize: 16, color: isFav ? "#faad14" : "#aaa", cursor: "pointer" }}
          />
        );
      }
    }
  ];

  const tableLoading = loading || favoritesLoading;

  const favoriteRows = stockData.filter(item => favorites.includes(item.ticker));
  const filteredFavoriteRows = favoriteRows.filter(item =>
    item.company.toLowerCase().includes(favoriteSearch.toLowerCase())
  );

  return (
    <div className="screener-page">
      <Navbar />

      {/* TradingView Widget */}
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
        <Row justify="center" style={{ gap: "24px" }}>
          {loadingCurrency ? (
            <Spin />
          ) : (
            currencyCards.map((item, idx) => (
              <Col
                key={idx}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <div className="market-card">
                  <div className="market-title">{item.name}</div>
                  <div className="market-value">{item.value}</div>
                  <div className={
                    `market-change ${item.change.startsWith("-") ? "negative" : "positive"}`
                  }>
                    {item.change}
                  </div>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={item.graphData}>
                      <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                      <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            ))
          )}
        </Row>
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
                  onChange={e => onSearch(e.target.value)}
                  style={{ width: 300, marginBottom: 16 }}
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredData}
                loading={tableLoading}
                scroll={{ y: 400 }}
                pagination={false}
                rowKey="key"
                onRow={record => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: "pointer" }
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
                  onChange={e => setFavoriteSearch(e.target.value)}
                  style={{ width: 300, marginBottom: 16 }}
                />
              </div>
              <Table
                columns={columns}
                dataSource={filteredFavoriteRows}
                loading={tableLoading}
                scroll={{ y: 400 }}
                pagination={false}
                rowKey="key"
                onRow={record => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: "pointer" }
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
