import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toUpperCase()
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY

    if (!alphaVantageKey) {
      throw new Error("ALPHA_VANTAGE_API_KEY not configured")
    }

    if (query) {
      // Handle stock search (similar to app/api/stocks/search/route.ts)
      try {
        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${query}&apikey=${alphaVantageKey}`
        const quoteResponse = await fetch(quoteUrl)
        const quoteData = await quoteResponse.json()

        const quote = quoteData["Global Quote"]
        if (quote && quote["01. symbol"]) {
          const price = Number.parseFloat(quote["05. price"] || "0")
          const change = Number.parseFloat(quote["09. change"] || "0")
          const changePercent = Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0")

          return NextResponse.json({
            stocks: [
              {
                symbol: quote["01. symbol"],
                name: query || `${quote["01. symbol"]} Inc.`, // Use query if available, else fallback
                price: price,
                change: change,
                changePercent: changePercent,
              },
            ],
          })
        }
      } catch (directQuoteError) {
        console.log("Direct quote failed, trying search:", directQuoteError)
      }

      // If direct quote fails, try symbol search
      const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${alphaVantageKey}`
      const searchResponse = await fetch(searchUrl)

      if (!searchResponse.ok) {
        throw new Error(`Alpha Vantage search error: ${searchResponse.status}`)
      }

      const searchData = await searchResponse.json()

      if (searchData["Error Message"]) {
        throw new Error(searchData["Error Message"])
      }

      if (searchData["Note"]) {
        return NextResponse.json(
          {
            error: "API rate limit reached. Please try again in a minute.",
            stocks: [],
          },
          { status: 429 },
        )
      }

      const matches = searchData["bestMatches"] || []

      if (matches.length === 0) {
        const mockStocks = getMockStockData(query)
        if (mockStocks.length > 0) {
          return NextResponse.json({ stocks: mockStocks })
        }
        return NextResponse.json({
          stocks: [],
          message: "No stocks found for this symbol",
        })
      }

      const stockPromises = matches.slice(0, 2).map(async (match: any) => {
        const symbol = match["1. symbol"]
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay to avoid rate limits

        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`
        const quoteResponse = await fetch(quoteUrl)
        const quoteData = await quoteResponse.json()

        const quote = quoteData["Global Quote"]
        if (!quote || !quote["01. symbol"]) {
          return {
            symbol: symbol,
            name: match["2. name"],
            price: Math.random() * 200 + 50,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 5,
          }
        }

        const price = Number.parseFloat(quote["05. price"] || "0")
        const change = Number.parseFloat(quote["09. change"] || "0")
        const changePercent = Number.parseFloat(quote["10. change percent"]?.replace("%", "") || "0")

        return {
          symbol: symbol,
          name: match["2. name"],
          price: price,
          change: change,
          changePercent: changePercent,
        }
      })

      const stocks = await Promise.all(stockPromises)
      return NextResponse.json({ stocks: stocks.filter((stock) => stock !== null) })
    } else {
      // Handle fetching all portfolio stocks for the user
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (portfolioError || !portfolio) {
        console.error("Error fetching portfolio:", portfolioError)
        return NextResponse.json({ error: "User portfolio not found" }, { status: 404 })
      }

      const { data: portfolioStocks, error: stocksError } = await supabase
        .from("portfolio_stocks")
        .select("*")
        .eq("portfolio_id", portfolio.id)

      if (stocksError) {
        console.error("Error fetching portfolio stocks:", stocksError)
        return NextResponse.json({ error: "Failed to fetch portfolio stocks" }, { status: 500 })
      }

      // For each stock, fetch its current price and change from Alpha Vantage
      const stocksWithCurrentData = await Promise.all(
        portfolioStocks.map(async (stock) => {
          try {
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${alphaVantageKey}`
            const response = await fetch(quoteUrl)
            const data = await response.json()
            const quote = data["Global Quote"]

            if (quote && quote["05. price"]) {
              return {
                ...stock,
                price: Number.parseFloat(quote["05. price"]),
                change: Number.parseFloat(quote["09. change"]),
                changePercent: Number.parseFloat(quote["10. change percent"]?.replace("%", "")),
              }
            } else {
              // Fallback to mock data if real-time data is not available
              const mock = getMockStockData(stock.symbol)[0] || {}
              return {
                ...stock,
                price: mock.price || stock.purchase_price,
                change: mock.change || 0,
                changePercent: mock.changePercent || 0,
              }
            }
          } catch (quoteError) {
            console.error(`Error fetching quote for ${stock.symbol}:`, quoteError)
            const mock = getMockStockData(stock.symbol)[0] || {}
            return {
              ...stock,
              price: mock.price || stock.purchase_price,
              change: mock.change || 0,
              changePercent: mock.changePercent || 0,
            }
          }
        }),
      )

      return NextResponse.json({ stocks: stocksWithCurrentData })
    }
  } catch (error) {
    console.error("Portfolio stocks API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symbol, name, shares, purchase_price } = await request.json()

    if (!symbol || !name || !shares || !purchase_price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the user's default portfolio ID
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (portfolioError || !portfolio) {
      console.error("Error fetching portfolio:", portfolioError)
      return NextResponse.json({ error: "User portfolio not found" }, { status: 404 })
    }

    const { data, error } = await supabase.from("portfolio_stocks").insert({
      portfolio_id: portfolio.id,
      symbol,
      name,
      shares,
      purchase_price,
    })

    if (error) {
      console.error("Error adding stock:", error)
      return NextResponse.json({ error: "Failed to add stock to portfolio" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Add stock API error:", error)
    return NextResponse.json({ error: "Failed to add stock to portfolio" }, { status: 500 })
  }
}

// Helper function to provide mock data for common symbols
function getMockStockData(query: string) {
  const mockData: { [key: string]: any } = {
    AAPL: {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 175.25 + (Math.random() - 0.5) * 10,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 3,
    },
    GOOGL: {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 2750.8 + (Math.random() - 0.5) * 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 2,
    },
    MSFT: {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 420.15 + (Math.random() - 0.5) * 20,
      change: (Math.random() - 0.5) * 8,
      changePercent: (Math.random() - 0.5) * 2,
    },
    TSLA: {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 245.67 + (Math.random() - 0.5) * 30,
      change: (Math.random() - 0.5) * 15,
      changePercent: (Math.random() - 0.5) * 5,
    },
    AMZN: {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 155.89 + (Math.random() - 0.5) * 15,
      change: (Math.random() - 0.5) * 6,
      changePercent: (Math.random() - 0.5) * 3,
    },
  }

  if (mockData[query]) {
    return [mockData[query]]
  }

  if (query.length >= 1) {
    return [
      {
        symbol: query,
        name: `${query} Corporation`,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
      },
    ]
  }

  return []
}
