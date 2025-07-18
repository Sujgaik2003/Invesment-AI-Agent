"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, TrendingUp, RefreshCw, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  url: string
  sentiment: "positive" | "negative" | "neutral"
  relevantSymbols: string[]
}

interface NewsSectionProps {
  subscriptionPlan: "free" | "premium" | "pro"
  planLimits: {
    free: { stocks: number; news: number; alerts: number }
    premium: { stocks: number; news: number; alerts: number }
    pro: { stocks: number; news: number; alerts: number }
  }
}

export default function NewsSection({ subscriptionPlan, planLimits }: NewsSectionProps) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredNews, setFilteredNews] = useState(news)

  const categories = [
    { id: "all", name: "All News" },
    { id: "technology", name: "Technology" },
    { id: "healthcare", name: "Healthcare" },
    { id: "finance", name: "Finance" },
    { id: "energy", name: "Energy" },
    { id: "consumer", name: "Consumer" },
    { id: "industrial", name: "Industrial" },
    { id: "real-estate", name: "Real Estate" },
    { id: "utilities", name: "Utilities" },
  ]

  const maxNews = planLimits[subscriptionPlan].news

  const refreshNews = async () => {
    setLoading(true)
    setError("")
    try {
      const categoryParam = activeCategory === "all" ? "business" : activeCategory
      const response = await fetch(
        `/api/news?limit=${maxNews === Number.POSITIVE_INFINITY ? 20 : maxNews}&category=${categoryParam}`,
      )
      const data = await response.json()

      if (response.ok && data.articles) {
        setNews(data.articles)
      } else {
        setError(data.error || "Failed to fetch news")
      }
    } catch (err) {
      setError("Network error while fetching news")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(
          `/api/news?limit=${maxNews === Number.POSITIVE_INFINITY ? 20 : maxNews}&category=business`,
        )
        const data = await response.json()

        if (response.ok && data.articles) {
          setNews(data.articles)
        } else {
          setError(data.error || "Failed to fetch news")
        }
      } catch (err) {
        setError("Network error while fetching news")
        console.error("News fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()

    // Refresh news every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [maxNews])

  const filterNewsByCategory = async (categoryId: string) => {
    setActiveCategory(categoryId)
    setLoading(true)

    try {
      const categoryParam = categoryId === "all" ? "business" : categoryId
      const response = await fetch(
        `/api/news?limit=${maxNews === Number.POSITIVE_INFINITY ? 20 : maxNews}&category=${categoryParam}`,
      )
      const data = await response.json()

      if (response.ok && data.articles) {
        setNews(data.articles)
        setFilteredNews(data.articles)
      }
    } catch (err) {
      console.error("Category filter error:", err)
    } finally {
      setLoading(false)
    }
  }

  const displayedNews = maxNews === Number.POSITIVE_INFINITY ? filteredNews : filteredNews.slice(0, maxNews)

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Market News
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={refreshNews} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              <Badge variant={subscriptionPlan === "free" ? "secondary" : "default"}>
                {displayedNews.length}/{maxNews === Number.POSITIVE_INFINITY ? "∞" : maxNews} articles
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>Stay updated with the latest market news and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading latest news...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No news articles available at the moment.</p>
            </div>
          )}

          <div className="space-y-4">
            {displayedNews.map((article) => (
              <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{article.title}</h3>
                  <Badge className={getSentimentColor(article.sentiment)}>{article.sentiment}</Badge>
                </div>

                <p className="text-gray-600 mb-3">{article.summary}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{article.source}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {article.relevantSymbols.slice(0, 3).map((symbol) => (
                      <Badge key={symbol} variant="outline" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {subscriptionPlan === "free" && news.length > maxNews && (
            <Alert className="mt-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                You're viewing {maxNews} of {news.length} articles. Upgrade to Premium for unlimited news access.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* News Categories (Premium Feature) */}
      {subscriptionPlan !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>News Categories</CardTitle>
            <CardDescription>Filter news by category and sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className="justify-start bg-transparent"
                  onClick={() => filterNewsByCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            {activeCategory !== "all" && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Showing {filteredNews.length} articles for {categories.find((c) => c.id === activeCategory)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
