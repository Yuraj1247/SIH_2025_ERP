// Local Storage utility functions for the ERP system

export interface AdminData {
  emails: string[]
}

export interface Mentor {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Classroom {
  id: string
  name: string
  year: string
  semester: string
  joinCode: string
  mentorId: string
  createdAt: string
  teachers: Teacher[]
  students: Student[]
}

export interface Teacher {
  id: string
  name: string
  email: string
  subject: string
  subjectType: string
  classroomId: string
  joinedAt: string
}

export interface Student {
  id: string
  // Academic Info
  admittedYear: string
  passingYear: string
  branch: string
  rollNo: string
  email: string
  // Personal Info
  fullName: string
  mobile: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  // Parent Info
  fatherName: string
  motherName: string
  parentEmail: string
  parentPhone: string
  // System Info
  createdAt: string
  classrooms: string[] // Array of classroom IDs
}

export interface Lecture {
  id: string
  classroomId: string
  teacherId: string
  subject: string
  date: string
  time: string
  createdAt: string
  isLocked: boolean
  attendance: AttendanceRecord[]
}

export interface AttendanceRecord {
  studentId: string
  rollNo: string
  name: string
  isPresent: boolean
}

export interface StudentRequest {
  id: string
  studentId: string
  classroomId: string
  requestedAt: string
  status: "pending" | "approved" | "denied"
  studentInfo: Student
}

interface OTPData {
  otp: string
  email: string
  userType: string
  expiresAt: number
  generatedAt: number
}

// Form Configuration Interfaces
export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "select" | "date" | "tel"
  required: boolean
  options?: string[] // For select fields
  placeholder?: string
  validation?: string // Regex pattern
}

export interface FormConfiguration {
  id: string
  name: string
  fields: FormField[]
  createdAt: string
  updatedAt: string
}

// Storage Keys
const STORAGE_KEYS = {
  ADMIN_DATA: "erp_admin_data",
  MENTORS: "erp_mentors",
  CLASSROOMS: "erp_classrooms",
  TEACHERS: "erp_teachers",
  STUDENTS: "erp_students",
  LECTURES: "erp_lectures",
  CURRENT_USER: "erp_current_user",
  STUDENT_REQUESTS: "erp_student_requests",
}

const OTP_STORAGE_KEY = "erp_otp_data"
const OTP_EXPIRY_MINUTES = 10
const FORM_CONFIG_KEY = "erp_form_configurations"

const isBrowser = () => typeof window !== "undefined"

// Initialize default admin emails
export const initializeAdminData = (): void => {
  if (!isBrowser()) return

  const existingData = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA)
  if (!existingData) {
    const defaultAdminData: AdminData = {
      emails: ["admin1@college.edu", "admin2@college.edu", "admin3@college.edu"],
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(defaultAdminData))
    console.log("[v0] Admin data initialized:", defaultAdminData)
  } else {
    console.log("[v0] Admin data already exists:", JSON.parse(existingData))
  }
}

// Admin Data Functions
export const getAdminData = (): AdminData => {
  if (!isBrowser()) return { emails: [] }

  const data = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA)
  return data ? JSON.parse(data) : { emails: [] }
}

// Mentor Functions
export const getMentors = (): Mentor[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(STORAGE_KEYS.MENTORS)
  return data ? JSON.parse(data) : []
}

export const saveMentors = (mentors: Mentor[]): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors))
}

export const addMentor = (mentor: Omit<Mentor, "id" | "createdAt">): Mentor => {
  const mentors = getMentors()
  const newMentor: Mentor = {
    ...mentor,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  mentors.push(newMentor)
  saveMentors(mentors)
  return newMentor
}

// Classroom Functions
export const getClassrooms = (): Classroom[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(STORAGE_KEYS.CLASSROOMS)
  return data ? JSON.parse(data) : []
}

export const saveClassrooms = (classrooms: Classroom[]): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms))
}

export const addClassroom = (
  classroom: Omit<Classroom, "id" | "joinCode" | "createdAt" | "teachers" | "students">,
): Classroom => {
  const classrooms = getClassrooms()
  const newClassroom: Classroom = {
    ...classroom,
    id: generateId(),
    joinCode: generateJoinCode(),
    createdAt: new Date().toISOString(),
    teachers: [],
    students: [],
  }
  classrooms.push(newClassroom)
  saveClassrooms(classrooms)
  return newClassroom
}

// Student Functions
export const getStudents = (): Student[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS)
  return data ? JSON.parse(data) : []
}

export const saveStudents = (students: Student[]): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students))
}

export const addStudent = (student: Omit<Student, "id" | "createdAt" | "classrooms">): Student => {
  const students = getStudents()

  // Check for duplicate email
  if (students.some((s) => s.email.toLowerCase() === student.email.toLowerCase())) {
    throw new Error("A student with this email already exists")
  }

  // Check for duplicate roll number
  if (students.some((s) => s.rollNo.toLowerCase() === student.rollNo.toLowerCase())) {
    throw new Error("A student with this roll number already exists")
  }

  const newStudent: Student = {
    ...student,
    id: generateId(),
    createdAt: new Date().toISOString(),
    classrooms: [],
  }
  students.push(newStudent)
  saveStudents(students)
  return newStudent
}

// Lecture Functions
export const getLectures = (): Lecture[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(STORAGE_KEYS.LECTURES)
  return data ? JSON.parse(data) : []
}

export const saveLectures = (lectures: Lecture[]): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures))
}

export const addLecture = (lecture: Omit<Lecture, "id" | "createdAt" | "isLocked" | "attendance">): Lecture => {
  const lectures = getLectures()
  const newLecture: Lecture = {
    ...lecture,
    id: generateId(),
    createdAt: new Date().toISOString(),
    isLocked: false,
    attendance: [],
  }
  lectures.push(newLecture)
  saveLectures(lectures)
  return newLecture
}

// Current User Functions
export const getCurrentUser = (): any => {
  if (!isBrowser()) return null

  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export const setCurrentUser = (user: any): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
}

export const clearCurrentUser = (): void => {
  if (!isBrowser()) return

  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

// Form Configuration Functions
export const getFormConfigurations = (): FormConfiguration[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(FORM_CONFIG_KEY)
  if (!data) {
    // Initialize with default student signup form
    const defaultConfig: FormConfiguration = {
      id: "student_signup",
      name: "Student Signup Form",
      fields: [
        { id: "admittedYear", label: "Admitted Academic Year", type: "text", required: true, placeholder: "2024" },
        { id: "passingYear", label: "Passing Year", type: "text", required: true, placeholder: "2028" },
        {
          id: "branch",
          label: "Branch",
          type: "select",
          required: true,
          options: ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"],
        },
        { id: "rollNo", label: "Roll Number", type: "text", required: true, placeholder: "CS001" },
        { id: "email", label: "Student Email", type: "email", required: true, placeholder: "student@college.edu" },
        { id: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
        { id: "mobile", label: "Mobile Number", type: "tel", required: true, placeholder: "+1234567890" },
        { id: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
        { id: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
        {
          id: "bloodGroup",
          label: "Blood Group",
          type: "select",
          required: true,
          options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        { id: "fatherName", label: "Father's Full Name", type: "text", required: true, placeholder: "John Doe Sr." },
        { id: "motherName", label: "Mother's Full Name", type: "text", required: true, placeholder: "Jane Doe" },
        { id: "parentEmail", label: "Parent Email", type: "email", required: true, placeholder: "parent@email.com" },
        { id: "parentPhone", label: "Parent Phone Number", type: "tel", required: true, placeholder: "+1234567890" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify([defaultConfig]))
    return [defaultConfig]
  }

  return JSON.parse(data)
}

export const saveFormConfigurations = (configs: FormConfiguration[]): void => {
  if (!isBrowser()) return
  localStorage.setItem(FORM_CONFIG_KEY, JSON.stringify(configs))
}

export const updateFormConfiguration = (configId: string, updates: Partial<FormConfiguration>): boolean => {
  const configs = getFormConfigurations()
  const configIndex = configs.findIndex((c) => c.id === configId)

  if (configIndex === -1) return false

  configs[configIndex] = {
    ...configs[configIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveFormConfigurations(configs)
  return true
}

export const addFormField = (configId: string, field: FormField): boolean => {
  const configs = getFormConfigurations()
  const config = configs.find((c) => c.id === configId)

  if (!config) return false

  config.fields.push(field)
  config.updatedAt = new Date().toISOString()

  saveFormConfigurations(configs)
  return true
}

export const updateFormField = (configId: string, fieldId: string, updates: Partial<FormField>): boolean => {
  const configs = getFormConfigurations()
  const config = configs.find((c) => c.id === configId)

  if (!config) return false

  const fieldIndex = config.fields.findIndex((f) => f.id === fieldId)
  if (fieldIndex === -1) return false

  config.fields[fieldIndex] = { ...config.fields[fieldIndex], ...updates }
  config.updatedAt = new Date().toISOString()

  saveFormConfigurations(configs)
  return true
}

export const deleteFormField = (configId: string, fieldId: string): boolean => {
  const configs = getFormConfigurations()
  const config = configs.find((c) => c.id === configId)

  if (!config) return false

  config.fields = config.fields.filter((f) => f.id !== fieldId)
  config.updatedAt = new Date().toISOString()

  saveFormConfigurations(configs)
  return true
}

// Student Request Functions
export const getStudentRequests = (): StudentRequest[] => {
  if (!isBrowser()) return []

  const data = localStorage.getItem(STORAGE_KEYS.STUDENT_REQUESTS)
  return data ? JSON.parse(data) : []
}

export const saveStudentRequests = (requests: StudentRequest[]): void => {
  if (!isBrowser()) return

  localStorage.setItem(STORAGE_KEYS.STUDENT_REQUESTS, JSON.stringify(requests))
}

export const createStudentRequest = (studentEmail: string, joinCode: string): boolean => {
  const classrooms = getClassrooms()
  const students = getStudents()
  const requests = getStudentRequests()

  const classroom = classrooms.find((c) => c.joinCode === joinCode)
  const student = students.find((s) => s.email === studentEmail)

  if (!classroom || !student) return false

  // Check if student is already in this classroom
  if (classroom.students.some((s) => s.id === student.id)) return false

  // Check if request already exists
  if (requests.some((r) => r.studentId === student.id && r.classroomId === classroom.id && r.status === "pending")) {
    return false
  }

  const newRequest: StudentRequest = {
    id: generateId(),
    studentId: student.id,
    classroomId: classroom.id,
    requestedAt: new Date().toISOString(),
    status: "pending",
    studentInfo: student,
  }

  requests.push(newRequest)
  saveStudentRequests(requests)
  return true
}

export const approveStudentRequest = (requestId: string): boolean => {
  const requests = getStudentRequests()
  const classrooms = getClassrooms()
  const students = getStudents()

  const requestIndex = requests.findIndex((r) => r.id === requestId)
  if (requestIndex === -1) return false

  const request = requests[requestIndex]
  const classroom = classrooms.find((c) => c.id === request.classroomId)
  const student = students.find((s) => s.id === request.studentId)

  if (!classroom || !student) return false

  // Add student to classroom
  classroom.students.push(student)

  // Add classroom to student's list
  student.classrooms.push(classroom.id)

  // Update request status
  requests[requestIndex].status = "approved"

  saveClassrooms(classrooms)
  saveStudents(students)
  saveStudentRequests(requests)
  return true
}

export const denyStudentRequest = (requestId: string): boolean => {
  const requests = getStudentRequests()
  const requestIndex = requests.findIndex((r) => r.id === requestId)

  if (requestIndex === -1) return false

  requests[requestIndex].status = "denied"
  saveStudentRequests(requests)
  return true
}

export const getClassroomRequests = (classroomId: string): StudentRequest[] => {
  const requests = getStudentRequests()
  return requests.filter((r) => r.classroomId === classroomId)
}

// Student Functions
export const joinClassroomAsStudent = (studentEmail: string, joinCode: string): boolean => {
  return createStudentRequest(studentEmail, joinCode)
}

export const clearAllData = (): void => {
  if (!isBrowser()) return

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

// OTP Management Functions
export const generateAndStoreOTP = (email: string, userType: string): string => {
  if (!isBrowser()) return ""

  const otp = generateOTP()
  const otpData: OTPData = {
    otp,
    email,
    userType,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    generatedAt: Date.now(),
  }

  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData))
  return otp
}

export const validateOTP = (email: string, otp: string): boolean => {
  if (!isBrowser()) return false

  const data = localStorage.getItem(OTP_STORAGE_KEY)
  if (!data) return false

  const otpData: OTPData = JSON.parse(data)

  // Check if OTP matches, email matches, and hasn't expired
  return otpData.otp === otp && otpData.email === email && Date.now() < otpData.expiresAt
}

export const clearOTP = (): void => {
  if (!isBrowser()) return
  localStorage.removeItem(OTP_STORAGE_KEY)
}

export const canResendOTP = (): boolean => {
  if (!isBrowser()) return true

  const data = localStorage.getItem(OTP_STORAGE_KEY)
  if (!data) return true

  const otpData: OTPData = JSON.parse(data)
  // Allow resend after 1 minute
  return Date.now() > otpData.generatedAt + 60000
}

// Utility Functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const generateJoinCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Authentication Functions
export const isValidAdminEmail = (email: string): boolean => {
  const adminData = getAdminData()
  console.log("[v0] Checking admin email:", email, "against:", adminData.emails)
  const isValid = adminData.emails.includes(email)
  console.log("[v0] Admin email validation result:", isValid)
  return isValid
}

export const isValidMentorEmail = (email: string): boolean => {
  const mentors = getMentors()
  return mentors.some((mentor) => mentor.email === email)
}

export const isValidTeacherEmail = (email: string): boolean => {
  const classrooms = getClassrooms()
  return classrooms.some((classroom) => classroom.teachers.some((teacher) => teacher.email === email))
}

export const isValidStudentEmail = (email: string): boolean => {
  const students = getStudents()
  return students.some((student) => student.email === email)
}

// Teacher Functions
export const joinClassroomAsTeacher = (
  teacherData: { name: string; subject: string; subjectType: string },
  joinCode: string,
  teacherEmail: string,
): boolean => {
  const classrooms = getClassrooms()
  const classroom = classrooms.find((c) => c.joinCode === joinCode)

  if (!classroom) return false

  // Check if teacher email is authorized for this classroom
  const teacherIndex = classroom.teachers.findIndex((t) => t.email === teacherEmail)
  if (teacherIndex === -1) return false

  // Update teacher information
  classroom.teachers[teacherIndex] = {
    ...classroom.teachers[teacherIndex],
    name: teacherData.name,
    subject: teacherData.subject,
    subjectType: teacherData.subjectType,
  }

  saveClassrooms(classrooms)
  return true
}
