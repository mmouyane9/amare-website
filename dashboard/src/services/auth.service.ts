import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResult<T = void> {
  data: T
  error: AuthError | null
}

export interface SignInResult {
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}

export interface SessionResult {
  data: {
    session: Session | null
  }
  error: AuthError | null
}

export interface UserResult {
  data: {
    user: User | null
  }
  error: AuthError | null
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("Email:", email);
  console.log("Password length:", password.length);
  console.log("Supabase response:", data);
  console.log("Supabase error:", error);

  if (error) {
    console.log("error.message:", error.message);
    console.log("error.status:", error.status);
    console.log("error.code:", error.code);
    console.log("complete error object:", JSON.stringify(error, null, 2));
  }

  return {
    data: {
      user: data.user,
      session: data.session,
    },
    error,
  }
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()
  return { data: undefined, error }
}

export async function getSession(): Promise<SessionResult> {
  const { data, error } = await supabase.auth.getSession()
  return { data, error }
}

export async function getCurrentUser(): Promise<UserResult> {
  const { data, error } = await supabase.auth.getUser()
  return { data, error }
}
