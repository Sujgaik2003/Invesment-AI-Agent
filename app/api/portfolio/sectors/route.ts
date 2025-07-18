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

    // Generate dynamic sector allocation data
    const generateSectorData = () => {
      const sectors = [
        { name: "Technology", basePercentage: 36, color: "#3B82F6" },
        { name: "Healthcare", basePercentage: 20, color: "#10B981" },
        { name: "Finance", basePercentage: 16, color: "#F59E0B" },
        { name: "Consumer", basePercentage: 12, color: "#EF4444" },
        { name: "Energy", basePercentage: 10, color: "#8B5CF6" },
        { name: "Other", basePercentage: 6, color: "#6B7280" },
      ]

      const totalValue = 125000 + (Math.random() - 0.5) * 10000 // Add some variation

      return sectors.map((sector) => {
        const percentage = sector.basePercentage + (Math.random() - 0.5) * 4 // ±2% variation
        const value = (totalValue * percentage) / 100
        const change = (Math.random() - 0.5) * 20 // ±10% change

        return {
          name: sector.name,
          value: Math.round(value),
          percentage: Math.round(percentage * 10) / 10,
          change: Math.round(change * 10) / 10,
          color: sector.color,
        }
      })
    }

    const sectorData = generateSectorData()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return NextResponse.json({
      sectors: sectorData,
      totalValue: sectorData.reduce((sum, sector) => sum + sector.value, 0),
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Sectors API error:", error)
    return NextResponse.json({ error: "Failed to fetch sector data" }, { status: 500 })
  }
}
