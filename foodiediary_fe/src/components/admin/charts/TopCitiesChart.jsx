import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const TopCitiesChart = ({ data }) => {
  const chartRef = useRef(null);
  
  useLayoutEffect(() => {
    // Kiểm tra nếu đã có chart để tránh tạo lại khi re-render
    if (chartRef.current) {
      chartRef.current.dispose();
    }
    
    // Tạo root element
    const root = am5.Root.new("topCitiesChart");
    chartRef.current = root;
    
    // Thiết lập theme
    root.setThemes([am5themes_Animated.new(root)]);
    
    // Tạo chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(40)  // Tạo donut chart
      })
    );
    
    // Format dữ liệu
    const formattedData = data.map(item => ({
      city: item.city.trim(),
      count: item.count
    }));
    
    // Tạo series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "count",
        categoryField: "city",
        startAngle: 180,
        endAngle: 540
      })
    );
    
    // Thiết lập colors - Sử dụng palette tương tự COLORS trong component gốc
    const colors = [
      "#22c55e", "#16a34a", "#15803d", "#166534", 
      "#14532d", "#4ade80", "#86efac", "#bbf7d0"
    ].map(color => am5.color(color));
    
    series.get("colors").set("colors", colors);
    
    // Cấu hình labels
    series.labels.template.setAll({
      fontSize: 12,
      text: "{category}: {value} posts",
      maxWidth: 140,
      oversizedBehavior: "wrap"
    });
    
    // Cấu hình ticks
    series.ticks.template.setAll({
      forceHidden: false,
      strokeOpacity: 0.4
    });
    
    // Thiết lập tooltip
    series.slices.template.setAll({
      cornerRadius: 5,
      tooltipText: "{category}: {value} posts ({valuePercentTotal.formatNumber('0.0')}%)"
    });
    
    // Thêm hiệu ứng hover
    series.slices.template.states.create("hover", {
      scale: 1.05
    });
    
    // Thêm data vào series
    series.data.setAll(formattedData);
    
    // Tạo legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        y: am5.percent(0),
        layout: root.horizontalLayout
      })
    );
    legend.data.setAll(series.dataItems);
    
    // Animate chart
    series.appear(1000, 100);

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, [data]);

  return <div id="topCitiesChart" style={{ width: "100%", height: "100%" }}></div>;
};

export default TopCitiesChart;