"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// CREATE POLL
export async function createPoll(formData: FormData) {
  /**
   * Creates a new poll in the database.
   *
   * @param formData - A FormData object containing the poll question and options.
   *                    Expected fields: `question` (string) and `options` (array of strings).
   * @returns A Promise that resolves to an object with an `error` property.
   *          If the poll is created successfully, `error` will be `null`.
   *          If an error occurs (e.g., missing fields, unauthenticated user), `error` will contain the error message.
   */
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  /**
   * Retrieves all polls created by the currently authenticated user.
   *
   * @returns A Promise that resolves to an object with `polls` and `error` properties.
   *          `polls` will be an array of poll objects if successful, otherwise an empty array.
   *          `error` will be `null` on success, or an error message if authentication fails or a database error occurs.
   */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  /**
   * Retrieves a single poll by its ID.
   *
   * @param id - The unique identifier of the poll.
   * @returns A Promise that resolves to an object with `poll` and `error` properties.
   *          `poll` will be the poll object if found, otherwise `null`.
   *          `error` will be `null` on success, or an error message if the poll is not found or a database error occurs.
   */
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  /**
   * Records a user's vote for a specific poll option.
   *
   * @param pollId - The ID of the poll being voted on.
   * @param optionIndex - The index of the chosen option (0-based).
   * @returns A Promise that resolves to an object with an `error` property.
   *          If the vote is submitted successfully, `error` will be `null`.
   *          If an error occurs (e.g., database error), `error` will contain the error message.
   */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optionally require login to vote
  // if (!user) return { error: 'You must be logged in to vote.' };

  // Prevent authenticated users from voting multiple times on the same poll
  if (user) {
    const { data: existingVote, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return { error: "You have already voted on this poll." };
    }
    if (voteError && voteError.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected for no prior vote
      return { error: voteError.message };
    }
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  /**
   * Deletes a poll by its ID.
   *
   * @param id - The unique identifier of the poll to delete.
   * @returns A Promise that resolves to an object with an `error` property.
   *          If the poll is deleted successfully, `error` will be `null`.
   *          If an error occurs, `error` will contain the error message.
   */
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Fetch the poll to verify ownership or admin status
  const { data: poll, error: fetchError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !poll) {
    return { error: "Poll not found or you don't have permission to delete it." };
  }

  // Check if the current user is the owner of the poll
  if (poll.user_id !== user.id) {
    // Additionally, check if the user is an administrator
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return { error: "You are not authorized to delete this poll." };
    }
  }

  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  /**
   * Updates an existing poll with new question and options.
   *
   * @param pollId - The ID of the poll to update.
   * @param formData - A FormData object containing the updated poll question and options.
   *                    Expected fields: `question` (string) and `options` (array of strings).
   * @returns A Promise that resolves to an object with an `error` property.
   *          If the poll is updated successfully, `error` will be `null`.
   *          If an error occurs (e.g., missing fields, unauthenticated user, unauthorized update), `error` will contain the error message.
   */
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Fetch the poll to verify ownership or admin status
  const { data: poll, error: fetchError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", pollId)
    .single();

  if (fetchError || !poll) {
    return { error: "Poll not found or you don't have permission to update it." };
  }

  // Check if the current user is the owner of the poll
  let isOwner = poll.user_id === user.id;
  let isAdmin = false;

  // If not the owner, check for admin role
  if (!isOwner) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profileError && profile?.role === 'admin') {
      isAdmin = true;
    }
  }

  if (!isOwner && !isAdmin) {
    return { error: "You are not authorized to update this poll." };
  }

  let updateQuery = supabase.from("polls").update({ question, options }).eq("id", pollId);

  // If the user is not an admin, ensure they can only update their own polls
  if (!isAdmin) {
    updateQuery = updateQuery.eq("user_id", user.id);
  }

  const { error } = await updateQuery;

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
