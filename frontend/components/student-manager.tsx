"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getLectures, type Classroom, type Teacher } from "@/lib/storage"
import { Users, BarChart3, Calendar, TrendingUp, X } from "lucide-react"
import AttendanceChart from "@/components/charts/attendance-chart"
import PieChart from "@/components/charts/pie-chart"
import DoughnutChart from "@/components/charts/doughnut-chart"

interface StudentManagerProps {
  classroom: Classroom
  teacherInfo: Teacher
}

export default function StudentManager({ classroom, teacherInfo }: StudentManagerProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const getStudentAnalytics = (studentId: string) => {
    const lectures = getLectures()
    const studentLectures = lectures.filter(
      (lecture) =>
        lecture.classroomId === classroom.id &&
        lecture.teacherId === teacherInfo.id &&
        lecture.isLocked &&
        lecture.attendance.some((a) => a.studentId === studentId),
    )

    const totalLectures = studentLectures.length
    const presentCount = studentLectures.filter(
      (lecture) => lecture.attendance.find((a) => a.studentId === studentId)?.isPresent,
    ).length
    const absentCount = totalLectures - presentCount
    const attendancePercentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0

    // Prepare chart data
    const chartData = {
      labels: studentLectures.map((lecture, index) => `Lecture ${studentLectures.length - index}`),
      present: studentLectures.map((lecture) =>
        lecture.attendance.find((a) => a.studentId === studentId)?.isPresent ? 1 : 0,
      ),
      absent: studentLectures.map((lecture) =>
        lecture.attendance.find((a) => a.studentId === studentId)?.isPresent ? 0 : 1,
      ),
    }

    return {
      totalLectures,
      presentCount,
      absentCount,
      attendancePercentage,
      chartData,
    }
  }

  const sortedStudents = [...classroom.students].sort((a, b) => Number.parseInt(a.rollNo) - Number.parseInt(b.rollNo))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-pt-sans font-bold text-dark">Student Management</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-poppins font-normal">No students in this classroom yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-pt-sans font-semibold">Roll No</TableHead>
                  <TableHead className="font-pt-sans font-semibold">Name</TableHead>
                  <TableHead className="font-pt-sans font-semibold">Email</TableHead>
                  <TableHead className="font-pt-sans font-semibold">Branch</TableHead>
                  <TableHead className="font-pt-sans font-semibold">Attendance %</TableHead>
                  <TableHead className="font-pt-sans font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student) => {
                  const analytics = getStudentAnalytics(student.id)
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-poppins font-normal">{student.rollNo}</TableCell>
                      <TableCell className="font-poppins font-normal">{student.fullName}</TableCell>
                      <TableCell className="font-poppins font-normal">{student.email}</TableCell>
                      <TableCell className="font-poppins font-normal">{student.branch}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            analytics.attendancePercentage >= 75
                              ? "default"
                              : analytics.attendancePercentage >= 50
                                ? "secondary"
                                : "destructive"
                          }
                          className="font-poppins font-normal"
                        >
                          {analytics.attendancePercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="font-poppins font-normal bg-transparent"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Student Analytics Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-pt-sans font-bold text-dark">{selectedStudent.fullName} - Analytics</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedStudent(null)}
                className="font-poppins font-normal h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-poppins font-normal text-gray-600">Roll Number</p>
                      <p className="font-pt-sans font-semibold text-dark">{selectedStudent.rollNo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-poppins font-normal text-gray-600">Branch</p>
                      <p className="font-pt-sans font-semibold text-dark">{selectedStudent.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm font-poppins font-normal text-gray-600">Email</p>
                      <p className="font-pt-sans font-semibold text-dark">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-poppins font-normal text-gray-600">Mobile</p>
                      <p className="font-pt-sans font-semibold text-dark">{selectedStudent.mobile}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(() => {
                  const analytics = getStudentAnalytics(selectedStudent.id)
                  return (
                    <>
                      <Card>
                        <CardContent className="flex items-center p-4">
                          <Calendar className="w-8 h-8 text-primary mr-3" />
                          <div>
                            <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                            <p className="text-xl font-pt-sans font-bold text-dark">{analytics.totalLectures}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="flex items-center p-4">
                          <Users className="w-8 h-8 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm font-poppins font-normal text-gray-600">Present</p>
                            <p className="text-xl font-pt-sans font-bold text-dark">{analytics.presentCount}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="flex items-center p-4">
                          <Users className="w-8 h-8 text-red-500 mr-3" />
                          <div>
                            <p className="text-sm font-poppins font-normal text-gray-600">Absent</p>
                            <p className="text-xl font-pt-sans font-bold text-dark">{analytics.absentCount}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="flex items-center p-4">
                          <TrendingUp className="w-8 h-8 text-secondary mr-3" />
                          <div>
                            <p className="text-sm font-poppins font-normal text-gray-600">Attendance %</p>
                            <p className="text-xl font-pt-sans font-bold text-dark">
                              {analytics.attendancePercentage}%
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )
                })()}
              </div>

              {/* Charts Section */}
              {(() => {
                const analytics = getStudentAnalytics(selectedStudent.id)
                if (analytics.totalLectures === 0) {
                  return (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-600 font-poppins font-normal">No attendance data available yet.</p>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Trend Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-pt-sans font-bold text-dark">Attendance Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AttendanceChart
                          data={analytics.chartData}
                          type="line"
                          title={`${teacherInfo.subject} - Attendance Over Time`}
                        />
                      </CardContent>
                    </Card>

                    {/* Attendance Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-pt-sans font-bold text-dark">
                          Attendance Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DoughnutChart
                          data={{
                            labels: ["Present", "Absent"],
                            values: [analytics.presentCount, analytics.absentCount],
                            colors: ["#22C55E", "#EF4444"],
                          }}
                          title="Overall Attendance"
                          centerText={`${analytics.attendancePercentage}%`}
                        />
                      </CardContent>
                    </Card>

                    {/* Monthly Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-pt-sans font-bold text-dark">Monthly Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AttendanceChart data={analytics.chartData} type="bar" title="Attendance by Lecture" />
                      </CardContent>
                    </Card>

                    {/* Performance Indicator */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-pt-sans font-bold text-dark">Performance Status</CardTitle>
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
                          title="Performance Category"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              {/* Attendance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-pt-sans font-bold text-dark">Attendance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const analytics = getStudentAnalytics(selectedStudent.id)
                    if (analytics.totalLectures === 0) {
                      return <p className="text-gray-600 font-poppins font-normal">No attendance data available yet.</p>
                    }

                    let statusColor = "text-green-600"
                    let statusText = "Excellent"
                    let statusMessage = "Keep up the great work!"
                    let bgColor = "bg-green-50"

                    if (analytics.attendancePercentage < 50) {
                      statusColor = "text-red-600"
                      statusText = "Critical"
                      statusMessage = "Attendance is below 50%. Immediate improvement needed."
                      bgColor = "bg-red-50"
                    } else if (analytics.attendancePercentage < 75) {
                      statusColor = "text-yellow-600"
                      statusText = "Warning"
                      statusMessage = "Attendance is below 75%. Please improve attendance."
                      bgColor = "bg-yellow-50"
                    }

                    return (
                      <div className={`text-center p-6 rounded-lg ${bgColor}`}>
                        <p className={`text-2xl font-pt-sans font-bold ${statusColor} mb-2`}>{statusText}</p>
                        <p className="font-poppins font-normal text-gray-600 mb-4">{statusMessage}</p>
                        <div className="flex justify-center space-x-8">
                          <div className="text-center">
                            <p className="text-xl font-pt-sans font-bold text-dark">
                              {analytics.attendancePercentage}%
                            </p>
                            <p className="text-sm font-poppins font-normal text-gray-600">Current</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-pt-sans font-bold text-dark">75%</p>
                            <p className="text-sm font-poppins font-normal text-gray-600">Required</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
