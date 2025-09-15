"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getClassrooms, getCurrentUser, getLectures, type Classroom } from "@/lib/storage"
import { BookOpen, Users, Calendar, Clock } from "lucide-react"

export default function TeacherDashboard() {
  const [joinedClassrooms, setJoinedClassrooms] = useState<Classroom[]>([])
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
    if (!userToUse?.email) return

    const allClassrooms = getClassrooms()
    const teacherClassrooms = allClassrooms.filter((classroom) =>
      classroom.teachers.some((teacher) => teacher.email === userToUse.email && teacher.name),
    )
    setJoinedClassrooms(teacherClassrooms)
  }

  const openClassroomDetails = (classroomId: string) => {
    router.push(`/dashboard/teacher/classroom/${classroomId}`)
  }

  const getTotalLectures = () => {
    const lectures = getLectures()
    return lectures.filter((lecture) =>
      joinedClassrooms.some(
        (classroom) =>
          classroom.id === lecture.classroomId &&
          classroom.teachers.some((teacher) => teacher.email === currentUser?.email),
      ),
    ).length
  }

  const getTotalStudents = () => {
    return joinedClassrooms.reduce((total, classroom) => total + classroom.students.length, 0)
  }

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
        <DashboardLayout title="Teacher Dashboard">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-poppins font-light text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout title="Teacher Dashboard">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-light text-gray-600">Joined Classrooms</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{joinedClassrooms.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="w-8 h-8 text-secondary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-light text-gray-600">Total Students</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{getTotalStudents()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Calendar className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-light text-gray-600">Total Lectures</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{getTotalLectures()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="w-8 h-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-light text-gray-600">This Week</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">
                    {
                      getLectures().filter((lecture) => {
                        const lectureDate = new Date(lecture.date)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lectureDate >= weekAgo
                      }).length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classroom Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-pt-sans font-bold text-dark">My Classrooms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {joinedClassrooms.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins font-light">No classrooms joined yet</p>
                  <p className="text-sm text-gray-500 font-poppins font-light">
                    Classrooms will appear here once your mentor adds you
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedClassrooms.map((classroom) => {
                    const teacherInfo = classroom.teachers.find((t) => t.email === currentUser?.email)
                    return (
                      <Card
                        key={classroom.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary"
                        onClick={() => openClassroomDetails(classroom.id)}
                      >
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <h3 className="text-lg font-pt-sans font-bold text-dark mb-1">{classroom.name}</h3>
                            <div className="flex space-x-2 mb-2">
                              <Badge variant="secondary" className="font-poppins font-light">
                                {classroom.year}
                              </Badge>
                              <Badge variant="outline" className="font-poppins font-light">
                                {classroom.semester}
                              </Badge>
                            </div>
                          </div>

                          {teacherInfo && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-poppins font-light text-gray-600 mb-1">Your Subject:</p>
                              <p className="font-pt-sans font-semibold text-dark">{teacherInfo.subject}</p>
                              <Badge variant="outline" className="mt-1 font-poppins font-light">
                                {teacherInfo.subjectType}
                              </Badge>
                            </div>
                          )}

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-poppins font-light text-gray-600">Students:</span>
                              <span className="font-poppins font-light text-dark">{classroom.students.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-poppins font-light text-gray-600">Teachers:</span>
                              <span className="font-poppins font-light text-dark">{classroom.teachers.length}</span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <p className="text-xs font-poppins font-light text-gray-500">
                              Joined: {teacherInfo ? new Date(teacherInfo.joinedAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
