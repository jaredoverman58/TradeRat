-- Migration 029: Fix create_free_evaluation_for_new_user to also create public.users row
--
-- Problem: Migration 006 replaced the on_auth_user_created trigger function,
-- but the new function forgot to insert into public.users (id, email).
-- This broke every signup after migration 006 - users get rows in auth.users,
-- free_evaluations, and user_roles, but NOT in public.users.
--
-- Fix: Update the trigger function to restore the public.users insert
-- alongside the existing free_evaluations and user_roles inserts.

CREATE OR REPLACE FUNCTION create_free_evaluation_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create the public.users row (this was missing!)
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- Create free evaluation (existing, kept)
  INSERT INTO free_evaluations (user_id, used, activated_at)
  VALUES (NEW.id, false, NOW());

  -- Create user role (existing, kept)
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger already exists from migration 006, but listing it here for clarity
-- (CREATE OR REPLACE FUNCTION above updates the function the trigger calls)
--
-- The trigger: on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_free_evaluation_for_new_user();
