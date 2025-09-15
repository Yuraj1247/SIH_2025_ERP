"use client"

import { useState, useEffect } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getLectures,
  addLecture,
  saveLectures,
  type Classroom,
  type Teacher,
  type Lecture,
  type AttendanceRecord,
} from "@/lib/storage"
import { Plus, Calendar, Clock, Trash2, Lock, Users, UserCheck, UserX } from "lucide-react"

interface AttendanceManagerProps {
  classroom: Classroom
  teacherInfo: Teacher
  onUpdate: () => void
}

export default function AttendanceManager({ classroom, teacherInfo, onUpdate }: AttendanceManagerProps) {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  })

  useEffect(() => {
    loadLectures()
  }, [classroom.id, teacherInfo.id])

  const loadLectures = () => {
    const allLectures = getLectures()
    const classroomLectures = allLectures
      .filter((lecture) => lecture.classroomId === classroom.id && lecture.teacherId === teacherInfo.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setLectures(classroomLectures)
  }

  const handleCreateLecture = () => {
    if (!formData.date || !formData.time) {
      alert("Please fill in all fields")
      return
    }

    // Check if lecture already exists for this date and time
    if (lectures.some((lecture) => lecture.date === formData.date && lecture.time === formData.time)) {
      alert("A lecture already exists for this date and time")
      return
    }

    try {
      addLecture({
        classroomId: classroom.id,
        teacherId: teacherInfo.id,
        subject: teacherInfo.subject,
        date: formData.date,
        time: formData.time,
      })
      loadLectures()
      setFormData({ date: "", time: "" })
      setIsCreateDialogOpen(false)
      alert("Lecture created successfully!")
    } catch (error) {
      alert("Failed to create lecture. Please try again.")
    }
  }

  const handleDeleteLecture = (lecture: Lecture) => {
    if (lecture.isLocked) {
      alert("Cannot delete a locked lecture")
      return
    }

    if (confirm(`Are you sure you want to delete the lecture on ${lecture.date} at ${lecture.time}?`)) {
      try {
        const allLectures = getLectures()
        const updatedLectures = allLectures.filter((l) => l.id !== lecture.id)
        saveLectures(updatedLectures)
        loadLectures()
        alert("Lecture deleted successfully!")
      } catch (error) {
        alert("Failed to delete lecture. Please try again.")
      }
    }
  }

  const openAttendance = (lecture: Lecture) => {
    if (lecture.isLocked) {
      alert("This lecture attendance is locked and cannot be modified")
      return
    }

    setSelectedLecture(lecture)

    // Initialize attendance data
    const sortedStudents = [...classroom.students].sort((a, b) => Number.parseInt(a.rollNo) - Number.parseInt(b.rollNo))

    if (lecture.attendance.length === 0) {
      // First time opening - all students present by default
      const initialAttendance: AttendanceRecord[] = sortedStudents.map((student) => ({
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.fullName,
        isPresent: true,
      }))
      setAttendanceData(initialAttendance)
    } else {
      // Load existing attendance
      setAttendanceData(lecture.attendance)
    }
  }

  const toggleAttendance = (studentId: string) => {
    setAttendanceData((prev) =>
      prev.map((record) => (record.studentId === studentId ? { ...record, isPresent: !record.isPresent } : record)),
    )
  }

  const saveAndLockAttendance = () => {
    if (!selectedLecture) return

    const presentCount = attendanceData.filter((record) => record.isPresent).length
    const absentCount = attendanceData.filter((record) => !record.isPresent).length
    const absentStudents = attendanceData.filter((record) => !record.isPresent).map((record) => record.rollNo)

    const confirmMessage = `
      Attendance Summary:
      Present: ${presentCount}
      Absent: ${absentCount}
      ${absentStudents.length > 0 ? `Absent Roll Numbers: ${absentStudents.join(", ")}` : ""}
      
      Once saved and locked, this attendance cannot be modified. Are you sure?
    `

    if (confirm(confirmMessage)) {
      try {
        const allLectures = getLectures()
        const updatedLectures = allLectures.map((lecture) =>
          lecture.id === selectedLecture.id ? { ...lecture, attendance: attendanceData, isLocked: true } : lecture,
        )
        saveLectures(updatedLectures)
        loadLectures()
        setSelectedLecture(null)
        setAttendanceData([])
        alert("Attendance saved and locked successfully!")
      } catch (error) {
        alert("Failed to save attendance. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Lecture */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-pt-sans font-bold text-dark">Lectures</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-600 font-poppins font-normal">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lecture
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-pt-sans font-bold">Create New Lecture</DialogTitle>
                  <DialogDescription className="font-poppins font-normal">
                    Enter the lecture date and time to create a new lecture.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lecture-date" className="font-poppins font-normal">
                      Lecture Date
                    </Label>
                    <Input
                      id="lecture-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="font-poppins font-normal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lecture-time" className="font-poppins font-normal">
                      Lecture Time
                    </Label>
                    <Input
                      id="lecture-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="font-poppins font-normal"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="font-poppins font-normal bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateLecture}
                      className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      Create Lecture
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {lectures.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-poppins font-normal">No lectures created yet</p>
              <p className="text-sm text-gray-500 font-poppins font-normal">Click "Create Lecture" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lectures.map((lecture, index) => (
                <Card
                  key={lecture.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    lecture.isLocked ? "border-l-4 border-l-green-500" : "border-l-4 border-l-primary"
                  }`}
                  onClick={() => openAttendance(lecture)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-pt-sans font-bold text-dark">Lecture {lectures.length - index}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 font-poppins font-normal">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(lecture.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 font-poppins font-normal">
                          <Clock className="w-4 h-4" />
                          <span>{lecture.time}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {lecture.isLocked ? (
                          <Badge variant="default" className="bg-green-500 font-poppins font-normal">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLecture(lecture)
                            }}
                            className="h-8 w-8 p-0 text-danger hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {lecture.attendance.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <span className="font-poppins font-normal text-gray-600">Present:</span>
                            <span className="font-poppins font-normal text-dark">
                              {lecture.attendance.filter((a) => a.isPresent).length}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserX className="w-4 h-4 text-red-500" />
                            <span className="font-poppins font-normal text-gray-600">Absent:</span>
                            <span className="font-poppins font-normal text-dark">
                              {lecture.attendance.filter((a) => !a.isPresent).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      {selectedLecture && (
        <Dialog open={!!selectedLecture} onOpenChange={() => setSelectedLecture(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-pt-sans font-bold">
                Update Attendance - {new Date(selectedLecture.date).toLocaleDateString()} at {selectedLecture.time}
              </DialogTitle>
              <DialogDescription className="font-poppins font-normal">
                Click on student names to toggle their attendance. Green = Present, Red = Absent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-poppins font-normal text-gray-600">
                      Total Students: {attendanceData.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-green-500" />
                    <span className="font-poppins font-normal text-gray-600">
                      Present: {attendanceData.filter((a) => a.isPresent).length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserX className="w-5 h-5 text-red-500" />
                    <span className="font-poppins font-normal text-gray-600">
                      Absent: {attendanceData.filter((a) => !a.isPresent).length}
                    </span>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-pt-sans font-semibold">Roll No</TableHead>
                    <TableHead className="font-pt-sans font-semibold">Student Name</TableHead>
                    <TableHead className="font-pt-sans font-semibold">Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((record) => (
                    <TableRow key={record.studentId}>
                      <TableCell className="font-poppins font-normal">{record.rollNo}</TableCell>
                      <TableCell className="font-poppins font-normal">{record.name}</TableCell>
                      <TableCell>
                        <Button
                          variant={record.isPresent ? "default" : "destructive"}
                          size="sm"
                          onClick={() => toggleAttendance(record.studentId)}
                          className="font-poppins font-normal"
                        >
                          {record.isPresent ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Present
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Absent
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLecture(null)}
                  className="font-poppins font-normal bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAndLockAttendance}
                  className="bg-green-600 hover:bg-green-700 font-poppins font-normal"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Save & Lock Attendance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
