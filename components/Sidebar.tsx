'use client'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-16">
      <nav className="p-6 space-y-4">
        <div className="text-xs font-bold text-gray-400 uppercase">Menu</div>
        
        {[
          { label: 'Dashboard', icon: '📊' },
          { label: 'Projects', icon: '📁' },
          { label: 'Tasks', icon: '✓' },
          { label: 'Team', icon: '👥' },
          { label: 'Budget', icon: '💰' },
          { label: 'Documents', icon: '📄' },
          { label: 'Reports', icon: '📈' },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded flex items-center gap-3"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
