// API Route Example - Projects
export async function GET() {
  // Placeholder for database query
  const projects = [
    {
      id: 1,
      name: 'Downtown Tower',
      status: 'In Progress',
      progress: 65,
      startDate: '2026-01-15',
      endDate: '2026-06-30',
      budget: 5000000,
      spent: 2500000,
    },
    {
      id: 2,
      name: 'Shopping Mall',
      status: 'Planning',
      progress: 25,
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      budget: 8000000,
      spent: 500000,
    },
  ]
  
  return Response.json({ projects })
}

export async function POST(request: Request) {
  const data = await request.json()
  
  // TODO: Validate and save to database
  return Response.json({ 
    message: 'Project created successfully',
    project: data 
  }, { status: 201 })
}
