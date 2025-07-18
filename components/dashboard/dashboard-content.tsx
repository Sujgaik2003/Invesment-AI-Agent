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

interface MarketDataItem {
  name: string
  value: number
  change: number
  iconType: "dollar" | "bar" | "trendingUp" | "trendingDown"
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const [marketDataItems, setMarketDataItems] = useState<MarketDataItem[]>([])
  const [loadingMarketData, setLoadingMarketData] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0)

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

  // Fetch real market data and combine with mock stock data for cycling
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoadingMarketData(true)
      try {
        const response = await fetch("/api/market/overview")
        if (response.ok) {
          const data = await response.json()
          const combinedData: MarketDataItem[] = [
            { name: "S&P 500", value: data.sp500.value, change: data.sp500.change, iconType: "dollar" },
            { name: "NASDAQ", value: data.nasdaq.value, change: data.nasdaq.change, iconType: "bar" },
            { name: "Dow Jones", value: data.dow.value, change: data.dow.change, iconType: "trendingUp" },
            // Add mock stock data for cycling
            { name: "Apple Inc. (AAPL)", value: 175.3, change: 0.75, iconType: "trendingUp" },
            { name: "Microsoft Corp. (MSFT)", value: 320.1, change: -0.2, iconType: "trendingDown" },
            { name: "Google (GOOGL)", value: 140.5, change: 1.5, iconType: "trendingUp" },
            { name: "Amazon (AMZN)", value: 135.8, change: 0.9, iconType: "trendingUp" },
            { name: "Tesla (TSLA)", value: 250.0, change: -1.5, iconType: "trendingDown" },
            { name: "NVIDIA (NVDA)", value: 950.0, change: 2.1, iconType: "trendingUp" },
            { name: "Meta Platforms (META)", value: 480.0, change: 0.55, iconType: "trendingUp" },
          ]
          setMarketDataItems(combinedData)
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error)
      } finally {
        setLoadingMarketData(false)
      }
    }

    fetchMarketData()
    // Refresh market data every 5 minutes (for the initial set)
    const refreshInterval = setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => clearInterval(refreshInterval)
  }, [])

  // Effect for cycling through market data items
  useEffect(() => {
    if (marketDataItems.length > 0) {
      const cycleInterval = setInterval(() => {
        setCurrentDisplayIndex((prevIndex) => (prevIndex + 1) % marketDataItems.length)
      }, 7000) // Cycle every 7 seconds
      return () => clearInterval(cycleInterval)
    }
  }, [marketDataItems]) // Depend on marketDataItems to start cycling once data is loaded

  const getIconComponent = (iconType: MarketDataItem["iconType"]) => {
    switch (iconType) {
      case "dollar":
        return DollarSign
      case "bar":
        return BarChart3
      case "trendingUp":
        return TrendingUp
      case "trendingDown":
        return TrendingDown
      default:
        return TrendingUp
    }
  }

  const displayedCards = []
  if (marketDataItems.length > 0) {
    for (let i = 0; i < 3; i++) {
      const item = marketDataItems[(currentDisplayIndex + i) % marketDataItems.length]
      if (item) {
        const IconComponent = getIconComponent(item.iconType)
        displayedCards.push(
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
              <p className={`text-xs flex items-center ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {item.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {item.change}%
              </p>
            </CardContent>
          </Card>,
        )
      }
    }
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">{displayedCards}</div>

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
