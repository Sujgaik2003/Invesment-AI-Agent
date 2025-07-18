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
    const timeframe = searchParams.get("timeframe") || "1M"

    // Generate dynamic performance data based on timeframe
    const generatePerformanceData = (timeframe: string) => {
      const baseValue = 100000
      const dataPoints: { date: string; value: number; return: number }[] = []

      let periods: number
      let dateIncrement: number
      let volatility: number

      switch (timeframe) {
        case "1D":
          periods = 24 // 24 hours
          dateIncrement = 60 * 60 * 1000 // 1 hour
          volatility = 0.02
          break
        case "1W":
          periods = 7 // 7 days
          dateIncrement = 24 * 60 * 60 * 1000 // 1 day
          volatility = 0.03
          break
        case "1M":
          periods = 30 // 30 days
          dateIncrement = 24 * 60 * 60 * 1000 // 1 day
          volatility = 0.05
          break
        case "3M":
          periods = 90 // 90 days
          dateIncrement = 24 * 60 * 60 * 1000 // 1 day
          volatility = 0.08
          break
        case "6M":
          periods = 180 // 180 days
          dateIncrement = 24 * 60 * 60 * 1000 // 1 day
          volatility = 0.12
          break
        case "1Y":
          periods = 365 // 365 days
          dateIncrement = 24 * 60 * 60 * 1000 // 1 day
          volatility = 0.18
          break
        default:
          periods = 30
          dateIncrement = 24 * 60 * 60 * 1000
          volatility = 0.05
      }

      const startDate = new Date(Date.now() - periods * dateIncrement)
      let currentValue = baseValue

      for (let i = 0; i <= periods; i++) {
        const date = new Date(startDate.getTime() + i * dateIncrement)

        // Generate realistic market movement
        const randomChange = (Math.random() - 0.5) * volatility
        const trendComponent = Math.sin((i / periods) * Math.PI) * 0.1 // Overall upward trend
        const dailyChange = randomChange + trendComponent

        currentValue *= 1 + dailyChange
        const returnPercent = ((currentValue - baseValue) / baseValue) * 100

        dataPoints.push({
          date: date.toISOString(),
          value: currentValue,
          return: returnPercent,
        })
      }

      return dataPoints
    }

    const performanceData = generatePerformanceData(timeframe)
    const latestReturn = performanceData[performanceData.length - 1]?.return || 0

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      timeframe,
      data: performanceData,
      summary: {
        return: latestReturn,
        volatility: Math.random() * 20 + 10,
        sharpe: Math.random() * 2 + 0.5,
        maxDrawdown: -(Math.random() * 15 + 5),
      },
    })
  } catch (error) {
    console.error("Performance API error:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }
}
