import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function extractKeywords(text, source = 'resume') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are an expert professional profile analyzer. Extract comprehensive structured data from the following text.

Extract and return a JSON object with these categories:

{
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "companies": ["company1", "company2"],
  "institutions": ["institution1", "institution2"],
  "roles": ["role1", "role2"],
  "projects": ["project1", "project2"],
  "interests": ["interest1", "interest2"],
  "certifications": ["cert1", "cert2"],
  "links": ["url1", "url2"]
}

EXTRACTION RULES:
- skills: Professional abilities (e.g., "leadership", "data analysis", "public speaking")
- technologies: Tools, languages, frameworks (e.g., "React", "Python", "Docker", "AWS")
- companies: Company names where person worked (e.g., "Google", "Microsoft", "Startup Inc")
- institutions: Schools, universities, bootcamps (e.g., "Stanford", "MIT", "Coursera")
- roles: Job titles or positions (e.g., "Software Engineer", "Product Manager", "CEO")
- projects: Project names or descriptions (e.g., "E-commerce Platform", "Mobile App")
- interests: Professional interests/domains (e.g., "machine learning", "UI/UX", "blockchain")
- certifications: Certificates, degrees (e.g., "AWS Certified", "MBA", "B.S. Computer Science")
- links: URLs found in the text (GitHub, portfolio, LinkedIn, etc.)

IMPORTANT:
- Extract ONLY what is explicitly mentioned
- Use lowercase for consistency
- Keep multi-word phrases together (e.g., "machine learning", "product management")
- NO generic words or filler
- If a category has nothing, return empty array []

Text to analyze:

${text}

Return ONLY the JSON object. No markdown, no explanation.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Clean up the response
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const extracted = JSON.parse(cleanedResponse)

    // Convert to keyword format with metadata
    const keywords = []
    const categories = ['skills', 'technologies', 'companies', 'institutions', 'roles', 'projects', 'interests', 'certifications', 'links']

    categories.forEach(category => {
      if (extracted[category] && Array.isArray(extracted[category])) {
        extracted[category].forEach(item => {
          keywords.push({
            keyword: item.toLowerCase().trim(),
            category: category,
            weight: source === 'resume' ? 1.0 : source === 'linkedin' ? 0.9 : 0.7,
            source: source
          })
        })
      }
    })

    return keywords
  } catch (error) {
    console.error('Error extracting keywords with Gemini:', error)
    throw new Error('Failed to extract keywords: ' + error.message)
  }
}

export async function extractKeywordsFromMultipleSources(sources) {
  const allKeywords = []
  const keywordMap = new Map()

  for (const { text, source } of sources) {
    if (!text || text.trim().length === 0) continue

    const keywords = await extractKeywords(text, source)
    allKeywords.push(...keywords)
  }

  // Merge keywords and combine weights
  allKeywords.forEach(({ keyword, weight, source, category }) => {
    if (keywordMap.has(keyword)) {
      const existing = keywordMap.get(keyword)
      existing.weight = Math.max(existing.weight, weight)
      if (!existing.sources.includes(source)) {
        existing.sources.push(source)
      }
      // Keep the most specific category
      if (!existing.category) {
        existing.category = category
      }
    } else {
      keywordMap.set(keyword, {
        keyword,
        category,
        weight,
        sources: [source]
      })
    }
  })

  return Array.from(keywordMap.values())
}
