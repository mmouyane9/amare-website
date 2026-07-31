const SUPABASE_URL = 'https://zqfvtgmdpbhhiqluehuh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LkRDy3q61L79QaCRdWXqxA_fTuMm7sx';

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
console.log('Supabase Connected:', window.supabaseClient);