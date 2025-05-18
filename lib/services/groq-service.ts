type GroqResponse = {
  choices: {
    message: {
      content: string
    }
  }[]
}

type IntentType = "event_info" | "employee_search" | "unknown"

export type Intent = {
  type: IntentType
  query?: string
}

export const analyzeUserIntent = async (message: string): Promise<Intent> => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `Ты помощник, который определяет намерение пользователя. 
            Определи, хочет ли пользователь получить информацию о мероприятиях (event_info) 
            или найти сотрудника (employee_search). 
            Ответь в формате JSON: {"type": "event_info" или "employee_search" или "unknown", "query": "поисковый запрос"}. 
            Если тип "unknown", поле query не требуется.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      console.error("Groq API error:", await response.text())
      return { type: "unknown" }
    }

    const data = (await response.json()) as GroqResponse
    const content = data.choices[0]?.message?.content

    if (!content) {
      return { type: "unknown" }
    }

    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/{[\s\S]*?}/)
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, "") : content
      const parsedIntent = JSON.parse(jsonString) as Intent

      return {
        type: parsedIntent.type || "unknown",
        query: parsedIntent.query,
      }
    } catch (parseError) {
      console.error("Error parsing Groq response:", parseError)
      return { type: "unknown" }
    }
  } catch (error) {
    console.error("Error calling Groq API:", error)
    return { type: "unknown" }
  }
}
