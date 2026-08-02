/* ==========================================================================
   Supabase — Storage
   --------------------------------------------------------------------------
   Generic storage helpers built on the shared Supabase client. Bucket-aware,
   table-agnostic. Concrete upload flows (membership documents, avatars, ...)
   will be built on top of this module.

   Usage:
     Supabase.storage.upload('profile-photos', 'a/b.png', file)
     Supabase.storage.download('profile-photos', 'a/b.png')
     Supabase.storage.remove('profile-photos', ['a/b.png'])
     Supabase.storage.publicUrl('profile-photos', 'a/b.png')
     Supabase.storage.bucket('profile-photos')   // raw storage bucket API
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = (window.Supabase = window.Supabase || {});

  function resolveClient() {
    var client = Supabase.getClient ? Supabase.getClient() : Supabase.client;
    if (!client) {
      throw new Error('Supabase client is not initialised');
    }
    return client;
  }

  function bucket(name) {
    return resolveClient().storage.from(name);
  }

  function upload(bucketName, path, file, options) {
    return bucket(bucketName).upload(path, file, options || {});
  }

  function download(bucketName, path) {
    return bucket(bucketName).download(path);
  }

  function remove(bucketName, paths) {
    return bucket(bucketName).remove(paths);
  }

  function publicUrl(bucketName, path) {
    return bucket(bucketName).getPublicUrl(path);
  }

  Supabase.storage = {
    bucket: bucket,
    upload: upload,
    download: download,
    remove: remove,
    publicUrl: publicUrl,
  };
})(window);
