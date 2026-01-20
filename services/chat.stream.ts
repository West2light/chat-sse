export async function streamChatMessage(
  url: string,
  onMessage: (chunk: string) => void,
  onDone?: () => void,
  onError?: (err: unknown) => void
) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      credentials: "include",
    })

    if (!res.body) throw new Error("No response body")

    const reader = res.body.getReader()
    const decoder = new TextDecoder("utf-8")

    let buffer = ""

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const events = buffer.split("\n\n")
      buffer = events.pop() || ""

      for (const event of events) {
        if (event.startsWith("data: ")) {
          const data = event.replace("data: ", "")
          if (data === "[DONE]") {
            onDone?.()
            return
          }
          onMessage(data)
        }
      }
    }
  } catch (err) {
    onError?.(err)
  }
}
