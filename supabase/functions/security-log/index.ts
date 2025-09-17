import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEvent {
  timestamp: string;
  event: string;
  details: Record<string, any>;
  userAgent: string;
  url: string;
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const securityEvent: SecurityEvent = await req.json()
    
    // Validate required fields
    if (!securityEvent.event || !securityEvent.timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    // Enhanced security event data
    const enrichedEvent = {
      ...securityEvent,
      client_ip: clientIP,
      created_at: new Date().toISOString(),
      risk_score: calculateRiskScore(securityEvent),
      alert_level: getAlertLevel(securityEvent)
    }

    // Log to database
    const { error: dbError } = await supabaseClient
      .from('security_logs')
      .insert([enrichedEvent])

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to log security event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check for high-risk events and send alerts
    if (enrichedEvent.alert_level === 'high') {
      await sendSecurityAlert(enrichedEvent)
    }

    // Apply security responses for certain events
    await applySecurityResponse(securityEvent, clientIP)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Security logging error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function calculateRiskScore(event: SecurityEvent): number {
  let score = 0

  // Base risk scores by event type
  const riskScores: Record<string, number> = {
    'SIGNIN_FAILED': 3,
    'SIGNUP_FAILED': 2,
    'RATE_LIMIT_EXCEEDED': 8,
    'MULTIPLE_FAILED_ATTEMPTS': 9,
    'SUSPICIOUS_ACTIVITY': 7,
    'UNAUTHORIZED_ACCESS': 10,
    'DATA_BREACH_ATTEMPT': 10
  }

  score = riskScores[event.event] || 1

  // Increase score for repeated events
  if (event.details?.attempts && event.details.attempts > 3) {
    score += Math.min(event.details.attempts - 3, 5)
  }

  // Increase score for events from new locations (simplified)
  if (event.details?.newLocation) {
    score += 2
  }

  return Math.min(score, 10) // Cap at 10
}

function getAlertLevel(event: SecurityEvent): 'low' | 'medium' | 'high' {
  const riskScore = calculateRiskScore(event)
  
  if (riskScore >= 8) return 'high'
  if (riskScore >= 5) return 'medium'
  return 'low'
}

async function sendSecurityAlert(event: SecurityEvent) {
  // In a real implementation, this would send alerts via email, Slack, etc.
  console.warn('HIGH RISK SECURITY EVENT:', {
    event: event.event,
    details: event.details,
    timestamp: event.timestamp,
    ip: event.client_ip
  })

  // You could integrate with services like:
  // - Email service (SendGrid, AWS SES)
  // - Slack webhooks
  // - PagerDuty
  // - Discord webhooks
}

async function applySecurityResponse(event: SecurityEvent, clientIP: string) {
  // Implement automatic security responses
  const highRiskEvents = [
    'RATE_LIMIT_EXCEEDED',
    'MULTIPLE_FAILED_ATTEMPTS',
    'SUSPICIOUS_ACTIVITY'
  ]

  if (highRiskEvents.includes(event.event)) {
    // In a real implementation, you might:
    // - Add IP to temporary block list
    // - Require additional verification
    // - Temporarily disable account
    console.log(`Security response triggered for ${clientIP}: ${event.event}`)
  }
}