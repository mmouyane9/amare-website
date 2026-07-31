(function (window) {
    'use strict';

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

    window.MembershipDatabase = {
        saveMember
    };

})(window);