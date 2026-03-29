import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JSON_SCHEMA = `{"weight_lbs":null,"body_fat_pct":null,"bmr_kcal":null,"fat_mass_lbs":null,"body_age":null,"muscle_mass_lbs":null,"skeletal_muscle_pct":null,"subcutaneous_fat_pct":null,"visceral_fat":null}`

const PROMPTS: Record<string, string> = {
  fitdays: `Extract measurements from this Fitdays smart scale screenshot. Return ONLY a JSON object with these exact keys (null for missing values):
${JSON_SCHEMA}
If weight is in kg, convert to lbs (×2.20462). Return only valid JSON, no other text.`,

  dexa: `Extract body composition measurements from this DEXA scan report. Return ONLY a JSON object with these exact keys (null for missing values):
${JSON_SCHEMA}
Mappings: "Lean Mass" or "Lean Tissue" → muscle_mass_lbs. "Visceral Adipose Tissue" or "VAT Area" → visceral_fat. "Skeletal Muscle Mass" → skeletal_muscle_pct if shown as %. Convert kg to lbs (×2.20462) where needed. BMR may not be present — leave null. Return only valid JSON, no other text.`,

  fitnescity: `Extract body composition measurements from this Fitnescity test report. Return ONLY a JSON object with these exact keys (null for missing values):
${JSON_SCHEMA}
Mappings: "Lean Mass" or "Lean Tissue" → muscle_mass_lbs. "Visceral Adipose Tissue" or "VAT" → visceral_fat. "Skeletal Muscle" → skeletal_muscle_pct if shown as %. Convert kg to lbs (×2.20462) where needed. Return only valid JSON, no other text.`,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { imageBase64, mimeType, source } = await req.json()
  const prompt = PROMPTS[source] ?? PROMPTS.fitdays

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { data: settings } = await supabase
    .from('program_settings')
    .select('anthropic_api_key')
    .limit(1)
    .single()

  const apiKey = settings?.anthropic_api_key
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'no_api_key' }),
      { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  }

  // PDFs use 'document' type; images use 'image' type
  const fileBlock = mimeType === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageBase64 } }
    : { type: 'image',    source: { type: 'base64', media_type: mimeType,           data: imageBase64 } }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          fileBlock,
          { type: 'text', text: prompt }
        ]
      }]
    })
  })

  const claudeData = await res.json()
  const text = claudeData.content?.[0]?.text ?? '{}'

  let parsed: Record<string, number | null> = {}
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) try { parsed = JSON.parse(match[0]) } catch { /* ignore */ }
  }

  return new Response(JSON.stringify(parsed), {
    headers: { ...corsHeaders, 'content-type': 'application/json' }
  })
})
