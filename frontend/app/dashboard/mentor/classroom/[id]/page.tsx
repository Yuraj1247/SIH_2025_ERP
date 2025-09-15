"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getClassrooms,
  saveClassrooms,
  getStudentRequests,
  approveStudentRequest,
  denyStudentRequest,
  getStudents,
  saveStudents,
  getLectures,
  type Classroom,
  type Teacher,
  type Student,
  type StudentRequest,
} from "@/lib/storage"
import StudentAnalyticsList from "@/components/student-analytics-list"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  BookOpen,
  Copy,
  UserPlus,
  CheckCircle,
  XCircle,
  Edit,
  UserCheck,
  BarChart3,
  Settings,
} from "lucide-react"

export default function ClassroomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const classroomId = params.id as string

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [activeTab, setActiveTab] = useState("requests")
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([])
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false)
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [teacherSubject, setTeacherSubject] = useState("")
  const [teacherSubjectType, setTeacherSubjectType] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  useEffect(() => {
    loadClassroom()
    loadStudentRequests()
  }, [classroomId])

  const loadClassroom = () => {
    const classrooms = getClassrooms()
    const foundClassroom = classrooms.find((c) => c.id === classroomId)
    setClassroom(foundClassroom || null)
  }

  const loadStudentRequests = () => {
    const requests = getStudentRequests()
    const classroomRequests = requests.filter((r) => r.classroomId === classroomId && r.status === "pending")
    setStudentRequests(classroomRequests)
  }

  const handleApproveRequest = async (requestId: string) => {
    const success = approveStudentRequest(requestId)
    if (success) {
      loadStudentRequests()
      loadClassroom()
      alert("Student request approved successfully!")
    } else {
      alert("Failed to approve request. Please try again.")
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    const success = denyStudentRequest(requestId)
    if (success) {
      loadStudentRequests()
      alert("Student request denied. Notification sent to student.")
    } else {
      alert("Failed to deny request. Please try again.")
    }
  }

  const handleAddTeacher = () => {
    if (!teacherEmail || !teacherName || !teacherSubject) {
      alert("Please fill in all required fields")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(teacherEmail)) {
      alert("Please enter a valid email address")
      return
    }

    if (!classroom) return

    // Check if teacher already exists in this classroom
    if (classroom.teachers.some((teacher) => teacher.email === teacherEmail)) {
      alert("This teacher is already added to the classroom")
      return
    }

    try {
      const newTeacher: Teacher = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: teacherName,
        email: teacherEmail,
        subject: teacherSubject,
        subjectType: teacherSubjectType,
        classroomId: classroom.id,
        joinedAt: new Date().toISOString(),
      }

      const allClassrooms = getClassrooms()
      const updatedClassrooms = allClassrooms.map((c) =>
        c.id === classroom.id ? { ...c, teachers: [...c.teachers, newTeacher] } : c,
      )

      saveClassrooms(updatedClassrooms)
      loadClassroom()
      setTeacherEmail("")
      setTeacherName("")
      setTeacherSubject("")
      setTeacherSubjectType("")
      setIsAddTeacherDialogOpen(false)
      alert("Teacher added successfully!")
    } catch (error) {
      alert("Failed to add teacher. Please try again.")
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setTeacherEmail(teacher.email)
    setTeacherName(teacher.name)
    setTeacherSubject(teacher.subject)
    setTeacherSubjectType(teacher.subjectType)
    setIsAddTeacherDialogOpen(true)
  }

  const handleDeleteTeacher = (teacher: Teacher) => {
    if (confirm(`Are you sure you want to remove teacher "${teacher.name}" from this classroom?`)) {
      if (!classroom) return

      try {
        const allClassrooms = getClassrooms()
        const updatedClassrooms = allClassrooms.map((c) =>
          c.id === classroom.id ? { ...c, teachers: c.teachers.filter((t) => t.id !== teacher.id) } : c,
        )

        saveClassrooms(updatedClassrooms)
        loadClassroom()
        alert("Teacher removed successfully!")
      } catch (error) {
        alert("Failed to remove teacher. Please try again.")
      }
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent({ ...student })
    setIsEditStudentDialogOpen(true)
  }

  const handleSaveStudent = () => {
    if (!editingStudent) return

    try {
      const allStudents = getStudents()
      const updatedStudents = allStudents.map((s) => (s.id === editingStudent.id ? editingStudent : s))
      saveStudents(updatedStudents)

      // Update classroom students as well
      const allClassrooms = getClassrooms()
      const updatedClassrooms = allClassrooms.map((c) =>
        c.id === classroomId
          ? {
              ...c,
              students: c.students.map((s) => (s.id === editingStudent.id ? editingStudent : s)),
            }
          : c,
      )
      saveClassrooms(updatedClassrooms)

      loadClassroom()
      setIsEditStudentDialogOpen(false)
      setEditingStudent(null)
      alert("Student information updated successfully!")
    } catch (error) {
      alert("Failed to update student information. Please try again.")
    }
  }

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to remove student "${student.fullName}" from this classroom?`)) {
      if (!classroom) return

      try {
        // Remove from classroom
        const allClassrooms = getClassrooms()
        const updatedClassrooms = allClassrooms.map((c) =>
          c.id === classroom.id ? { ...c, students: c.students.filter((s) => s.id !== student.id) } : c,
        )
        saveClassrooms(updatedClassrooms)

        // Remove classroom from student's list
        const allStudents = getStudents()
        const updatedStudents = allStudents.map((s) =>
          s.id === student.id ? { ...s, classrooms: s.classrooms.filter((cId) => cId !== classroomId) } : s,
        )
        saveStudents(updatedStudents)

        loadClassroom()
        alert("Student removed successfully!")
      } catch (error) {
        alert("Failed to remove student. Please try again.")
      }
    }
  }

  const copyJoinCode = () => {
    if (classroom) {
      navigator.clipboard.writeText(classroom.joinCode)
      alert("Join code copied to clipboard!")
    }
  }

  if (!classroom) {
    return (
      <AuthGuard allowedRoles={["mentor"]}>
        <DashboardLayout title="Classroom Details">
          <div className="text-center py-8">
            <p className="text-gray-600 font-poppins font-normal">Classroom not found</p>
            <Button onClick={() => router.back()} className="mt-4 font-poppins font-normal">
              Go Back
            </Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const lectures = getLectures().filter((l) => l.classroomId === classroomId)

  return (
    <AuthGuard allowedRoles={["mentor"]}>
      <DashboardLayout title={`${classroom.name} - Management`}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="font-poppins font-normal bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-poppins font-normal text-gray-600">Join Code:</p>
                <div className="flex items-center space-x-2">
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">{classroom.joinCode}</code>
                  <Button variant="ghost" size="sm" onClick={copyJoinCode} className="h-8 w-8 p-0">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
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
                  <BookOpen className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Semester</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.semester}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Teachers</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.teachers.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-poppins font-normal text-gray-600">Students</p>
                    <p className="text-lg font-pt-sans font-semibold text-dark">{classroom.students.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Student Requests
                {studentRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {studentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Students
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Teachers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Show Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Manage Student Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No pending student requests</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">
                        Student requests will appear here when they try to join the classroom
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{request.studentInfo.fullName}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Roll No:</span> {request.studentInfo.rollNo}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {request.studentInfo.email}
                                </div>
                                <div>
                                  <span className="font-medium">Branch:</span> {request.studentInfo.branch}
                                </div>
                                <div>
                                  <span className="font-medium">Requested:</span>{" "}
                                  {new Date(request.requestedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button onClick={() => handleDenyRequest(request.id)} variant="destructive" size="sm">
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {classroom.students.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No students joined yet</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">
                        Students can join using the classroom join code
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classroom.students
                          .sort((a, b) => Number.parseInt(a.rollNo) - Number.parseInt(b.rollNo))
                          .map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.rollNo}</TableCell>
                              <TableCell>{student.fullName}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.branch}</TableCell>
                              <TableCell>{student.mobile}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button onClick={() => handleEditStudent(student)} size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button onClick={() => handleDeleteStudent(student)} size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Manage Teachers
                    </CardTitle>
                    <Dialog open={isAddTeacherDialogOpen} onOpenChange={setIsAddTeacherDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-blue-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Teacher
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Teacher</DialogTitle>
                          <DialogDescription>
                            Add a new teacher to this classroom with their subject information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="teacher-name">Teacher Name *</Label>
                            <Input
                              id="teacher-name"
                              placeholder="Enter teacher name"
                              value={teacherName}
                              onChange={(e) => setTeacherName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="teacher-email">Teacher Email *</Label>
                            <Input
                              id="teacher-email"
                              type="email"
                              placeholder="teacher@college.edu"
                              value={teacherEmail}
                              onChange={(e) => setTeacherEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="teacher-subject">Subject *</Label>
                            <Input
                              id="teacher-subject"
                              placeholder="e.g., Mathematics, Physics"
                              value={teacherSubject}
                              onChange={(e) => setTeacherSubject(e.target.value)}
                            />
                          </div>
                        <div>
  <Label htmlFor="teacher-subject-type">Subject Type</Label>
  <select
    id="teacher-subject-type"
    value={teacherSubjectType}
    onChange={(e) => setTeacherSubjectType(e.target.value)}
    className="w-full border rounded-md p-2"
    required
  >
    <option value="">Select subject type</option>
    <option value="Theory">Theory</option>
    <option value="Practical">Practical</option>
    <option value="Tutorial">Tutorial</option>
  </select>
</div>


                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddTeacherDialogOpen(false)
                                setTeacherEmail("")
                                setTeacherName("")
                                setTeacherSubject("")
                                setTeacherSubjectType("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddTeacher}>Add Teacher</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {classroom.teachers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No teachers added yet</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">
                        Click "Add Teacher" to get started
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classroom.teachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell className="font-medium">{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                            <TableCell>
                              {teacher.subjectType && <Badge variant="outline">{teacher.subjectType}</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button onClick={() => handleEditTeacher(teacher)} size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDeleteTeacher(teacher)} size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
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
              ) : (
                <StudentAnalyticsList students={classroom.students} lectures={lectures} />
              )}
            </TabsContent>
          </Tabs>

          {/* Student Edit Dialog */}
          <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Student Information</DialogTitle>
                <DialogDescription>Update the student's personal and academic information.</DialogDescription>
              </DialogHeader>
              {editingStudent && (
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="edit-fullName">Full Name</Label>
                    <Input
                      id="edit-fullName"
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-rollNo">Roll Number</Label>
                    <Input
                      id="edit-rollNo"
                      value={editingStudent.rollNo}
                      onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-mobile">Mobile</Label>
                    <Input
                      id="edit-mobile"
                      value={editingStudent.mobile}
                      onChange={(e) => setEditingStudent({ ...editingStudent, mobile: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-branch">Branch</Label>
                    <Input
                      id="edit-branch"
                      value={editingStudent.branch}
                      onChange={(e) => setEditingStudent({ ...editingStudent, branch: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                    <Input
                      id="edit-dateOfBirth"
                      type="date"
                      value={editingStudent.dateOfBirth}
                      onChange={(e) => setEditingStudent({ ...editingStudent, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-fatherName">Father's Name</Label>
                    <Input
                      id="edit-fatherName"
                      value={editingStudent.fatherName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-motherName">Mother's Name</Label>
                    <Input
                      id="edit-motherName"
                      value={editingStudent.motherName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-parentEmail">Parent Email</Label>
                    <Input
                      id="edit-parentEmail"
                      type="email"
                      value={editingStudent.parentEmail}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-parentPhone">Parent Phone</Label>
                    <Input
                      id="edit-parentPhone"
                      value={editingStudent.parentPhone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditStudentDialogOpen(false)
                    setEditingStudent(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveStudent}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
