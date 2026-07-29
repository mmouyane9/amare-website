async function saveMembership(data) {
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;

  if (client) {
    try {
      const { data: result, error } = await client
        .from('members')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          birth_date: data.birthDate,
          birth_place: data.birthPlace,
          cin: data.cin,
          phone: data.phone,
          email: data.email,
          address: data.address,
          photo_base64: data.photoBase64,
          signature_member: data.sigMemberDataUrl,
          signature_president: data.sigPresidentDataUrl,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      return { data: Array.isArray(result) ? result[0] : result, error: null };
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'))) {
        return fallbackSave(data);
      }
      return { data: null, error: err };
    }
  }

  return fallbackSave(data);
}

function fallbackSave(data) {
  const saved = localStorage.getItem('amare_memberships') || '[]';
  let memberships = [];
  try { memberships = JSON.parse(saved); } catch(e) {}
  const record = { ...data, id: Date.now(), created_at: new Date().toISOString() };
  memberships.push(record);
  localStorage.setItem('amare_memberships', JSON.stringify(memberships));
  return { data: { id: record.id }, error: null };
}
