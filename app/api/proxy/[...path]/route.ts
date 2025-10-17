import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const fullPath = path.join("/")

    // Construct the target URL
    const targetUrl = `https://fonts.gstatic.com/${fullPath}`

    console.log("[v0] Proxying request to:", targetUrl)

    // Forward the request to fonts.gstatic.com
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // Forward relevant headers from the original request
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
        "Accept-Encoding": request.headers.get("accept-encoding") || "gzip, deflate, br",
      },
    })

    console.log("[v0] Response status:", response.status)

    // Get the response body as an ArrayBuffer to handle binary data
    const data = await response.arrayBuffer()

    // Create headers object preserving important response headers
    const headers = new Headers()

    // Copy important headers from the upstream response
    const headersToPreserve = [
      "content-type",
      "content-length",
      "cache-control",
      "etag",
      "last-modified",
      "expires",
      "access-control-allow-origin",
    ]

    headersToPreserve.forEach((header) => {
      const value = response.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    })

    // Add CORS headers to allow cross-origin requests
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")

    // Return the response with preserved status code and headers
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 })
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
