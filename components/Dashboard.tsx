'use client'

export default function Dashboard() {
  return (
    <div className="ml-64 p-8">
      <h2 className="text-3xl font-bold mb-8">Project Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Active Projects', value: '12', color: 'bg-blue-500' },
          { title: 'Total Tasks', value: '89', color: 'bg-green-500' },
          { title: 'Team Members', value: '24', color: 'bg-purple-500' },
          { title: 'Budget Used', value: '68%', color: 'bg-orange-500' },
        ].map((kpi) => (
          <div key={kpi.title} className={`${kpi.color} text-white p-6 rounded-lg`}>
            <p className="text-sm opacity-90">{kpi.title}</p>
            <p className="text-3xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Recent Projects</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Project</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Progress</th>
              <th className="text-left py-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Downtown Tower', status: 'In Progress', progress: 65 },
              { name: 'Shopping Mall', status: 'Planning', progress: 25 },
              { name: 'Office Complex', status: 'In Progress', progress: 45 },
              { name: 'Residential Block', status: 'Completed', progress: 100 },
            ].map((project) => (
              <tr key={project.name} className="border-b hover:bg-gray-50">
                <td className="py-3">{project.name}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded text-sm ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </td>
                <td className="py-3">2026-Q2</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
