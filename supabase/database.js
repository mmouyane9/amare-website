/* ==========================================================================
   Supabase — Database
   --------------------------------------------------------------------------
   Generic, table-agnostic database helpers built on the shared Supabase
   client. No table is assumed and no business logic lives here; concrete
   data services will be built on top of this module in a future feature
   layer.

   Usage:
     Supabase.db.from('members')
     Supabase.db.select('members', 'id, first_name')
     Supabase.db.select('members', '*', { count: 'exact' })
     Supabase.db.insert('members', [{ ... }, { ... }])
     Supabase.db.update('members', { status: 'approved' }, { id: 1 })
     Supabase.db.remove('members', { id: 1 })
     Supabase.db.rpc('register_member', { payload: { ... } })
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

  function from(table) {
    return resolveClient().from(table);
  }

  function select(table, columns, options, orderBy) {
    var query = from(table).select(columns || '*', options || {});
    if (orderBy && orderBy.column) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending !== false,
      });
    }
    return query;
  }

  function insert(table, rows) {
    return from(table).insert(rows);
  }

  function update(table, values, match) {
    return applyMatch(from(table).update(values), match);
  }

  function remove(table, match) {
    return applyMatch(from(table).delete(), match);
  }

  function rpc(fn, args) {
    return resolveClient().rpc(fn, args);
  }

  function applyMatch(query, match) {
    if (match && typeof match === 'object') {
      Object.keys(match).forEach(function (key) {
        query = query.eq(key, match[key]);
      });
    }
    return query;
  }

  Supabase.db = {
    from: from,
    select: select,
    insert: insert,
    update: update,
    remove: remove,
    rpc: rpc,
  };
})(window);
