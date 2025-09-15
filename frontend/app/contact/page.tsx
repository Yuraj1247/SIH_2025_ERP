import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-pt-sans font-bold text-dark mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 font-poppins font-normal max-w-3xl mx-auto">
              Have questions about our ERP system? We're here to help you get started.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-pt-sans font-bold text-dark">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-poppins font-normal text-dark mb-2">First Name</label>
                      <Input placeholder="John" className="font-poppins font-normal" />
                    </div>
                    <div>
                      <label className="block text-sm font-poppins font-normal text-dark mb-2">Last Name</label>
                      <Input placeholder="Doe" className="font-poppins font-normal" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-normal text-dark mb-2">Email</label>
                    <Input type="email" placeholder="john@example.com" className="font-poppins font-normal" />
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-normal text-dark mb-2">Subject</label>
                    <Input placeholder="How can we help you?" className="font-poppins font-normal" />
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-normal text-dark mb-2">Message</label>
                    <Textarea
                      placeholder="Tell us more about your requirements..."
                      rows={5}
                      className="font-poppins font-normal"
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-blue-600 text-white font-poppins font-normal">
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-pt-sans font-bold text-dark mb-6">Contact Information</h3>
                  <p className="text-gray-600 font-poppins font-normal mb-8">
                    Reach out to us through any of these channels. We're always ready to assist you.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-pt-sans font-semibold text-dark">Email</h4>
                      <p className="text-gray-600 font-poppins font-normal">info@collegeerp.com</p>
                      <p className="text-gray-600 font-poppins font-normal">support@collegeerp.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-pt-sans font-semibold text-dark">Phone</h4>
                      <p className="text-gray-600 font-poppins font-normal">+1 (555) 123-4567</p>
                      <p className="text-gray-600 font-poppins font-normal">+1 (555) 987-6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-pt-sans font-semibold text-dark">Address</h4>
                      <p className="text-gray-600 font-poppins font-normal">
                        123 Education Street
                        <br />
                        Tech City, TC 12345
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="bg-blue-50 border-primary">
                  <CardContent className="pt-6">
                    <h4 className="font-pt-sans font-semibold text-dark mb-2">Business Hours</h4>
                    <div className="space-y-1 text-sm font-poppins font-normal text-gray-600">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
