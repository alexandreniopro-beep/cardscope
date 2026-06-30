import { NextResponse } from "next/server"
import { analyzeCard } from "@/lib/scanner"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body?.image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 })
  }

  const result = await analyzeCard(body.image)

  return NextResponse.json(result)
}
