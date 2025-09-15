"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClassrooms, getCurrentUser, getLectures, type Classroom } from "@/lib/storage"
import AdvancedAnalytics from "@/components/charts/advanced-analytics"
import { ArrowLeft, BookOpen, Users, Calendar, TrendingUp, BarChart3, User } from "lucide-react"

export default function StudentClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const classroomId = params.id as string
  const currentUser = getCurrentUser()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [activeTab, setActiveTab] = useState("subjects")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [allLectures, setAllLectures] = useState<any[]>([])

  useEffect(() => {
    loadClassroom()
  }, [classroomId])

  const loadClassroom = () => {
    if (!currentUser?.id) return

    const classrooms = getClassrooms()
    const foundClassroom = classrooms.find((c) => c.id === classroomId)

    if (!foundClassroom) return

    // Check if student is in this classroom
    const isStudentInClassroom = foundClassroom.students.some((student) => student.id === currentUser.id)
    if (!isStudentInClassroom) return

    setClassroom(foundClassroom)

    const lectures = getLectures().filter((l) => l.classroomId === classroomId)
    setAllLectures(lectures)
  }

  const getSubjectAnalytics = (subject: string) => {
    if (!currentUser?.id) return { total: 0, attended: 0, percentage: 0 }

    const lectures = getLectures().filter(
      (l) =>
        l.classroomId === classroomId &&
        l.subject === subject &&
        l.isLocked &&
        l.attendance.some((a) => a.studentId === currentUser.id),
    )

    const totalLectures = lectures.length
    const attendedLectures = lectures.filter((lecture) => {
      const attendance = lecture.attendance.find((a) => a.studentId === currentUser.id)
      return attendance?.isPresent
    }).length

    return {
      total: totalLectures,
      attended: attendedLectures,
      percentage: totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0,
    }
  }

  const getOverallAnalytics = () => {
    if (!currentUser?.id || !classroom) return { total: 0, attended: 0, percentage: 0 }

    const lectures = getLectures().filter(
      (l) => l.classroomId === classroomId && l.isLocked && l.attendance.some((a) => a.studentId === currentUser.id),
    )

    const totalLectures = lectures.length
    const attendedLectures = lectures.filter((lecture) => {
      const attendance = lecture.attendance.find((a) => a.studentId === currentUser.id)
      return attendance?.isPresent
    }).length

    return {
      total: totalLectures,
      attended: attendedLectures,
      percentage: totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0,
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 65) return "text-yellow-600"
    return "text-red-600"
  }

  const handleViewSubjectAnalytics = (subject: string, teacherName: string) => {
    setSelectedSubject(subject)
    setSelectedTeacher(teacherName)
    setActiveTab("analytics")
  }

  if (!classroom) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout title="Classroom Details">
          <div className="text-center py-8">
            <p className="text-gray-600 font-poppins font-normal">Classroom not found or access denied</p>
            <Button onClick={() => router.back()} className="mt-4 font-poppins font-normal">
              Go Back
            </Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const overallStats = getOverallAnalytics()
  const currentStudent = classroom.students.find((s) => s.id === currentUser?.id)

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout title={`${classroom.name} - Details`}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="font-poppins font-normal bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Classroom Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-pt-sans font-bold text-dark">{classroom.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Year</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark capitalize">{classroom.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Semester</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.semester}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Total Students</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.students.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp
                    className={`w-8 h-8 ${getAttendanceColor(overallStats.percentage).replace("text-", "text-")}`}
                  />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">My Attendance</p>
                    <p className={`text-lg font-pt-sans font-semibold ${getAttendanceColor(overallStats.percentage)}`}>
                      {overallStats.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subjects" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Show Subjects
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Show Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects & Teachers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classroom.teachers.filter((t) => t.name && t.subject).length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No subjects available yet</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">
                        Teachers need to join the classroom first
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Teacher Name</TableHead>
                            <TableHead>Subject Type</TableHead>
                            <TableHead>Total Lectures</TableHead>
                            <TableHead>Attended</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classroom.teachers
                            .filter((teacher) => teacher.name && teacher.subject)
                            .sort((a, b) => a.subject.localeCompare(b.subject))
                            .map((teacher) => {
                              const analytics = getSubjectAnalytics(teacher.subject)
                              return (
                                <TableRow key={teacher.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{teacher.subject}</TableCell>
                                  <TableCell className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    {teacher.name}
                                  </TableCell>
                                  <TableCell>
                                    {teacher.subjectType && <Badge variant="outline">{teacher.subjectType}</Badge>}
                                  </TableCell>
                                  <TableCell className="text-center">{analytics.total}</TableCell>
                                  <TableCell className="text-center">{analytics.attended}</TableCell>
                                  <TableCell
                                    className={`text-center font-semibold ${getAttendanceColor(analytics.percentage)}`}
                                  >
                                    {analytics.percentage}%
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      onClick={() => handleViewSubjectAnalytics(teacher.subject, teacher.name)}
                                      size="sm"
                                      className="bg-[#4B87F6] hover:bg-[#3A75E5] text-white"
                                    >
                                      <BarChart3 className="h-4 w-4 mr-1" />
                                      View Analytics
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Overall Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-pt-sans font-bold text-dark">{overallStats.total}</p>
                      <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-pt-sans font-bold text-dark">{overallStats.attended}</p>
                      <p className="text-sm font-poppins font-normal text-gray-600">Attended</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className={`text-2xl font-pt-sans font-bold ${getAttendanceColor(overallStats.percentage)}`}>
                        {overallStats.percentage}%
                      </p>
                      <p className="text-sm font-poppins font-normal text-gray-600">Overall Attendance</p>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    {(() => {
                      let statusColor = "text-green-600"
                      let statusText = "Excellent Attendance!"
                      let statusMessage = "Keep up the great work!"
                      let bgColor = "bg-green-50"

                      if (overallStats.percentage < 50) {
                        statusColor = "text-red-600"
                        statusText = "Critical - Attendance Below 50%"
                        statusMessage = "Your attendance is critically low. Please attend classes regularly."
                        bgColor = "bg-red-50"
                      } else if (overallStats.percentage < 75) {
                        statusColor = "text-yellow-600"
                        statusText = "Warning - Attendance Below 75%"
                        statusMessage = "Your attendance needs improvement to meet minimum requirements."
                        bgColor = "bg-yellow-50"
                      }

                      return (
                        <div className={`p-4 rounded-lg ${bgColor}`}>
                          <p className={`text-lg font-pt-sans font-bold ${statusColor} mb-1`}>{statusText}</p>
                          <p className="font-poppins font-normal text-gray-600">{statusMessage}</p>
                        </div>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {selectedSubject && currentStudent ? (
                <div>
                  <div className="mb-4">
                    <Button
                      onClick={() => {
                        setSelectedSubject(null)
                        setSelectedTeacher(null)
                      }}
                      variant="outline"
                      className="mb-4"
                    >
                      ← Back to Overall Analytics
                    </Button>
                  </div>
                  <AdvancedAnalytics
                    student={currentStudent}
                    lectures={allLectures}
                    isSubjectSpecific={true}
                    subjectName={selectedSubject}
                    teacherName={selectedTeacher || undefined}
                  />
                </div>
              ) : currentStudent ? (
                <div>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Subject-wise Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Click on any subject below to view detailed analytics:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classroom.teachers
                          .filter((teacher) => teacher.name && teacher.subject)
                          .map((teacher) => {
                            const analytics = getSubjectAnalytics(teacher.subject)
                            return (
                              <Card
                                key={teacher.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                                onClick={() => handleViewSubjectAnalytics(teacher.subject, teacher.name)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{teacher.subject}</h3>
                                    <BarChart3 className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{teacher.name}</p>
                                  <div className="flex justify-between text-sm">
                                    <span>Attendance:</span>
                                    <span className={`font-semibold ${getAttendanceColor(analytics.percentage)}`}>
                                      {analytics.percentage}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Lectures:</span>
                                    <span>
                                      {analytics.attended}/{analytics.total}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  <AdvancedAnalytics student={currentStudent} lectures={allLectures} isSubjectSpecific={false} />
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins font-normal">Unable to load analytics</p>
                    <p className="text-sm text-gray-500 font-poppins font-normal">Student information not found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
