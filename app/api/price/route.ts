import { NextResponse } from "next/server"
import { getRealPrice } from "@/lib/pricing/realPrice"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get("name")

  if (!name) {
    return NextResponse.json({ error: "Missing card name" }, { status: 400 })
  }

  const price = await getRealPrice(name)

  return NextResponse.json({ name, price, currency: "EUR", source: "hybrid" })
}
