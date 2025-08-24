import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { endpoint: string[] } }) {
  try {
    const endpoint = params.endpoint.join("/")
    const apiUrl = `https://index.blueshift.gg/${endpoint}`

    console.log("[v0] Server-side fetch to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Server-side fetch doesn't have CORS restrictions
    })

    if (!response.ok) {
      console.log("[v0] API response not ok:", response.status, response.statusText)
      return NextResponse.json(
        { error: `API returned ${response.status}: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched data from Blueshift API")

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Server-side API error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch from Blueshift API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
