"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, registerables } from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, TrendingUp, Calendar, Users, Clock, Target, Award, AlertTriangle } from "lucide-react"
import type { Student, Lecture } from "@/lib/storage"

Chart.register(...registerables)

interface AdvancedAnalyticsProps {
  student: Student
  lectures: Lecture[]
  isSubjectSpecific?: boolean
  subjectName?: string
  teacherName?: string
}

interface SubjectAnalytics {
  subject: string
  totalLectures: number
  attendedLectures: number
  percentage: number
  teacher: string
  recentTrend: number[]
  consecutiveAbsences: number
  longestStreak: number
  averageGap: number
  riskLevel: "low" | "medium" | "high"
  predictedFinalPercentage: number
}

interface AdvancedMetrics {
  punctualityScore: number
  consistencyIndex: number
  improvementRate: number
  riskAssessment: string
  recommendedActions: string[]
  semesterProjection: number
  attendanceVelocity: number
  performanceCategory: string
}

export default function AdvancedAnalytics({
  student,
  lectures,
  isSubjectSpecific = false,
  subjectName,
  teacherName,
}: AdvancedAnalyticsProps) {
  const attendanceChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const trendChartRef = useRef<HTMLCanvasElement>(null)
  const monthlyChartRef = useRef<HTMLCanvasElement>(null)
  const heatmapChartRef = useRef<HTMLCanvasElement>(null)
  const performanceChartRef = useRef<HTMLCanvasElement>(null)

  const [analytics, setAnalytics] = useState<{
    overall: { attended: number; total: number; percentage: number }
    subjects: SubjectAnalytics[]
    monthlyData: { month: string; percentage: number; attended: number; total: number }[]
    weeklyTrend: number[]
    dailyPattern: { day: string; percentage: number }[]
    timeSlotAnalysis: { slot: string; percentage: number }[]
    advancedMetrics: AdvancedMetrics
  }>({
    overall: { attended: 0, total: 0, percentage: 0 },
    subjects: [],
    monthlyData: [],
    weeklyTrend: [],
    dailyPattern: [],
    timeSlotAnalysis: [],
    advancedMetrics: {
      punctualityScore: 0,
      consistencyIndex: 0,
      improvementRate: 0,
      riskAssessment: "",
      recommendedActions: [],
      semesterProjection: 0,
      attendanceVelocity: 0,
      performanceCategory: "",
    },
  })

  useEffect(() => {
    calculateAdvancedAnalytics()
  }, [student, lectures])

  const calculateAdvancedAnalytics = () => {
    let filteredLectures = lectures.filter((l) => l.isLocked)

    // Filter lectures for specific subject if needed
    if (isSubjectSpecific && subjectName) {
      filteredLectures = filteredLectures.filter((lecture) => lecture.subject === subjectName)
    }

    // Sort lectures by date for trend analysis
    filteredLectures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate overall attendance
    let totalAttended = 0
    const totalLectures = filteredLectures.length

    // Group by subjects
    const subjectMap = new Map<
      string,
      {
        lectures: Lecture[]
        attended: number
        teacher: string
      }
    >()

    filteredLectures.forEach((lecture) => {
      const attendance = lecture.attendance.find((a) => a.studentId === student.id)
      if (attendance?.isPresent) {
        totalAttended++
      }

      if (!subjectMap.has(lecture.subject)) {
        subjectMap.set(lecture.subject, {
          lectures: [],
          attended: 0,
          teacher: "",
        })
      }

      const subjectData = subjectMap.get(lecture.subject)!
      subjectData.lectures.push(lecture)
      if (attendance?.isPresent) {
        subjectData.attended++
      }
    })

    const subjectAnalytics: SubjectAnalytics[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
      const percentage = data.lectures.length > 0 ? (data.attended / data.lectures.length) * 100 : 0

      // Calculate recent trend (last 10 lectures)
      const recentLectures = data.lectures.slice(-10)
      const recentTrend = recentLectures.map((lecture) => {
        const attendance = lecture.attendance.find((a) => a.studentId === student.id)
        return attendance?.isPresent ? 1 : 0
      })

      // Calculate consecutive absences
      let consecutiveAbsences = 0
      for (let i = data.lectures.length - 1; i >= 0; i--) {
        const attendance = data.lectures[i].attendance.find((a) => a.studentId === student.id)
        if (!attendance?.isPresent) {
          consecutiveAbsences++
        } else {
          break
        }
      }

      // Calculate longest attendance streak
      let longestStreak = 0
      let currentStreak = 0
      data.lectures.forEach((lecture) => {
        const attendance = lecture.attendance.find((a) => a.studentId === student.id)
        if (attendance?.isPresent) {
          currentStreak++
          longestStreak = Math.max(longestStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      })

      // Calculate average gap between absences
      const absences = data.lectures.filter((lecture) => {
        const attendance = lecture.attendance.find((a) => a.studentId === student.id)
        return !attendance?.isPresent
      })
      const averageGap = absences.length > 1 ? data.lectures.length / absences.length : data.lectures.length

      // Risk assessment
      let riskLevel: "low" | "medium" | "high" = "low"
      if (percentage < 65 || consecutiveAbsences >= 3) riskLevel = "high"
      else if (percentage < 75 || consecutiveAbsences >= 2) riskLevel = "medium"

      // Predict final percentage based on current trend
      const recentPercentage =
        recentTrend.length > 0 ? (recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length) * 100 : percentage
      const predictedFinalPercentage = Math.round(percentage * 0.7 + recentPercentage * 0.3)

      return {
        subject,
        totalLectures: data.lectures.length,
        attendedLectures: data.attended,
        percentage: Math.round(percentage * 100) / 100,
        teacher: teacherName || "Teacher Name",
        recentTrend,
        consecutiveAbsences,
        longestStreak,
        averageGap: Math.round(averageGap * 100) / 100,
        riskLevel,
        predictedFinalPercentage,
      }
    })

    const monthlyMap = new Map<string, { attended: number; total: number }>()
    filteredLectures.forEach((lecture) => {
      const month = new Date(lecture.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { attended: 0, total: 0 })
      }
      const monthData = monthlyMap.get(month)!
      monthData.total++
      const attendance = lecture.attendance.find((a) => a.studentId === student.id)
      if (attendance?.isPresent) {
        monthData.attended++
      }
    })

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
      attended: data.attended,
      total: data.total,
    }))

    const dayMap = new Map<string, { attended: number; total: number }>()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    filteredLectures.forEach((lecture) => {
      const dayName = dayNames[new Date(lecture.date).getDay()]
      if (!dayMap.has(dayName)) {
        dayMap.set(dayName, { attended: 0, total: 0 })
      }
      const dayData = dayMap.get(dayName)!
      dayData.total++
      const attendance = lecture.attendance.find((a) => a.studentId === student.id)
      if (attendance?.isPresent) {
        dayData.attended++
      }
    })

    const dailyPattern = Array.from(dayMap.entries()).map(([day, data]) => ({
      day,
      percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
    }))

    const timeSlotMap = new Map<string, { attended: number; total: number }>()
    filteredLectures.forEach((lecture) => {
      const hour = Number.parseInt(lecture.time.split(":")[0])
      let slot = "Morning (8-12)"
      if (hour >= 12 && hour < 16) slot = "Afternoon (12-4)"
      else if (hour >= 16) slot = "Evening (4-8)"

      if (!timeSlotMap.has(slot)) {
        timeSlotMap.set(slot, { attended: 0, total: 0 })
      }
      const slotData = timeSlotMap.get(slot)!
      slotData.total++
      const attendance = lecture.attendance.find((a) => a.studentId === student.id)
      if (attendance?.isPresent) {
        slotData.attended++
      }
    })

    const timeSlotAnalysis = Array.from(timeSlotMap.entries()).map(([slot, data]) => ({
      slot,
      percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
    }))

    // Calculate weekly trend (last 8 weeks)
    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekLectures = filteredLectures.filter((lecture) => {
        const lectureDate = new Date(lecture.date)
        return lectureDate >= weekStart && lectureDate <= weekEnd
      })

      if (weekLectures.length === 0) return 0

      const weekAttended = weekLectures.filter((lecture) => {
        const attendance = lecture.attendance.find((a) => a.studentId === student.id)
        return attendance?.isPresent
      }).length

      return Math.round((weekAttended / weekLectures.length) * 100)
    }).reverse()

    const overallPercentage = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0

    // Punctuality Score (based on early lectures attendance)
    const morningLectures = filteredLectures.filter((l) => Number.parseInt(l.time.split(":")[0]) < 10)
    const morningAttended = morningLectures.filter((l) => {
      const attendance = l.attendance.find((a) => a.studentId === student.id)
      return attendance?.isPresent
    }).length
    const punctualityScore =
      morningLectures.length > 0 ? Math.round((morningAttended / morningLectures.length) * 100) : 100

    // Consistency Index (standard deviation of monthly percentages)
    const monthlyPercentages = monthlyData.map((m) => m.percentage)
    const avgMonthly = monthlyPercentages.reduce((a, b) => a + b, 0) / monthlyPercentages.length || 0
    const variance =
      monthlyPercentages.reduce((acc, val) => acc + Math.pow(val - avgMonthly, 2), 0) / monthlyPercentages.length || 0
    const consistencyIndex = Math.max(0, 100 - Math.sqrt(variance))

    // Improvement Rate (comparing first half vs second half)
    const midPoint = Math.floor(filteredLectures.length / 2)
    const firstHalf = filteredLectures.slice(0, midPoint)
    const secondHalf = filteredLectures.slice(midPoint)

    const firstHalfPercentage =
      firstHalf.length > 0
        ? (firstHalf.filter((l) => {
            const attendance = l.attendance.find((a) => a.studentId === student.id)
            return attendance?.isPresent
          }).length /
            firstHalf.length) *
          100
        : 0

    const secondHalfPercentage =
      secondHalf.length > 0
        ? (secondHalf.filter((l) => {
            const attendance = l.attendance.find((a) => a.studentId === student.id)
            return attendance?.isPresent
          }).length /
            secondHalf.length) *
          100
        : 0

    const improvementRate = secondHalfPercentage - firstHalfPercentage

    // Risk Assessment and Recommendations
    let riskAssessment = "Low Risk"
    let recommendedActions: string[] = []
    let performanceCategory = "Excellent"

    if (overallPercentage < 50) {
      riskAssessment = "Critical Risk"
      performanceCategory = "Critical"
      recommendedActions = [
        "Immediate intervention required",
        "Meet with academic advisor",
        "Create attendance improvement plan",
        "Consider medical/personal counseling",
      ]
    } else if (overallPercentage < 65) {
      riskAssessment = "High Risk"
      performanceCategory = "Poor"
      recommendedActions = [
        "Urgent attention needed",
        "Weekly check-ins with mentor",
        "Identify attendance barriers",
        "Set daily attendance goals",
      ]
    } else if (overallPercentage < 75) {
      riskAssessment = "Medium Risk"
      performanceCategory = "Below Average"
      recommendedActions = [
        "Monitor attendance closely",
        "Improve time management",
        "Set weekly attendance targets",
        "Seek peer support",
      ]
    } else if (overallPercentage < 85) {
      riskAssessment = "Low Risk"
      performanceCategory = "Good"
      recommendedActions = ["Maintain current efforts", "Focus on consistency", "Aim for 85%+ target"]
    } else {
      recommendedActions = ["Excellent performance!", "Continue current habits", "Help peers improve"]
    }

    // Semester Projection
    const remainingWeeks = 16 - filteredLectures.length / 3 // Assuming 3 lectures per week
    const currentTrend = weeklyTrend.slice(-4).reduce((a, b) => a + b, 0) / 4 || overallPercentage
    const semesterProjection = Math.min(100, Math.max(0, Math.round((overallPercentage + currentTrend) / 2)))

    // Attendance Velocity (rate of change)
    const recentWeeks = weeklyTrend.slice(-3)
    const attendanceVelocity =
      recentWeeks.length > 1 ? (recentWeeks[recentWeeks.length - 1] - recentWeeks[0]) / recentWeeks.length : 0

    const advancedMetrics: AdvancedMetrics = {
      punctualityScore: Math.round(punctualityScore),
      consistencyIndex: Math.round(consistencyIndex),
      improvementRate: Math.round(improvementRate * 100) / 100,
      riskAssessment,
      recommendedActions,
      semesterProjection,
      attendanceVelocity: Math.round(attendanceVelocity * 100) / 100,
      performanceCategory,
    }

    setAnalytics({
      overall: {
        attended: totalAttended,
        total: totalLectures,
        percentage: overallPercentage,
      },
      subjects: subjectAnalytics,
      monthlyData,
      weeklyTrend,
      dailyPattern,
      timeSlotAnalysis,
      advancedMetrics,
    })
  }

  useEffect(() => {
    if (analytics.overall.total > 0) {
      createAdvancedCharts()
    }
  }, [analytics])

  const createAdvancedCharts = () => {
    // Destroy existing charts
    Chart.getChart(attendanceChartRef.current!)?.destroy()
    Chart.getChart(pieChartRef.current!)?.destroy()
    Chart.getChart(trendChartRef.current!)?.destroy()
    Chart.getChart(monthlyChartRef.current!)?.destroy()
    Chart.getChart(heatmapChartRef.current!)?.destroy()
    Chart.getChart(performanceChartRef.current!)?.destroy()

    // Attendance Overview Chart
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Present", "Absent"],
            datasets: [
              {
                data: [analytics.overall.attended, analytics.overall.total - analytics.overall.attended],
                backgroundColor: ["#4B87F6", "#E74C3C"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
        })
      }
    }

    // Subject-wise Performance Chart
    if (pieChartRef.current && analytics.subjects.length > 0) {
      const ctx = pieChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: analytics.subjects.map((s) => s.subject),
            datasets: [
              {
                label: "Current %",
                data: analytics.subjects.map((s) => s.percentage),
                backgroundColor: "#4B87F6",
                borderRadius: 4,
              },
              {
                label: "Predicted %",
                data: analytics.subjects.map((s) => s.predictedFinalPercentage),
                backgroundColor: "#F2C94C",
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      }
    }

    // Weekly Trend Chart
    if (trendChartRef.current) {
      const ctx = trendChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
            datasets: [
              {
                label: "Weekly Attendance %",
                data: analytics.weeklyTrend,
                borderColor: "#F2C94C",
                backgroundColor: "rgba(242, 201, 76, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      }
    }

    // Monthly Performance Chart
    if (monthlyChartRef.current && analytics.monthlyData.length > 0) {
      const ctx = monthlyChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: analytics.monthlyData.map((m) => m.month),
            datasets: [
              {
                label: "Monthly Attendance %",
                data: analytics.monthlyData.map((m) => m.percentage),
                borderColor: "#4B87F6",
                backgroundColor: "rgba(75, 135, 246, 0.1)",
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      }
    }

    if (heatmapChartRef.current && analytics.dailyPattern.length > 0) {
      const ctx = heatmapChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: analytics.dailyPattern.map((d) => d.day),
            datasets: [
              {
                label: "Day-wise Attendance %",
                data: analytics.dailyPattern.map((d) => d.percentage),
                backgroundColor: analytics.dailyPattern.map((d) =>
                  d.percentage >= 85 ? "#4B87F6" : d.percentage >= 75 ? "#F2C94C" : "#E74C3C",
                ),
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      }
    }

    if (performanceChartRef.current) {
      const ctx = performanceChartRef.current.getContext("2d")
      if (ctx) {
        new Chart(ctx, {
          type: "radar",
          data: {
            labels: ["Attendance %", "Punctuality", "Consistency", "Improvement", "Projection"],
            datasets: [
              {
                label: "Performance Metrics",
                data: [
                  analytics.overall.percentage,
                  analytics.advancedMetrics.punctualityScore,
                  analytics.advancedMetrics.consistencyIndex,
                  Math.max(0, 50 + analytics.advancedMetrics.improvementRate),
                  analytics.advancedMetrics.semesterProjection,
                ],
                backgroundColor: "rgba(75, 135, 246, 0.2)",
                borderColor: "#4B87F6",
                pointBackgroundColor: "#4B87F6",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "#4B87F6",
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
              },
            },
          },
        })
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (percentage >= 75) return { status: "Good", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (percentage >= 65) return { status: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { status: "Poor", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Critical Risk":
        return "bg-red-500"
      case "High Risk":
        return "bg-red-400"
      case "Medium Risk":
        return "bg-yellow-500"
      default:
        return "bg-green-500"
    }
  }

  const overallStatus = getAttendanceStatus(analytics.overall.percentage)

  return (
    <div className="space-y-6 p-6 bg-white">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-[#333333] mb-2" style={{ fontFamily: "PT Sans" }}>
          {isSubjectSpecific ? `${subjectName} Analytics` : "Advanced Attendance Analytics"}
        </h1>
        <div className="text-lg text-gray-600" style={{ fontFamily: "Poppins", fontWeight: 300 }}>
          <p>
            <strong>Student:</strong> {student.fullName} (Roll No: {student.rollNo})
          </p>
          <p>
            <strong>Branch:</strong> {student.branch} | <strong>Year:</strong> {student.admittedYear} -{" "}
            {student.passingYear}
          </p>
          {isSubjectSpecific && teacherName && (
            <p>
              <strong>Teacher:</strong> {teacherName}
            </p>
          )}
          <p>
            <strong>Report Generated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#333333]">{analytics.overall.total}</div>
            <p className="text-xs text-gray-500">Attended: {analytics.overall.attended}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Attendance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overallStatus.color}`}>{analytics.overall.percentage}%</div>
            <Badge className={`text-xs ${getRiskBadgeColor(analytics.advancedMetrics.riskAssessment)} text-white`}>
              {analytics.advancedMetrics.riskAssessment}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Punctuality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4B87F6]">{analytics.advancedMetrics.punctualityScore}%</div>
            <p className="text-xs text-gray-500">Morning lectures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Consistency Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F2C94C]">{analytics.advancedMetrics.consistencyIndex}%</div>
            <p className="text-xs text-gray-500">Monthly variance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Performance Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${overallStatus.color}`}>
              {analytics.advancedMetrics.performanceCategory}
            </div>
            <p className="text-xs text-gray-500">Overall rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improvement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${analytics.advancedMetrics.improvementRate >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {analytics.advancedMetrics.improvementRate > 0 ? "+" : ""}
              {analytics.advancedMetrics.improvementRate}%
            </div>
            <p className="text-xs text-gray-500">Semester progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Semester Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4B87F6]">{analytics.advancedMetrics.semesterProjection}%</div>
            <p className="text-xs text-gray-500">Expected final %</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Attendance Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${analytics.advancedMetrics.attendanceVelocity >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {analytics.advancedMetrics.attendanceVelocity > 0 ? "+" : ""}
              {analytics.advancedMetrics.attendanceVelocity}%
            </div>
            <p className="text-xs text-gray-500">Weekly change rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={attendanceChartRef} width="400" height="300"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={performanceChartRef} width="400" height="300"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={trendChartRef} width="400" height="300"></canvas>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day-wise Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={heatmapChartRef} width="400" height="300"></canvas>
          </CardContent>
        </Card>

        {!isSubjectSpecific && (
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <canvas ref={pieChartRef} width="400" height="300"></canvas>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={monthlyChartRef} width="400" height="300"></canvas>
          </CardContent>
        </Card>
      </div>

      {analytics.timeSlotAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.timeSlotAnalysis.map((slot, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-700">{slot.slot}</h3>
                  <div className={`text-2xl font-bold ${getAttendanceStatus(slot.percentage).color}`}>
                    {slot.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recommendations & Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${overallStatus.bgColor}`}>
              <h3 className={`font-semibold ${overallStatus.color} mb-2`}>
                Risk Level: {analytics.advancedMetrics.riskAssessment}
              </h3>
              <ul className="space-y-1">
                {analytics.advancedMetrics.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-sm">•</span>
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Subject Details Table */}
      {!isSubjectSpecific && analytics.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Subject-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Teacher</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Attendance</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Predicted %</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Consecutive Absences</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Longest Streak</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.subjects.map((subject, index) => {
                    const status = getAttendanceStatus(subject.percentage)
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">{subject.subject}</td>
                        <td className="border border-gray-300 px-4 py-2">{subject.teacher}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div className={`font-semibold ${status.color}`}>{subject.percentage}%</div>
                          <div className="text-xs text-gray-500">
                            {subject.attendedLectures}/{subject.totalLectures}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                          {subject.predictedFinalPercentage}%
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge
                            variant={
                              subject.consecutiveAbsences >= 3
                                ? "destructive"
                                : subject.consecutiveAbsences >= 2
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {subject.consecutiveAbsences}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-green-600">
                          {subject.longestStreak}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <Badge
                            className={`${getRiskBadgeColor(subject.riskLevel === "high" ? "High Risk" : subject.riskLevel === "medium" ? "Medium Risk" : "Low Risk")} text-white`}
                          >
                            {subject.riskLevel.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Button */}
      <div className="flex justify-center pt-6 border-t">
        <Button
          onClick={handlePrint}
          className="bg-[#4B87F6] hover:bg-[#3A75E5] text-white px-8 py-2 flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Advanced Report
        </Button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .space-y-6, .space-y-6 * {
            visibility: visible;
          }
          .space-y-6 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
