/* ==========================================================================
   Supabase — Real-time (future use)
   --------------------------------------------------------------------------
   Scaffold only — no channels are opened automatically. Subscription
   helpers for live data (chats, presence, live tables, ...) will be built
   on top of this module.

   Usage (once realtime features are added):
     var channel = Supabase.realtime.channel('my-channel');
     channel.on('postgres_changes', { event: 'INSERT', schema: 'public' }, cb)
            .subscribe();
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = (window.Supabase = window.Supabase || {});

  Supabase.realtime = {
    channel: function (name) {
      var client = Supabase.getClient ? Supabase.getClient() : Supabase.client;
      if (!client) {
        console.error('[Supabase] Real-time: client not initialised.');
        return null;
      }
      return client.channel(name);
    },
  };
})(window);
