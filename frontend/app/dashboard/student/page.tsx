"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getClassrooms, createStudentRequest, getCurrentUser, getLectures, type Classroom } from "@/lib/storage"
import { Plus, BookOpen, Users, Calendar, TrendingUp, Eye } from "lucide-react"

export default function StudentDashboard() {
  const [joinedClassrooms, setJoinedClassrooms] = useState<Classroom[]>([])
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    loadJoinedClassrooms(user)
    setIsLoading(false)
  }, [])

  const loadJoinedClassrooms = (user?: any) => {
    const userToUse = user || currentUser
    if (!userToUse?.id) return

    const allClassrooms = getClassrooms()
    const studentClassrooms = allClassrooms.filter((classroom) =>
      classroom.students.some((student) => student.id === userToUse.id),
    )
    setJoinedClassrooms(studentClassrooms)
  }

  const handleJoinClassroom = () => {
    if (!joinCode) {
      alert("Please enter the classroom join code")
      return
    }

    if (!currentUser?.email) {
      alert("User email not found")
      return
    }

    try {
      const success = createStudentRequest(currentUser.email, joinCode)

      if (success) {
        setJoinCode("")
        setIsJoinDialogOpen(false)
        alert("Join request submitted successfully! Please wait for mentor approval.")
        setTimeout(() => {
          loadJoinedClassrooms()
        }, 1000)
      } else {
        alert("Invalid join code, classroom not found, or request already exists")
      }
    } catch (error) {
      alert("Failed to submit join request. Please try again.")
    }
  }

  const getStudentAttendanceStats = () => {
    if (!currentUser?.id) return { totalLectures: 0, presentCount: 0, attendancePercentage: 0, absentCount: 0 }

    const lectures = getLectures()
    const studentLectures = lectures.filter((lecture) => {
      // Check if lecture is from a classroom the student is in
      const isInClassroom = joinedClassrooms.some((classroom) => classroom.id === lecture.classroomId)
      // Check if student has attendance record for this lecture
      const hasAttendanceRecord = lecture.attendance.some((a) => a.studentId === currentUser.id)
      return isInClassroom && hasAttendanceRecord && lecture.isLocked
    })

    const totalLectures = studentLectures.length
    const presentCount = studentLectures.filter(
      (lecture) => lecture.attendance.find((a) => a.studentId === currentUser.id)?.isPresent,
    ).length
    const absentCount = totalLectures - presentCount
    const attendancePercentage = totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0

    return { totalLectures, presentCount, absentCount, attendancePercentage }
  }

  const openClassroomDetails = (classroomId: string) => {
    router.push(`/dashboard/student/classroom/${classroomId}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinClassroom()
    }
  }

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["student"]}>
        <DashboardLayout title="Student Dashboard">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-poppins font-normal text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const stats = getStudentAttendanceStats()

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout title="Student Dashboard">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Joined Classrooms</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{joinedClassrooms.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Calendar className="w-8 h-8 text-secondary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{stats.totalLectures}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Present</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{stats.presentCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="w-8 h-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Overall Attendance</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{stats.attendancePercentage}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Join Classroom */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-pt-sans font-bold text-dark">My Classrooms</CardTitle>
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-blue-600 font-poppins font-normal">
                      <Plus className="w-4 h-4 mr-2" />
                      Join Classroom
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-pt-sans font-bold">Join Classroom</DialogTitle>
                      <DialogDescription className="font-poppins font-normal">
                        Enter the classroom join code provided by your mentor. Your request will be sent for approval.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="join-code" className="font-poppins font-normal">
                          Classroom Join Code
                        </Label>
                        <Input
                          id="join-code"
                          placeholder="ABC12345"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          onKeyPress={handleKeyPress}
                          className="font-poppins font-normal"
                          maxLength={8}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsJoinDialogOpen(false)}
                          className="font-poppins font-normal bg-transparent"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleJoinClassroom}
                          className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                        >
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {joinedClassrooms.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins font-normal">No classrooms joined yet</p>
                  <p className="text-sm text-gray-500 font-poppins font-normal">Click "Join Classroom" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedClassrooms.map((classroom) => (
                    <Card key={classroom.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-pt-sans font-bold text-dark mb-1">{classroom.name}</h3>
                          <div className="flex space-x-2 mb-2">
                            <Badge variant="secondary" className="font-poppins font-normal">
                              {classroom.year}
                            </Badge>
                            <Badge variant="outline" className="font-poppins font-normal">
                              {classroom.semester}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="font-poppins font-normal text-gray-600">Students:</span>
                            <span className="font-poppins font-normal text-dark">{classroom.students.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-poppins font-normal text-gray-600">Subjects:</span>
                            <span className="font-poppins font-normal text-dark">
                              {classroom.teachers.filter((t) => t.name).length}
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Button
                            onClick={() => openClassroomDetails(classroom.id)}
                            className="w-full bg-[#4B87F6] hover:bg-[#3A75E5] text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Attendance Status */}
          {stats.totalLectures > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-pt-sans font-bold text-dark">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-pt-sans font-bold text-dark">{stats.totalLectures}</p>
                    <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-pt-sans font-bold text-dark">{stats.presentCount}</p>
                    <p className="text-sm font-poppins font-normal text-gray-600">Present</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-pt-sans font-bold text-dark">{stats.absentCount}</p>
                    <p className="text-sm font-poppins font-normal text-gray-600">Absent</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-pt-sans font-bold text-dark">{stats.attendancePercentage}%</p>
                    <p className="text-sm font-poppins font-normal text-gray-600">Attendance Rate</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  {(() => {
                    let statusColor = "text-green-600"
                    let statusText = "Excellent Attendance!"
                    let statusMessage = "Keep up the great work!"
                    let bgColor = "bg-green-50"

                    if (stats.attendancePercentage < 50) {
                      statusColor = "text-red-600"
                      statusText = "Critical - Attendance Below 50%"
                      statusMessage = "Your attendance is critically low. Please attend classes regularly."
                      bgColor = "bg-red-50"
                    } else if (stats.attendancePercentage < 75) {
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
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
