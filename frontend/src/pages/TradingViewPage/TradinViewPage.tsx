// frontend/src/pages/TradingViewPage/TradingViewPage.tsx
import React, { useEffect, useRef, memo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './TradingViewPage.css';

const TradingViewPage: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { stockId } = useParams<{ stockId: string }>();

  // Normalize ticker (remove trailing ".IS")
  let ticker = (stockId || '').endsWith('.IS')
    ? stockId!.slice(0, -3)
    : stockId || '';

  useEffect(() => {
    if (!chartRef.current) return;
    // Clear prior widget if any
    chartRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      container_id: 'tradingview_widget_container',
      symbol: ticker,
      interval: 'D',
      timezone: 'Etc/GMT+3',
      theme: 'light',
      style: '1',
      withdateranges: true,
      hide_side_toolbar: false,
      save_image: true,
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
    });

    chartRef.current.appendChild(script);
  }, [ticker]);

  return (
    <div className="trading-view-page">
      <Navbar />
      <div className="chart-container">
        <div
          ref={chartRef}
          id="tradingview_widget_container"
          className="tradingview-widget-container"
        >
          <div className="tradingview-widget-container__widget" />
        </div>
      </div>
    </div>
  );
};

export default memo(TradingViewPage);
