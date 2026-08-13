// Supabase Edge Function: admin-management
// -------------------------------------------------------------
// Secure administrator management for the AMARE dashboard.
//
// Actions:
//   - create_admin  -> creates an Auth user (auto-confirmed) + profile
//   - delete_admin  -> deletes an Auth user (profile cascades) + profile
//
// Security:
//   - The SERVICE ROLE KEY lives ONLY in the Edge Function environment
//     (Deno.env). It is never exposed to the browser.
//   - The caller must present a valid user access token.
//   - The caller must be a super_admin (verified server-side from the
//     profiles table, the single source of truth for roles).
//   - All responses are Arabic user-facing messages; technical errors are
//     logged to the function console only.
// -------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_ROLES = ['super_admin', 'admin']

interface RequestBody {
  action?: string
  email?: string
  password?: string
  full_name?: string
  role?: string
  id?: string
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return json({ success: false, message: 'الطريقة غير مدعومة' }, 405)
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null
    const action = body?.action

    // ---- Verify the caller's session --------------------------------
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null

    if (!token) {
      return json(
        { success: false, message: 'يجب تسجيل الدخول للوصول إلى هذه الخدمة' },
        401,
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return json({ success: false, message: 'خطأ في إعدادات الخادم' }, 500)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: callerData, error: callerError } =
      await adminClient.auth.getUser(token)

    if (callerError || !callerData?.user) {
      return json(
        { success: false, message: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى' },
        401,
      )
    }

    const callerId = callerData.user.id

    // ---- Verify the caller is authorized (super_admin) ---------------
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .maybeSingle()

    if (callerProfile?.role !== 'super_admin') {
      return json(
        { success: false, message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' },
        403,
      )
    }

    switch (action) {
      case 'create_admin':
        return await createAdmin(adminClient, body)
      case 'delete_admin':
        return await deleteAdmin(adminClient, callerId, body)
      default:
        return json({ success: false, message: 'إجراء غير معروف' }, 400)
    }
  } catch (err) {
    console.error('admin-management error:', err)
    return json({ success: false, message: 'حدث خطأ غير متوقع' }, 500)
  }
})

async function createAdmin(
  adminClient: ReturnType<typeof createClient>,
  body: RequestBody | null,
): Promise<Response> {
  const email = (body?.email ?? '').trim().toLowerCase()
  const password = body?.password ?? ''
  const fullName = (body?.full_name ?? '').trim()
  const role = body?.role ?? 'admin'

  // ---- Validate input ------------------------------------------------
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return json({ success: false, message: 'البريد الإلكتروني غير صالح' }, 400)
  }
  if (typeof password !== 'string' || password.length < 6) {
    return json(
      { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
      400,
    )
  }
  if (!fullName) {
    return json({ success: false, message: 'الاسم الكامل مطلوب' }, 400)
  }
  if (!ALLOWED_ROLES.includes(role)) {
    return json({ success: false, message: 'الدور غير صالح' }, 400)
  }

  // ---- Create the Auth user (auto-confirmed) -------------------------
  // email_confirm: true -> email_confirmed_at is set, so the new
  // administrator can log in immediately (no "Email not confirmed").
  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

  if (createError) {
    console.error('createUser error:', createError)
    const message = createError.message.toLowerCase()
    if (
      createError.code === 'user_already_exists' ||
      message.includes('already been registered')
    ) {
      return json(
        { success: false, message: 'هذا البريد الإلكتروني مستخدم بالفعل' },
        409,
      )
    }
    return json({ success: false, message: 'فشل إنشاء المسؤول' }, 400)
  }

  if (!created?.user) {
    return json({ success: false, message: 'فشل إنشاء المسؤول' }, 500)
  }

  const userId = created.user.id

  // ---- Create/update the profile -------------------------------------
  // handle_new_user() already created a 'member' profile via trigger;
  // upsert on the Auth user id keeps the operation idempotent and stores
  // the selected role. No duplicate-auth-user, no 409 on id conflict.
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .upsert(
      { id: userId, email, full_name: fullName, role },
      { onConflict: 'id' },
    )
    .select('id, full_name, email, role, created_at, updated_at')
    .single()

  if (profileError) {
    // Roll back so an orphan Auth user is not left behind.
    console.error('profile upsert error:', profileError)
    await adminClient.auth.admin.deleteUser(userId)
    return json({ success: false, message: 'فشل إنشاء المسؤول' }, 500)
  }

  return json(
    { success: true, message: 'تم إنشاء المسؤول بنجاح', data: profile },
    200,
  )
}

async function deleteAdmin(
  adminClient: ReturnType<typeof createClient>,
  callerId: string,
  body: RequestBody | null,
): Promise<Response> {
  const targetId = (body?.id ?? '').trim()

  if (!isUuid(targetId)) {
    return json({ success: false, message: 'معرف المسؤول غير صالح' }, 400)
  }

  if (targetId === callerId) {
    return json(
      { success: false, message: 'لا يمكنك حذف حسابك الحالي' },
      400,
    )
  }

  // Deleting the Auth user removes the profile automatically via the
  // profiles.id -> auth.users.id ON DELETE CASCADE. Other tables that
  // reference auth.users use ON DELETE SET NULL, handled by the DB.
  const { error } = await adminClient.auth.admin.deleteUser(targetId)

  if (error) {
    console.error('deleteUser error:', error)
    const message = error.message.toLowerCase()
    if (
      error.status === 404 ||
      message.includes('not found') ||
      message.includes('already deleted')
    ) {
      // Idempotent: the user is already gone; clean the profile too.
      await adminClient.from('profiles').delete().eq('id', targetId)
      return json(
        { success: true, message: 'تم حذف المسؤول بنجاح' },
        200,
      )
    }
    return json({ success: false, message: 'فشل حذف المسؤول' }, 400)
  }

  // Safety net: ensure the profile row is gone even if the cascade was
  // missing in some environment. No-op under normal conditions.
  await adminClient.from('profiles').delete().eq('id', targetId)

  return json({ success: true, message: 'تم حذف المسؤول بنجاح' }, 200)
}
