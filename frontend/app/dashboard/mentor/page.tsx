"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getClassrooms, addClassroom, saveClassrooms, getCurrentUser, type Classroom } from "@/lib/storage"
import { Plus, BookOpen, Users, Calendar, Edit, Trash2, Copy } from "lucide-react"

export default function MentorDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    semester: "",
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    loadClassrooms(user)
    setIsLoading(false)
  }, [])

  const loadClassrooms = (user?: any) => {
    const userToUse = user || currentUser
    if (!userToUse) return

    const allClassrooms = getClassrooms()
    const mentorClassrooms = allClassrooms.filter((classroom) => classroom.mentorId === userToUse?.id)
    setClassrooms(mentorClassrooms)
  }

  const handleCreateClassroom = () => {
    if (!formData.name || !formData.year || !formData.semester) {
      alert("Please fill in all fields")
      return
    }

    try {
      addClassroom({
        name: formData.name,
        year: formData.year,
        semester: formData.semester,
        mentorId: currentUser?.id || "",
      })
      loadClassrooms()
      setFormData({ name: "", year: "", semester: "" })
      setIsCreateDialogOpen(false)
      alert("Classroom created successfully!")
    } catch (error) {
      alert("Failed to create classroom. Please try again.")
    }
  }

  const handleEditClassroom = () => {
    if (!formData.name || !formData.year || !formData.semester || !editingClassroom) {
      alert("Please fill in all fields")
      return
    }

    try {
      const allClassrooms = getClassrooms()
      const updatedClassrooms = allClassrooms.map((classroom) =>
        classroom.id === editingClassroom.id
          ? { ...classroom, name: formData.name, year: formData.year, semester: formData.semester }
          : classroom,
      )
      saveClassrooms(updatedClassrooms)
      loadClassrooms()
      setFormData({ name: "", year: "", semester: "" })
      setEditingClassroom(null)
      setIsEditDialogOpen(false)
      alert("Classroom updated successfully!")
    } catch (error) {
      alert("Failed to update classroom. Please try again.")
    }
  }

  const handleDeleteClassroom = (classroom: Classroom) => {
    if (
      confirm(
        `Are you sure you want to delete classroom "${classroom.name}"? This will also remove all associated teachers and students. This action cannot be undone.`,
      )
    ) {
      try {
        const allClassrooms = getClassrooms()
        const updatedClassrooms = allClassrooms.filter((c) => c.id !== classroom.id)
        saveClassrooms(updatedClassrooms)
        loadClassrooms()
        alert("Classroom deleted successfully!")
      } catch (error) {
        alert("Failed to delete classroom. Please try again.")
      }
    }
  }

  const openEditDialog = (classroom: Classroom) => {
    setEditingClassroom(classroom)
    setFormData({
      name: classroom.name,
      year: classroom.year,
      semester: classroom.semester,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", year: "", semester: "" })
    setEditingClassroom(null)
  }

  const copyJoinCode = (joinCode: string) => {
    navigator.clipboard.writeText(joinCode)
    alert("Join code copied to clipboard!")
  }

  const openClassroomDetails = (classroomId: string) => {
    router.push(`/dashboard/mentor/classroom/${classroomId}`)
  }

  if (isLoading) {
    return (
      <AuthGuard allowedRoles={["mentor"]}>
        <DashboardLayout title="Mentor Dashboard">
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

  return (
    <AuthGuard allowedRoles={["mentor"]}>
      <DashboardLayout title="Mentor Dashboard">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <BookOpen className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Classrooms</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{classrooms.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="w-8 h-8 text-secondary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">
                    {classrooms.reduce((total, classroom) => total + classroom.teachers.length, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Students</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">
                    {classrooms.reduce((total, classroom) => total + classroom.students.length, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <Calendar className="w-8 h-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">This Month</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">
                    {classrooms.filter((c) => new Date(c.createdAt).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classroom Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-pt-sans font-bold text-dark">Classroom Management</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-blue-600 font-poppins font-normal" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Classroom
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-pt-sans font-bold">Create New Classroom</DialogTitle>
                      <DialogDescription className="font-poppins font-normal">
                        Enter the classroom details to create a new classroom.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="classroom-name" className="font-poppins font-normal">
                          Classroom Name
                        </Label>
                        <Input
                          id="classroom-name"
                          placeholder="Computer Science A"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="font-poppins font-normal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year" className="font-poppins font-normal">
                          Year
                        </Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, year: value })}>
                          <SelectTrigger className="font-poppins font-normal">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">First</SelectItem>
                            <SelectItem value="second">Second</SelectItem>
                            <SelectItem value="third">Third</SelectItem>
                            <SelectItem value="fourth">Fourth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="semester" className="font-poppins font-normal">
                          Semester
                        </Label>
                        <Select onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                          <SelectTrigger className="font-poppins font-normal">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sem1">Sem1</SelectItem>
                            <SelectItem value="Sem2">Sem2</SelectItem>
                            <SelectItem value="Sem3">Sem3</SelectItem>
                            <SelectItem value="Sem4">Sem4</SelectItem>
                            <SelectItem value="Sem5">Sem5</SelectItem>
                            <SelectItem value="Sem6">Sem6</SelectItem>
                            <SelectItem value="Sem7">Sem7</SelectItem>
                            <SelectItem value="Sem8">Sem8</SelectItem>
                          </SelectContent>
                        </Select>
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
                          onClick={handleCreateClassroom}
                          className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                        >
                          Create Classroom
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {classrooms.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-poppins font-normal">No classrooms created yet</p>
                  <p className="text-sm text-gray-500 font-poppins font-normal">
                    Click "Create Classroom" to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classrooms.map((classroom) => (
                    <Card
                      key={classroom.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary"
                      onClick={() => openClassroomDetails(classroom.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
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
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(classroom)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClassroom(classroom)
                              }}
                              className="h-8 w-8 p-0 text-danger hover:text-danger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="font-poppins font-normal text-gray-600">Teachers:</span>
                            <span className="font-poppins font-normal text-dark">{classroom.teachers.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-poppins font-normal text-gray-600">Students:</span>
                            <span className="font-poppins font-normal text-dark">{classroom.students.length}</span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-poppins font-normal text-gray-500 mb-1">Join Code:</p>
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {classroom.joinCode}
                              </code>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyJoinCode(classroom.joinCode)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-poppins font-normal text-gray-500">
                            Created: {new Date(classroom.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-pt-sans font-bold">Edit Classroom</DialogTitle>
                <DialogDescription className="font-poppins font-normal">
                  Update the classroom information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-classroom-name" className="font-poppins font-normal">
                    Classroom Name
                  </Label>
                  <Input
                    id="edit-classroom-name"
                    placeholder="Computer Science A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="font-poppins font-normal"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-year" className="font-poppins font-normal">
                    Year
                  </Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger className="font-poppins font-normal">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First</SelectItem>
                      <SelectItem value="second">Second</SelectItem>
                      <SelectItem value="third">Third</SelectItem>
                      <SelectItem value="fourth">Fourth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-semester" className="font-poppins font-normal">
                    Semester
                  </Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                  >
                    <SelectTrigger className="font-poppins font-normal">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sem1">Sem1</SelectItem>
                      <SelectItem value="Sem2">Sem2</SelectItem>
                      <SelectItem value="Sem3">Sem3</SelectItem>
                      <SelectItem value="Sem4">Sem4</SelectItem>
                      <SelectItem value="Sem5">Sem5</SelectItem>
                      <SelectItem value="Sem6">Sem6</SelectItem>
                      <SelectItem value="Sem7">Sem7</SelectItem>
                      <SelectItem value="Sem8">Sem8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      resetForm()
                    }}
                    className="font-poppins font-normal bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditClassroom}
                    className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                  >
                    Update Classroom
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
