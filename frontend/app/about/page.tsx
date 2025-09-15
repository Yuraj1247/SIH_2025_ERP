import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Eye, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-pt-sans font-bold text-dark mb-6">
              About Our <span className="text-primary">ERP System</span>
            </h1>
            <p className="text-xl text-gray-600 font-poppins font-normal max-w-3xl mx-auto">
              We're dedicated to revolutionizing educational administration through innovative technology and
              user-centric design.
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <CardContent className="pt-6">
                  <Target className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-pt-sans font-bold text-dark mb-4">Our Mission</h3>
                  <p className="text-gray-600 font-poppins font-normal">
                    To provide educational institutions with powerful, intuitive tools that streamline attendance
                    management and enhance academic administration.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-8">
                <CardContent className="pt-6">
                  <Eye className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-pt-sans font-bold text-dark mb-4">Our Vision</h3>
                  <p className="text-gray-600 font-poppins font-normal">
                    To become the leading ERP solution for educational institutions worldwide, empowering educators and
                    students through technology.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-8">
                <CardContent className="pt-6">
                  <Award className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-pt-sans font-bold text-dark mb-4">Our Values</h3>
                  <p className="text-gray-600 font-poppins font-normal">
                    Innovation, reliability, and user satisfaction drive everything we do. We believe in creating
                    solutions that truly make a difference.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-pt-sans font-bold text-dark mb-4">Why Choose Our System?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-pt-sans font-bold text-dark mb-6">Comprehensive Solution</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 font-poppins font-normal">
                      Multi-role access for administrators, mentors, teachers, and students
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 font-poppins font-normal">Real-time attendance tracking and analytics</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 font-poppins font-normal">Secure authentication and data management</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-600 font-poppins font-normal">
                      Intuitive interface designed for educational environments
                    </p>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-pt-sans font-bold text-dark mb-4">Key Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-pt-sans font-bold text-primary">99.9%</div>
                    <div className="text-sm text-gray-600 font-poppins font-normal">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-pt-sans font-bold text-primary">24/7</div>
                    <div className="text-sm text-gray-600 font-poppins font-normal">Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-pt-sans font-bold text-primary">1000+</div>
                    <div className="text-sm text-gray-600 font-poppins font-normal">Institutions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-pt-sans font-bold text-primary">50K+</div>
                    <div className="text-sm text-gray-600 font-poppins font-normal">Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
