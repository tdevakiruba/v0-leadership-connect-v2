'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function generateBoldActions(
  dayNumber: number,
  theme: string,
  goal: string,
  actionForToday: string
): Promise<{ actions: Array<{ id: number; title: string; description: string; difficulty: 'easy' | 'medium' | 'bold' }> }> {
  try {
    console.log("[v0] generateBoldActions called for day", dayNumber, "theme:", theme)
    const openai = getOpenAIClient()
    console.log("[v0] OpenAI client created, making API call...")
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a leadership coach. Always respond with valid JSON matching this schema: { "actions": [{ "id": number, "title": string, "description": string, "difficulty": "easy" | "medium" | "bold" }] }`
        },
        {
          role: 'user',
          content: `You are helping someone on Day ${dayNumber} of a 90-day Leadership Reboot program.

Today's theme: "${theme}"
Today's goal: "${goal}"
Today's core action (already shown separately): "${actionForToday}"

Generate 3 NEW and UNIQUE bold, practical actions they can take TODAY to apply this lesson.

CRITICAL RULES:
- Each action MUST be completely different from the core action above. Do NOT repeat, rephrase, or paraphrase "${actionForToday}" in any way.
- All 3 actions MUST be distinct from each other — different verbs, different activities, different approaches.
- Be specific and actionable (not vague)
- Be completable within 24 hours
- Push them slightly outside their comfort zone
- Complement (not duplicate) the core action

Return exactly 3 actions with varying difficulty levels:
1. One "easy" action (low barrier, quick win — e.g. a 5-minute reflection, observation, or note-taking exercise)
2. One "medium" action (moderate effort — e.g. a conversation, written exercise, or behavior change)
3. One "bold" action (challenging, transformative — e.g. facilitating a discussion, making a public commitment, or leading a change)

Make them concrete and real-world applicable for a professional/leader context. Each must feel genuinely different in approach and scope.`
        }
      ]
    })

    const content = response.choices[0]?.message?.content
    console.log("[v0] Raw API response content:", content)
    const generated = content ? JSON.parse(content) as { actions: Array<{ id: number; title: string; description: string; difficulty: 'easy' | 'medium' | 'bold' }> } : { actions: [] }
    console.log("[v0] Parsed generated actions:", generated.actions.length)

    // Deduplicate: remove any AI action whose title or description is too similar to actionForToday
    const coreNormalized = actionForToday.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const deduped = generated.actions.filter(action => {
      const titleNorm = action.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      const descNorm = action.description.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      // Check if title or description is a near-duplicate of the core action
      if (coreNormalized && (
        titleNorm.includes(coreNormalized) || 
        coreNormalized.includes(titleNorm) ||
        descNorm.includes(coreNormalized) || 
        coreNormalized.includes(descNorm) ||
        titleNorm === coreNormalized ||
        descNorm === coreNormalized
      )) {
        console.log("[v0] Filtered out duplicate action:", action.title)
        return false
      }
      return true
    })
    console.log("[v0] After dedup with core action:", deduped.length)

    // Also deduplicate among the AI actions themselves
    const seen = new Set<string>()
    const uniqueActions = deduped.filter(action => {
      const key = action.title.toLowerCase().trim()
      if (seen.has(key)) {
        console.log("[v0] Filtered out duplicate among AI actions:", action.title)
        return false
      }
      seen.add(key)
      return true
    })
    console.log("[v0] Final unique actions count:", uniqueActions.length)

    console.log("[v0] Returning actions:", JSON.stringify(uniqueActions, null, 2))
    return { actions: uniqueActions }
  } catch (error) {
    console.error('[v0] Error generating bold actions:', error)
    // Return fallback actions based on the theme - each is distinct
    return {
      actions: [
        {
          id: 1,
          title: `Observe ${theme.toLowerCase()} in action`,
          description: 'Spend 5 minutes noticing how this theme appears in your interactions today. Write down one observation.',
          difficulty: 'easy' as const
        },
        {
          id: 2,
          title: `Apply ${theme.toLowerCase()} in a conversation`,
          description: 'Choose one meeting or interaction today to consciously practice this principle. Note what changes.',
          difficulty: 'medium' as const
        },
        {
          id: 3,
          title: `Lead a discussion on ${theme.toLowerCase()}`,
          description: 'Share this concept with your team and facilitate a brief conversation about how it applies to your work.',
          difficulty: 'bold' as const
        }
      ]
    }
  }
}

export async function saveActionsToProgress(
  dayNumber: number,
  aiActions: Array<{ id: number; title: string; description: string; difficulty: string }>
) {
  console.log("[v0] saveActionsToProgress called with", aiActions.length, "actions for day", dayNumber)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("[v0] No user authenticated")
    throw new Error('Not authenticated')
  }

  // First check if progress exists
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('day_number', dayNumber)
    .single()

  console.log("[v0] Existing progress found:", !!existing)

  if (existing) {
    console.log("[v0] Updating existing progress")
    const { error } = await supabase
      .from('user_progress')
      .update({ ai_actions: aiActions })
      .eq('user_id', user.id)
      .eq('day_number', dayNumber)

    if (error) {
      console.error("[v0] Error updating progress:", error)
      throw error
    }
    console.log("[v0] Successfully updated progress")
  } else {
    console.log("[v0] Creating new progress record")
    const { error } = await supabase
      .from('user_progress')
      .insert({ 
        user_id: user.id, 
        day_number: dayNumber, 
        ai_actions: aiActions 
      })

    if (error) {
      console.error("[v0] Error creating progress:", error)
      throw error
    }
    console.log("[v0] Successfully created progress record")
  }
  
  return { success: true }
}

export async function toggleActionCompleted(
  dayNumber: number,
  actionIndex: number,
  completed: boolean
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current progress
  const { data: progress, error: fetchError } = await supabase
    .from('user_progress')
    .select('actions_completed')
    .eq('user_id', user.id)
    .eq('day_number', dayNumber)
    .maybeSingle()

  if (fetchError) throw fetchError

  let actionsCompleted: number[] = progress?.actions_completed || []
  
  if (completed && !actionsCompleted.includes(actionIndex)) {
    actionsCompleted = [...actionsCompleted, actionIndex]
  } else if (!completed) {
    actionsCompleted = actionsCompleted.filter(i => i !== actionIndex)
  }

  if (progress) {
    const { error } = await supabase
      .from('user_progress')
      .update({ actions_completed: actionsCompleted })
      .eq('user_id', user.id)
      .eq('day_number', dayNumber)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('user_progress')
      .insert({ 
        user_id: user.id, 
        day_number: dayNumber, 
        actions_completed: actionsCompleted 
      })

    if (error) throw error
  }

  return { success: true, actionsCompleted }
}
