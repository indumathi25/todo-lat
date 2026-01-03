# Authentication Flow

This document describes the complete authentication flow for the Todo application, covering both the Frontend (React + Auth0) and Backend (Django + Django REST Framework) processes.

## 1. Frontend: Login Flow (React + Auth0)

1.  **Initiation**:
    *   The user clicks the **Log In** button in `LoginButton.tsx`.
    *   This calls `loginWithRedirect()` from the `@auth0/auth0-react` SDK.

2.  **Redirect to Auth0**:
    *   The SDK generates a cryptographic random `code_verifier` and `code_challenge` (PKCE - Proof Key for Code Exchange).
    *   The user is redirected to the Auth0 Universal Login page (`/authorize` endpoint) with the `code_challenge`.

3.  **Authentication**:
    *   The user authenticates (username/password, social login, etc.).
    *   Auth0 validates the credentials and redirects the user back to `http://localhost:5173` with an `authorization_code`.

4.  **Token Exchange**:
    *   The application loads, and the `Auth0Provider` processes the callback.
    *   The SDK sends the `authorization_code` and `code_verifier` to Auth0's `/oauth/token` endpoint.
    *   Auth0 verifies the PKCE challenge and returns an **Access Token** (JWT) and **ID Token**.

5.  **Post-Login Navigation**:
    *   The strict `Auth0ProviderWithNavigate` component intercepts the successful login event.
    *   It uses React Router's `navigate` to redirect the user to `/todos`.

## 2. Frontend: API Requests

 When the application needs to fetch data (e.g., in `useTodos.ts`):

1.  **Token Retrieval**:
    *   The code calls `getAccessTokenSilently()`.
    *   The SDK retrieves the valid Access Token from **Local Storage** (persisted across refreshes).

2.  **Request Construction**:
    *   The token is attached to the HTTP Authorization header:
        ```
        Authorization: Bearer <ACCESS_TOKEN>
        ```
    *   The request is sent to the backend (e.g., `GET http://localhost:8000/api/todos/`).

## 3. Backend: Validation & User Resolution (Django)

1.  **Interception**:
    *   The request reaches Django. DRF's authentication classes run.
    *   `todo_api.authentication.Auth0JSONWebTokenAuthentication` handles the request.

2.  **Token Verification**:
    *   The `Authorization` header is parsed to extract the Bearer token.
    *   The backend fetches the public keys (JWKS) from `https://{AUTH0_DOMAIN}/.well-known/jwks.json`.
    *   It verifies the token's signature, expiration, and audience (`https://todo-api`).

3.  **User Mapping (Get or Create)**:
    *   The authentication class extracts the `sub` claim (Subject ID) from the token payload (e.g., `auth0|123456...`).
    *   **Check**: It queries the database for a `User` with `username=sub`.
    *   **Create**: If the user does not exist, a new Django user is created automatically with that `username`.
    *   **Access**: The verified `user` object is attached to `request.user`.

4.  **Access Control**:
    *   The `TodoViewSet` uses `request.user` to filter the queryset:
        ```python
        Todo.objects.filter(owner=self.request.user)
        ```
    *   This ensures users only access their own todos.
