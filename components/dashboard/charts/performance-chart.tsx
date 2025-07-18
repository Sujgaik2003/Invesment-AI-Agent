"use client"

import { useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface PerformanceChartProps {
  data: Array<{
    date: string
    value: number
    return: number
  }>
  timeframe: string
}

export default function PerformanceChart({ data, timeframe }: PerformanceChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null)

  const formatDate = (dateString: string, timeframe: string) => {
    const date = new Date(dateString)

    switch (timeframe) {
      case "1D":
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      case "1W":
        return date.toLocaleDateString("en-US", { weekday: "short" })
      case "1M":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      case "3M":
      case "6M":
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      case "1Y":
        return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      default:
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const chartData = {
    labels: data.map((point) => formatDate(point.date, timeframe)),
    datasets: [
      {
        label: "Portfolio Value",
        data: data.map((point) => point.value),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#3B82F6",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3B82F6",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const dataIndex = context[0].dataIndex
            const date = new Date(data[dataIndex].date)
            return date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              ...(timeframe === "1D" && {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })
          },
          label: (context: any) => {
            const dataIndex = context.dataIndex
            const value = data[dataIndex].value
            const returnPercent = data[dataIndex].return

            return [
              `Portfolio Value: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              `Return: ${returnPercent >= 0 ? "+" : ""}${returnPercent.toFixed(2)}%`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: timeframe === "1D" ? 8 : timeframe === "1W" ? 7 : 10,
          color: "#6B7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 12,
          },
          callback: (value: any) => "$" + value.toLocaleString(),
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart" as const,
    },
  }

  return (
    <div className="w-full h-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  )
}
