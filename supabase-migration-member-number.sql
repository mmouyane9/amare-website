-- ============================================================
-- Migration: Real sequential membership numbers
-- Format: AMARE-<CURRENT_YEAR>-000001 ... -999999, forever
--
-- Concurrency-safe: a single SECURITY INVOKER function holds an
-- advisory xact lock, computes MAX(sequence) for the current year,
-- increments it, inserts the row and returns it. Two near-simultaneous
-- registrations can never receive the same number because the second
-- call blocks on the advisory lock until the first transaction commits.
--
-- RLS stays enabled. anon still INSERTs via its existing policy;
-- the function runs with the caller's privileges (SECURITY INVOKER).
-- ============================================================

-- Drop-then-create for idempotent re-runs
DROP FUNCTION IF EXISTS public.register_member(JSONB);

CREATE OR REPLACE FUNCTION public.register_member(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_year TEXT := to_char(now(), 'YYYY');
  max_seq      BIGINT;
  next_seq     BIGINT;
  member_number TEXT;
  new_row      members%ROWTYPE;
BEGIN
  -- Serialize concurrent registrations (released at commit)
  PERFORM pg_advisory_xact_lock(hashtext('amare_member_numbering'));

  -- Highest existing sequence for the current year
  SELECT COALESCE(MAX(NULLIF(regexp_replace(member_number, '^AMARE-[0-9]{4}-', ''), '')::BIGINT), 0)
  INTO max_seq
  FROM members
  WHERE member_number LIKE 'AMARE-' || current_year || '-%';

  next_seq      := max_seq + 1;
  member_number := 'AMARE-' || current_year || '-' || lpad(next_seq::TEXT, 6, '0');

  INSERT INTO members (
    member_number,
    first_name,
    last_name,
    birth_date,
    birth_place,
    national_id,
    phone,
    email,
    address,
    declaration_accepted,
    profile_photo_url,
    national_id_front_url,
    national_id_back_url
  )
  VALUES (
    member_number,
    payload->>'first_name',
    payload->>'last_name',
    payload->>'birth_date',
    payload->>'birth_place',
    payload->>'national_id',
    payload->>'phone',
    payload->>'email',
    payload->>'address',
    COALESCE((payload->>'declaration_accepted')::BOOLEAN, false),
    payload->>'profile_photo_url',
    payload->>'national_id_front_url',
    payload->>'national_id_back_url'
  )
  RETURNING * INTO new_row;

  RETURN to_jsonb(new_row);
END;
$$;

-- anon may execute (registration runs with the anon key)
GRANT EXECUTE ON FUNCTION public.register_member(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.register_member(JSONB) TO authenticated;
