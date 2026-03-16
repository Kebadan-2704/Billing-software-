'use client'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">CM</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">BuildTrack Pro</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-gray-600 hover:text-gray-900">Dashboard</button>
          <button className="text-gray-600 hover:text-gray-900">Projects</button>
          <button className="text-gray-600 hover:text-gray-900">Team</button>
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </header>
  )
}
