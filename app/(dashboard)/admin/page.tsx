"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/lib/context/auth-context"; // Import useAuth
import { redirect } from "next/navigation"; // Import redirect

interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

export default function AdminPage() {
  /**
   * `AdminPage` is a React functional component that serves as an administrative panel
   * for viewing and managing all polls in the system. It fetches all polls from the database
   * and provides functionality to delete individual polls.
   *
   * State management:
   * - `polls`: Stores the list of all poll objects fetched from the database.
   * - `loading`: A boolean indicating whether the polls are currently being loaded.
   * - `deleteLoading`: Stores the ID of the poll currently being deleted to manage loading states for individual delete buttons.
   */
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth(); // Use the auth context

  useEffect(() => {
    /**
     * Fetches all polls from the Supabase database.
     * Populates the `polls` state with the retrieved data and sets `loading` to `false` once done.
     * Handles potential errors during data fetching by logging them to the console.
     */
    if (!authLoading) {
      // Wait for auth context to load
      if (!user || user.user_metadata.role !== 'admin') {
        // If user is not an admin, redirect them
        redirect('/dashboard');
      } else {
        fetchAllPolls();
      }
    }
  }, [user, authLoading]); // Re-run effect when user or authLoading changes

  const fetchAllPolls = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPolls(data);
    }
    setLoading(false);
  };

  const handleDelete = async (pollId: string) => {
    /**
     * Handles the deletion of a specific poll.
     * Sets `deleteLoading` to the `pollId` to indicate that a deletion operation is in progress for that poll.
     * Calls the `deletePoll` action to remove the poll from the database.
     * If the deletion is successful, it updates the `polls` state to reflect the removal of the deleted poll.
     *
     * @param pollId - The ID of the poll to be deleted.
     */
    setDeleteLoading(pollId);
    const result = await deletePoll(pollId);

    if (!result.error) {
      setPolls(polls.filter((poll) => poll.id !== pollId));
    }

    setDeleteLoading(null);
  };

  if (loading || authLoading) {
    // Show loading indicator while authentication status is being determined or polls are loading
    return <div className="p-6">Loading all polls...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          View and manage all polls in the system.
        </p>
      </div>

      <div className="grid gap-4">
        {polls.map((poll) => (
          <Card key={poll.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1 mt-2">
                      <div>
                        Poll ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.id}
                        </code>
                      </div>
                      <div>
                        Owner ID:{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {poll.user_id}
                        </code>
                      </div>
                      <div>
                        Created:{" "}
                        {new Date(poll.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(poll.id)}
                  disabled={deleteLoading === poll.id}
                >
                  {deleteLoading === poll.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Options:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {poll.options.map((option, index) => (
                    <li key={index} className="text-gray-700">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {polls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No polls found in the system.
        </div>
      )}
    </div>
  );
}
