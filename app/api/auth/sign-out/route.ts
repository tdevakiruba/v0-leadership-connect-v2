import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/auth/sign-out
 *
 * Best-effort sign-out endpoint called via navigator.sendBeacon
 * when the browser is closing. Signs the user out of Supabase
 * to invalidate the session server-side.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: "global" })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
