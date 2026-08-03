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
        'declaration_accepted',
        'profile_photo_url',
        'national_id_front_url',
        'national_id_back_url'
    ];

    var UPLOAD_ORDER = [
        { id: 'msPhoto',    field: 'profile_photo_url',     step: 7 },
        { id: 'msCinFront', field: 'national_id_front_url', step: 8 },
        { id: 'msCinBack',  field: 'national_id_back_url',  step: 9 }
    ];

    function saveMember(payload) {
        var client = window.supabaseClient;
        if (!client || typeof client.rpc !== 'function') {
            console.error('[Membership][STEP 11] FATAL: window.supabaseClient is not initialised ' +
                '(did config.js run? is the @supabase/supabase-js CDN script loaded before config.js?).');
            return Promise.reject(new Error('Supabase client is not initialised'));
        }
        console.log('[Membership][STEP 11] supabase.rpc("register_member", { payload }) with payload:');
        console.log('[Membership][STEP 11]', payload);
        return Promise.resolve(client.rpc('register_member', { payload: payload })).then(function (res) {
            console.log('[Membership][STEP 12] rpc response received. error =', res.error, ', data =', res.data);
            if (res.error) {
                console.error('[Membership][STEP 12] INSERT FAILED. Supabase error:', res.error);
                if (res.error.code === '23505' && payload.national_id) {
                    console.warn('[Membership][STEP 12] Duplicate national_id. Returning existing member.');
                    return Promise.resolve(
                        client.from('members').select('*').eq('national_id', payload.national_id).maybeSingle()
                    ).then(function (lookup) {
                        if (lookup.error) {
                            console.error('[Membership][STEP 12] Lookup of existing member failed:', lookup.error);
                            throw lookup.error;
                        }
                        if (lookup.data) {
                            console.log('[Membership][STEP 12] Existing member returned. member id =', lookup.data.id,
                                ', member_number =', lookup.data.member_number);
                            return lookup.data;
                        }
                        throw res.error;
                    });
                }
                throw res.error;
            }
            console.log('[Membership][STEP 12] INSERT OK. member id =', res.data ? res.data.id : '?',
                ', member_number =', res.data && res.data.member_number ? res.data.member_number : '?');
            return res.data;
        });
    }

    function buildPayload(data) {
        var payload = {};
        DB_COLUMNS.forEach(function (column) {
            payload[column] = data[column];
        });
        console.log('[Membership][STEP 10] insert payload prepared:', payload);
        return payload;
    }

    function uploadSequential(app) {
        var chain = Promise.resolve();
        var paths = {};

        console.log('[Membership][STEP 6] uploadSequential() started');

        UPLOAD_ORDER.forEach(function (item) {
            chain = chain.then(function () {
                console.log('[Membership][STEP ' + item.step + '] uploading ' + item.id + ' ...');
                return Promise.resolve(app.Upload.uploadFile(item.id)).then(function (storagePath) {
                    paths[item.field] = storagePath;
                    console.log('[Membership][STEP ' + item.step + '] ' + item.id + ' uploaded -> storage path: ' + storagePath);
                    return storagePath;
                });
            });
        });

        return chain.then(function () {
            console.log('[Membership][STEP 6] uploadSequential() finished. storage paths =', paths);
            return paths;
        });
    }

    function registerMember() {
        var app = window.MembershipForm;
        var data = window.membershipData || {};

        console.log('[Membership][STEP 5] registerMember() entered');

        if (app && app.Validation) {
            console.log('[Membership][STEP 3] validate(): step 1');
            if (!app.Validation.validateStep(1)) {
                console.error('[Membership][STEP 3] validate(): step 1 INVALID -> registration aborted.');
                return Promise.reject(new Error('Step 1 validation failed'));
            }
            console.log('[Membership][STEP 3] validate(): step 2');
            if (!app.Validation.validateStep(2)) {
                console.error('[Membership][STEP 3] validate(): step 2 INVALID -> registration aborted.');
                return Promise.reject(new Error('Step 2 validation failed'));
            }
            console.log('[Membership][STEP 3] validate(): OK');
        } else {
            console.log('[Membership][STEP 3] validate(): app.Validation not available, skipping re-validation.');
        }

        if (!app || !app.Upload || typeof app.Upload.uploadFile !== 'function') {
            console.error('[Membership][STEP 5] FATAL: Upload module missing ' +
                '(app.Upload.uploadFile is not a function). Nothing was uploaded or inserted.');
            return Promise.reject(new Error('Upload module is not initialised'));
        }

        return uploadSequential(app)
            .then(function (paths) {
                data.profile_photo_url = paths.profile_photo_url;
                data.national_id_front_url = paths.national_id_front_url;
                data.national_id_back_url = paths.national_id_back_url;
                return saveMember(buildPayload(data)).catch(function (err) {
                    console.error('[Membership] registerMember() FAILED:', err && err.message ? err.message : err);
                    if (app && app.Upload && typeof app.Upload.cleanupUploaded === 'function') {
                        return Promise.resolve(app.Upload.cleanupUploaded()).then(
                            function () {
                                console.log('[Membership] Cleaned up uploaded files.');
                                throw err;
                            },
                            function () {
                                console.error('[Membership] Cleanup of uploaded files failed.');
                                throw err;
                            }
                        );
                    }
                    throw err;
                });
            })
            .catch(function (err) {
                console.error('[Membership] registerMember() FAILED:', err && err.message ? err.message : err);
                throw err;
            });
    }

    window.MembershipDatabase = {
        saveMember: saveMember,
        registerMember: registerMember
    };

    console.log('[Membership] database.js loaded. window.MembershipDatabase =', Object.keys(window.MembershipDatabase).join(', '));

})(window);
