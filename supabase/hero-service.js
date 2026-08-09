/* ==========================================================================
   Hero Service — fetches the live Hero Update from the hero_updates table.
   Returns the data transformed into the format expected by injectHero().

   Table: hero_updates  |  Bucket: hero-images

   Fallback: returns null — the caller falls back to the hardcoded default.
   ========================================================================== */

(function () {
  'use strict';

  /**
   * Transform raw hero_updates row → injectHero()-compatible object.
   * Splits the title by '\n': all but the last line become the heading,
   * the last line becomes the <span> subheading.
   */
  function transformCMSHero(row) {
    if (!row) return null;

    var lines = (row.title || '').split('\n');
    var subheading = '';
    if (lines.length > 1) {
      subheading = lines.pop();
    }
    var heading = lines.join('\n');

    return {
      heading: heading,
      subheading: subheading,
      eyebrow: row.banner_text || '',
      description: row.description || '',
      backgroundImage: row.image_url || '',
      buttons: [
        { label: row.button1_text || '', url: row.button1_url || '#', variant: 'primary' },
        { label: row.button2_text || '', url: row.button2_url || '#', variant: 'primary' },
        { label: row.button3_text || '', url: row.button3_url || '#', variant: 'outline' },
      ],
    };
  }

  /**
   * Fetch the live Hero from hero_updates.
   * Returns the transformed data object, or null on failure / no live hero.
   *
   * Selection rules:
   *   - status = 'live'
   *   - optional start_date / end_date window honoured when present
   *     (rows without a start/end date are always eligible)
   *   - the highest-priority (lowest display_order) live hero wins
   *
   * Backward compatible: if the table has no start_date/end_date columns yet,
   * rows simply have no scheduling constraint.
   */
  function loadHeroFromSupabase(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Hero Service] Supabase client not available after', MAX_RETRIES * RETRY_MS, 'ms');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Hero Service] Supabase client init failed after waiting');
        return callback(null);
      }

      client
        .from('hero_updates')
        .select('*')
        .eq('status', 'live')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(20)
        .then(function (result) {
          if (result.error || !result.data || result.data.length === 0) {
            return callback(null);
          }

          var now = new Date();
          var active = [];
          for (var i = 0; i < result.data.length; i++) {
            var row = result.data[i];
            var start = row.start_date ? new Date(row.start_date) : null;
            var end = row.end_date ? new Date(row.end_date) : null;
            if (start && now < start) continue;
            if (end && now > end) continue;
            active.push(row);
          }
          if (active.length === 0) return callback(null);

          return callback(transformCMSHero(active[0]));
        })
        .catch(function () {
          return callback(null);
        });
    }

    tryLoad(0);
  }

  /* Expose */
  window.__AMARE_HERO_SERVICE = {
    loadHeroFromSupabase: loadHeroFromSupabase,
    transformCMSHero: transformCMSHero,
  };
})();
