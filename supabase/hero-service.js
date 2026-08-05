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
   */
  function loadHeroFromSupabase(callback) {
    var S = window.Supabase;
    if (!S || !S.getClient) return callback(null);

    var client = S.getClient();
    if (!client) return callback(null);

    client
      .from('hero_updates')
      .select('*')
      .eq('status', 'live')
      .limit(1)
      .single()
      .then(function (result) {
        if (result.error) return callback(null);
        var hero = transformCMSHero(result.data);
        return callback(hero);
      })
      .catch(function () {
        return callback(null);
      });
  }

  /* Expose */
  window.__AMARE_HERO_SERVICE = {
    loadHeroFromSupabase: loadHeroFromSupabase,
    transformCMSHero: transformCMSHero,
  };
})();
