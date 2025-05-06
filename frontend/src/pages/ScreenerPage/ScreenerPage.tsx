import React, { useState } from "react";
import { Table, Tabs, Input } from "antd";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

// Hardcoded companies (screener) data based on Borsa İstanbul
const hardcodedStockData = [
  {
    key: 1,
    company: "Turkcell İletişim Hizmetleri A.Ş.",
    ticker: "TCELL.IS",
    price: 18.75,
    day: 0.50,
    month: 2.30,
    year: 10.50,
    marketCap: "35B"
  },
  {
    key: 2,
    company: "Akbank T.A.Ş.",
    ticker: "AKBNK.IS",
    price: 7.25,
    day: -0.30,
    month: 4.10,
    year: 12.00,
    marketCap: "50B"
  },
  {
    key: 3,
    company: "Koç Holding A.Ş.",
    ticker: "KCHOL.IS",
    price: 110.50,
    day: 1.20,
    month: 6.50,
    year: 15.00,
    marketCap: "100B"
  }
];

// Hardcoded currency & index (graphics) data for BIST & Currencies
const hardcodedCurrencyCards = [
  {
    name: "USD/TRY",
    value: "23.60",
    change: "+0.43%",
    graphData: [ { value: 23.50 }, { value: 23.70 }, { value: 23.60 } ]
  },
  {
    name: "EUR/TRY",
    value: "25.10",
    change: "+0.40%",
    graphData: [ { value: 25.00 }, { value: 25.20 }, { value: 25.10 } ]
  },
  {
    name: "GBP/TRY",
    value: "29.05",
    change: "+0.17%",
    graphData: [ { value: 29.00 }, { value: 29.10 }, { value: 29.05 } ]
  },
  {
    name: "BIST 100 Index",
    value: "605",
    change: "+0.83%",
    graphData: [ { value: 600 }, { value: 610 }, { value: 605 } ]
  }
];

const ScreenerPage: React.FC = () => {
  const [stockData] = useState(hardcodedStockData);
  const [filteredData, setFilteredData] = useState(hardcodedStockData);
  const [currencyCards] = useState(hardcodedCurrencyCards);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteSearch, setFavoriteSearch] = useState("");

  const navigate = useNavigate();

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
          <Icon
            onClick={e => { e.stopPropagation(); /* add favorite toggle logic here if needed */ }}
            style={{ fontSize: 16, color: fav ? "#faad14" : "#aaa", cursor: "pointer" }}
          />
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
