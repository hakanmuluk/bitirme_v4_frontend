import React, { useState, useEffect, memo } from "react";
import axios from "axios";
import { Row, Col, Card, Spin, Typography, Button, Popover, Input } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar/Navbar";
import "./ReportPage.css";

const { Title, Text } = Typography;
const API_BASE = "https://investmenthelper-ai-backend.up.railway.app/api/report";

interface DocumentItem {
  id: string;
  name: string;
}

const PDFPreview = memo(({ url, title }: { url: string; title: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <div className="preview-placeholder"><Spin /></div>}
      <iframe
        src={url}
        title={title}
        className="preview-small"
        style={{ display: isLoaded ? 'block' : 'none' }}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
});

const PDFCard = memo(({ doc, visible }: { doc: DocumentItem; visible: boolean }) => {
  const previewUrl = `${API_BASE}/preview/${doc.id}`;

  return (
    <Col 
      xs={24} 
      sm={12} 
      md={8} 
      lg={6} 
      style={{ display: visible ? 'flex' : 'none' }}
    >
      <Popover
        content={
          <iframe
            src={previewUrl}
            width="400"
            height="600"
            style={{ border: 0, borderRadius: 4 }}
            title={doc.name}
          />
        }
        trigger="hover"
        mouseEnterDelay={1}
        placement="rightTop"
      >
        <Card
          className="report-card"
          hoverable
          cover={
            <PDFPreview url={previewUrl} title={doc.name} />
          }
          actions={[
            <Button
              type="text"
              icon={<DownloadOutlined />}
              href={`${API_BASE}/download/${doc.id}`}
              target="_blank"
              key="download"
            >
              Download
            </Button>,
          ]}
        >
          <Card.Meta title={doc.name} />
        </Card>
      </Popover>
    </Col>
  );
});

const ReportPage: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Instead of filtering docs array, compute visibility
  const isVisible = (doc: DocumentItem) => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase());

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get<DocumentItem[]>(`${API_BASE}/reports`, {
          withCredentials: true,
        });
        setDocs(res.data);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="pdf-page">
      <Navbar />
      <div className="pdf-container">
        <Title level={2}>Your Financial Reports</Title>

        <Input
          placeholder="Search by report name..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        {loading ? (
          <Spin size="large" />
        ) : docs.length > 0 ? (
          <Row gutter={[16, 16]}>
            {docs.map((doc) => (
              <PDFCard 
                key={doc.id} 
                doc={doc} 
                visible={isVisible(doc)} 
              />
            ))}
          </Row>
        ) : (
          <Text>No reports found.</Text>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
