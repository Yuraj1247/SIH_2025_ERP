"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, TrendingUp } from "lucide-react"
import type { Student, Lecture } from "@/lib/storage"
import AdvancedAnalytics from "./charts/advanced-analytics"

interface StudentAnalyticsListProps {
  students: Student[]
  lectures: Lecture[]
  isSubjectSpecific?: boolean
  subjectName?: string
  teacherName?: string
}

export default function StudentAnalyticsList({
  students,
  lectures,
  isSubjectSpecific = false,
  subjectName,
  teacherName,
}: StudentAnalyticsListProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Sort students by roll number
  const sortedStudents = [...students].sort((a, b) => {
    const rollA = Number.parseInt(a.rollNo) || 0
    const rollB = Number.parseInt(b.rollNo) || 0
    return rollA - rollB
  })

  const calculateStudentAttendance = (student: Student) => {
    let relevantLectures = lectures

    if (isSubjectSpecific && subjectName) {
      relevantLectures = lectures.filter((lecture) => lecture.subject === subjectName)
    }

    const totalLectures = relevantLectures.length
    const attendedLectures = relevantLectures.filter((lecture) => {
      const attendance = lecture.attendance.find((a) => a.studentId === student.id)
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

  if (selectedStudent) {
    return (
      <div>
        <div className="mb-4">
          <Button onClick={() => setSelectedStudent(null)} variant="outline" className="mb-4">
            ← Back to Student List
          </Button>
        </div>
        <AdvancedAnalytics
          student={selectedStudent}
          lectures={lectures}
          isSubjectSpecific={isSubjectSpecific}
          subjectName={subjectName}
          teacherName={teacherName}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Student Analytics
          {isSubjectSpecific && subjectName && (
            <span className="text-sm font-normal text-gray-600">- {subjectName}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Roll No</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total Lectures</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Attended</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Percentage</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => {
                const attendance = calculateStudentAttendance(student)
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">{student.rollNo}</td>
                    <td className="border border-gray-300 px-4 py-2">{student.fullName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{attendance.total}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{attendance.attended}</td>
                    <td
                      className={`border border-gray-300 px-4 py-2 text-center font-semibold ${getAttendanceColor(attendance.percentage)}`}
                    >
                      {attendance.percentage}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <Button
                        onClick={() => setSelectedStudent(student)}
                        size="sm"
                        className="bg-[#4B87F6] hover:bg-[#3A75E5] text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Analytics
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
