import { NextResponse } from 'next/server'
import { recordIPAgreementAcceptance } from '@/app/actions/auth-actions'

// Test endpoint to verify IP agreement recording works
// This should be removed in production
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'userId parameter required' }, { status: 400 })
  }
  
  try {
    const result = await recordIPAgreementAcceptance(userId)
    return NextResponse.json({ 
      success: true, 
      message: 'IP agreement recorded successfully',
      result 
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
