const SUPABASE_URL = 'https://zqfvtgmdpbhhiqluehuh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LkRDy3q61L79QaCRdWXqxA_fTuMm7sx';

let _supabaseClient = null;

function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('[Supabase] SDK not loaded. Include the Supabase CDN script before js/supabase.js.');
    return null;
  }

  try {
    _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    console.log('[Supabase] Client initialized successfully.');
    return _supabaseClient;
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

const supabaseClient = getSupabaseClient();

(async function testSupabaseConnection() {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient
      .from('health')
      .select('*', { count: 'exact', head: true });

    if (error && error.code === 'PGRST116') {
      console.log('[Supabase] Connection verified.');
    } else if (error) {
      console.warn('[Supabase] Connected but:', error.message);
    } else {
      console.log('[Supabase] Connection verified.');
    }
  } catch (err) {
    console.error('[Supabase] Connection failed - cannot reach Supabase servers.');
  }
})();
