import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stockId = params.id

    // Verify that the stock belongs to the user's portfolio before deleting
    const { data: portfolioStock, error: fetchError } = await supabase
      .from("portfolio_stocks")
      .select("id, portfolio_id")
      .eq("id", stockId)
      .single()

    if (fetchError || !portfolioStock) {
      console.error("Error fetching portfolio stock for deletion:", fetchError)
      return NextResponse.json({ error: "Stock not found or unauthorized" }, { status: 404 })
    }

    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolios")
      .select("id")
      .eq("id", portfolioStock.portfolio_id)
      .eq("user_id", user.id)
      .single()

    if (portfolioError || !portfolio) {
      console.error("Error verifying portfolio ownership:", portfolioError)
      return NextResponse.json({ error: "Unauthorized to delete this stock" }, { status: 403 })
    }

    const { error: deleteError } = await supabase.from("portfolio_stocks").delete().eq("id", stockId)

    if (deleteError) {
      console.error("Error deleting stock:", deleteError)
      return NextResponse.json({ error: "Failed to remove stock from portfolio" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Stock removed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete stock API error:", error)
    return NextResponse.json({ error: "Failed to remove stock from portfolio" }, { status: 500 })
  }
}
