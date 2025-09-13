import { type NextRequest, NextResponse } from "next/server"
import { projectsApi } from "@/lib/supabase/projects"

export async function GET() {
  try {
    const projects = await projectsApi.getAll()
    
    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch projects" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create project in Supabase
    const newProject = await projectsApi.create({
      project_owner: body.projectOwner,
      name: body.name,
      symbol: body.symbol,
      short_description: body.shortDescription,
      long_description: body.longDescription,
      website: body.website,
      twitter: body.twitter,
      discord: body.discord,
      medium: body.medium,
      banner_url: body.bannerUrl,
      logo_url: body.logoUrl,
      status: "draft",
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newProject.id,
        name: newProject.name,
        symbol: newProject.symbol,
        status: newProject.status,
        createdAt: newProject.created_at,
      },
      message: "Project created successfully",
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create project" 
    }, { status: 500 })
  }
}
