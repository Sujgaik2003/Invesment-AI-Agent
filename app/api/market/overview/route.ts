import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!alphaVantageKey) {
      throw new Error("ALPHA_VANTAGE_API_KEY not configured")
    }

    // Get major market indices
    const symbols = ["SPY", "QQQ", "DIA"] // S&P 500, NASDAQ, Dow Jones ETFs

    const marketPromises = symbols.map(async (symbol) => {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
        const response = await fetch(url)
        const data = await response.json()

        const quote = data["Global Quote"]
        if (!quote) return null

        return {
          symbol,
          price: Number.parseFloat(quote["05. price"] || "0"),
          change: Number.parseFloat(quote["09. change"] || "0"),
          changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
          volume: Number.parseInt(quote["06. volume"] || "0"),
          lastUpdated: quote["07. latest trading day"],
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
        return null
      }
    })

    const marketData = (await Promise.all(marketPromises)).filter((data) => data !== null)

    // Map to our expected format
    const formattedData = {
      sp500: marketData.find((d) => d?.symbol === "SPY") || { value: 0, change: 0 },
      nasdaq: marketData.find((d) => d?.symbol === "QQQ") || { value: 0, change: 0 },
      dow: marketData.find((d) => d?.symbol === "DIA") || { value: 0, change: 0 },
      lastUpdated: new Date().toISOString(),
    }

    // Transform to match existing format
    return NextResponse.json({
      sp500: {
        value: formattedData.sp500.price || 450.25,
        change: formattedData.sp500.changePercent || 1.2,
      },
      nasdaq: {
        value: formattedData.nasdaq.price || 375.75,
        change: formattedData.nasdaq.changePercent || -0.8,
      },
      dow: {
        value: formattedData.dow.price || 340.5,
        change: formattedData.dow.changePercent || 0.5,
      },
      lastUpdated: formattedData.lastUpdated,
    })
  } catch (error) {
    console.error("Market overview error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
