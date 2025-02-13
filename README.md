# Elysia Basic Auth based on cookies

## Features

- **User Signup (`POST /auth/signup`):**
  - Create a new account with an email, password, and name.
  - Optionally, register an organization if an organization name is provided.
  - Passwords are securely hashed using `argon2id`.

- **User Signin (`POST /auth/signin`):**
  - Verify user credentials.
  - Issue a session token upon successful authentication.
  
- **Session Management:**
  - Generates secure random session tokens stored in cookies.
  - Persists sessions in a SQLite database with an expiration time.
  
- **Protected Routes:**
  - The `/private` route is protected by an authentication middleware that validates the session token stored in cookies.

- **Database:**
  - Uses SQLite (via Bun's built-in support) to persist information about users, sessions, accounts, organizations, and memberships.
  - The necessary tables are automatically created when the server initializes.


## Setup & Installation

### Prerequisites

- [Bun](https://bun.sh/) installed on your system.
- Basic familiarity with JavaScript/TypeScript and REST APIs.

### Running the Project

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies and start the development server:**

   ```bash
   bun install
   bun run dev
   ```

3. **Access the API:**
   
   - Open your browser and go to [http://localhost:3000](http://localhost:3000) to see the base route.
   - Use tools like Postman or cURL to interact with the endpoints (`/auth/signup`, `/auth/signin`, and `/private`).

## Considerations

- The cookie secret (`"mysecretsupersecret"`) is hardcoded for demonstration purposes. **For production, ensure to use a robust secret and manage it via environment variables or a secure configuration management system.**
