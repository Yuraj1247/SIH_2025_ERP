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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  initializeAdminData,
  isValidAdminEmail,
  isValidMentorEmail,
  isValidTeacherEmail,
  isValidStudentEmail,
  generateAndStoreOTP,
  validateOTP,
  clearOTP,
  canResendOTP,
  setCurrentUser,
  getMentors,
  getClassrooms,
  getStudents,
} from "@/lib/storage"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [userType, setUserType] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Initializing admin data on page load")
    initializeAdminData()

    // Verify admin data was initialized
    const adminData = localStorage.getItem("erp_admin_data")
    console.log("[v0] Admin data after initialization:", adminData)
  }, [])

  const handleEmailSubmit = (type: string) => {
    if (!email) {
      alert("Please enter your email address")
      return
    }

    console.log("[v0] Attempting login for:", email, "as:", type)
    setLoading(true)
    let isValidEmail = false

    switch (type) {
      case "admin":
        console.log("[v0] Validating admin email:", email)
        isValidEmail = isValidAdminEmail(email)
        console.log("[v0] Admin validation result:", isValidEmail)
        break
      case "mentor":
        isValidEmail = isValidMentorEmail(email)
        break
      case "teacher":
        isValidEmail = isValidTeacherEmail(email)
        break
      case "student":
        isValidEmail = isValidStudentEmail(email)
        break
    }

    setTimeout(() => {
      if (isValidEmail) {
        const newOTP = generateAndStoreOTP(email, type)
        setUserType(type)
        setShowOTPInput(true)
        alert(`OTP sent to ${email}: ${newOTP}`)
      } else {
        console.log("[v0] Email validation failed for:", email, "type:", type)
        alert("Email not found in our records. Please check your email or contact administrator.")
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
      const newOTP = generateAndStoreOTP(email, userType)
      alert(`New OTP sent to ${email}: ${newOTP}`)
      setResendLoading(false)
    }, 1000)
  }

  const handleOTPSubmit = () => {
    if (!otp) {
      alert("Please enter the OTP")
      return
    }

    if (validateOTP(email, otp)) {
      // Set current user based on type
      let userData = null
      switch (userType) {
        case "admin":
          userData = { type: "admin", email }
          break
        case "mentor":
          const mentors = getMentors()
          userData = { type: "mentor", ...mentors.find((m) => m.email === email) }
          break
        case "teacher":
          const classrooms = getClassrooms()
          let teacherData = null
          for (const classroom of classrooms) {
            const teacher = classroom.teachers.find((t) => t.email === email)
            if (teacher) {
              teacherData = { type: "teacher", ...teacher, classroomId: classroom.id }
              break
            }
          }
          userData = teacherData
          break
        case "student":
          const students = getStudents()
          userData = { type: "student", ...students.find((s) => s.email === email) }
          break
      }

      if (userData) {
        setCurrentUser(userData)
        clearOTP()
        alert("Login successful!")
        router.push(`/dashboard/${userType}`)
      } else {
        alert("User data not found")
      }
    } else {
      alert("Invalid or expired OTP. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showOTPInput) {
        handleOTPSubmit()
      }
    }
  }

  const resetForm = () => {
    setEmail("")
    setOtp("")
    setShowOTPInput(false)
    setUserType("")
    clearOTP()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-pt-sans font-bold text-dark mb-2">Welcome Back</h1>
            <p className="text-gray-600 font-poppins font-normal">Sign in to access your dashboard</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-pt-sans font-semibold text-center">
                {showOTPInput ? "Enter OTP" : "Choose Login Type"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showOTPInput ? (
                <Tabs defaultValue="admin" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="admin" className="text-sm font-poppins font-medium">
                      Admin
                    </TabsTrigger>
                    <TabsTrigger value="mentor" className="text-sm font-poppins font-medium">
                      Mentor
                    </TabsTrigger>
                    <TabsTrigger value="teacher" className="text-sm font-poppins font-medium">
                      Teacher
                    </TabsTrigger>
                    <TabsTrigger value="student" className="text-sm font-poppins font-medium">
                      Student
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="admin" className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email" className="font-poppins font-normal">
                        Admin Email
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit("admin")}
                        className="font-poppins font-normal"
                      />
                    </div>
                    <Button
                      onClick={() => handleEmailSubmit("admin")}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="mentor" className="space-y-4">
                    <div>
                      <Label htmlFor="mentor-email" className="font-poppins font-normal">
                        Mentor Email
                      </Label>
                      <Input
                        id="mentor-email"
                        type="email"
                        placeholder="mentor@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit("mentor")}
                        className="font-poppins font-normal"
                      />
                    </div>
                    <Button
                      onClick={() => handleEmailSubmit("mentor")}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="teacher" className="space-y-4">
                    <div>
                      <Label htmlFor="teacher-email" className="font-poppins font-normal">
                        Teacher Email
                      </Label>
                      <Input
                        id="teacher-email"
                        type="email"
                        placeholder="teacher@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit("teacher")}
                        className="font-poppins font-normal"
                      />
                    </div>
                    <Button
                      onClick={() => handleEmailSubmit("teacher")}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="student" className="space-y-4">
                    <div>
                      <Label htmlFor="student-email" className="font-poppins font-normal">
                        Student Email
                      </Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="student@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit("student")}
                        className="font-poppins font-normal"
                      />
                    </div>
                    <Button
                      onClick={() => handleEmailSubmit("student")}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-poppins font-normal mb-2">Don't have an account?</p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/signup")}
                        className="font-poppins font-normal bg-transparent"
                      >
                        Sign Up as Student
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
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
                    <p className="text-sm text-gray-600 font-poppins font-normal mt-1">
                      OTP sent to: {email} ({userType})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleOTPSubmit}
                      className="flex-1 bg-primary hover:bg-blue-600 font-poppins font-normal"
                    >
                      Verify OTP
                    </Button>
                    <Button
                      onClick={resetForm}
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
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-poppins font-normal">
              For demo purposes, OTP will be shown in alert. In production, it will be sent via email.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
