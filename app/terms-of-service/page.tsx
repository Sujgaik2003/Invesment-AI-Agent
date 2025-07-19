import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InvestAI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600 mt-2">Last updated: December 2024</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using InvestAI's services, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                <p className="text-gray-700 mb-4">
                  InvestAI provides AI-powered investment analysis, portfolio tracking, and market insights. Our
                  services include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Real-time market data and analysis</li>
                  <li>AI-generated investment recommendations</li>
                  <li>Portfolio performance tracking</li>
                  <li>Risk assessment tools</li>
                  <li>Market news and sentiment analysis</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Investment Disclaimer</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-800 font-semibold">Important Investment Warning:</p>
                  <p className="text-yellow-700 mt-2">
                    All investments involve risk, including the potential loss of principal. Past performance does not
                    guarantee future results. InvestAI's recommendations are for informational purposes only and should
                    not be considered as financial advice.
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We are not a registered investment advisor</li>
                  <li>Our AI recommendations are based on historical data and algorithms</li>
                  <li>You should consult with a qualified financial advisor before making investment decisions</li>
                  <li>We are not responsible for any financial losses incurred</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
                <p className="text-gray-700 mb-4">As a user of InvestAI, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the service in compliance with applicable laws</li>
                  <li>Not attempt to reverse engineer or hack our systems</li>
                  <li>Not share your account with unauthorized users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Subscription and Billing</h2>
                <p className="text-gray-700 mb-4">
                  InvestAI offers various subscription plans with different features and pricing:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Free plan with limited features</li>
                  <li>Premium plan at $9.99/month</li>
                  <li>Pro plan at $19.99/month</li>
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  InvestAI shall not be liable for any direct, indirect, incidental, special, consequential, or punitive
                  damages resulting from your use of our service, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Financial losses from investment decisions</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Data loss or security breaches</li>
                  <li>Third-party actions or market volatility</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
                <p className="text-gray-700 mb-4">
                  Either party may terminate this agreement at any time. Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Your access to the service will be discontinued</li>
                  <li>Your data may be deleted according to our data retention policy</li>
                  <li>Outstanding fees remain due and payable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p className="text-gray-700 mb-4">For questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold">InvestAI Legal Department</p>
                  <p>Email: legal@investai.com</p>
                  <p>Phone: +91 9359416735</p>
                  <p>Address: 123 Finance Street, Mumbai, Maharashtra 400001, India</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
