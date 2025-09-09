# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## Project Overview

ALX Polly is an interactive web application that enables users to create, manage, and participate in polls. It's designed to showcase a robust polling system with secure authentication and dynamic content management. The application provides a seamless user experience for both poll creators and voters.

### Key Features:

*   **Secure Authentication**: Users can securely sign up, log in, and manage their sessions using Supabase Authentication.
*   **Poll Creation & Management**: Authenticated users can easily create new polls, define questions and options, and manage their existing polls (view, edit, delete).
*   **Voting System**: A straightforward and intuitive interface allows users to cast votes on active polls. The system ensures fair voting and displays real-time results.
*   **User Dashboard**: A personalized dashboard provides users with an overview of their created polls and an easy way to navigate to poll details.
*   **Admin Panel**: An administrative interface (for authorized users) to view and manage all polls within the system.

### Tech Stack:

*   **Framework**: [Next.js](https://nextjs.org/) (App Router) for a powerful, full-stack React framework.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for enhanced code quality and developer experience.
*   **Backend & Database**: [Supabase](https://supabase.io/) for a scalable backend, real-time database, and authentication services.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS styling.
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for accessible and customizable UI components.
*   **State Management**: Leverages React Server Components and Client Components for efficient data fetching and rendering.

---

## 🚀 The Challenge: Security Audit & Remediation

As a developer, writing functional code is only half the battle. Ensuring that the code is secure, robust, and free of vulnerabilities is just as critical. This version of ALX Polly has been intentionally built with several security flaws, providing a real-world scenario for you to practice your security auditing skills.

**Your mission is to act as a security engineer tasked with auditing this codebase.**

### Your Objectives:

1.  **Identify Vulnerabilities**:
    -   Thoroughly review the codebase to find security weaknesses.
    -   Pay close attention to user authentication, data access, and business logic.
    -   Think about how a malicious actor could misuse the application's features.

2.  **Understand the Impact**:
    -   For each vulnerability you find, determine the potential impact. Query your AI assistant about it. What data could be exposed? What unauthorized actions could be performed?

3.  **Propose and Implement Fixes**:
    -   Once a vulnerability is identified, ask your AI assistant to fix it.
    -   Write secure, efficient, and clean code to patch the security holes.
    -   Ensure that your fixes do not break existing functionality for legitimate users.

### Where to Start?

A good security audit involves both static code analysis and dynamic testing. Here’s a suggested approach:

1.  **Familiarize Yourself with the Code**:
    -   Start with `app/lib/actions/` to understand how the application interacts with the database.
    -   Explore the page routes in the `app/(dashboard)/` directory. How is data displayed and managed?
    -   Look for hidden or undocumented features. Are there any pages not linked in the main UI?

2.  **Use Your AI Assistant**:
    -   This is an open-book test. You are encouraged to use AI tools to help you.
    -   Ask your AI assistant to review snippets of code for security issues.
    -   Describe a feature's behavior to your AI and ask it to identify potential attack vectors.
    -   When you find a vulnerability, ask your AI for the best way to patch it.

---

## Getting Started

To get ALX Polly up and running on your local machine, follow these steps.

### 1. Prerequisites

Ensure you have the following installed:

*   **Node.js**: v20.x or higher (LTS recommended)
*   **npm** or **Yarn**: For package management.
*   **Supabase Account**: A free account is sufficient. You'll need to set up a new project in Supabase.

### 2. Supabase Project Setup

1.  **Create a New Project**: Go to [Supabase](https://supabase.com/) and create a new project. Remember your project's `URL` and `Anon Key`.
2.  **Database Schema**: Set up your database tables. You will need at least tables for `users`, `polls`, and `votes`.
    *   **`users` table**: (Supabase Auth handles this automatically)
    *   **`polls` table**: 
        -   `id` (UUID, Primary Key, Default: `gen_random_uuid()`) 
        -   `created_at` (TIMESTAMP WITH TIME ZONE, Default: `now()`) 
        -   `user_id` (UUID, Foreign Key to `auth.users.id`)
        -   `question` (TEXT)
        -   `options` (JSONB - Array of strings)
    *   **`votes` table**: 
        -   `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
        -   `created_at` (TIMESTAMP WITH TIME ZONE, Default: `now()`)
        -   `poll_id` (UUID, Foreign Key to `polls.id`)
        -   `user_id` (UUID, Foreign Key to `auth.users.id`, nullable for anonymous voting)
        -   `option_index` (INT - Index of the chosen option in the `options` array of the `polls` table)
3.  **Enable Row Level Security (RLS)**: For `polls` and `votes` tables, ensure RLS is enabled and set up appropriate policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations to protect your data.

### 3. Installation

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd alx-polly
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    # or yarn install
    ```

### 4. Environment Variables

Create a `.env.local` file in the root of your `alx-polly` directory and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the values from your Supabase project settings.

### 5. Running the Development Server

Start the application in development mode:

```bash
npm run dev
# or yarn dev
```

The application will be accessible at `http://localhost:3000`.

## Usage Examples

### Creating a Poll

1.  Navigate to the `/dashboard/create` page after logging in.
2.  Enter your poll question and at least two options.
3.  Click "Create Poll" to save your poll. It will then appear on your `/dashboard/polls` page.

### Voting on a Poll

1.  Browse to any poll's detail page (e.g., `/dashboard/polls/your-poll-id`).
2.  Select your preferred option by clicking on it.
3.  Click "Submit Vote." After voting, you will see the updated results and vote distribution.

### Managing Your Polls

1.  Go to your `/dashboard/polls` page to see a list of all polls you have created.
2.  From there, you can navigate to a specific poll's detail page to edit or delete it.

## Running Tests

(If you have tests configured, describe how to run them here. Example below:)

To run the tests for the application, use the following command:

```bash
npm test
# or yarn test
```

This will execute all test files and report the results.

---

Good luck, engineer! This is your chance to step into the shoes of a security professional and make a real impact on the quality and safety of this application. Happy hunting!
