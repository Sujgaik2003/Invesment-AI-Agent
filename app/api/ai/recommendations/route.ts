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

    // Get user's subscription plan
    const { data: profile } = await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()

    const subscriptionPlan = profile?.subscription_plan || "free"

    // Mock AI recommendations based on subscription plan
    const baseRecommendations = [
      {
        id: "1",
        type: "recommendation",
        title: "Strong Buy Signal for AAPL",
        description:
          "Technical indicators and sentiment analysis suggest Apple stock is undervalued with strong upward momentum expected.",
        confidence: 85,
        impact: "high",
        symbol: "AAPL",
        action: "buy",
        reasoning: [
          "RSI indicates oversold conditions",
          "Positive earnings surprise expected",
          "Strong institutional buying",
        ],
      },
      {
        id: "2",
        type: "risk_alert",
        title: "High Volatility Warning",
        description: "Market volatility is expected to increase due to upcoming Federal Reserve announcements.",
        confidence: 78,
        impact: "medium",
        reasoning: ["FOMC meeting scheduled", "Economic data releases pending", "Options expiration approaching"],
      },
    ]

    const premiumRecommendations = [
      {
        id: "3",
        type: "opportunity",
        title: "Sector Rotation Opportunity",
        description:
          "Healthcare sector showing signs of recovery with several stocks presenting attractive entry points.",
        confidence: 72,
        impact: "medium",
        reasoning: [
          "Sector underperformance creating value",
          "Regulatory clarity improving",
          "Demographic trends favorable",
        ],
      },
      {
        id: "4",
        type: "market_sentiment",
        title: "Bullish Market Sentiment",
        description:
          "Overall market sentiment remains positive with 68% of analyzed news articles showing bullish indicators.",
        confidence: 91,
        impact: "high",
        reasoning: ["News sentiment analysis", "Social media trends", "Institutional positioning"],
      },
    ]

    const proRecommendations = [
      {
        id: "5",
        type: "trading_signal",
        title: "Automated Trading Signal: TSLA",
        description: "Algorithm detected breakout pattern in Tesla with high probability of continued upward movement.",
        confidence: 88,
        impact: "high",
        symbol: "TSLA",
        action: "buy",
        reasoning: ["Technical breakout confirmed", "Volume surge detected", "Momentum indicators aligned"],
      },
    ]

    let recommendations = baseRecommendations

    if (subscriptionPlan === "premium" || subscriptionPlan === "pro") {
      recommendations = [...recommendations, ...premiumRecommendations]
    }

    if (subscriptionPlan === "pro") {
      recommendations = [...recommendations, ...proRecommendations]
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({
      recommendations,
      marketSentiment: {
        overall: 68,
        bullish: 68,
        bearish: 22,
        neutral: 10,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
