import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || "business"

    // Use News API for real news data
    const newsApiKey = process.env.NEWS_API_KEY
    if (!newsApiKey) {
      throw new Error("NEWS_API_KEY not configured")
    }

    // Use more specific financial keywords for better relevance
    const keywords =
      category === "business"
        ? "stock market OR finance OR investment OR trading OR economy OR Federal Reserve OR inflation OR earnings"
        : category

    // Add date filtering for recent news (last 30 days)
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 30)
    const fromDateString = fromDate.toISOString().split("T")[0]

    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&language=en&sortBy=publishedAt&from=${fromDateString}&pageSize=${limit}&apiKey=${newsApiKey}`

    const response = await fetch(newsApiUrl)
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`)
    }

    const newsData = await response.json()

    // Filter out articles with missing content and improve data quality
    const articles =
      newsData.articles
        ?.filter(
          (article: any) =>
            article.title &&
            article.description &&
            article.title !== "[Removed]" &&
            article.description !== "[Removed]" &&
            !article.title.toLowerCase().includes("removed"),
        )
        ?.map((article: any, index: number) => ({
          id: `news_${Date.now()}_${index}`,
          title: article.title,
          summary:
            article.description?.length > 200 ? article.description.substring(0, 200) + "..." : article.description,
          source: article.source?.name || "Unknown",
          publishedAt: article.publishedAt,
          url: article.url,
          relevantSymbols: [],
        })) || []

    return NextResponse.json({
      articles,
      total: newsData.totalResults || articles.length,
    })
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ error: "Failed to fetch news data" }, { status: 500 })
  }
}
