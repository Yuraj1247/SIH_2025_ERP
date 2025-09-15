"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface AttendanceChartProps {
  data: {
    labels: string[]
    present: number[]
    absent: number[]
  }
  type?: "line" | "bar"
  title?: string
}

export default function AttendanceChart({ data, type = "line", title = "Attendance Trend" }: AttendanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const config: ChartConfiguration = {
      type: type,
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Present",
            data: data.present,
            backgroundColor: type === "line" ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.8)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 2,
            fill: type === "line",
            tension: 0.4,
          },
          {
            label: "Absent",
            data: data.absent,
            backgroundColor: type === "line" ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.8)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 2,
            fill: type === "line",
            tension: 0.4,
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
            position: "top",
            labels: {
              font: {
                family: "Poppins",
                size: 12,
              },
              color: "#666666",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                family: "Poppins",
                size: 11,
              },
              color: "#666666",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            ticks: {
              font: {
                family: "Poppins",
                size: 11,
              },
              color: "#666666",
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
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
  }, [data, type, title])

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
