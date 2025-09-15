import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, BarChart3, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

     {/* Hero Section */}
<section
  className="relative bg-cover bg-center bg-no-repeat min-h-screen flex items-center"
  style={{
    backgroundImage:
      "url('https://sdmntprpolandcentral.oaiusercontent.com/files/00000000-3208-620a-b902-648bb0132c3e/raw?se=2025-09-15T20%3A09%3A07Z&sp=r&sv=2024-08-04&sr=b&scid=107e6516-c682-5c60-9f93-6d959f4db1ef&skoid=5939c452-ea83-4420-b5b4-21182254a5d3&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-09-14T23%3A07%3A10Z&ske=2025-09-15T23%3A07%3A10Z&sks=b&skv=2024-08-04&sig=2rps2i3m1GOh6h%2BZnjUzdUNPa/poGPzMxDQlGk1PC3w%3D')",
  }}
>
  {/* Overlay (optional for readability) */}
  <div className="absolute inset-0 bg-black/20"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl md:text-6xl font-pt-sans font-bold text-white mb-6">
      College Attendance <span className="text-white">ERP System</span>
    </h1>
    <p className="text-xl text-gray-200 font-poppins font-normal mb-8 max-w-3xl mx-auto">
      Streamline your educational institution's attendance management with our comprehensive,
      professional-grade ERP solution designed for modern colleges.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/login">
        <Button className="bg-black  text-white px-8 py-6 text-lg font-poppins font-normal">
          Get Started
        </Button>
      </Link>
      <Link href="/about">
        <Button
          variant="outline"
          className="border-primary text-primary bg-yellow-400 hover:bg-red-400 hover:text-white px-8 py-5 text-lg font-poppins font-normal "
        >
          Learn More
        </Button>
      </Link>
    </div>
  </div>
</section>


      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-pt-sans font-bold text-dark mb-4">
              Powerful Features for Every User
            </h2>
            <p className="text-lg text-gray-600 font-poppins font-normal max-w-2xl mx-auto">
              Our system provides dedicated panels for administrators, mentors, teachers, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-pt-sans font-semibold text-dark mb-2">Admin Panel</h3>
                <p className="text-gray-600 font-poppins font-normal">
                  Complete control over mentor management and system administration.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-pt-sans font-semibold text-dark mb-2">Mentor Panel</h3>
                <p className="text-gray-600 font-poppins font-normal">
                  Create and manage classrooms, add teachers, and oversee operations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-pt-sans font-semibold text-dark mb-2">Teacher Panel</h3>
                <p className="text-gray-600 font-poppins font-normal">
                  Join classrooms, manage attendance, and track student progress.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-pt-sans font-semibold text-dark mb-2">Student Panel</h3>
                <p className="text-gray-600 font-poppins font-normal">
                  View attendance records and detailed analytics for all subjects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-yellow-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-pt-sans font-bold text-white mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-blue-100 font-poppins font-normal mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions already using our ERP system.
          </p>
          <Link href="/login">
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-5 text-lg font-poppins font-medium">
              Start Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
