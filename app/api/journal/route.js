import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractKeywords } from '@/lib/gemini'
import { mergeKeywords } from '@/lib/keywords'

// GET - Fetch all journals for the user
export async function GET(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: journals, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching journals:', error)
      return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 })
    }

    return NextResponse.json({ journals })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new journal entry
export async function POST(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Extract keywords from journal content
    const extractedKeywords = await extractKeywords(content, 'journal')

    // Save journal entry
    const { data: journal, error: journalError } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        title,
        content,
        extracted_keywords: extractedKeywords,
      })
      .select()
      .single()

    if (journalError) {
      console.error('Error saving journal:', journalError)
      return NextResponse.json({ error: 'Failed to save journal' }, { status: 500 })
    }

    // Update user's keyword profile with new keywords
    const { data: existingProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      const mergedKeywords = mergeKeywords(
        existingProfile.keywords || [],
        extractedKeywords
      )

      await supabase
        .from('keyword_profiles')
        .update({
          keywords: mergedKeywords,
          total_keywords: mergedKeywords.length,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      journal,
      extractedKeywords,
    })
  } catch (error) {
    console.error('Error creating journal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a journal entry
export async function DELETE(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get('id')

    if (!journalId) {
      return NextResponse.json({ error: 'Journal ID is required' }, { status: 400 })
    }

    // Get the journal entry to retrieve its keywords
    const { data: journal, error: fetchError } = await supabase
      .from('journals')
      .select('extracted_keywords')
      .eq('id', journalId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !journal) {
      return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    // Delete the journal entry
    const { error: deleteError } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting journal:', deleteError)
      return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 })
    }

    // Remove journal keywords from user's keyword profile
    if (journal.extracted_keywords && journal.extracted_keywords.length > 0) {
      const { data: existingProfile } = await supabase
        .from('keyword_profiles')
        .select('keywords')
        .eq('user_id', user.id)
        .single()

      if (existingProfile && existingProfile.keywords) {
        // Create a map of keywords from the journal entry
        const journalKeywordMap = new Map(
          journal.extracted_keywords.map(kw => [kw.keyword.toLowerCase(), kw])
        )

        // Filter out keywords that came only from this journal entry
        const updatedKeywords = existingProfile.keywords.filter(kw => {
          const journalKw = journalKeywordMap.get(kw.keyword.toLowerCase())

          // Keep keyword if it's not from journal at all
          if (!journalKw) return true

          // Keep keyword if it has sources other than journal
          if (kw.sources && kw.sources.length > 1) {
            // Remove 'journal' from sources
            return true
          }

          // Remove keyword if it only came from journal
          if (kw.sources && kw.sources.length === 1 && kw.sources[0] === 'journal') {
            return false
          }

          return true
        }).map(kw => {
          // For keywords with multiple sources, remove 'journal' from sources
          if (kw.sources && kw.sources.includes('journal')) {
            return {
              ...kw,
              sources: kw.sources.filter(s => s !== 'journal')
            }
          }
          return kw
        })

        // Update the keyword profile
        await supabase
          .from('keyword_profiles')
          .update({
            keywords: updatedKeywords,
            total_keywords: updatedKeywords.length,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
