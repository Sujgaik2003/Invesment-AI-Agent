"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Activity, Target, AlertTriangle, DollarSign, Loader2 } from "lucide-react"
import PerformanceChart from "./charts/performance-chart"
import SectorAllocationChart from "./charts/sector-allocation-chart"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdvancedAnalyticsProps {
  subscriptionPlan: "free" | "premium" | "pro"
}

interface Stock {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  shares: number
  purchase_price: number
}

interface PortfolioSummary {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  sectors: Array<{ name: string; value: number; percentage: number; change: number; color: string }>
  riskMetrics: {
    beta: number
    sharpeRatio: number
    volatility: number
    maxDrawdown: number
  }
}

export default function AdvancedAnalytics({ subscriptionPlan }: AdvancedAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M")
  const [portfolioStocks, setPortfolioStocks] = useState<Stock[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null)
  const [performanceData, setPerformanceData] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [error, setError] = useState("")

  const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"]

  const sectorColors: { [key: string]: string } = {
    Technology: "#3B82F6",
    Healthcare: "#10B981",
    Finance: "#F59E0B",
    Consumer: "#EF4444",
    Energy: "#8B5CF6",
    Industrial: "#06B6D4",
    Utilities: "#6D28D9",
    "Real Estate": "#D97706",
    Other: "#6B7280",
  }

  // Simple mock sector mapping (in a real app, this would come from an API or a more robust data source)
  const getSectorForSymbol = (symbol: string): string => {
    switch (symbol) {
      case "AAPL":
      case "MSFT":
      case "GOOGL":
      case "AMZN":
      case "TSLA":
        return "Technology"
      case "JNJ":
      case "PFE":
        return "Healthcare"
      case "JPM":
      case "BAC":
        return "Finance"
      case "KO":
      case "PG":
        return "Consumer"
      case "XOM":
      case "CVX":
        return "Energy"
      default:
        return "Other"
    }
  }

  const calculatePortfolioSummary = useCallback((stocks: Stock[]): PortfolioSummary => {
    let totalValue = 0
    let totalPurchaseValue = 0
    const sectorMap: { [key: string]: { value: number; change: number } } = {}

    stocks.forEach((stock) => {
      const currentValue = stock.price * stock.shares
      const purchaseValue = stock.purchase_price * stock.shares
      totalValue += currentValue
      totalPurchaseValue += purchaseValue

      const sectorName = getSectorForSymbol(stock.symbol)
      if (!sectorMap[sectorName]) {
        sectorMap[sectorName] = { value: 0, change: 0 }
      }
      sectorMap[sectorName].value += currentValue
      sectorMap[sectorName].change += stock.change * stock.shares // Sum of absolute changes for now
    })

    const totalGain = totalValue - totalPurchaseValue
    const totalGainPercent = totalPurchaseValue > 0 ? (totalGain / totalPurchaseValue) * 100 : 0

    const sectors = Object.keys(sectorMap)
      .map((name) => {
        const value = sectorMap[name].value
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
        const change = (sectorMap[name].change / (value > 0 ? value : 1)) * 100 // Simplified change for sector
        return {
          name,
          value,
          percentage: Number.parseFloat(percentage.toFixed(1)),
          change: Number.parseFloat(change.toFixed(1)),
          color: sectorColors[name] || sectorColors.Other,
        }
      })
      .sort((a, b) => b.percentage - a.percentage) // Sort by percentage

    // Mock risk metrics, can be enhanced with real calculations later
    const beta = 1.0 + (Math.random() - 0.5) * 0.3 // Around 1.0
    const sharpeRatio = 1.0 + (Math.random() - 0.5) * 1.0 // Around 1.0
    const volatility = 15.0 + (Math.random() - 0.5) * 10.0 // Around 15%
    const maxDrawdown = -(5.0 + (Math.random() - 0.5) * 10.0) // Around -5%

    return {
      totalValue,
      totalGain,
      totalGainPercent,
      sectors,
      riskMetrics: {
        beta: Number.parseFloat(beta.toFixed(2)),
        sharpeRatio: Number.parseFloat(sharpeRatio.toFixed(2)),
        volatility: Number.parseFloat(volatility.toFixed(1)),
        maxDrawdown: Number.parseFloat(maxDrawdown.toFixed(1)),
      },
    }
  }, [])

  // Generate dynamic performance data based on timeframe and actual portfolio value
  const generatePerformanceData = useCallback((timeframe: string, initialValue: number) => {
    const dataPoints: { date: string; value: number; return: number }[] = []

    let periods: number
    let dateIncrement: number
    let volatility: number

    switch (timeframe) {
      case "1D":
        periods = 24 // 24 hours
        dateIncrement = 60 * 60 * 1000 // 1 hour
        volatility = 0.005
        break
      case "1W":
        periods = 7 // 7 days
        dateIncrement = 24 * 60 * 60 * 1000 // 1 day
        volatility = 0.01
        break
      case "1M":
        periods = 30 // 30 days
        dateIncrement = 24 * 60 * 60 * 1000 // 1 day
        volatility = 0.02
        break
      case "3M":
        periods = 90 // 90 days
        dateIncrement = 24 * 60 * 60 * 1000 // 1 day
        volatility = 0.03
        break
      case "6M":
        periods = 180 // 180 days
        dateIncrement = 24 * 60 * 60 * 1000 // 1 day
        volatility = 0.04
        break
      case "1Y":
        periods = 365 // 365 days
        dateIncrement = 24 * 60 * 60 * 1000 // 1 day
        volatility = 0.05
        break
      default:
        periods = 30
        dateIncrement = 24 * 60 * 60 * 1000
        volatility = 0.02
    }

    const startDate = new Date(Date.now() - periods * dateIncrement)
    let currentValue = initialValue

    for (let i = 0; i <= periods; i++) {
      const date = new Date(startDate.getTime() + i * dateIncrement)

      const randomChange = (Math.random() - 0.5) * volatility
      const trendComponent = Math.sin((i / periods) * Math.PI) * 0.01 // Slight upward trend
      const dailyChange = randomChange + trendComponent

      currentValue *= 1 + dailyChange
      const returnPercent = ((currentValue - initialValue) / initialValue) * 100

      dataPoints.push({
        date: date.toISOString(),
        value: currentValue,
        return: returnPercent,
      })
    }

    return dataPoints
  }, [])

  const fetchPortfolioData = useCallback(async () => {
    setPortfolioLoading(true)
    setError("")
    try {
      const response = await fetch("/api/portfolio/stocks")
      const data = await response.json()

      if (response.ok && data.stocks) {
        setPortfolioStocks(data.stocks)
        const summary = calculatePortfolioSummary(data.stocks)
        setPortfolioSummary(summary)

        // Generate performance data for all timeframes based on the new total value
        const newPerformanceData: { [key: string]: any } = {}
        timeframes.forEach((tf) => {
          const perfData = generatePerformanceData(tf, summary.totalValue)
          const latestReturn = perfData[perfData.length - 1]?.return || 0
          newPerformanceData[tf] = {
            data: perfData,
            return: latestReturn,
            summary: {
              period: tf,
              return: latestReturn,
              volatility: summary.riskMetrics.volatility,
              sharpe: summary.riskMetrics.sharpeRatio,
            },
          }
        })
        setPerformanceData(newPerformanceData)
      } else {
        setError(data.error || "Failed to fetch portfolio data")
      }
    } catch (err) {
      setError("Network error while fetching portfolio data")
      console.error("Fetch portfolio data error:", err)
    } finally {
      setPortfolioLoading(false)
    }
  }, [calculatePortfolioSummary, generatePerformanceData])

  useEffect(() => {
    fetchPortfolioData()
    // Refresh portfolio data every 30 seconds
    const interval = setInterval(fetchPortfolioData, 30 * 1000)
    return () => clearInterval(interval)
  }, [fetchPortfolioData])

  const currentPerformanceData = performanceData[selectedTimeframe]

  if (portfolioLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!portfolioSummary || portfolioStocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analytics</CardTitle>
          <CardDescription>Detailed analysis of your investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No stocks in your portfolio to analyze. Add some to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioSummary.totalValue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />+{portfolioSummary.totalGainPercent.toFixed(1)}% overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioSummary.riskMetrics.beta}</div>
            <p className="text-xs text-gray-600">vs S&P 500</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioSummary.riskMetrics.sharpeRatio}</div>
            <p className="text-xs text-green-600">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioSummary.riskMetrics.volatility}%</div>
            <p className="text-xs text-yellow-600">Moderate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          {subscriptionPlan === "pro" && <TabsTrigger value="optimization">Optimization</TabsTrigger>}
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Performance Analysis
                <div className="flex space-x-1">
                  {timeframes.map((tf) => (
                    <Button
                      key={tf}
                      variant={selectedTimeframe === tf ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(tf)}
                      disabled={loading}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(performanceData).map(([period, data]) => (
                  <div key={period} className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-gray-600">{period}</div>
                    <div className={`text-lg font-bold ${data.return >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {data.return >= 0 ? "+" : ""}
                      {data.return.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Performance Chart */}
              <div className="h-80">
                {loading ? (
                  <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading performance data...</p>
                    </div>
                  </div>
                ) : currentPerformanceData ? (
                  <PerformanceChart data={currentPerformanceData.data} timeframe={selectedTimeframe} />
                ) : (
                  <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              {currentPerformanceData && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Current Return</div>
                    <div
                      className={`text-xl font-bold ${currentPerformanceData.return >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {currentPerformanceData.return >= 0 ? "+" : ""}
                      {currentPerformanceData.return.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Volatility</div>
                    <div className="text-xl font-bold text-gray-900">
                      {currentPerformanceData.summary?.volatility.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    <div className="text-xl font-bold text-gray-900">
                      {currentPerformanceData.summary?.sharpe.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
              <CardDescription>Your portfolio distribution across different sectors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector List */}
                <div className="space-y-4">
                  {portfolioSummary.sectors.map((sector) => (
                    <div key={sector.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
                          <span className="font-medium">{sector.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{sector.percentage}%</Badge>
                          <span className={`text-sm ${sector.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {sector.change >= 0 ? "+" : ""}
                            {sector.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={sector.percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 min-w-[80px]">${sector.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Pie Chart */}
                <div className="h-80">
                  <SectorAllocationChart sectors={portfolioSummary.sectors} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Comprehensive risk metrics for your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Portfolio Beta</span>
                      <span className="text-sm">{portfolioSummary.riskMetrics.beta}</span>
                    </div>
                    <Progress value={portfolioSummary.riskMetrics.beta * 50} />
                    <p className="text-xs text-gray-600 mt-1">
                      {portfolioSummary.riskMetrics.beta > 1
                        ? "More volatile than market"
                        : "Less volatile than market"}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Sharpe Ratio</span>
                      <span className="text-sm">{portfolioSummary.riskMetrics.sharpeRatio}</span>
                    </div>
                    <Progress value={portfolioSummary.riskMetrics.sharpeRatio * 33.33} />
                    <p className="text-xs text-gray-600 mt-1">Risk-adjusted return performance</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Volatility</span>
                      <span className="text-sm">{portfolioSummary.riskMetrics.volatility}%</span>
                    </div>
                    <Progress value={portfolioSummary.riskMetrics.volatility * 2} />
                    <p className="text-xs text-gray-600 mt-1">Annual volatility measure</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Max Drawdown</span>
                      <span className="text-sm text-red-600">{portfolioSummary.riskMetrics.maxDrawdown}%</span>
                    </div>
                    <Progress value={Math.abs(portfolioSummary.riskMetrics.maxDrawdown) * 4} />
                    <p className="text-xs text-gray-600 mt-1">Largest peak-to-trough decline</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Overall Risk Level</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                          Moderate
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Diversification Score</span>
                        <span className="text-sm font-medium">7.2/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Correlation Risk</span>
                        <Badge variant="outline" className="bg-green-50 text-green-800">
                          Low
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Risk Recommendations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Consider reducing tech sector exposure</li>
                      <li>• Add defensive stocks for stability</li>
                      <li>• Increase international diversification</li>
                      <li>• Monitor correlation between holdings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {subscriptionPlan === "pro" && (
          <TabsContent value="optimization">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Optimization</CardTitle>
                <CardDescription>AI-powered suggestions to optimize your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Optimization Suggestions</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Rebalance Technology</span>
                          <Badge className="bg-blue-100 text-blue-800">High Impact</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Reduce tech allocation from 36% to 30%</p>
                        <p className="text-xs text-green-600 mt-1">Expected improvement: +0.8% annual return</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Add International Exposure</span>
                          <Badge className="bg-green-100 text-green-800">Medium Impact</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Allocate 15% to international markets</p>
                        <p className="text-xs text-green-600 mt-1">Expected improvement: +0.5% risk reduction</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Increase Dividend Stocks</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Low Impact</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Add 10% dividend-focused holdings</p>
                        <p className="text-xs text-green-600 mt-1">Expected improvement: +0.3% income yield</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Efficient Frontier Analysis</h4>
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Risk-Return Optimization Chart</p>
                        <p className="text-sm text-gray-500">Efficient frontier visualization</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current Position</span>
                        <span className="text-sm font-medium">Risk: 18.5% | Return: 12.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Optimized Position</span>
                        <span className="text-sm font-medium text-green-600">Risk: 16.2% | Return: 13.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Improvement</span>
                        <span className="text-sm font-medium text-blue-600">-2.3% Risk | +0.8% Return</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
