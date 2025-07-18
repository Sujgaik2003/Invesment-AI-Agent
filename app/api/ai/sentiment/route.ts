import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const huggingFaceKey = process.env.HUGGING_FACE_API_KEY
    if (!huggingFaceKey) {
      throw new Error("HUGGING_FACE_API_KEY not configured")
    }

    // Use Hugging Face sentiment analysis model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        headers: {
          Authorization: `Bearer ${huggingFaceKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`)
    }

    const result = await response.json()

    // Handle the response format from Hugging Face
    if (Array.isArray(result) && result.length > 0) {
      const sentimentData = result[0]

      // Find the highest confidence sentiment
      let topSentiment = sentimentData[0]
      for (const item of sentimentData) {
        if (item.score > topSentiment.score) {
          topSentiment = item
        }
      }

      // Map Hugging Face labels to our format
      let sentiment: "positive" | "negative" | "neutral"
      if (topSentiment.label === "LABEL_2" || topSentiment.label.toLowerCase().includes("pos")) {
        sentiment = "positive"
      } else if (topSentiment.label === "LABEL_0" || topSentiment.label.toLowerCase().includes("neg")) {
        sentiment = "negative"
      } else {
        sentiment = "neutral"
      }

      // Convert score to our scale (-1 to 1)
      const normalizedScore =
        sentiment === "positive" ? topSentiment.score : sentiment === "negative" ? -topSentiment.score : 0

      return NextResponse.json({
        sentiment,
        score: normalizedScore,
        confidence: topSentiment.score * 100,
        details: {
          rawResults: sentimentData,
          model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
        },
      })
    }

    // Fallback if API response is unexpected
    return NextResponse.json({
      sentiment: "neutral" as const,
      score: 0,
      confidence: 50,
      details: {
        error: "Unexpected API response format",
      },
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
