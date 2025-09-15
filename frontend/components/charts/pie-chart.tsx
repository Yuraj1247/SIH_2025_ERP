"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface PieChartProps {
  data: {
    labels: string[]
    values: number[]
    colors?: string[]
  }
  title?: string
}

export default function PieChart({ data, title = "Distribution" }: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const defaultColors = ["#4B87F6", "#F2C94C", "#E74C3C", "#22C55E", "#8B5CF6", "#F97316", "#06B6D4", "#EF4444"]

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const config: ChartConfiguration = {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: data.colors || defaultColors.slice(0, data.values.length),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              family: "PT Sans",
              size: 16,
              weight: "bold",
            },
            color: "#333333",
          },
          legend: {
            position: "bottom",
            labels: {
              font: {
                family: "Poppins",
                size: 12,
              },
              color: "#666666",
              padding: 20,
            },
          },
        },
      },
    }

    chartInstance.current = new Chart(ctx, config)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title])

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
