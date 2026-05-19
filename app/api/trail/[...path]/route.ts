import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const apiKey = process.env.TRAIL_API_KEY
  const baseUrl = process.env.TRAIL_API_BASE_URL ?? 'https://web.trailapp.com/api/v1'

  if (!apiKey) {
    return NextResponse.json({ error: 'TRAIL_API_KEY not configured' }, { status: 500 })
  }

  const trailPath = '/' + params.path.join('/')
  const search = req.nextUrl.searchParams.toString()
  const url = `${baseUrl}${trailPath}${search ? '?' + search : ''}`

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const body = await upstream.json()
    return NextResponse.json(body, { status: upstream.status })
  } catch {
    return NextResponse.json({ error: 'Trail API request failed' }, { status: 502 })
  }
}
