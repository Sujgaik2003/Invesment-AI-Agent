"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Shield, TrendingUp, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  full_name: string
  subscription_plan: "free" | "premium" | "pro"
  created_at: string
}

interface UpgradeContentProps {
  user: User
  profile: Profile | null
}

export default function UpgradeContent({ user, profile }: UpgradeContentProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const selectedPlan = searchParams.get("plan") || "premium"
  const currentPlan = profile?.subscription_plan || "free"

  const plans = [
    {
      id: "premium",
      name: "Premium",
      price: 9.99,
      period: "month",
      description: "Perfect for serious investors",
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      features: [
        "Unlimited portfolio tracking",
        "Advanced sentiment analysis",
        "Real-time news feed (unlimited)",
        "AI-powered stock recommendations",
        "Technical analysis indicators",
        "Risk assessment tools",
        "Custom alerts and notifications",
        "Email support",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 19.99,
      period: "month",
      description: "Complete solution for professional traders",
      icon: <Crown className="h-8 w-8 text-purple-600" />,
      features: [
        "All Premium features",
        "Automated trading signals",
        "Advanced portfolio optimization",
        "Sector analysis and comparison",
        "Economic calendar integration",
        "API access for developers",
        "Priority customer support",
        "Custom research reports",
        "Advanced backtesting tools",
      ],
      popular: false,
    },
  ]

  const handleUpgrade = async (planId: string) => {
    setLoading(planId)
    setError("")
    setSuccess("")

    try {
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll simulate the upgrade process

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update user's subscription plan in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ subscription_plan: planId })
        .eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(`Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`)

      // Redirect to dashboard after successful upgrade
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("Failed to process upgrade. Please try again.")
      console.error("Upgrade error:", err)
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (planId: string) => currentPlan === planId
  const isPlanDowngrade = (planId: string) => {
    const planHierarchy = { free: 0, premium: 1, pro: 2 }
    return (
      planHierarchy[planId as keyof typeof planHierarchy] < planHierarchy[currentPlan as keyof typeof planHierarchy]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InvestAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">Current: {currentPlan.toUpperCase()}</Badge>
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock advanced AI-powered features and take your investment strategy to the next level
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 max-w-2xl mx-auto border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 max-w-2xl mx-auto" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan Info */}
        <Card className="max-w-2xl mx-auto mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Current Plan: {currentPlan.toUpperCase()}</h3>
                <p className="text-blue-700 text-sm">
                  {currentPlan === "free"
                    ? "You're currently on the free plan with limited features"
                    : `You're enjoying ${currentPlan} features`}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-blue-500 shadow-lg scale-105" : ""
              } ${selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan(plan.id) || loading === plan.id || isPlanDowngrade(plan.id)}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan(plan.id) ? (
                    "Current Plan"
                  ) : isPlanDowngrade(plan.id) ? (
                    "Contact Support"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>

                {isCurrentPlan(plan.id) && (
                  <p className="text-center text-sm text-gray-600 mt-2">You're currently on this plan</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Features</th>
                      <th className="text-center p-4 font-semibold">Free</th>
                      <th className="text-center p-4 font-semibold">Premium</th>
                      <th className="text-center p-4 font-semibold">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4">Portfolio Tracking</td>
                      <td className="text-center p-4">3 stocks</td>
                      <td className="text-center p-4">Unlimited</td>
                      <td className="text-center p-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4">Market News</td>
                      <td className="text-center p-4">5 articles/day</td>
                      <td className="text-center p-4">Unlimited</td>
                      <td className="text-center p-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-4">AI Insights</td>
                      <td className="text-center p-4">Basic</td>
                      <td className="text-center p-4">Advanced</td>
                      <td className="text-center p-4">Advanced + Signals</td>
                    </tr>
                    <tr>
                      <td className="p-4">Risk Assessment</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">✅</td>
                      <td className="text-center p-4">✅</td>
                    </tr>
                    <tr>
                      <td className="p-4">API Access</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">✅</td>
                    </tr>
                    <tr>
                      <td className="p-4">Support</td>
                      <td className="text-center p-4">Community</td>
                      <td className="text-center p-4">Email</td>
                      <td className="text-center p-4">Priority</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to premium features
                  until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely
                  through Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Is there a free trial for premium plans?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! We offer a 14-day free trial for both Premium and Pro plans. No credit card required to start
                  your trial.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
