import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'https://ai-api.dtp-dev.site/api'
const APP_CODE = process.env.NEXT_PUBLIC_APP_CODE || ''
const APP_PASSPORT = process.env.NEXT_PUBLIC_APP_PASSPORT || ''

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = path.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const url = `${API_BASE_URL}/${apiPath}?${searchParams.toString()}`
  
  console.log('Proxying GET:', url)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-app-code': APP_CODE,
        'x-app-passport': APP_PASSPORT,
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const apiPath = path.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const url = `${API_BASE_URL}/${apiPath}?${searchParams.toString()}`
  const body = await request.json()
  
  console.log('Proxying POST:', url, body)
  
  // Check if this is a streaming request
  const isStreaming = body.response_mode === 'streaming'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': isStreaming ? 'text/event-stream' : 'application/json',
        'x-app-code': APP_CODE,
        'x-app-passport': APP_PASSPORT,
      },
      body: JSON.stringify(body),
    })

    if (isStreaming && response.body) {
      // Return streaming response
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}
