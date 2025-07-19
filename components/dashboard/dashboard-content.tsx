"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Settings, LogOut } from "lucide-react"
import PortfolioOverview from "./portfolio-overview"
import NewsSection from "./news-section"
import AIInsights from "./ai-insights"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdvancedAnalytics from "./advanced-analytics"
import StockAIInsights from "./stock-ai-insights"

interface Profile {
  id: string
  full_name: string
  subscription_plan: "free" | "premium" | "pro"
  created_at: string
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const [marketData, setMarketData] = useState({
    sp500: { value: 4500.25, change: 1.2 },
    nasdaq: { value: 14250.75, change: -0.8 },
    dow: { value: 35000.5, change: 0.5 },
  })
  const [displayMarketData, setDisplayMarketData] = useState(marketData)
  const [loadingMarketData, setLoadingMarketData] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const subscriptionPlan = profile?.subscription_plan || "free"

  const planLimits = {
    free: { stocks: 3, news: 5, alerts: 3 },
    premium: { stocks: Number.POSITIVE_INFINITY, news: Number.POSITIVE_INFINITY, alerts: 10 },
    pro: { stocks: Number.POSITIVE_INFINITY, news: Number.POSITIVE_INFINITY, alerts: Number.POSITIVE_INFINITY },
  }

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
  }

  const handleBackToPortfolio = () => {
    setSelectedStock(null)
  }

  // Function to simulate small fluctuations
  const simulateFluctuation = (currentValue: number, currentChange: number) => {
    const fluctuation = Math.random() * 0.2 - 0.1 // +/- 0.1%
    const newChange = Number.parseFloat((currentChange + fluctuation).toFixed(2))
    const newValue = Number.parseFloat((currentValue * (1 + newChange / 100)).toFixed(2))
    return { value: newValue, change: newChange }
  }

  // Fetch real market data every 5 minutes
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoadingMarketData(true)
      try {
        const response = await fetch("/api/market/overview")
        if (response.ok) {
          const data = await response.json()
          setMarketData(data)
          setDisplayMarketData(data) // Reset display data to actual data
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error)
      } finally {
        setLoadingMarketData(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000) // Fetch every 5 minutes
    return () => clearInterval(interval)
  }, [])

  // Simulate market data changes every 7 seconds
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setDisplayMarketData((prevData) => ({
        sp500: simulateFluctuation(prevData.sp500.value, prevData.sp500.change),
        nasdaq: simulateFluctuation(prevData.nasdaq.value, prevData.nasdaq.change),
        dow: simulateFluctuation(prevData.dow.value, prevData.dow.change),
      }))
    }, 7000) // Update every 7 seconds

    return () => clearInterval(simulationInterval)
  }, []) // Run once on mount

  // Update displayMarketData when marketData changes (from 5-min fetch)
  useEffect(() => {
    setDisplayMarketData(marketData)
  }, [marketData])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">InvestAI Dashboard</h1>
            <Badge variant={subscriptionPlan === "free" ? "secondary" : "default"}>
              {subscriptionPlan.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {profile?.full_name || user.email}</span>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">S&P 500</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-all duration-300">
                {displayMarketData.sp500.value.toLocaleString()}
              </div>
              <p
                className={`text-xs flex items-center transition-all duration-300 ${
                  displayMarketData.sp500.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {displayMarketData.sp500.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {displayMarketData.sp500.change}%
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NASDAQ</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-all duration-300">
                {displayMarketData.nasdaq.value.toLocaleString()}
              </div>
              <p
                className={`text-xs flex items-center transition-all duration-300 ${
                  displayMarketData.nasdaq.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {displayMarketData.nasdaq.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {displayMarketData.nasdaq.change}%
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dow Jones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-all duration-300">
                {displayMarketData.dow.value.toLocaleString()}
              </div>
              <p
                className={`text-xs flex items-center transition-all duration-300 ${
                  displayMarketData.dow.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {displayMarketData.dow.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {displayMarketData.dow.change}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            {subscriptionPlan !== "free" && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="portfolio">
            {selectedStock ? (
              <StockAIInsights
                symbol={selectedStock}
                subscriptionPlan={subscriptionPlan}
                onBack={handleBackToPortfolio}
              />
            ) : (
              <PortfolioOverview
                subscriptionPlan={subscriptionPlan}
                planLimits={planLimits}
                onStockSelect={handleStockSelect}
              />
            )}
          </TabsContent>

          <TabsContent value="news">
            <NewsSection subscriptionPlan={subscriptionPlan} planLimits={planLimits} />
          </TabsContent>

          <TabsContent value="insights">
            <AIInsights subscriptionPlan={subscriptionPlan} />
          </TabsContent>

          {subscriptionPlan !== "free" && (
            <TabsContent value="analytics">
              <AdvancedAnalytics subscriptionPlan={subscriptionPlan} />
            </TabsContent>
          )}
        </Tabs>

        {/* Upgrade Banner for Free Users */}
        {subscriptionPlan === "free" && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Unlock Premium Features</h3>
                  <p className="text-blue-700 text-sm">Get unlimited portfolio tracking, AI insights, and more</p>
                </div>
                <Link href="/upgrade">
                  <Button className="bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
