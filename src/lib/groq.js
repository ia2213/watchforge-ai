const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `You are a master horological engineer with expertise in all watch complications ever made.
When given a watch description, analyze it and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "complications": [
    {
      "type": "snake_case_type",
      "variant": "optional variant description",
      "position": "one of: 12h, 1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h, 9h, 10h, 11h, center",
      "description": "brief technical description"
    }
  ],
  "estimatedComponents": <integer>,
  "complexity": "simple | elaborate | grande_complication | ultra_complication",
  "inspirations": ["watch reference names"],
  "notes": "horologist technical notes about this movement"
}

Known complication types (use snake_case):
tourbillon, flying_tourbillon, double_axis_tourbillon, tri_axis_tourbillon,
minute_repeater, quarter_repeater, grande_sonnerie, westminster_chime,
chronograph, flyback_chronograph, rattrapante,
perpetual_calendar, annual_calendar, equation_of_time,
moon_phase, triple_moon_phase, sky_chart, sidereal_time,
gmt, world_time, power_reserve, dead_seconds,
automata, striking_work, jacquemart,
and any other real horological complication.

For ultra_complication, use 600-1600+ components.
For grande_complication (tourbillon+repeater+calendar), use 400-800 components.
For elaborate, use 150-400. For simple, use 100-200.
Place complications logically: tourbillons often at 6h, repeaters need space at 9h or edge, calendars at 12h, moon phases at 6h or 12h.`

export async function generateMovement(prompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY manquante dans .env')

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Erreur Groq API')
  }

  const data = await response.json()
  const content = data.choices[0].message.content.trim()

  // Strip potential markdown code blocks
  const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}
