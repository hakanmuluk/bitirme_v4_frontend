import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin, Pagination, Input, Layout } from "antd";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar"
const { Title, Paragraph } = Typography;
const { Header, Content } = Layout;
const { Search } = Input;

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url: string;
  link: string;
  published_at: string;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/news?limit=180`).then((res) => {
      setNews(res.data);
      setLoading(false);
    });
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedNews = filteredNews.slice((currentPage - 1) * 18, currentPage * 18);

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "2rem auto" }} />;
  }

  return (
    <>
      <Navbar />
      <div style={{ position: "fixed", top: 64, width: "100%", background: "#fff", zIndex: 1000, padding: "16px 24px", display: "flex", justifyContent: "center" }}>
        <Search
          placeholder="Search news..."
          onSearch={(value) => setSearchTerm(value)}
          enterButton
          style={{ maxWidth: "400px" }}
        />
      </div>
      <Layout>
        <Content style={{ padding: "24px", paddingTop: "140px" }}>
          <Row gutter={[16, 16]}>
            {paginatedNews.map((item) => (
              <Col xs={24} md={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  cover={<img alt={item.title} src={item.image_url} />}
                  onClick={() => window.open(item.link, "_blank")}
                >
                  <Title level={4}>{item.title}</Title>
                  <Paragraph ellipsis={{ rows: 3 }}>{item.content}</Paragraph>
                  <Paragraph type="secondary" style={{ fontSize: "12px" }}>
                    {new Date(item.published_at).toLocaleString()}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={currentPage}
            pageSize={18}
            total={filteredNews.length}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}
          />
        </Content>
      </Layout>
    </>
  );
};

export default NewsPage;