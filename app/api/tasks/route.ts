// API Route Example - Tasks
export async function GET() {
  const tasks = [
    {
      id: 1,
      title: 'Foundation Work',
      project: 'Downtown Tower',
      assignee: 'John Doe',
      priority: 'High',
      status: 'Completed',
      dueDate: '2026-02-15',
    },
    {
      id: 2,
      title: 'Structural Steel',
      project: 'Downtown Tower',
      assignee: 'Jane Smith',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-03-30',
    },
    {
      id: 3,
      title: 'Electrical Installation',
      project: 'Downtown Tower',
      assignee: 'Bob Wilson',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2026-04-15',
    },
  ]
  
  return Response.json({ tasks })
}

export async function POST(request: Request) {
  const data = await request.json()
  
  // TODO: Validate and save to database
  return Response.json({ 
    message: 'Task created successfully',
    task: data 
  }, { status: 201 })
}
