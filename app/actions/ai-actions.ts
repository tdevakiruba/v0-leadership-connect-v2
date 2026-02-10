'use server'

import { generateText, Output } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const boldActionsSchema = z.object({
  actions: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'bold'])
  }))
})

export async function generateBoldActions(
  dayNumber: number,
  theme: string,
  goal: string,
  actionForToday: string
): Promise<{ actions: Array<{ id: number; title: string; description: string; difficulty: 'easy' | 'medium' | 'bold' }> }> {
  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({ schema: boldActionsSchema }),
      prompt: `You are a leadership coach helping someone on Day ${dayNumber} of a 90-day Leadership Reboot program.

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
    })

    const generated = result.output ?? { actions: [] }

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
        return false
      }
      return true
    })

    // Also deduplicate among the AI actions themselves
    const seen = new Set<string>()
    const uniqueActions = deduped.filter(action => {
      const key = action.title.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

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
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First check if progress exists
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('day_number', dayNumber)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('user_progress')
      .update({ ai_actions: aiActions })
      .eq('user_id', user.id)
      .eq('day_number', dayNumber)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('user_progress')
      .insert({ 
        user_id: user.id, 
        day_number: dayNumber, 
        ai_actions: aiActions 
      })

    if (error) throw error
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
