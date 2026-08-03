/* ==========================================================================
   renewal-database.js — Supabase persistence for renewal requests
   Inserts ONLY into the dedicated membership_renewals table. The `members`
   table, registration workflow, OTP and storage are never touched.
   Reuses the shared Supabase.db helpers (supabase/database.js).
   Exposes: MembershipRenewal.Database
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipRenewal = root.MembershipRenewal || {};

  var TABLE = 'membership_renewals';

  function getDb() {
    if (
      root.Supabase &&
      root.Supabase.db &&
      typeof root.Supabase.db.insert === 'function'
    ) {
      return root.Supabase.db;
    }
    return null;
  }

  function submitRenewalRequest(data) {
    var db = getDb();
    if (!db) {
      return Promise.reject(new Error('Supabase client is not initialised'));
    }

    return Promise.resolve(
      db.insert(TABLE, {
        first_name: data.first_name,
        last_name: data.last_name,
        membership_number: data.membership_number,
        status: 'pending'
      })
    ).then(function (res) {
      if (res.error) throw res.error;
      return res.data;
    });
  }

  app.Database = {
    table: TABLE,
    submitRenewalRequest: submitRenewalRequest
  };
})(typeof window !== 'undefined' ? window : this);
