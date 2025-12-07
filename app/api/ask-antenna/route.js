import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { input, intent, searchableData } = await request.json()

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build the database context for Gemini
    const dbContext = searchableData ? `
AVAILABLE DATA IN DATABASE:
- Keywords/Skills: ${searchableData.keywords?.slice(0, 300).join(', ')}
- People Names: ${searchableData.names?.slice(0, 50).join(', ')}
- Companies: ${searchableData.companies?.join(', ')}
- Locations: ${searchableData.locations?.join(', ')}
- Job Titles: ${searchableData.jobTitles?.join(', ')}
` : ''

    const prompt = `You are a search query analyzer for a networking platform. Your job is to extract search terms from the user's query and match them against the available database.

User's intent: ${intent || 'general'}
User's query: "${input}"

${dbContext}

INSTRUCTIONS:
1. Look at the user's query and identify what they're searching for
2. Match their search terms against the AVAILABLE DATA above
3. Return keywords that EXIST in the database OR are clearly mentioned in the query
4. Include partial matches (e.g., if user says "theater" and database has "theater", include it)
5. Include name matches if user is looking for a specific person
6. Include location, company, job title matches

MATCHING RULES:
- If user mentions a skill/keyword, check if it exists in the Keywords list
- If user mentions a location, check the Locations list
- If user mentions a company, check the Companies list
- If user mentions a job role, check Job Titles list
- If user mentions a person's name, check People Names list
- Be case-insensitive when matching
- Include synonyms and variations (e.g., "ML" matches "machine learning")

DO NOT include:
- Common verbs (has, know, works, looking for)
- Filler words (someone, anyone, who, should)
- Words that don't exist anywhere in the database AND aren't specific search terms

Return ONLY a JSON array of lowercase keywords that should be used for searching.
Example: ["theater", "bangalore", "python"]

If no valid keywords found or query is too vague, return: []

Return ONLY the JSON array. No markdown, no explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Clean up the response
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const keywords = JSON.parse(cleanedResponse)

    return NextResponse.json({
      success: true,
      keywords: keywords.map(k => k.toLowerCase().trim())
    })
  } catch (error) {
    console.error('Error extracting search keywords:', error)
    return NextResponse.json(
      { error: 'Failed to extract keywords: ' + error.message },
      { status: 500 }
    )
  }
}
