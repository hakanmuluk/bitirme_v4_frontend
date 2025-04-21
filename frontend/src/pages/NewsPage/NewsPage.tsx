import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import axios from "axios";

const { Title, Paragraph } = Typography;

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

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/news?limit=20`).then((res) => {
      setNews(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "2rem auto" }} />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Latest News</Title>
      <Row gutter={[16, 16]}>
        {news.map((item) => (
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
    </div>
  );
};

export default NewsPage;