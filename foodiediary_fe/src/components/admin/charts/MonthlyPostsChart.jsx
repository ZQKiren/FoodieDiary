import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const MonthlyPostsChart = ({ data }) => {
  const chartRef = useRef(null);
  
  useLayoutEffect(() => {
    // Kiểm tra nếu đã có chart để tránh tạo lại khi re-render
    if (chartRef.current) {
      chartRef.current.dispose();
    }
    
    // Tạo root element
    const root = am5.Root.new("monthlyPostsChart");
    chartRef.current = root;
    
    // Thiết lập theme
    root.setThemes([am5themes_Animated.new(root)]);
    
    // Tạo chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0
      })
    );
    
    // Format dữ liệu
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const formattedData = data.map(item => ({
      month: monthNames[item.month - 1],
      count: item.count
    }));
    
    // Tạo trục Y
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );
    
    // Tạo trục X
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        categoryField: "month"
      })
    );
    xAxis.data.setAll(formattedData);
    
    // Tạo series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Posts",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "month",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY} posts"
        })
      })
    );
    
    // Thiết lập màu cho cột
    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      fill: am5.color("#22c55e")  // Green color matching your original
    });
    
    // Thêm hiệu ứng hover
    series.columns.template.states.create("hover", {
      fill: am5.color("#16a34a")  // Darker green on hover
    });
    
    // Thêm data vào series
    series.data.setAll(formattedData);
    
    // Thêm cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none",
      xAxis: xAxis,
      yAxis: yAxis
    }));
    
    // Thêm grid cho trục Y
    yAxis.get("renderer").grid.template.setAll({
      strokeDasharray: [3, 3]
    });
    
    // Make sure all labels are shown
    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "wrap",
      textAlign: "center",
      maxWidth: 50
    });
    
    // Animate series on appearance
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, [data]);

  return <div id="monthlyPostsChart" style={{ width: "100%", height: "100%" }}></div>;
};

export default MonthlyPostsChart;