export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-pt-sans font-bold mb-4">College ERP</h3>
            <p className="text-gray-300 font-poppins font-normal">
              Professional attendance management system for educational institutions.
            </p>
          </div>
          <div>
            <h4 className="text-md font-pt-sans font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white font-poppins font-normal transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white font-poppins font-normal transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white font-poppins font-normal transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-pt-sans font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 font-poppins font-normal">
              Email: info@collegeerp.com
              <br />
              Phone: +91 12345XXXXX
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 font-poppins font-normal">© 2025 College ERP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
