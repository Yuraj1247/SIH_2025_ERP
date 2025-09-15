"use client"

import { useState, useEffect } from "react"
import AuthGuard from "@/components/auth-guard"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getMentors,
  addMentor,
  saveMentors,
  getFormConfigurations,
  updateFormField,
  addFormField,
  deleteFormField,
  type Mentor,
  type FormConfiguration,
  type FormField,
} from "@/lib/storage"
import { Plus, Edit, Trash2, Users, UserCheck, FormInput } from "lucide-react"

export default function AdminDashboard() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [formConfigs, setFormConfigs] = useState<FormConfiguration[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [fieldData, setFieldData] = useState({
    id: "",
    label: "",
    type: "text" as FormField["type"],
    required: false,
    placeholder: "",
    options: [] as string[],
  })

  useEffect(() => {
    loadMentors()
    loadFormConfigs()
  }, [])

  const loadMentors = () => {
    const mentorData = getMentors()
    setMentors(mentorData)
  }

  const loadFormConfigs = () => {
    const configs = getFormConfigurations()
    setFormConfigs(configs)
  }

  const handleAddField = () => {
    if (!fieldData.label || !fieldData.id) {
      alert("Please fill in field ID and label")
      return
    }

    const newField: FormField = {
      ...fieldData,
      options: fieldData.type === "select" ? fieldData.options : undefined,
    }

    if (addFormField("student_signup", newField)) {
      loadFormConfigs()
      resetFieldForm()
      setIsFieldDialogOpen(false)
      alert("Field added successfully! Student signup form updated in real-time.")
    } else {
      alert("Failed to add field")
    }
  }

  const handleEditField = () => {
    if (!fieldData.label || !fieldData.id || !editingField) {
      alert("Please fill in all required fields")
      return
    }

    const updates = {
      ...fieldData,
      options: fieldData.type === "select" ? fieldData.options : undefined,
    }

    if (updateFormField("student_signup", editingField.id, updates)) {
      loadFormConfigs()
      resetFieldForm()
      setIsFieldDialogOpen(false)
      alert("Field updated successfully! Changes reflected in student signup form.")
    } else {
      alert("Failed to update field")
    }
  }

  const handleDeleteField = (fieldId: string) => {
    if (confirm("Are you sure you want to delete this field?")) {
      if (deleteFormField("student_signup", fieldId)) {
        loadFormConfigs()
        alert("Field deleted successfully! Student signup form updated.")
      } else {
        alert("Failed to delete field")
      }
    }
  }

  const openFieldDialog = (field?: FormField) => {
    if (field) {
      setEditingField(field)
      setFieldData({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || "",
        options: field.options || [],
      })
    } else {
      setEditingField(null)
      resetFieldForm()
    }
    setIsFieldDialogOpen(true)
  }

  const resetFieldForm = () => {
    setFieldData({
      id: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    })
    setEditingField(null)
  }

  const addOption = () => {
    setFieldData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFieldData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  const removeOption = (index: number) => {
    setFieldData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const handleAddMentor = () => {
    if (!formData.name || !formData.email) {
      alert("Please fill in all fields")
      return
    }

    if (mentors.some((mentor) => mentor.email === formData.email)) {
      alert("A mentor with this email already exists")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return
    }

    try {
      addMentor(formData)
      loadMentors()
      setFormData({ name: "", email: "" })
      setIsAddDialogOpen(false)
      alert("Mentor added successfully!")
    } catch (error) {
      alert("Failed to add mentor. Please try again.")
    }
  }

  const handleEditMentor = () => {
    if (!formData.name || !formData.email || !editingMentor) {
      alert("Please fill in all fields")
      return
    }

    if (mentors.some((mentor) => mentor.email === formData.email && mentor.id !== editingMentor.id)) {
      alert("A mentor with this email already exists")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return
    }

    try {
      const updatedMentors = mentors.map((mentor) =>
        mentor.id === editingMentor.id ? { ...mentor, name: formData.name, email: formData.email } : mentor,
      )
      saveMentors(updatedMentors)
      loadMentors()
      setFormData({ name: "", email: "" })
      setEditingMentor(null)
      setIsEditDialogOpen(false)
      alert("Mentor updated successfully!")
    } catch (error) {
      alert("Failed to update mentor. Please try again.")
    }
  }

  const handleDeleteMentor = (mentor: Mentor) => {
    if (confirm(`Are you sure you want to delete mentor "${mentor.name}"? This action cannot be undone.`)) {
      try {
        const updatedMentors = mentors.filter((m) => m.id !== mentor.id)
        saveMentors(updatedMentors)
        loadMentors()
        alert("Mentor deleted successfully!")
      } catch (error) {
        alert("Failed to delete mentor. Please try again.")
      }
    }
  }

  const openEditDialog = (mentor: Mentor) => {
    setEditingMentor(mentor)
    setFormData({ name: mentor.name, email: mentor.email })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "" })
    setEditingMentor(null)
  }

  const studentSignupConfig = formConfigs.find((config) => config.id === "student_signup")

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Admin Dashboard">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="w-8 h-8 text-primary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Total Mentors</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{mentors.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <UserCheck className="w-8 h-8 text-secondary mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Active Mentors</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{mentors.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <FormInput className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-poppins font-normal text-gray-600">Form Fields</p>
                  <p className="text-2xl font-pt-sans font-bold text-dark">{studentSignupConfig?.fields.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="mentors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mentors" className="font-poppins font-normal">
                Mentor Management
              </TabsTrigger>
              <TabsTrigger value="forms" className="font-poppins font-normal">
                Form Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-pt-sans font-bold text-dark">Mentor Management</CardTitle>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-blue-600 font-poppins font-normal" onClick={resetForm}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Mentor
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-pt-sans font-bold">Add New Mentor</DialogTitle>
                          <DialogDescription className="font-poppins font-normal">
                            Enter the mentor's details to add them to the system.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="mentor-name" className="font-poppins font-normal pb-2">
                              Mentor Name
                            </Label>
                            <Input
                              id="mentor-name"
                              placeholder="John Doe"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="font-poppins font-normal"
                            />
                          </div>
                          <div>
                            <Label htmlFor="mentor-email" className="font-poppins font-normal pb-2">
                              Email Address
                            </Label>
                            <Input
                              id="mentor-email"
                              type="email"
                              placeholder="mentor@college.edu"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="font-poppins font-normal"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddDialogOpen(false)}
                              className="font-poppins font-normal bg-transparent"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddMentor}
                              className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                            >
                              Add Mentor
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {mentors.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No mentors added yet</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">Click "Add Mentor" to get started</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-pt-sans font-semibold">Name</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Email</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Added Date</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mentors.map((mentor) => (
                          <TableRow key={mentor.id}>
                            <TableCell className="font-poppins font-normal">{mentor.name}</TableCell>
                            <TableCell className="font-poppins font-normal">{mentor.email}</TableCell>
                            <TableCell className="font-poppins font-normal">
                              {new Date(mentor.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(mentor)}
                                  className="font-poppins font-normal bg-transparent"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMentor(mentor)}
                                  className="text-danger border-danger hover:bg-danger hover:text-white font-poppins font-normal bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
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

            <TabsContent value="forms" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-pt-sans font-bold text-dark">
                      Student Signup Form Builder
                    </CardTitle>
                    {/* <Button
                      className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                      onClick={() => openFieldDialog()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Field
                    </Button> */}
                  </div>
                </CardHeader>
                <CardContent>
                  {studentSignupConfig && studentSignupConfig.fields.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-pt-sans font-semibold">Field ID</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Label</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Type</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Required</TableHead>
                          <TableHead className="font-pt-sans font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentSignupConfig.fields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-poppins font-normal font-mono text-sm">{field.id}</TableCell>
                            <TableCell className="font-poppins font-normal">{field.label}</TableCell>
                            <TableCell className="font-poppins font-normal capitalize">{field.type}</TableCell>
                            <TableCell className="font-poppins font-normal">{field.required ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFieldDialog(field)}
                                  className="font-poppins font-normal bg-transparent"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteField(field.id)}
                                  className="text-danger border-danger hover:bg-danger hover:text-white font-poppins font-normal bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FormInput className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-poppins font-normal">No form fields configured</p>
                      <p className="text-sm text-gray-500 font-poppins font-normal">Click "Add Field" to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-pt-sans font-bold">Edit Mentor</DialogTitle>
                <DialogDescription className="font-poppins font-normal">
                  Update the mentor's information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-mentor-name" className="font-poppins font-normal">
                    Mentor Name
                  </Label>
                  <Input
                    id="edit-mentor-name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="font-poppins font-normal"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mentor-email" className="font-poppins font-normal">
                    Email Address
                  </Label>
                  <Input
                    id="edit-mentor-email"
                    type="email"
                    placeholder="mentor@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="font-poppins font-normal"
                  />
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
                  <Button onClick={handleEditMentor} className="bg-primary hover:bg-blue-600 font-poppins font-normal">
                    Update Mentor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-pt-sans font-bold">
                  {editingField ? "Edit Form Field" : "Add Form Field"}
                </DialogTitle>
                <DialogDescription className="font-poppins font-normal">
                  Configure the form field properties for the student signup form.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field-id" className="font-poppins font-normal">
                      Field ID
                    </Label>
                    <Input
                      id="field-id"
                      placeholder="fieldName"
                      value={fieldData.id}
                      onChange={(e) => setFieldData({ ...fieldData, id: e.target.value })}
                      className="font-poppins font-normal"
                      disabled={!!editingField}
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-label" className="font-poppins font-normal">
                      Field Label
                    </Label>
                    <Input
                      id="field-label"
                      placeholder="Field Label"
                      value={fieldData.label}
                      onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
                      className="font-poppins font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field-type" className="font-poppins font-normal">
                      Field Type
                    </Label>
                    <Select
                      value={fieldData.type}
                      onValueChange={(value: FormField["type"]) => setFieldData({ ...fieldData, type: value })}
                    >
                      <SelectTrigger className="font-poppins font-normal">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Phone</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="field-placeholder" className="font-poppins font-normal">
                      Placeholder
                    </Label>
                    <Input
                      id="field-placeholder"
                      placeholder="Enter placeholder text"
                      value={fieldData.placeholder}
                      onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
                      className="font-poppins font-normal"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-required"
                    checked={fieldData.required}
                    onCheckedChange={(checked) => setFieldData({ ...fieldData, required: !!checked })}
                  />
                  <Label htmlFor="field-required" className="font-poppins font-normal">
                    Required field
                  </Label>
                </div>

                {fieldData.type === "select" && (
                  <div>
                    <Label className="font-poppins font-normal">Options</Label>
                    <div className="space-y-2">
                      {fieldData.options.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="font-poppins font-normal"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                            className="text-danger border-danger hover:bg-danger hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addOption}
                        className="w-full font-poppins font-normal bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFieldDialogOpen(false)
                      resetFieldForm()
                    }}
                    className="font-poppins font-normal bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingField ? handleEditField : handleAddField}
                    className="bg-primary hover:bg-blue-600 font-poppins font-normal"
                  >
                    {editingField ? "Update Field" : "Add Field"}
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
