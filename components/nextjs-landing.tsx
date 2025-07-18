"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Triangle, Zap, Globe, Code, Layers, Database } from "lucide-react"

export default function NextJSLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Triangle className="h-6 w-6 fill-black" />
                <span className="text-xl font-bold">NEXT.JS</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Showcase
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Docs
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Blog
                </a>
                <div className="flex items-center space-x-1">
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Templates
                  </a>
                  <Badge variant="secondary" className="text-xs">
                    β
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Enterprise
                  </a>
                  <Badge variant="secondary" className="text-xs">
                    β
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <span className="text-sm text-gray-600">Ctrl K</span>
              <Button variant="ghost" size="sm">
                <Triangle className="h-4 w-4 mr-1" />
                Deploy
              </Button>
              <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                Learn
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            The React Framework
            <br />
            for the Web
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Used by some of the world's largest companies, Next.js enables you to create{" "}
            <span className="font-semibold text-gray-900">high-quality web applications</span> with the power of React
            components.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-3">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              Learn Next.js
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Triangle className="h-4 w-4" />
            <code className="bg-gray-100 px-2 py-1 rounded">npx create-next-app@latest</code>
          </div>
        </div>

        {/* What's in Next.js Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What's in Next.js?</h2>
            <p className="text-xl text-gray-600">Everything you need to build great products on the web.</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Built-in Optimizations</h3>
                <p className="text-gray-600 text-sm">
                  Automatic Image, Font, and Script Optimizations for improved UX and Core Web Vitals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Dynamic HTML Streaming</h3>
                <p className="text-gray-600 text-sm">
                  Instantly stream UI from the server, integrated with the App Router and React Suspense.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">React Server Components</h3>
                <p className="text-gray-600 text-sm">
                  Add components without sending additional client-side JavaScript. Built on the latest React features.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Data Fetching</h3>
                <p className="text-gray-600 text-sm">
                  Make your React component async and await your data. Next.js supports both server and client data
                  fetching.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features Preview */}
        <div className="py-20 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl font-bold text-gray-400">CSS</div>
              </div>
              <h4 className="font-semibold mb-2">CSS Support</h4>
              <p className="text-gray-600 text-sm">
                Style your application with your favorite tools, including support for CSS Modules, Sass, Tailwind CSS,
                styled-jsx, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="font-semibold mb-2">Route Handlers</h4>
              <p className="text-gray-600 text-sm">
                Build API endpoints to securely connect with third party services for handling auth, webhooks, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
              <h4 className="font-semibold mb-2">Middleware</h4>
              <p className="text-gray-600 text-sm">
                Use code to define routing and access rules for authentication, experimentation, and
                internationalization.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>
              Get started by editing <code className="bg-gray-100 px-2 py-1 rounded">app/page.tsx</code>.
            </p>
            <p className="mt-2">Save and see your changes instantly.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="hover:text-gray-900">
                Deploy now
              </a>
              <a href="#" className="hover:text-gray-900">
                Read our docs
              </a>
              <a href="#" className="hover:text-gray-900">
                Learn
              </a>
              <a href="#" className="hover:text-gray-900">
                Examples
              </a>
              <a href="#" className="hover:text-gray-900">
                Go to nextjs.org →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
