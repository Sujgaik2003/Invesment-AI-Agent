"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, UserIcon, Bell, Shield, CreditCard, ArrowLeft, Save, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Profile {
  id: string
  full_name: string
  subscription_plan: "free" | "premium" | "pro"
  created_at: string
}

interface SettingsContentProps {
  user: User
  profile: Profile | null
}

export default function SettingsContent({ user, profile }: SettingsContentProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  // Profile settings
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [email, setEmail] = useState(user.email || "")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [newsAlerts, setNewsAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)

  // Investment preferences
  const [riskTolerance, setRiskTolerance] = useState("moderate")
  const [investmentGoals, setInvestmentGoals] = useState<string[]>(["growth"])
  const [preferredSectors, setPreferredSectors] = useState<string[]>(["technology"])

  const handleSaveProfile = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile")
      console.error("Profile update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const notificationSettings = {
        email: emailNotifications,
        push: pushNotifications,
        price_alerts: priceAlerts,
        news_alerts: newsAlerts,
        weekly_reports: weeklyReports,
      }

      const { error: updateError } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString(),
      })

      if (updateError) throw updateError

      setSuccess("Notification settings updated successfully!")
    } catch (err) {
      setError("Failed to update notification settings")
      console.error("Notification update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error: updateError } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        risk_tolerance: riskTolerance,
        investment_goals: investmentGoals,
        preferred_sectors: preferredSectors,
        updated_at: new Date().toISOString(),
      })

      if (updateError) throw updateError

      setSuccess("Investment preferences updated successfully!")
    } catch (err) {
      setError("Failed to update investment preferences")
      console.error("Preferences update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      // In a real app, you would call a server action to properly delete the account
      // This would include deleting all user data and canceling subscriptions
      alert("Account deletion would be processed here. Contact support for account deletion.")
    } catch (err) {
      setError("Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
          </div>
          <Badge variant={profile?.subscription_plan === "free" ? "secondary" : "default"}>
            {profile?.subscription_plan?.toUpperCase() || "FREE"}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-600">Email cannot be changed. Contact support if needed.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about market updates and account activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="price-alerts">Price Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when stock prices hit your targets</p>
                    </div>
                    <Switch id="price-alerts" checked={priceAlerts} onCheckedChange={setPriceAlerts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="news-alerts">News Alerts</Label>
                      <p className="text-sm text-gray-600">Receive important market news notifications</p>
                    </div>
                    <Switch id="news-alerts" checked={newsAlerts} onCheckedChange={setNewsAlerts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports">Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Get weekly portfolio performance summaries</p>
                    </div>
                    <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Investment Preferences</CardTitle>
                <CardDescription>
                  Set your investment goals and risk tolerance for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your risk tolerance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative - Low risk, stable returns</SelectItem>
                        <SelectItem value="moderate">Moderate - Balanced risk and return</SelectItem>
                        <SelectItem value="aggressive">Aggressive - High risk, high potential return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Investment Goals</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["Growth", "Income", "Preservation", "Speculation"].map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={goal.toLowerCase()}
                            checked={investmentGoals.includes(goal.toLowerCase())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInvestmentGoals([...investmentGoals, goal.toLowerCase()])
                              } else {
                                setInvestmentGoals(investmentGoals.filter((g) => g !== goal.toLowerCase()))
                              }
                            }}
                          />
                          <Label htmlFor={goal.toLowerCase()}>{goal}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Preferred Sectors</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["Technology", "Healthcare", "Finance", "Energy", "Consumer", "Industrial"].map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={sector.toLowerCase()}
                            checked={preferredSectors.includes(sector.toLowerCase())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferredSectors([...preferredSectors, sector.toLowerCase()])
                              } else {
                                setPreferredSectors(preferredSectors.filter((s) => s !== sector.toLowerCase()))
                              }
                            }}
                          />
                          <Label htmlFor={sector.toLowerCase()}>{sector}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage your subscription plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-gray-600">
                      {profile?.subscription_plan === "free"
                        ? "You're currently on the free plan"
                        : `You're subscribed to the ${profile?.subscription_plan} plan`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={profile?.subscription_plan === "free" ? "secondary" : "default"}>
                      {profile?.subscription_plan?.toUpperCase() || "FREE"}
                    </Badge>
                    {profile?.subscription_plan === "free" ? (
                      <Link href="/upgrade">
                        <Button>Upgrade</Button>
                      </Link>
                    ) : (
                      <Button variant="outline">Manage</Button>
                    )}
                  </div>
                </div>

                {profile?.subscription_plan !== "free" && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Billing Information</h4>
                      <p className="text-sm text-gray-600">Next billing date: January 15, 2024</p>
                      <p className="text-sm text-gray-600">Payment method: •••• •���•• •••• 1234</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline">Update Payment Method</Button>
                      <Button variant="outline">Download Invoices</Button>
                      <Button variant="destructive">Cancel Subscription</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Password</h4>
                    <p className="text-sm text-gray-600 mb-3">Last changed: 30 days ago</p>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Active Sessions</h4>
                    <p className="text-sm text-gray-600 mb-3">Manage devices that are signed into your account</p>
                    <Button variant="outline">View Sessions</Button>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <h4 className="font-semibold mb-2 text-red-800">Danger Zone</h4>
                    <p className="text-sm text-red-600 mb-3">Permanently delete your account and all associated data</p>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
