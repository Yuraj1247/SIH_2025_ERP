"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClassrooms, getCurrentUser, getLectures, type Classroom } from "@/lib/storage"
import { ArrowLeft, Calendar, Users, BarChart3 } from "lucide-react"
import AttendanceManager from "@/components/attendance-manager"
import StudentManager from "@/components/student-manager"
import StudentAnalyticsList from "@/components/student-analytics-list"

export default function TeacherClassroomPage() {
  const params = useParams()
  const router = useRouter()
  const classroomId = params.id as string
  const currentUser = getCurrentUser()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [teacherInfo, setTeacherInfo] = useState<any>(null)

  useEffect(() => {
    loadClassroom()
  }, [classroomId])

  const loadClassroom = () => {
    const classrooms = getClassrooms()
    const foundClassroom = classrooms.find((c) => c.id === classroomId)

    if (foundClassroom) {
      const teacher = foundClassroom.teachers.find((t) => t.email === currentUser?.email)
      if (teacher) {
        setClassroom(foundClassroom)
        setTeacherInfo(teacher)
      }
    }
  }

  if (!classroom || !teacherInfo) {
    return (
      <AuthGuard allowedRoles={["teacher"]}>
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

  const lectures = getLectures().filter(
    (l) => l.classroomId === classroomId && l.subject === teacherInfo.subject && l.teacherId === teacherInfo.id,
  )

  return (
    <AuthGuard allowedRoles={["teacher"]}>
      <DashboardLayout title={`${classroom.name} - ${teacherInfo.subject}`}>
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
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Subject</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{teacherInfo.subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Type</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{teacherInfo.subjectType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Students</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.students.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Total Lectures</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{lectures.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendance" className="font-poppins font-normal">
                Update Attendance
              </TabsTrigger>
              <TabsTrigger value="students" className="font-poppins font-normal">
                Manage Students
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-poppins font-normal">
                Show Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-6">
              <AttendanceManager classroom={classroom} teacherInfo={teacherInfo} onUpdate={loadClassroom} />
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <StudentManager classroom={classroom} teacherInfo={teacherInfo} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {classroom.students.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins font-normal">No students available for analytics</p>
                    <p className="text-sm text-gray-500 font-poppins font-normal">
                      Students need to join the classroom first
                    </p>
                  </CardContent>
                </Card>
              ) : lectures.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-poppins font-normal">No lectures available for analytics</p>
                    <p className="text-sm text-gray-500 font-poppins font-normal">
                      Create some lectures first to view student analytics
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <StudentAnalyticsList
                  students={classroom.students}
                  lectures={lectures}
                  isSubjectSpecific={true}
                  subjectName={teacherInfo.subject}
                  teacherName={teacherInfo.name}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
