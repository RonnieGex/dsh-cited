export function transcriptOf(events, prompt) {
  const calls = events.filter((event) => event.type === 'tool_call')
  const final = events.findLast((event) => event.type === 'final')
  if (calls.length !== 1 || calls[0].tool !== 'cited_search' || calls[0].truncated) throw new Error('Expected one complete cited_search call')
  const call = calls[0]
  const result = events.find((event) => event.type === 'tool_result' && event.callId === call.callId)
  if (result?.status !== 'completed' || result.truncated || !result.result) throw new Error('No complete successful search result')
  const citations = [...(final?.text ?? '').matchAll(/\[(\d+)\]/g)].map((match) => match[1])
  if (citations.length === 0 || citations.some((n) => !new RegExp(`^${n}\\. `, 'm').test(result.result))) throw new Error('The answer must cite returned passages')
  return `Question\n${prompt}\n\nTool call\n${call.tool} ${JSON.stringify(call.input)}\n\nPassages\n${result.result}\n\nAnswer\n${final.text}`
}
