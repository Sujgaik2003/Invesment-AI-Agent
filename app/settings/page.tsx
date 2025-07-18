import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsContent from "@/components/settings/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with subscription plan
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <SettingsContent user={user} profile={profile} />
}
