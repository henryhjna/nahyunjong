import Link from 'next/link'

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-700">
              Nahyunjong
            </Link>
            <div className="flex gap-8">
              <Link href="/research" className="hover:text-primary-600 transition-colors">
                Research
              </Link>
              <Link href="/lab" className="hover:text-primary-600 transition-colors">
                Lab
              </Link>
              <Link href="/education" className="font-semibold text-primary-600">
                Education
              </Link>
              <Link href="/book" className="hover:text-primary-600 transition-colors">
                Book
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Education</h1>
          <p className="text-xl text-gray-600">
            Interactive course materials, lectures, and resources
          </p>
        </div>

        {/* Course List - Placeholder for now */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sample courses - will be fetched from API later */}
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-gray-100 hover:border-primary-300 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Financial Accounting
                </h3>
                <p className="text-sm text-gray-500">BUS3001 • 2025 Spring</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Introduction to financial accounting principles and practices
            </p>
            <Link
              href="/education/courses/1"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Course →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-gray-100 opacity-60">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Managerial Accounting
                </h3>
                <p className="text-sm text-gray-500">BUS3002 • 2025 Fall</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Upcoming
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Management accounting for decision making and control
            </p>
            <button
              disabled
              className="inline-block px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
