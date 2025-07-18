"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, Search, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Stock {
  id?: string // Add id for database record
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  shares: number
  purchase_price?: number // Add purchase_price for database
}

interface PortfolioOverviewProps {
  subscriptionPlan: "free" | "premium" | "pro"
  planLimits: {
    free: { stocks: number; news: number; alerts: number }
    premium: { stocks: number; news: number; alerts: number }
    pro: { stocks: number; news: number; alerts: number }
  }
  onStockSelect?: (symbol: string) => void
}

export default function PortfolioOverview({ subscriptionPlan, planLimits, onStockSelect }: PortfolioOverviewProps) {
  const [portfolio, setPortfolio] = useState<Stock[]>([])
  const [searchSymbol, setSearchSymbol] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [loading, setLoading] = useState(false)
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [error, setError] = useState("")

  const maxStocks = planLimits[subscriptionPlan].stocks
  const canAddMore = portfolio.length < maxStocks

  const fetchPortfolio = useCallback(async () => {
    setPortfolioLoading(true)
    setError("")
    try {
      const response = await fetch("/api/portfolio/stocks")
      const data = await response.json()

      if (response.ok && data.stocks) {
        setPortfolio(data.stocks)
      } else {
        setError(data.error || "Failed to fetch portfolio")
      }
    } catch (err) {
      setError("Network error while fetching portfolio")
      console.error("Fetch portfolio error:", err)
    } finally {
      setPortfolioLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const totalValue = portfolio.reduce((sum, stock) => sum + stock.price * (stock.shares || 0), 0)
  const totalChange = portfolio.reduce((sum, stock) => sum + stock.change * (stock.shares || 0), 0)
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0

  const searchStocks = async () => {
    if (!searchSymbol.trim()) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/portfolio/stocks?q=${searchSymbol}`)
      const data = await response.json()

      if (response.ok && data.stocks) {
        setSearchResults(data.stocks)
      } else {
        setError(data.error || "Failed to search stocks")
      }
    } catch (err) {
      setError("Network error during stock search")
      console.error("Stock search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const addToPortfolio = async (stock: Stock) => {
    if (!canAddMore) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/portfolio/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          shares: 1, // Default to 1 share when adding
          purchase_price: stock.price, // Use current price as purchase price
        }),
      })
      const data = await response.json()

      if (response.ok) {
        await fetchPortfolio() // Re-fetch portfolio to get updated data from DB
        setSearchResults([])
        setSearchSymbol("")
      } else {
        setError(data.error || "Failed to add stock to portfolio")
      }
    } catch (err) {
      setError("Network error while adding stock")
      console.error("Add stock error:", err)
    } finally {
      setLoading(false)
    }
  }

  const removeFromPortfolio = async (stockId: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/portfolio/stocks/${stockId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (response.ok) {
        await fetchPortfolio() // Re-fetch portfolio to get updated data from DB
      } else {
        setError(data.error || "Failed to remove stock from portfolio")
      }
    } catch (err) {
      setError("Network error while removing stock")
      console.error("Remove stock error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Portfolio Overview
            <Badge variant={subscriptionPlan === "free" ? "secondary" : "default"}>
              {portfolio.length}/{maxStocks === Number.POSITIVE_INFINITY ? "∞" : maxStocks} stocks
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Change</p>
              <p
                className={`text-2xl font-bold flex items-center ${totalChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {totalChange >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                ${Math.abs(totalChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentage Change</p>
              <p className={`text-2xl font-bold ${totalChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalChangePercent >= 0 ? "+" : ""}
                {totalChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Stock Section */}
      {canAddMore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Stock to Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && searchStocks()}
                disabled={loading}
              />
              <Button onClick={searchStocks} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                      <p className="text-sm">${stock.price.toFixed(2)}</p>
                    </div>
                    <Button onClick={() => addToPortfolio(stock)} disabled={loading}>
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!canAddMore && subscriptionPlan === "free" && (
        <Alert>
          <AlertDescription>
            You've reached the maximum number of stocks for the free plan. Upgrade to Premium for unlimited tracking.
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
          <CardDescription>Track your stock positions and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {portfolioLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading portfolio...</span>
            </div>
          ) : portfolio.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No stocks in your portfolio yet. Add some to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolio.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{stock.symbol}</h3>
                      <Badge variant="outline">{stock.shares} shares</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                    <p className="text-lg font-medium">${stock.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium flex items-center justify-end ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}
                    </p>
                    <p className={`text-sm ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Value: $
                      {((stock.shares || 0) * stock.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stock.id && removeFromPortfolio(stock.id)}
                    className="ml-4"
                    disabled={loading}
                  >
                    Remove
                  </Button>
                  <Button variant="default" size="sm" onClick={() => onStockSelect?.(stock.symbol)} className="ml-2">
                    AI Insights
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
