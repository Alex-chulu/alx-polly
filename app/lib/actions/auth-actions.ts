'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

export async function login(data: LoginFormData) {
  /**
   * Handles user login by authenticating with Supabase.
   *
   * @param data - An object containing user login credentials (email and password).
   * @returns A Promise that resolves to an object with an `error` property.
   *          If authentication is successful, `error` will be `null`.
   *          If an error occurs, `error` will contain the error message.
   */
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  /**
   * Handles user registration by creating a new user in Supabase.
   *
   * @param data - An object containing user registration details (name, email, and password).
   * @returns A Promise that resolves to an object with an `error` property.
   *          If registration is successful, `error` will be `null`.
   *          If an error occurs, `error` will contain the error message.
   */
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Success: no error
  return { error: null };
}

export async function logout() {
  /**
   * Handles user logout by signing out from Supabase.
   *
   * @returns A Promise that resolves to an object with an `error` property.
   *          If logout is successful, `error` will be `null`.
   *          If an error occurs, `error` will contain the error message.
   */
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getCurrentUser() {
  /**
   * Retrieves the currently authenticated user's information from Supabase.
   *
   * @returns A Promise that resolves to the user object if authenticated, otherwise `null`.
   */
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  /**
   * Retrieves the current user session from Supabase.
   *
   * @returns A Promise that resolves to the session object if a session exists, otherwise `null`.
   */
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
