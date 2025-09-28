import { NextResponse } from 'next/server'
import path from 'path'
import { readFileSync } from 'fs'

export async function GET() {
  try {
    const swaggerPath = path.join(process.cwd(), 'swagger.json')
    const swaggerContent = readFileSync(swaggerPath, 'utf8')
    const swaggerSpec = JSON.parse(swaggerContent)
    
    return NextResponse.json(swaggerSpec)
  } catch (error) {
    console.error('Error loading swagger.json:', error)
    return NextResponse.json(
      { error: 'Failed to load API specification' },
      { status: 500 }
    )
  }
}