"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, BarChart3 } from "lucide-react"
import PerformanceChart from "./charts/performance-chart"
import SectorAllocationChart from "./charts/sector-allocation-chart"

interface AdvancedAnalyticsProps {
  subscriptionPlan: "free" | "premium" | "pro"
}

interface Stock {
  id: string
  user_id: string
  symbol: string
  name: string
  quantity: number
  purchase_price: number
  purchase_date: string
}

interface PortfolioPerformance {
  date: string
  value: number
}

export default function AdvancedAnalytics({ subscriptionPlan }: AdvancedAnalyticsProps) {
  const [portfolioStocks, setPortfolioStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioPerformance, setPortfolioPerformance] = useState<PortfolioPerformance[]>([])

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true)
      setError(null)
      try {
        const stocksResponse = await fetch("/api/portfolio/stocks")
        if (!stocksResponse.ok) {
          throw new Error("Failed to fetch portfolio stocks")
        }
        const stocksData: Stock[] = await stocksResponse.json()
        setPortfolioStocks(stocksData)

        // Simulate fetching real-time prices for calculation
        // In a real app, you'd fetch current prices for each stock
        const stocksWithCurrentPrices = await Promise.all(
          stocksData.map(async (stock) => {
            // Mock current price for demonstration. Replace with actual API call.
            const mockCurrentPrice = stock.purchase_price * (1 + (Math.random() * 0.2 - 0.1)) // +/- 10%
            return { ...stock, current_price: mockCurrentPrice }
          }),
        )

        // Calculate initial portfolio value for performance chart
        const initialValue = stocksWithCurrentPrices.reduce(
          (sum, stock) => sum + stock.purchase_price * stock.quantity,
          0,
        )
        const currentValue = stocksWithCurrentPrices.reduce(
          (sum, stock) => sum + stock.current_price * stock.quantity,
          0,
        )

        // Generate mock performance data based on current value
        const generateMockPerformance = (currentVal: number): PortfolioPerformance[] => {
          const data: PortfolioPerformance[] = []
          let val = currentVal
          for (let i = 60; i >= 0; i--) {
            // Last 60 days
            const date = new Date()
            date.setDate(date.getDate() - i)
            // Simulate some fluctuation
            val = val * (1 + (Math.random() - 0.5) * 0.02) // +/- 1% daily
            data.push({ date: date.toISOString().split("T")[0], value: val })
          }
          return data
        }
        setPortfolioPerformance(generateMockPerformance(currentValue))
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching portfolio data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [])

  const totalPortfolioValue = useMemo(() => {
    return portfolioStocks.reduce((sum, stock) => sum + stock.quantity * stock.purchase_price, 0)
  }, [portfolioStocks])

  const totalGains = useMemo(() => {
    // This would require fetching current prices for each stock
    // For now, let's simulate a gain based on totalPortfolioValue
    return totalPortfolioValue * 0.073 // Mock 7.3% overall gain
  }, [totalPortfolioValue])

  const overallChangePercentage = useMemo(() => {
    if (totalPortfolioValue === 0) return 0
    return (totalGains / totalPortfolioValue) * 100
  }, [totalPortfolioValue, totalGains])

  // Mock data for Beta, Sharpe Ratio, Volatility
  const mockMetrics = useMemo(
    () => ({
      beta: { value: 1.15, description: "vs S&P 500" },
      sharpeRatio: { value: 1.42, description: "Excellent" },
      volatility: { value: 18.5, description: "Moderate" },
    }),
    [],
  )

  const sectorAllocationData = useMemo(() => {
    const allocation: { [key: string]: number } = {}
    portfolioStocks.forEach((stock) => {
      // Simple mock sector allocation based on symbol
      let sector = "Other"
      if (stock.symbol.includes("AAPL") || stock.symbol.includes("MSFT") || stock.symbol.includes("GOOGL")) {
        sector = "Technology"
      } else if (stock.symbol.includes("JPM") || stock.symbol.includes("BAC")) {
        sector = "Financials"
      } else if (stock.symbol.includes("XOM") || stock.symbol.includes("CVX")) {
        sector = "Energy"
      }
      allocation[sector] = (allocation[sector] || 0) + stock.quantity * stock.purchase_price
    })

    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0)
    return Object.entries(allocation).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
  }, [portfolioStocks])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">Loading analytics...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-red-500">Error: {error}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <p
              className={`text-xs flex items-center ${overallChangePercentage >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {overallChangePercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {overallChangePercentage.toFixed(1)}% overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beta</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.beta.value.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{mockMetrics.beta.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.sharpeRatio.value.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{mockMetrics.sharpeRatio.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.volatility.value.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{mockMetrics.volatility.description}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="asset-allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={portfolioPerformance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asset-allocation">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <SectorAllocationChart data={sectorAllocationData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed risk analysis features will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
