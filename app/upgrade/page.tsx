import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UpgradeContent from "@/components/upgrade/upgrade-content"

export default async function UpgradePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with subscription plan
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <UpgradeContent user={user} profile={profile} />
}
