import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary-700">
              Nahyunjong
            </div>
            <div className="flex gap-8">
              <Link href="/research" className="hover:text-primary-600 transition-colors">
                Research
              </Link>
              <Link href="/lab" className="hover:text-primary-600 transition-colors">
                Lab
              </Link>
              <Link href="/education" className="hover:text-primary-600 transition-colors font-semibold text-primary-600">
                Education
              </Link>
              <Link href="/book" className="hover:text-primary-600 transition-colors">
                Book
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-900 animate-fade-in">
            Welcome
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up">
            Professor of Business Administration<br />
            Hanyang University Business School
          </p>

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              { title: 'Research', href: '/research', icon: '🔬', desc: 'Publications & Projects', disabled: true },
              { title: 'Lab', href: '/lab', icon: '🏢', desc: 'Laboratory Information', disabled: true },
              { title: 'Education', href: '/education', icon: '📚', desc: 'Courses & Lectures', disabled: false },
              { title: 'Book', href: '/book', icon: '📖', desc: 'Published Books', disabled: true },
            ].map((item) => {
              const content = (
                <>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                  <p className="text-gray-600">{item.desc}</p>
                  {item.disabled && (
                    <span className="text-xs text-gray-400 mt-2 block">Coming Soon</span>
                  )}
                </>
              )

              if (item.disabled) {
                return (
                  <div
                    key={item.title}
                    className="p-8 rounded-2xl border-2 bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                  >
                    {content}
                  </div>
                )
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="p-8 rounded-2xl border-2 transition-all bg-white border-primary-200 hover:border-primary-400 hover:shadow-xl hover:-translate-y-1"
                >
                  {content}
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2025 Nahyunjong. Hanyang University Business School.</p>
        </div>
      </footer>
    </div>
  )
}
