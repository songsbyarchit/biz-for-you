/**
 * Parses the structured recommendation block from the AI response.
 * Returns an array of recommendation objects, or null if not found.
 */
export function parseRecommendations(text) {
  const startMarker = '---RECOMMENDATIONS START---'
  const endMarker = '---RECOMMENDATIONS END---'

  const startIdx = text.indexOf(startMarker)
  const endIdx = text.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) return null

  const block = text.slice(startIdx + startMarker.length, endIdx).trim()
  const recommendations = []

  // Split on RECOMMENDATION #N:
  const chunks = block.split(/(?=RECOMMENDATION #\d+:)/).filter(c => c.trim())

  for (const chunk of chunks) {
    const titleMatch = chunk.match(/RECOMMENDATION #\d+:\s*(.+)/)
    const whyMatch = chunk.match(/WHY THIS FOR YOU:\s*([\s\S]*?)(?=FIRST STEPS:|$)/)
    const stepsMatch = chunk.match(/FIRST STEPS:\s*([\s\S]*?)(?=---|$)/)

    if (!titleMatch) continue

    const title = titleMatch[1].trim()
    const why = whyMatch ? whyMatch[1].trim() : ''
    const stepsRaw = stepsMatch ? stepsMatch[1].trim() : ''
    const steps = stepsRaw
      .split(/\n/)
      .map(l => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)

    recommendations.push({ title, why, steps })
  }

  return recommendations.length > 0 ? recommendations : null
}

/**
 * Returns the text before the recommendations block (the final message),
 * or the full text if no block is present.
 */
export function extractPreRecommendationText(text) {
  const startMarker = '---RECOMMENDATIONS START---'
  const idx = text.indexOf(startMarker)
  if (idx === -1) return text
  return text.slice(0, idx).trim()
}
