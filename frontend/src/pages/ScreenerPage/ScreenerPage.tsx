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

// Hardcoded companies (screener) data based on Borsa İstanbul
const hardcodedStockData = [
  {
    key: 1,
    company: "Turkcell İletişim Hizmetleri A.Ş.",
    ticker: "TCELL.IS",
    price: 87.80,
    day: 1.50,
    month: -4.82,
    year: 7.13,
    marketCap: "194,51B"
  },
  {
    key: 2,
    company: "Akbank T.A.Ş.",
    ticker: "AKBNK.IS",
    price: 49.72,
    day: 2.39,
    month: -5.35,
    year: -17.10,
    marketCap: "257.40B"
  },
  {
    key: 3,
    company: "Koç Holding A.Ş.",
    ticker: "KCHOL.IS",
    price: 136,
    day: 0.81,
    month: -16.45,
    year: -41.86,
    marketCap: "350.97B"
  }
];

// Hardcoded currency & index (graphics) data for BIST & Currencies
const hardcodedCurrencyCards = [
  // --- USD / TRY ----------------------------------------------------------
  {
    name: "USD/TRY",
    value: "38.6109",        // close on May 06 2025
    change: "+0.04%",        // vs. May 05
    graphData: [
      { value: 37.9525 },  // Apr 07
      { value: 37.9449 },  // Apr 08
      { value: 37.9706 },  // Apr 09
      { value: 37.8965 },  // Apr 10
      { value: 37.8604 },  // Apr 11
      { value: 38.0255 },  // Apr 14
      { value: 38.0785 },  // Apr 15
      { value: 38.1291 },  // Apr 16
      { value: 37.6085 },  // Apr 17
      { value: 37.6529 },  // Apr 18
      { value: 38.1701 },  // Apr 21
      { value: 38.2634 },  // Apr 22
      { value: 38.3025 },  // Apr 23
      { value: 38.3464 },  // Apr 24
      { value: 38.4235 },  // Apr 25
      { value: 38.4339 },  // Apr 28
      { value: 38.4713 },  // Apr 29
      { value: 38.4908 },  // Apr 30
      { value: 38.4479 },  // May 01
      { value: 38.5698 },  // May 02
      { value: 38.5950 },  // May 05
      { value: 38.6109 }   // May 06  ← latest
    ]
  },

  // --- EUR / TRY ----------------------------------------------------------
  {
    name: "EUR/TRY",
    value: "43.7382",
    change: "+0.18%",
    graphData: [
      { value: 41.3835 },  // Apr 07
      { value: 41.5724 },  // Apr 08
      { value: 41.5816 },  // Apr 09
      { value: 42.4327 },  // Apr 10
      { value: 43.0094 },  // Apr 11
      { value: 43.1370 },  // Apr 14
      { value: 42.9564 },  // Apr 15
      { value: 43.4595 },  // Apr 16
      { value: 42.7345 },  // Apr 17
      { value: 42.8904 },  // Apr 18
      { value: 43.9414 },  // Apr 21
      { value: 43.6987 },  // Apr 22
      { value: 43.3393 },  // Apr 23
      { value: 43.6745 },  // Apr 24
      { value: 43.6683 },  // Apr 25
      { value: 43.8992 },  // Apr 28
      { value: 43.8015 },  // Apr 29
      { value: 43.6044 },  // Apr 30
      { value: 43.4174 },  // May 01
      { value: 43.5685 },  // May 02
      { value: 43.6614 },  // May 05
      { value: 43.7382 }   // May 06
    ]
  },

  // --- GBP / TRY ----------------------------------------------------------
  {
    name: "GBP/TRY",
    value: "51.5428",
    change: "+0.44%",
    graphData: [
      { value: 48.2681 },  // Apr 07
      { value: 48.4367 },  // Apr 08
      { value: 48.6555 },  // Apr 09
      { value: 49.1404 },  // Apr 10
      { value: 49.5214 },  // Apr 11
      { value: 50.1307 },  // Apr 14
      { value: 50.3779 },  // Apr 15
      { value: 50.4829 },  // Apr 16
      { value: 49.8877 },  // Apr 17
      { value: 50.0558 },  // Apr 18
      { value: 51.0601 },  // Apr 21
      { value: 51.0090 },  // Apr 22
      { value: 50.7643 },  // Apr 23
      { value: 51.1655 },  // Apr 24
      { value: 51.1628 },  // Apr 25
      { value: 51.6572 },  // Apr 28
      { value: 51.5804 },  // Apr 29
      { value: 51.3102 },  // Apr 30
      { value: 51.0666 },  // May 01
      { value: 51.1918 },  // May 02
      { value: 51.3182 },  // May 05
      { value: 51.5428 }   // May 06
    ]
  },

  // --- BIST 100 Index ------------------------------------------------------
  {
    name: "BIST 100 Index",
    value: "9196.64",
    change: "+0.93%",
    graphData: [
      { value: 9407.17 },  // Apr 07
      { value: 9477.14 },  // Apr 08
      { value: 9275.50 },  // Apr 09
      { value: 9338.58 },  // Apr 10
      { value: 9380.95 },  // Apr 11
      { value: 9423.62 },  // Apr 14
      { value: 9393.79 },  // Apr 15
      { value: 9266.09 },  // Apr 16
      { value: 9396.02 },  // Apr 17
      { value: 9317.24 },  // Apr 18
      { value: 9321.64 },  // Apr 21
      { value: 9312.13 },  // Apr 22
      { value: 9490.90 },  // Apr 24
      { value: 9432.55 },  // Apr 25
      { value: 9306.96 },  // Apr 28
      { value: 9224.84 },  // Apr 29
      { value: 9078.43 },  // Apr 30
      { value: 9167.58 },  // May 02
      { value: 9112.19 },  // May 05
      { value: 9196.64 }   // May 06
    ]
  }
]

const ScreenerPage: React.FC = () => {
  const [stockData] = useState(hardcodedStockData);
  const [filteredData, setFilteredData] = useState(hardcodedStockData);
  const [currencyCards] = useState(hardcodedCurrencyCards);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoriteSearch, setFavoriteSearch] = useState("");

  const navigate = useNavigate();

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

      {/* Market Cards */}
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
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} stroke={lineColor} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Screener Tabs */}
      <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto" }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Companies" key="1">
            <div style={{ width: "100%", maxWidth: 1200, margin: "16px auto", padding: 8, backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center" }}>
              <Input placeholder="Search..." prefix={<SearchOutlined />} onChange={e => onSearch(e.target.value)} style={{ width: "100%", maxWidth: 400 }} />
            </div>
            <Table columns={columns} dataSource={filteredData} pagination={false} rowKey="key" sticky onRow={rec => ({ onClick: () => handleRowClick(rec), style: { cursor: "pointer" } })} scroll={{ x: 'max-content', y: 400 }} />
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
