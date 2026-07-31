(function (window) {
    'use strict';

    var DB_COLUMNS = [
        'first_name',
        'last_name',
        'birth_date',
        'birth_place',
        'national_id',
        'phone',
        'email',
        'address',
        'declaration_accepted'
    ];

    async function saveMember(payload) {

        const { data, error } = await window.supabaseClient
            .from('members')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error(error);
            throw error;
        }

        console.log('Member Saved ✅', data);

        return data;

    }

    function submitMember() {
        var data = window.membershipData || {};
        var payload = {};
        DB_COLUMNS.forEach(function (column) {
            payload[column] = data[column];
        });
        return saveMember(payload).catch(function (err) {
            console.error('Member insert failed:', err);
            return null;
        });
    }

    window.MembershipDatabase = {
        saveMember,
        submitMember
    };

})(window);