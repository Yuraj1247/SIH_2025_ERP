"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  addStudent,
  generateAndStoreOTP,
  validateOTP,
  clearOTP,
  canResendOTP,
  getFormConfigurations,
  type FormConfiguration,
  type FormField,
} from "@/lib/storage"

export default function SignupPage() {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [formConfig, setFormConfig] = useState<FormConfiguration | null>(null)
  const [otp, setOtp] = useState("")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [canSignup, setCanSignup] = useState(true)
  const [branchError, setBranchError] = useState("")
  const router = useRouter()

useEffect(() => {
  let prevConfig: FormConfiguration | null = null

  const loadFormConfig = () => {
    const configs = getFormConfigurations()
    const studentConfig = configs.find((config) => config.id === "student_signup") || null

    // Only update state if config actually changed
    if (JSON.stringify(studentConfig) !== JSON.stringify(prevConfig)) {
      setFormConfig(studentConfig)
      prevConfig = studentConfig

      // ✅ Branch validation logic
      const branchField = studentConfig?.fields.find((field) => field.id === "branch")
      if (branchField && branchField.type === "select") {
        if (!branchField.options || branchField.options.length === 0) {
          setCanSignup(false)
          setBranchError("No branches are available for signup. Please contact the administrator.")
        } else {
          setCanSignup(true)
          setBranchError("")
        }
      }
    }
  }

  // Load once on mount
  loadFormConfig()

  // Poll for admin updates every 2 sec
  const interval = setInterval(loadFormConfig, 2000)
  return () => clearInterval(interval)
}, [])


  useEffect(() => {
    if (formConfig) {
      const initialData: Record<string, string> = {}
      formConfig.fields.forEach((field) => {
        initialData[field.id] = ""
      })
      setFormData(initialData)
    }
  }, [formConfig])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      if (field === "admittedYear" && value) {
        const admittedYear = Number.parseInt(value)
        if (!isNaN(admittedYear)) {
          updated.passingYear = (admittedYear + 4).toString()
        }
      }

      return updated
    })
  }

  const validateForm = (): string | null => {
    if (!formConfig) return "Form configuration not loaded"
    if (!canSignup) return branchError

    const requiredFields = formConfig.fields.filter((field) => field.required)
    const missingFields = requiredFields.filter((field) => !formData[field.id])

    if (missingFields.length > 0) {
      return `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`
    }

    // Enhanced email validation
    const emailFields = formConfig.fields.filter((field) => field.type === "email")
    for (const field of emailFields) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (formData[field.id] && !emailRegex.test(formData[field.id])) {
        return `Please enter a valid ${field.label.toLowerCase()}`
      }
    }

    // Phone validation
    const phoneFields = formConfig.fields.filter((field) => field.type === "tel")
    for (const field of phoneFields) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (formData[field.id] && !phoneRegex.test(formData[field.id].replace(/\s/g, ""))) {
        return `Please enter a valid ${field.label.toLowerCase()}`
      }
    }

    // Year validation for admitted and passing years
    if (formData.admittedYear && formData.passingYear) {
      const currentYear = new Date().getFullYear()
      const admittedYear = Number.parseInt(formData.admittedYear)
      const passingYear = Number.parseInt(formData.passingYear)

      if (admittedYear < 2000 || admittedYear > currentYear + 1) {
        return "Please enter a valid admitted year"
      }
      if (passingYear <= admittedYear || passingYear > currentYear + 10) {
        return "Please enter a valid passing year"
      }
    }

    return null
  }

  const handleSubmit = () => {
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    setLoading(true)
    setTimeout(() => {
      try {
        const newOTP = generateAndStoreOTP(formData.email, "student")
        setShowOTPInput(true)
        alert(`OTP sent to ${formData.email}: ${newOTP}`)
      } catch (error) {
        alert("Failed to send OTP. Please try again.")
      }
      setLoading(false)
    }, 1000)
  }

  const handleResendOTP = () => {
    if (!canResendOTP()) {
      alert("Please wait before requesting a new OTP")
      return
    }

    setResendLoading(true)
    setTimeout(() => {
      const newOTP = generateAndStoreOTP(formData.email, "student")
      alert(`New OTP sent to ${formData.email}: ${newOTP}`)
      setResendLoading(false)
    }, 1000)
  }

  const handleOTPSubmit = () => {
    if (!otp) {
      alert("Please enter the OTP")
      return
    }

    if (validateOTP(formData.email, otp)) {
      try {
        // Convert form data to student format
        const studentData = {
          admittedYear: formData.admittedYear,
          passingYear: formData.passingYear,
          branch: formData.branch,
          rollNo: formData.rollNo,
          email: formData.email,
          fullName: formData.fullName,
          mobile: formData.mobile,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
        }

        addStudent(studentData)
        clearOTP()
        alert("Registration successful! You can now login with your email.")
        router.push("/login")
      } catch (error: any) {
        alert(error.message || "Registration failed. Please try again.")
      }
    } else {
      alert("Invalid or expired OTP. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showOTPInput) {
        handleOTPSubmit()
      } else {
        handleSubmit()
      }
    }
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.id] || ""

    switch (field.type) {
      case "select":
        return (
          <div key={field.id}>
            <Label className="font-poppins font-normal">{field.label}</Label>
            <Select onValueChange={(value) => handleInputChange(field.id, value)} value={value}>
              <SelectTrigger className="font-poppins font-normal">
                <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "date":
        return (
          <div key={field.id}>
            <Label className="font-poppins font-normal">{field.label}</Label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="font-poppins font-normal"
            />
          </div>
        )

      default:
        return (
          <div key={field.id}>
            <Label className="font-poppins font-normal">{field.label}</Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="font-poppins font-normal"
            />
          </div>
        )
    }
  }

  if (showOTPInput) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-pt-sans font-semibold text-center">Verify Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="font-poppins font-normal">
                    Enter 6-digit OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={6}
                    className="font-poppins font-normal text-center text-lg tracking-widest"
                  />
                  <p className="text-sm text-gray-600 font-poppins font-normal mt-1">OTP sent to: {formData.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleOTPSubmit}
                    className="flex-1 bg-primary hover:bg-blue-600 font-poppins font-normal"
                  >
                    Verify & Register
                  </Button>
                  <Button
                    onClick={() => setShowOTPInput(false)}
                    variant="outline"
                    className="flex-1 font-poppins font-normal bg-transparent"
                  >
                    Back
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    onClick={handleResendOTP}
                    disabled={resendLoading || !canResendOTP()}
                    variant="ghost"
                    className="text-sm font-poppins font-normal"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!canSignup) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-pt-sans font-bold text-dark mb-2">Registration Unavailable</h2>
                  <p className="text-red-600 font-poppins font-normal text-lg">{branchError}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 font-poppins font-normal">
                    The administrator needs to configure available branches before student registration can proceed.
                  </p>
                  <p className="text-sm text-gray-500 font-poppins font-normal">
                    Please contact your institution's administrator for assistance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 font-poppins font-normal">Loading registration form...</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const academicFields = formConfig.fields.filter((field) =>
    ["admittedYear", "passingYear", "branch", "rollNo", "email"].includes(field.id),
  )

  const personalFields = formConfig.fields.filter((field) =>
    ["fullName", "mobile", "dateOfBirth", "gender", "bloodGroup"].includes(field.id),
  )

  const parentFields = formConfig.fields.filter((field) =>
    ["fatherName", "motherName", "parentEmail", "parentPhone"].includes(field.id),
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-pt-sans font-bold text-dark mb-2">Student Registration</h1>
            <p className="text-gray-600 font-poppins font-normal">Create your student account</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-8" onKeyPress={handleKeyPress}>
                {/* Academic Information */}
                {academicFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-pt-sans font-semibold text-dark mb-4">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {academicFields.map((field) => (
                        <div key={field.id} className={field.id === "email" ? "md:col-span-2" : ""}>
                          {renderFormField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                {personalFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-pt-sans font-semibold text-dark mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {personalFields.map((field) => (
                        <div key={field.id} className={field.id === "fullName" ? "md:col-span-2" : ""}>
                          {renderFormField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent Information */}
                {parentFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-pt-sans font-semibold text-dark mb-4">Parent Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parentFields.map((field) => renderFormField(field))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !canSignup}
                    className="bg-primary hover:bg-blue-600 px-8 py-3 font-poppins font-normal"
                  >
                    {loading ? "Sending OTP..." : "Register & Send OTP"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
