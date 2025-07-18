"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const updateTestResult = (name: string, status: "success" | "error", message: string, data?: any) => {
    setTestResults((prev) => {
      const existing = prev.find((r) => r.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.data = data
        return [...prev]
      }
      return [...prev, { name, status, message, data }]
    })
  }

  const testNewsAPI = async () => {
    updateTestResult("News API", "pending", "Testing...")
    try {
      const response = await fetch("/api/news?limit=1")
      const data = await response.json()

      if (response.ok && data.articles && data.articles.length > 0) {
        updateTestResult("News API", "success", `✅ Working! Found ${data.articles.length} articles`, data)
      } else {
        updateTestResult("News API", "error", `❌ Error: ${data.error || "No articles returned"}`, data)
      }
    } catch (error) {
      updateTestResult("News API", "error", `❌ Network Error: ${error}`)
    }
  }

  const testAlphaVantageAPI = async () => {
    updateTestResult("Alpha Vantage API", "pending", "Testing...")
    try {
      const response = await fetch("/api/market/overview")
      const data = await response.json()

      if (response.ok && data.sp500) {
        updateTestResult("Alpha Vantage API", "success", "✅ Working! Market data retrieved", data)
      } else {
        updateTestResult("Alpha Vantage API", "error", `❌ Error: ${data.error || "No market data"}`, data)
      }
    } catch (error) {
      updateTestResult("Alpha Vantage API", "error", `❌ Network Error: ${error}`)
    }
  }

  const testHuggingFaceAPI = async () => {
    updateTestResult("Hugging Face API", "pending", "Testing...")
    try {
      const response = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "The stock market is performing well today" }),
      })
      const data = await response.json()

      if (response.ok && data.sentiment) {
        updateTestResult("Hugging Face API", "success", `✅ Working! Sentiment: ${data.sentiment}`, data)
      } else {
        updateTestResult("Hugging Face API", "error", `❌ Error: ${data.error || "No sentiment data"}`, data)
      }
    } catch (error) {
      updateTestResult("Hugging Face API", "error", `❌ Network Error: ${error}`)
    }
  }

  const testStockSearchAPI = async () => {
    updateTestResult("Stock Search API", "pending", "Testing...")
    try {
      const response = await fetch("/api/stocks/search?q=AAPL")
      const data = await response.json()

      if (response.ok && data.stocks && data.stocks.length > 0) {
        updateTestResult("Stock Search API", "success", `✅ Working! Found ${data.stocks.length} stocks`, data)
      } else {
        updateTestResult("Stock Search API", "error", `❌ Error: ${data.error || "No stocks found"}`, data)
      }
    } catch (error) {
      updateTestResult("Stock Search API", "error", `❌ Network Error: ${error}`)
    }
  }

  const testEnhancedAI = async () => {
    updateTestResult("Enhanced AI API", "pending", "Testing...")
    try {
      const response = await fetch("/api/ai/recommendations/enhanced")
      const data = await response.json()

      if (response.ok && data.recommendations) {
        updateTestResult(
          "Enhanced AI API",
          "success",
          `✅ Working! ${data.recommendations.length} recommendations`,
          data,
        )
      } else {
        updateTestResult("Enhanced AI API", "error", `❌ Error: ${data.error || "No recommendations"}`, data)
      }
    } catch (error) {
      updateTestResult("Enhanced AI API", "error", `❌ Network Error: ${error}`)
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setTestResults([])

    // Run tests sequentially to avoid rate limits
    await testNewsAPI()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testAlphaVantageAPI()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testHuggingFaceAPI()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testStockSearchAPI()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await testEnhancedAI()

    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Configuration Test</h1>
          <p className="text-gray-600">Test all your API keys to make sure they're working correctly</p>
        </div>

        {/* Environment Variables Check */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Variables Status</CardTitle>
            <CardDescription>Check if your API keys are properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span>NEWS_API_KEY</span>
                <Badge variant={process.env.NEWS_API_KEY ? "default" : "destructive"}>
                  {process.env.NEWS_API_KEY ? "✅ Set" : "❌ Missing"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>ALPHA_VANTAGE_API_KEY</span>
                <Badge variant={process.env.ALPHA_VANTAGE_API_KEY ? "default" : "destructive"}>
                  {process.env.ALPHA_VANTAGE_API_KEY ? "✅ Set" : "❌ Missing"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>HUGGING_FACE_API_KEY</span>
                <Badge variant={process.env.HUGGING_FACE_API_KEY ? "default" : "destructive"}>
                  {process.env.HUGGING_FACE_API_KEY ? "✅ Set" : "❌ Missing"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
            <CardDescription>Run tests to verify your API integrations are working</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={runAllTests} disabled={testing} className="mb-2">
                {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Run All Tests
              </Button>
              <Button variant="outline" onClick={testNewsAPI} disabled={testing}>
                Test News API
              </Button>
              <Button variant="outline" onClick={testAlphaVantageAPI} disabled={testing}>
                Test Alpha Vantage
              </Button>
              <Button variant="outline" onClick={testHuggingFaceAPI} disabled={testing}>
                Test Hugging Face
              </Button>
              <Button variant="outline" onClick={testStockSearchAPI} disabled={testing}>
                Test Stock Search
              </Button>
              <Button variant="outline" onClick={testEnhancedAI} disabled={testing}>
                Test Enhanced AI
              </Button>
            </div>

            {testResults.length > 0 && (
              <Alert className="mb-4">
                <AlertDescription>
                  Tests completed: {testResults.filter((r) => r.status === "success").length} passed,{" "}
                  {testResults.filter((r) => r.status === "error").length} failed
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {getStatusIcon(result.status)}
                      <span className="ml-2">{result.name}</span>
                    </span>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {result.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600">View Response Data</summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Troubleshooting Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-red-600">❌ If News API fails:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Check your NEWS_API_KEY in .env.local</li>
                  <li>
                    Verify the key at{" "}
                    <a href="https://newsapi.org/account" className="text-blue-600">
                      newsapi.org/account
                    </a>
                  </li>
                  <li>Free tier: 1,000 requests/day limit</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-600">❌ If Alpha Vantage fails:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Check your ALPHA_VANTAGE_API_KEY in .env.local</li>
                  <li>
                    Verify the key at{" "}
                    <a href="https://www.alphavantage.co/support/#api-key" className="text-blue-600">
                      alphavantage.co
                    </a>
                  </li>
                  <li>Free tier: 25 requests/day, 5 requests/minute limit</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-600">❌ If Hugging Face fails:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Check your HUGGING_FACE_API_KEY in .env.local</li>
                  <li>
                    Create token at{" "}
                    <a href="https://huggingface.co/settings/tokens" className="text-blue-600">
                      huggingface.co/settings/tokens
                    </a>
                  </li>
                  <li>Make sure token has "Read" permissions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-600">✅ Common fixes:</h4>
                <ul className="list-disc list-inside ml-4 text-gray-600">
                  <li>Restart your development server after adding keys</li>
                  <li>Make sure .env.local is in your project root</li>
                  <li>Check for typos in environment variable names</li>
                  <li>Ensure no spaces around the = sign in .env.local</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
