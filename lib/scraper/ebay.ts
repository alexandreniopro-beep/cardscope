import * as cheerio from "cheerio"

export type ScrapedSale = {
  price: number
  date: string
  title: string
}

// ⚠️ Server-only. N'importer ce module que depuis des Route Handlers
// (app/api/**) ou du code serveur — jamais depuis un composant "use client".
export async function scrapeEbaySold(cardName: string): Promise<ScrapedSale[]> {
  const query = encodeURIComponent(cardName)
  const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    })

    if (!res.ok) return []

    const html = await res.text()
    const $ = cheerio.load(html)

    const results: ScrapedSale[] = []

    $(".s-item").each((_, el) => {
      const title = $(el).find(".s-item__title").text()
      const priceText = $(el).find(".s-item__price").text()

      const price = parseFloat(
        priceText.replace(/[^0-9.,]/g, "").replace(",", ".")
      )

      if (!isNaN(price) && price > 0) {
        results.push({ price, date: new Date().toISOString(), title })
      }
    })

    return results.slice(0, 20)
  } catch (err) {
    console.error("scrapeEbaySold failed:", err)
    return []
  }
}
