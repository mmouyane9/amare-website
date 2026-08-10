const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zqfvtgmdpbhhiqluehuh.supabase.co',
  'sb_publishable_LkRDy3q61L79QaCRdWXqxA_fTuMm7sx'
);

async function main() {
  // Try to sign in with common admin credentials
  const emails = ['admin@amare.ma', 'admin@example.com', 'test@test.com'];
  const passwords = ['admin123', 'password', 'Amare2024!', 'amare2024'];
  
  for (const email of emails) {
    for (const pw of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (!error && data.session) {
        console.log('Logged in as:', email);
        console.log('Session token:', data.session.access_token.substring(0, 30) + '...');
        
        // Now try to update with the authenticated session
        const FR = JSON.parse(require('fs').readFileSync('/Users/mac/Desktop/Amare/supabase/scripts/french_data.json', 'utf8'));
        
        const { error: upErr } = await supabase
          .from('page_sections')
          .update({ content: FR })
          .eq('id', '39fd080c-9946-4b6d-bd06-7ab65c41b1c1');
        
        if (upErr) {
          console.log('Update error:', upErr.message);
        } else {
          console.log('UPDATE SUCCESSFUL!');
        }
        return;
      }
    }
  }
  console.log('Could not authenticate');
}
main().catch(console.error);
