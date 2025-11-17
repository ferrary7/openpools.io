import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Accept or reject collab request
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the collab to verify user is receiver
    const { data: collab, error: fetchError } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !collab) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    if (collab.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this collaboration' }, { status: 403 })
    }

    if (collab.status !== 'pending') {
      return NextResponse.json({ error: 'Collaboration already processed' }, { status: 400 })
    }

    // Update status
    const { data: updated, error: updateError } = await supabase
      .from('collaborations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        sender:sender_id(id, full_name, email),
        receiver:receiver_id(id, full_name, email)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      collab: updated,
      message: `Collaboration ${status}`
    })
  } catch (error) {
    console.error('Error updating collab:', error)
    return NextResponse.json(
      { error: 'Failed to update collab: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a collaboration
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    console.log('DELETE collab request - ID:', id, 'User:', user.id)

    // Get the collab to verify user is part of it
    const { data: collab, error: fetchError } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !collab) {
      console.error('Collab not found:', fetchError)
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    console.log('Found collab:', collab)

    // Verify user is either sender or receiver
    if (collab.sender_id !== user.id && collab.receiver_id !== user.id) {
      console.error('User not authorized:', { user: user.id, sender: collab.sender_id, receiver: collab.receiver_id })
      return NextResponse.json({ error: 'Not authorized to delete this collaboration' }, { status: 403 })
    }

    // Use service client for deletions (bypasses RLS after we've verified authorization)
    const serviceSupabase = createServiceClient()

    // Delete all messages between these two users (both directions)
    console.log('Deleting messages...')
    const { data: deletedMessages1, error: msg1Error, count: msgCount1 } = await serviceSupabase
      .from('messages')
      .delete({ count: 'exact' })
      .eq('sender_id', collab.sender_id)
      .eq('receiver_id', collab.receiver_id)

    if (msg1Error) {
      console.error('Error deleting messages (direction 1):', msg1Error)
    } else {
      console.log('Deleted messages (direction 1):', msgCount1)
    }

    const { data: deletedMessages2, error: msg2Error, count: msgCount2 } = await serviceSupabase
      .from('messages')
      .delete({ count: 'exact' })
      .eq('sender_id', collab.receiver_id)
      .eq('receiver_id', collab.sender_id)

    if (msg2Error) {
      console.error('Error deleting messages (direction 2):', msg2Error)
    } else {
      console.log('Deleted messages (direction 2):', msgCount2)
    }

    // Delete notifications related to this collaboration
    console.log('Deleting notifications...')
    const { data: deletedNotifs1, error: notif1Error, count: notifCount1 } = await serviceSupabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('user_id', collab.sender_id)
      .eq('related_user_id', collab.receiver_id)

    if (notif1Error) {
      console.error('Error deleting notifications (direction 1):', notif1Error)
    } else {
      console.log('Deleted notifications (direction 1):', notifCount1)
    }

    const { data: deletedNotifs2, error: notif2Error, count: notifCount2 } = await serviceSupabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('user_id', collab.receiver_id)
      .eq('related_user_id', collab.sender_id)

    if (notif2Error) {
      console.error('Error deleting notifications (direction 2):', notif2Error)
    } else {
      console.log('Deleted notifications (direction 2):', notifCount2)
    }

    // Delete the collaboration
    console.log('Deleting collaboration...')
    const { data: deletedCollab, error: deleteError, count } = await serviceSupabase
      .from('collaborations')
      .delete({ count: 'exact' })
      .eq('id', id)
      .select()

    if (deleteError) {
      console.error('Error deleting collaboration:', deleteError)
      return NextResponse.json({
        error: 'Failed to delete collaboration: ' + deleteError.message,
        details: deleteError
      }, { status: 500 })
    }

    console.log('Collaboration deleted successfully:', { deletedCollab, count, deletedCount: deletedCollab?.length })

    return NextResponse.json({
      success: true,
      message: 'Collaboration removed successfully'
    })
  } catch (error) {
    console.error('Error deleting collab:', error)
    return NextResponse.json(
      { error: 'Failed to delete collab: ' + error.message },
      { status: 500 }
    )
  }
}
