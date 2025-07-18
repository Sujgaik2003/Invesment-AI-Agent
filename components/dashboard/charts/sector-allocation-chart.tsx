"use client"

import { useRef } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

interface Sector {
  name: string
  value: number
  percentage: number
  change: number
  color: string
}

interface SectorAllocationChartProps {
  sectors: Sector[]
}

export default function SectorAllocationChart({ sectors }: SectorAllocationChartProps) {
  const chartRef = useRef<ChartJS<"doughnut">>(null)

  const chartData = {
    labels: sectors.map((sector) => sector.name),
    datasets: [
      {
        data: sectors.map((sector) => sector.percentage),
        backgroundColor: sectors.map((sector) => sector.color),
        borderColor: sectors.map((sector) => sector.color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: false, // We'll use custom legend
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#3B82F6",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const sector = sectors[context.dataIndex]
            return [
              `${sector.name}: ${sector.percentage}%`,
              `Value: $${sector.value.toLocaleString()}`,
              `Change: ${sector.change >= 0 ? "+" : ""}${sector.change.toFixed(1)}%`,
            ]
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeInOutQuart" as const,
    },
    onHover: (event: any, elements: any) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = elements.length > 0 ? "pointer" : "default"
      }
    },
  }

  // Calculate total value for center display
  const totalValue = sectors.reduce((sum, sector) => sum + sector.value, 0)
  const totalChange = sectors.reduce((sum, sector) => sum + (sector.value * sector.change) / 100, 0)
  const totalChangePercent = (totalChange / totalValue) * 100

  return (
    <div className="relative w-full h-full">
      <Doughnut ref={chartRef} data={chartData} options={options} />

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
          <div className={`text-sm font-medium ${totalChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalChangePercent >= 0 ? "+" : ""}
            {totalChangePercent.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Total Value</div>
        </div>
      </div>
    </div>
  )
}
