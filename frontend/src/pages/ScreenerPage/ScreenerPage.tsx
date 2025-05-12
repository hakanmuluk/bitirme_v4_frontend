import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tabs, Input, Spin, Skeleton } from "antd";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from "recharts";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;
const API_BASE = "https://investmenthelper-ai-backend.up.railway.app";

const ScreenerPage: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [currencyCards, setCurrencyCards] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [stocksLoading, setStocksLoading] = useState<boolean>(true);
  const [currencyLoading, setCurrencyLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const container = document.getElementById("tradingview-widget-container");
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
        { description: "BIST Technology Index", proName: "BIST:XUTEK" }
      ],
      showSymbolLogo: true,
      isTransparent: false,
      autosize: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      colorTheme: "light",
      locale: "en"
    });
    container.appendChild(script);
  }, []);

  useEffect(() => {
    setStocksLoading(true);
    axios.get(`${API_BASE}/api/stocks/`)
      .then(res => {
        // Filter out items with error before mapping
        const validItems = res.data.filter((item: any) => !item.error);
        // Map API fields to table format
        const stocks = validItems.map((item: any, idx: number) => ({
          key: idx + 1,
          company: item.company,
          ticker: `${item.ticker}.IS`,
          price: item.price,
          day: item.dayChange,
          month: item.monthChange,
          year: item.ytdChange,
          marketCap: item.marketCap
        }));
        setFilteredData(stocks);
        setStockData(stocks);
        setStocksLoading(false);
      })
      .catch(err => {
        console.error(err);
        setStocksLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrencyLoading(true);
    axios.get(`${API_BASE}/api/currency/`)
      .then(res => {
        // Interpret arr so that arr[0] is oldest, arr[arr.length-1] is newest
        // Compute 7-day change percent using the newest and the value 7 days ago (or oldest)
        const cards = Object.entries(res.data as Record<string, number[]>).map(([symbol, arr]) => {
          const oldest = arr[0] ?? 0;
          const newest = arr[arr.length - 1] ?? oldest;
          // 7 days ago: if not enough data, fallback to oldest
          const sevenDaysAgo = arr[arr.length - 1 - 6] ?? oldest;
          const changePercent = sevenDaysAgo !== 0
            ? ((newest - sevenDaysAgo) / sevenDaysAgo * 100).toFixed(2)
            : "0.00";
          // Use original series order for sparkline with dates
          const graphData = arr.map((val, idx) => {
            // idx 0 is oldest, so date is today minus (arr.length - 1 - idx) days
            const date = new Date();
            date.setDate(date.getDate() - (arr.length - 1 - idx));
            return {
              date: date.toISOString().split('T')[0], // YYYY-MM-DD
              value: val
            };
          });
          return {
            name: symbol,
            value: newest.toFixed(4),
            change: `${changePercent}%`,
            graphData
          };
        });
        setCurrencyCards(cards);
        setCurrencyLoading(false);
      })
      .catch(err => {
        console.error(err);
        setCurrencyLoading(false);
      });
  }, []);

  // Fetch favorites on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/favorites/get`, { withCredentials: true })
      .then(res => setFavorites(res.data.favoriteCompanies || []))
      .catch(console.error)
      .finally(() => setFavoritesLoading(false));
  }, []);

  // Toggle favorite via API
  const toggleFavorite = async (ticker: string) => {
    const endpoint = favorites.includes(ticker) ? "/api/favorites/remove" : "/api/favorites/add";
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

  // Navigate to TradingView when clicking a row
  const handleRowClick = (rec: any) => {
    navigate(`/tradingView/${rec.ticker}`);
  };

  // Filter companies by search term
  const onSearch = (v: string) => {
    setFilteredData(
      stockData.filter(item =>
        item.company.toLowerCase().includes(v.toLowerCase())
      )
    );
  };

  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (active && payload && payload.length && coordinate) {
      return (
        <div
          style={{
            position: 'absolute',
            left: coordinate.x,
            top: coordinate.y - 30,
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: '4px 8px',
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            pointerEvents: 'none',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap'
          }}
        >
          <div>{label}</div>
          <div>{`Value: ${payload[0].value.toFixed(4)}`}</div>
        </div>
      );
    }
    return null;
  };

  // Table columns definition
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
      )
    },
    { title: "Price", dataIndex: "price", render: (p: number) => `${p.toFixed(2)} TL` },
    {
      title: "1D %",
      dataIndex: "day",
      render: (v: number) => (
        <span style={{ color: v >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      )
    },
    {
      title: "1M %",
      dataIndex: "month",
      render: (v: number) => (
        <span style={{ color: v >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      )
    },
    {
      title: "YTD %",
      dataIndex: "year",
      render: (v: number) => (
        <span style={{ color: v >= 0 ? "green" : "red", fontWeight: "bold" }}>
          {v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
        </span>
      )
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
          <Spin spinning={favoritesLoading}>
            <Icon
              onClick={e => { e.stopPropagation(); toggleFavorite(rec.ticker); }}
              style={{ fontSize: 16, color: fav ? "#faad14" : "#aaa", cursor: "pointer" }}
            />
          </Spin>
        );
      }
    }
  ];

  return (
    <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", paddingTop: 64, padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Navbar />

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
      {currencyLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <div style={{ width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, margin: "16px 0", paddingTop: 80 }}>
          {currencyCards.map((item, idx) => {
            const lineColor = item.change.startsWith("-") ? "var(--color-error)" : "var(--color-success)";
            return (
              <div key={idx} style={{ backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: 16, display: "flex", flexDirection: "column", alignItems: "center", transition: "transform 0.2s", cursor: "pointer" }}>
                <div>{item.name}</div>
                <div>{item.value}</div>
                <div style={{ color: item.change.startsWith("-") ? "red" : "green", fontWeight: "bold" }}>
                  {item.change}
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={item.graphData}>
                    <XAxis dataKey="date" hide={true} />
                    <YAxis
                      hide
                      domain={["auto", "auto"]}
                    />
                    <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} stroke={lineColor} />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={false}
                      wrapperStyle={{ overflow: 'visible' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* Screener Tabs */}
      <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto" }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Companies" key="1">
            <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto", padding: 8, backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center" }}>
              <Input placeholder="Search..." prefix={<SearchOutlined />} onChange={e => onSearch(e.target.value)} style={{ width: "100%", maxWidth: 400 }} />
            </div>
            <Spin spinning={stocksLoading}>
              <Table columns={columns} dataSource={filteredData} pagination={false} rowKey="key" sticky onRow={rec => ({ onClick: () => handleRowClick(rec), style: { cursor: "pointer" } })} scroll={{ x: 'max-content', y: 400 }} />
            </Spin>
          </TabPane>
          <TabPane tab="My Favorites" key="2">
            <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto", padding: 8, backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center" }}>
              <Input placeholder="Search favorites..." prefix={<SearchOutlined />} value={favoriteSearch} onChange={e => setFavoriteSearch(e.target.value)} style={{ width: "100%", maxWidth: 400 }} />
            </div>
            <Table columns={columns} dataSource={filteredData.filter(x => favorites.includes(x.ticker) && x.company.toLowerCase().includes(favoriteSearch.toLowerCase()))} pagination={false} rowKey="key" sticky onRow={rec => ({ onClick: () => handleRowClick(rec), style: { cursor: "pointer" } })} scroll={{ x: 'max-content', y: 400 }} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ScreenerPage;
