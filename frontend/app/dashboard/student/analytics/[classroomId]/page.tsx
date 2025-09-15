"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClassrooms, getCurrentUser, getLectures, type Classroom, type Lecture } from "@/lib/storage"
import { ArrowLeft, Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"
import AttendanceChart from "@/components/charts/attendance-chart"
import PieChart from "@/components/charts/pie-chart"
import DoughnutChart from "@/components/charts/doughnut-chart"

export default function StudentAnalyticsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const classroomId = params.classroomId as string
  const subject = searchParams.get("subject")
  const currentUser = getCurrentUser()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [subjectLectures, setSubjectLectures] = useState<Lecture[]>([])
  const [analytics, setAnalytics] = useState({
    totalLectures: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0,
    chartData: {
      labels: [] as string[],
      present: [] as number[],
      absent: [] as number[],
    },
  })

  useEffect(() => {
    loadData()
  }, [classroomId, subject])

  const loadData = () => {
    if (!currentUser?.id || !subject) return

    const classrooms = getClassrooms()
    const foundClassroom = classrooms.find((c) => c.id === classroomId)

    if (!foundClassroom) return

    // Check if student is in this classroom
    const isStudentInClassroom = foundClassroom.students.some((student) => student.id === currentUser.id)
    if (!isStudentInClassroom) return

    setClassroom(foundClassroom)

    // Get lectures for this subject
    const lectures = getLectures()
    const filteredLectures = lectures
      .filter(
        (lecture) =>
          lecture.classroomId === classroomId &&
          lecture.subject === subject &&
          lecture.isLocked &&
          lecture.attendance.some((a) => a.studentId === currentUser.id),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setSubjectLectures(filteredLectures)

    // Calculate analytics
    const totalLectures = filteredLectures.length
    const presentCount = filteredLectures.filter(
      (lecture) => lecture.attendance.find((a) => a.studentId === currentUser.id)?.isPresent,
    ).length
    const absentCount = totalLectures - presentCount
    const attendancePercentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0

    // Prepare chart data
    const chartData = {
      labels: filteredLectures.map((lecture, index) => `Lecture ${filteredLectures.length - index}`),
      present: filteredLectures.map((lecture) =>
        lecture.attendance.find((a) => a.studentId === currentUser.id)?.isPresent ? 1 : 0,
      ),
      absent: filteredLectures.map((lecture) =>
        lecture.attendance.find((a) => a.studentId === currentUser.id)?.isPresent ? 0 : 1,
      ),
    }

    setAnalytics({
      totalLectures,
      presentCount,
      absentCount,
      attendancePercentage,
      chartData,
    })
  }

  if (!classroom || !subject) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout title="Subject Analytics">
          <div className="text-center py-8">
            <p className="text-gray-600 font-poppins font-normal">Subject analytics not found</p>
            <Button onClick={() => router.back()} className="mt-4 font-poppins font-normal">
              Go Back
            </Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const teacher = classroom.teachers.find((t) => t.subject === subject)

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout title={`${subject} - Analytics`}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="font-poppins font-normal bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Subject Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Subject</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Type</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{teacher?.subjectType || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Teacher</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{teacher?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Classroom</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Calendar className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{analytics.totalLectures}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Present</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{analytics.presentCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <XCircle className="w-8 h-8 text-red-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Absent</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{analytics.absentCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="w-8 h-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Attendance %</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{analytics.attendancePercentage}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {analytics.totalLectures > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-pt-sans font-bold text-dark">Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceChart data={analytics.chartData} type="line" title={`${subject} - Attendance Over Time`} />
                </CardContent>
              </Card>

              {/* Attendance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-pt-sans font-bold text-dark">Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DoughnutChart
                    data={{
                      labels: ["Present", "Absent"],
                      values: [analytics.presentCount, analytics.absentCount],
                      colors: ["#22C55E", "#EF4444"],
                    }}
                    title="Overall Distribution"
                    centerText={`${analytics.attendancePercentage}%`}
                  />
                </CardContent>
              </Card>

              {/* Weekly Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-pt-sans font-bold text-dark">Lecture-wise Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceChart data={analytics.chartData} type="bar" title="Attendance by Lecture" />
                </CardContent>
              </Card>

              {/* Performance Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-pt-sans font-bold text-dark">Performance Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={{
                      labels: ["Excellent (>90%)", "Good (75-90%)", "Average (50-75%)", "Poor (<50%)"],
                      values: [
                        analytics.attendancePercentage > 90 ? 1 : 0,
                        analytics.attendancePercentage >= 75 && analytics.attendancePercentage <= 90 ? 1 : 0,
                        analytics.attendancePercentage >= 50 && analytics.attendancePercentage < 75 ? 1 : 0,
                        analytics.attendancePercentage < 50 ? 1 : 0,
                      ],
                      colors: ["#22C55E", "#F59E0B", "#F97316", "#EF4444"],
                    }}
                    title="Performance Level"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-pt-sans font-bold text-dark">Attendance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                {(() => {
                  let statusColor = "text-green-600"
                  let statusText = "Excellent"
                  let statusMessage = "Your attendance is excellent! Keep it up!"
                  let bgColor = "bg-green-50"

                  if (analytics.attendancePercentage < 50) {
                    statusColor = "text-red-600"
                    statusText = "Critical"
                    statusMessage = "Your attendance is critically low. Please attend classes regularly."
                    bgColor = "bg-red-50"
                  } else if (analytics.attendancePercentage < 75) {
                    statusColor = "text-yellow-600"
                    statusText = "Warning"
                    statusMessage = "Your attendance needs improvement to meet minimum requirements."
                    bgColor = "bg-yellow-50"
                  }

                  return (
                    <div className={`p-6 rounded-lg ${bgColor}`}>
                      <p className={`text-3xl font-pt-sans font-bold ${statusColor} mb-2`}>{statusText}</p>
                      <p className="text-lg font-poppins font-normal text-gray-700 mb-4">{statusMessage}</p>
                      <div className="flex justify-center space-x-8">
                        <div className="text-center">
                          <p className="text-2xl font-pt-sans font-bold text-dark">{analytics.attendancePercentage}%</p>
                          <p className="text-sm font-poppins font-normal text-gray-600">Current Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-pt-sans font-bold text-dark">75%</p>
                          <p className="text-sm font-poppins font-normal text-gray-600">Required</p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Lecture History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-pt-sans font-bold text-dark">Lecture History</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectLectures.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins font-normal">No lecture data available yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-pt-sans font-semibold">Date</TableHead>
                      <TableHead className="font-pt-sans font-semibold">Time</TableHead>
                      <TableHead className="font-pt-sans font-semibold">Status</TableHead>
                      <TableHead className="font-pt-sans font-semibold">Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectLectures.map((lecture) => {
                      const attendanceRecord = lecture.attendance.find((a) => a.studentId === currentUser?.id)
                      const isPresent = attendanceRecord?.isPresent || false

                      return (
                        <TableRow key={lecture.id}>
                          <TableCell className="font-poppins font-normal">
                            {new Date(lecture.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-poppins font-normal">{lecture.time}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-500 font-poppins font-normal">
                              Completed
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isPresent ? "default" : "destructive"}
                              className={`font-poppins font-normal ${isPresent ? "bg-green-500" : "bg-red-500"}`}
                            >
                              {isPresent ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Present
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Absent
                                </>
                              )}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
