'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Toggle action completion status for a lesson day
 * Actions are now stored in V2_daily_lessons table (action_for_today, action_for_today1, action_for_today2)
 * This function tracks which actions have been completed by the user
 */
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
