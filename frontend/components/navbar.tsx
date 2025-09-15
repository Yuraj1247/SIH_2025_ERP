"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Trash2 } from "lucide-react"
import { clearAllData } from "@/lib/storage"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const handleClearData = () => {
    if (typeof window === "undefined") return

    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearAllData()
      alert("All data has been cleared successfully!")
      window.location.reload()
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mt-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-pt-sans font-bold text-primary">
              College ERP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block ">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-dark hover:text-primary px-3 py-2 text-md font-poppins font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-dark hover:text-primary px-3 py-2 text-md font-poppins font-medium transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-dark hover:text-primary px-3 py-2 text-md font-poppins font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="bg-primary text-white px-4 py-2 rounded-md text-md font-poppins font-medium hover:bg-blue-600 transition-colors"
              >
                Login
              </Link>
              <Button
                onClick={handleClearData}
                variant="outline"
                size="sm"
                className="text-danger border-danger hover:bg-danger hover:text-white bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-dark hover:text-primary p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="block text-dark hover:text-primary px-3 py-2 text-base font-poppins font-normal">
                Home
              </Link>
              <Link
                href="/about"
                className="block text-dark hover:text-primary px-3 py-2 text-base font-poppins font-normal"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-dark hover:text-primary px-3 py-2 text-base font-poppins font-normal"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="block bg-primary text-white px-3 py-2 rounded-md text-base font-poppins font-normal"
              >
                Login
              </Link>
              <Button
                onClick={handleClearData}
                variant="outline"
                size="sm"
                className="w-full text-danger border-danger hover:bg-danger hover:text-white mt-2 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
