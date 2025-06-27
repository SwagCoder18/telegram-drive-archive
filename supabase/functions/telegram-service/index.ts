
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get user's Telegram config
    const { data: profile } = await supabase
      .from('profiles')
      .select('bot_token, channel_id')
      .eq('id', user.id)
      .single()

    if (!profile?.bot_token || !profile?.channel_id) {
      throw new Error('Telegram configuration not found')
    }

    const { action, fileData, fileName, fileId } = await req.json()

    switch (action) {
      case 'upload':
        return await handleUpload(profile.bot_token, profile.channel_id, fileData, fileName, user.id, supabase)
      case 'download':
        return await handleDownload(profile.bot_token, fileId)
      case 'delete':
        return await handleDelete(profile.bot_token, profile.channel_id, fileId, user.id, supabase)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in telegram-service:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleUpload(botToken: string, channelId: string, fileData: string, fileName: string, userId: string, supabase: any) {
  // Convert base64 to blob
  const base64Data = fileData.split(',')[1]
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  const formData = new FormData()
  formData.append('chat_id', channelId)
  formData.append('document', new File([bytes], fileName))
  formData.append('caption', `📁 ${fileName}`)

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()
  
  if (!result.ok) {
    throw new Error(`Telegram API error: ${result.description}`)
  }

  // Save file metadata to database
  const { data: fileRecord, error } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      name: fileName,
      size: bytes.length,
      type: fileName.split('.').pop() || 'unknown',
      mime_type: 'application/octet-stream',
      telegram_file_id: result.result.document.file_id,
      telegram_message_id: result.result.message_id,
      folder_path: '/',
      upload_status: 'completed'
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw new Error('Failed to save file metadata')
  }

  return new Response(
    JSON.stringify({ success: true, file: fileRecord }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDownload(botToken: string, fileId: string) {
  // Get file info from Telegram
  const fileInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
  const fileInfo = await fileInfoResponse.json()
  
  if (!fileInfo.ok) {
    throw new Error(`Failed to get file info: ${fileInfo.description}`)
  }
  
  // Download file from Telegram
  const fileResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`)
  const fileBlob = await fileResponse.blob()
  
  return new Response(fileBlob, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment'
    }
  })
}

async function handleDelete(botToken: string, channelId: string, messageId: number, userId: string, supabase: any) {
  // Delete message from Telegram
  const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: channelId,
      message_id: messageId
    })
  })

  const result = await response.json()
  
  if (!result.ok) {
    console.error('Failed to delete from Telegram:', result.description)
  }

  // Delete from database
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('telegram_message_id', messageId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to delete file record')
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
