"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface DoughnutChartProps {
  data: {
    labels: string[]
    values: number[]
    colors?: string[]
  }
  title?: string
  centerText?: string
}

export default function DoughnutChart({ data, title = "Overview", centerText }: DoughnutChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const defaultColors = ["#22C55E", "#EF4444", "#F59E0B", "#8B5CF6"]

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const config: ChartConfiguration = {
      type: "doughnut",
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: data.colors || defaultColors.slice(0, data.values.length),
            borderColor: "#ffffff",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
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
      plugins: [
        {
          id: "centerText",
          beforeDraw: (chart) => {
            if (centerText) {
              const { ctx, chartArea } = chart
              const centerX = (chartArea.left + chartArea.right) / 2
              const centerY = (chartArea.top + chartArea.bottom) / 2

              ctx.save()
              ctx.font = "bold 24px PT Sans"
              ctx.fillStyle = "#333333"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillText(centerText, centerX, centerY)
              ctx.restore()
            }
          },
        },
      ],
    }

    chartInstance.current = new Chart(ctx, config)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, centerText])

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
