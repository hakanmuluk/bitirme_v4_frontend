import React, { useEffect, useRef, memo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import './TradingViewPage.css';

function TradingViewWidget() {
    const chartRef = useRef(null);
    const { stockId } = useParams(); // Extract the ticker parameter from the URL
    // Remove the trailing ".IS" if present
    let ticker = stockId || "";
    if (ticker.endsWith(".IS")) {
        ticker = ticker.slice(0, ticker.length - 3);
    }
    console.log("Final ticker:", ticker);

    useEffect(() => {
        // Clear any previous widget content
        if (chartRef.current) {
            chartRef.current.innerHTML = "";
        }
        
        // Create the TradingView embed script
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        // Use JSON.stringify to inject the config safely
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "container_id": "tradingview_widget_container",
            "symbol": ticker,
            "interval": "D",
            "timezone": "Etc/GMT+3",
            "theme": "light",
            "style": "1",
            "withdateranges": true,
            "hide_side_toolbar": false,
            "save_image": true,
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650"
        });
        
        if (chartRef.current) {
            chartRef.current.appendChild(script);
        }
    }, [ticker]);

    return (
        <div className="trading-view-page">
            <Navbar />
            <div className="chart-container">
                {/* Make sure the container has the same id as defined in the config */}
                <div
                    ref={chartRef}
                    id="tradingview_widget_container"
                    className="tradingview-widget-container"
                    style={{ width: '100%', height: '100%' }}
                >
                    <div className="tradingview-widget-container__widget" style={{ width: '100%', height: '100%' }}></div>
                </div>
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
