import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, BarChart3, Bell, Brain } from "lucide-react"

export default function LandingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with investment tracking",
      features: [
        "Portfolio tracking (up to 3 stocks)",
        "Basic market news (5 articles/day)",
        "Simple price alerts",
        "Basic charts and graphs",
        "Daily market summary",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      description: "Advanced features for serious investors",
      features: [
        "Unlimited portfolio tracking",
        "Advanced sentiment analysis",
        "Real-time news feed (unlimited)",
        "AI-powered stock recommendations",
        "Technical analysis indicators",
        "Risk assessment tools",
        "Custom alerts and notifications",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "month",
      description: "Complete solution for professional traders",
      features: [
        "All Premium features",
        "Automated trading signals",
        "Advanced portfolio optimization",
        "Sector analysis and comparison",
        "Economic calendar integration",
        "API access for developers",
        "Priority customer support",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InvestAI</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">AI-Powered Investment Intelligence</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Make smarter investment decisions with our advanced AI agent that analyzes market trends, sentiment, and
            provides personalized recommendations for your portfolio.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms analyze market data and sentiment to provide intelligent insights.
              </p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Portfolio Tracking</h3>
              <p className="text-gray-600">
                Track your investments with real-time data, performance metrics, and risk assessment tools.
              </p>
            </div>
            <div className="text-center">
              <Bell className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
              <p className="text-gray-600">
                Get notified about important market movements, news, and opportunities that matter to your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-600">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Shield className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.name === "Free" ? "/auth/register" : `/upgrade?plan=${plan.name.toLowerCase()}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Free" ? "Get Started" : "Upgrade Now"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6" />
            <span className="text-xl font-bold">InvestAI</span>
          </div>
          <p className="text-gray-400 mb-4">Empowering investors with AI-driven insights and analysis.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-blue-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-400">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
