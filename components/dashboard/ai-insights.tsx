"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, Target, Lightbulb, RefreshCw, Loader2, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AIInsight {
  id: string
  type: "recommendation" | "risk_alert" | "opportunity" | "market_sentiment" | "trading_signal"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  symbol?: string
  action?: "buy" | "sell" | "hold" | "watch"
  reasoning?: string[] // Add reasoning for detailed view
}

interface MarketSentiment {
  overall: number
  bullish: number
  bearish: number
  neutral: number
  analysisSource?: string
  articlesAnalyzed?: number
}

interface AIInsightsProps {
  subscriptionPlan: "free" | "premium" | "pro"
}

export default function AIInsights({ subscriptionPlan }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/ai/recommendations/enhanced?plan=${subscriptionPlan}`)
      const data = await response.json()

      if (response.ok && data.recommendations) {
        setInsights(data.recommendations)
        setMarketSentiment(data.marketSentiment)
        if (data.newsFetchError || data.sentimentAnalysisError) {
          setError(data.newsFetchError || data.sentimentAnalysisError)
        }
      } else {
        setError(data.error || "Failed to fetch AI insights")
      }
    } catch (err) {
      setError("Network error while fetching AI insights")
      console.error("AI insights fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [subscriptionPlan])

  useEffect(() => {
    fetchInsights()
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchInsights, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchInsights])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Target className="h-5 w-5" />
      case "risk_alert":
        return <AlertTriangle className="h-5 w-5" />
      case "opportunity":
        return <Lightbulb className="h-5 w-5" />
      case "market_sentiment":
        return <Brain className="h-5 w-5" />
      case "trading_signal":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <Brain className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "recommendation":
        return "border-blue-200 bg-blue-50"
      case "risk_alert":
        return "border-red-200 bg-red-50"
      case "opportunity":
        return "border-green-200 bg-green-50"
      case "market_sentiment":
        return "border-purple-200 bg-purple-50"
      case "trading_signal":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getActionBadge = (action?: string) => {
    if (!action) return null

    const colors = {
      buy: "bg-green-100 text-green-800",
      sell: "bg-red-100 text-red-800",
      hold: "bg-yellow-100 text-yellow-800",
      watch: "bg-blue-100 text-blue-800",
    }

    return <Badge className={colors[action as keyof typeof colors]}>{action.toUpperCase()}</Badge>
  }

  // Limit insights for free users
  const displayedInsights = subscriptionPlan === "free" ? insights.slice(0, 2) : insights

  const InsightDetailsModal = ({ insight, onClose }: { insight: AIInsight; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{insight.title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {getInsightIcon(insight.type)}
              <Badge variant="outline">{insight.type.replace("_", " ")}</Badge>
              {insight.symbol && <Badge variant="outline">{insight.symbol}</Badge>}
              {getActionBadge(insight.action)}
            </div>

            <p className="text-gray-700">{insight.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Confidence Level</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={insight.confidence} className="flex-1" />
                  <span className="text-sm font-medium">{insight.confidence}%</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Impact Level</h4>
                <Badge variant={insight.impact === "high" ? "default" : "secondary"}>
                  {insight.impact.toUpperCase()}
                </Badge>
              </div>
            </div>

            {insight.reasoning && insight.reasoning.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Analysis Details</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {insight.reasoning.map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>Take Action</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading AI insights...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Sentiment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Market Sentiment Analysis
            </div>
            <Button variant="outline" size="sm" onClick={fetchInsights} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </CardTitle>
          <CardDescription>Real-time sentiment analysis based on news, social media, and market data</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {marketSentiment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Market Sentiment</span>
                <span className="text-2xl font-bold text-green-600">{marketSentiment.overall}% Bullish</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bullish</span>
                  <span>{marketSentiment.bullish}%</span>
                </div>
                <Progress value={marketSentiment.bullish} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bearish</span>
                  <span>{marketSentiment.bearish}%</span>
                </div>
                <Progress value={marketSentiment.bearish} className="h-2 bg-red-100" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Neutral</span>
                  <span>{marketSentiment.neutral}%</span>
                </div>
                <Progress value={marketSentiment.neutral} className="h-2 bg-gray-100" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No market sentiment data available at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI-Powered Insights
            {subscriptionPlan === "free" && <Badge variant="secondary">{displayedInsights.length}/2 insights</Badge>}
          </CardTitle>
          <CardDescription>Personalized recommendations and alerts based on AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedInsights.length > 0 ? (
              displayedInsights.map((insight) => (
                <div key={insight.id} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <h3 className="font-semibold">{insight.title}</h3>
                      {insight.symbol && <Badge variant="outline">{insight.symbol}</Badge>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getActionBadge(insight.action)}
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{insight.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Impact:</span>
                      <Badge variant={insight.impact === "high" ? "default" : "secondary"}>{insight.impact}</Badge>
                    </div>

                    {subscriptionPlan !== "free" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInsight(insight)
                          setShowDetails(true)
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No AI insights available at the moment.</p>
              </div>
            )}
          </div>

          {subscriptionPlan === "free" && insights.length > displayedInsights.length && (
            <Alert className="mt-4">
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Upgrade to Premium to unlock unlimited AI insights, detailed analysis, and personalized recommendations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Advanced AI Features (Premium/Pro only) */}
      {subscriptionPlan !== "free" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>AI-powered portfolio risk analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Portfolio Risk Score</span>
                  <Badge variant="outline">Moderate Risk</Badge>
                </div>
                <Progress value={65} className="h-3" />
                <p className="text-sm text-gray-600">
                  Your portfolio shows moderate risk with good diversification across sectors.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
              <CardDescription>AI recommendations for portfolio improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>• Increase tech sector allocation</span>
                  <Badge variant="outline" className="text-xs">
                    +3%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>• Reduce energy sector exposure</span>
                  <Badge variant="outline" className="text-xs">
                    -2%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>• Add defensive stocks</span>
                  <Badge variant="outline" className="text-xs">
                    +1%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showDetails && selectedInsight && (
        <InsightDetailsModal
          insight={selectedInsight}
          onClose={() => {
            setShowDetails(false)
            setSelectedInsight(null)
          }}
        />
      )}
    </div>
  )
}
