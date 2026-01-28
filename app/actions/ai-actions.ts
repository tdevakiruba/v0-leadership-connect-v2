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
      prompt: `You are a leadership coach helping someone on Day ${dayNumber} of a 21-day Leadership Reboot program.

Today's theme: "${theme}"
Today's goal: "${goal}"
Suggested action from curriculum: "${actionForToday}"

Generate 3 bold, practical actions they can take TODAY to apply this lesson. Each action should:
- Be specific and actionable (not vague)
- Be completable within 24 hours
- Push them slightly outside their comfort zone
- Build on the curriculum's suggested action

Return exactly 3 actions with varying difficulty levels:
1. One "easy" action (low barrier, quick win)
2. One "medium" action (moderate effort, meaningful impact)
3. One "bold" action (challenging, transformative)

Make them concrete and real-world applicable for a professional/leader context.`
    })

    return result.output ?? { actions: [] }
  } catch (error) {
    console.error('[v0] Error generating bold actions:', error)
    // Return fallback actions based on the theme
    return {
      actions: [
        {
          id: 1,
          title: `Quick reflection on ${theme.toLowerCase()}`,
          description: 'Take 5 minutes to journal about how this theme shows up in your work.',
          difficulty: 'easy' as const
        },
        {
          id: 2,
          title: actionForToday || `Practice ${theme.toLowerCase()} today`,
          description: goal || 'Apply this lesson in one interaction today.',
          difficulty: 'medium' as const
        },
        {
          id: 3,
          title: `Share your learning about ${theme.toLowerCase()}`,
          description: 'Discuss this concept with a colleague or team member.',
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
