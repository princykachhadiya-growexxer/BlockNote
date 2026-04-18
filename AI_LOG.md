## 📅 13-04-2026

### Entry 1

**Tool:** Claude  
**Task:** Setup Postgres with Next.js and Node.js

### Prompt

"Create a full-stack setup using Next.js frontend, Node.js (Express) backend, PostgreSQL database, and Prisma ORM with proper folder structure."

### Output Summary

- Workspace structure (monorepo-style)
- Package.json files for frontend & backend
- Starter Next.js app
- Express server setup
- Shared constants/config
- Prisma ORM initial setup

**Issues Found:**  
None so far

**Fixes Applied:**  
None

---

### Entry 2

**Tool:** Claude  
**Task:** Implement authentication with backend APIs and minimal frontend

### Prompt

"Implement authentication with backend APIs, JWT and refresh token flow, and a minimal frontend to verify auth locally."

### Output Summary

- Auth controller, service, and middleware
- Password hashing implementation
- JWT and refresh token helpers
- Shared validation schemas
- Minimal auth UI in Next.js app

**Issues Found:**

- Monorepo path issues in environment and migration loading
- Prisma ORM version compatibility issue

**Fixes Applied:**

- Fixed monorepo path issues before continuing
- Downgraded Prisma version to resolve compatibility issue

---

### Entry 3

**Tool:** Claude  
**Task:** Implement document APIs and minimal dashboard

### Prompt

"Implement document APIs with ownership checks and a minimal dashboard for create, list, rename, and delete flows."

### Output Summary

- Set up document repository, service, and controller
- Added ownership checks to secure user data
- Created validation schemas
- Built a simple frontend dashboard connected to the authenticated session
- Implemented basic CRUD flows: create, list, rename, delete

**Issues Found:**

- Fetch API path in the frontend was incorrect
- Frontend environment variables were not working properly in the monorepo setup

**Fixes Applied:**

- Corrected the API path used in fetch requests
- Fixed environment variable loading so API_PROXY_TARGET values work correctly in the app

---

### Entry 4

**Tool:** Claude  
**Task:** Update UI for dashboard, login, and register pages

### Prompt

"Change the UI of the dashboard, login, and register pages while maintaining the same color code."

### Output Summary

- Updated UI for dashboard, login, and register pages
- Maintained existing color scheme and design consistency
- Improved layout and overall look

**Issues Found:**  
None

**Fixes Applied:**  
None

## 📅 14-04-2026

### Entry 1

**Tool:** Codex  
**Task:** Create landing page and update app color theme

### Prompt

"Act as a professional frontend developer and UI/UX designer. Create a modern, responsive landing page for a web application that is a simplified Notion-like block-based document editor and apply a new color code. Connect it to existing login and register pages and apply the color code to the whole web app."

### Output Summary

- Designed a modern and responsive landing page
- Introduced a new color scheme for the application
- Connected landing page with existing login and register pages
- Applied consistent color theme across the entire web app

**Issues Found:**  
None

**Fixes Applied:**  
None

---

### Entry 2

**Tool:** Codex  
**Task:** Add sidebar and redesign auth pages

### Prompt

"Act as a senior frontend developer and UI/UX designer. You are working on an existing web application. Extend the current codebase by adding a left-side drawer (sidebar). Do not rebuild the project. Include app logo/name at the top, navigation items (Dashboard, Starred Pages), and a bottom section with a theme toggle and logout button."

### Output Summary

- Added a left-side drawer (sidebar) to the existing app
- Included app logo/name at the top of the sidebar
- Implemented navigation items: Dashboard and Starred Pages
- Added bottom section with theme toggle and logout button
- Improved overall UI consistency without rebuilding the project

**Issues Found:**  
None

**Fixes Applied:**  
None

---

### Entry 3

**Tool:** Claude  
**Task:** Implement block system and replace temporary UI with real app pages

### Prompt

"Implement block-system foundation and replace the temporary verification UI with real home, auth, dashboard, and document pages."

### Output Summary

- Implemented block validation and contracts
- Created block CRUD API routes
- Added routed frontend with auth provider
- Redesigned home, auth, dashboard, and document pages
- Built document workspace to render stored blocks

**Issues Found:**

- Deployment issues due to incorrect paths/configuration
- Path-related problems in monorepo setup

**Fixes Applied:**

- Fixed path configurations for proper module resolution
- Adjusted environment and build settings for deployment
- Ensured correct routing and API paths across frontend and backend

---

### Entry 4

**Tool:** Claude  
**Task:** Improve editor functionality and UX

### Prompt

"Fix the 'Add Block' button, upgrade the editor to a modern Notion-style rich editor, handle edge cases properly, and ensure backend consistency and data integrity."

### Output Summary

- Fixed core editor interactions and block handling
- Improved editor UX to feel closer to a modern Notion-style experience
- Enhanced block management and rendering logic
- Strengthened backend validation and data consistency
- Improved overall reliability of editor workflows

**Issues Found:**

- Drag & drop was not updating local state correctly or syncing with backend
- Slash command was incorrectly triggering API calls too early
- Block behavior was creating new blocks instead of transforming existing ones
- Cursor position was not maintained during edits
- Rendering logic defaulted all blocks to paragraph instead of using block.type
- API allowed invalid requests (e.g., from "/")
- Backend did not fully validate block types safely

**Fixes Applied:**

- Ensured slash command works as frontend-only until block is finalized
- Maintained cursor position during block updates
- Added API validation to block invalid requests


## 📅 15-04-2026

### Entry 1

**Tool:** Codex  
**Task:** Add star functionality and fix authentication flow

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like web application. Add backend-integrated star functionality and fix the authentication flow to properly match the backend. Do not rebuild the project. Ensure clicking star updates instantly, starred pages appear in the sidebar, data persists after reload, only authorized users see their stars, and auth works seamlessly with the backend."

### Output Summary

- Implemented backend-integrated star functionality
- Enabled instant UI updates when clicking the star icon
- Displayed starred pages in the sidebar
- Ensured data persistence after reload
- Restricted starred data to authorized users only
- Fixed authentication flow to align properly with backend

**Issues Found:**  
None

**Fixes Applied:**  
None

---

### Entry 2

**Tool:** Codex  
**Task:** Add star functionality and fix authentication with full-stack integration

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like web application. Add backend-integrated star functionality and fix authentication flow to match the backend. Do not rebuild the project. Implement user-specific starred data, secure APIs, proper UI updates, sidebar integration, and a redesigned login/register experience with a consistent design system and improved UX."

### Output Summary

- Added full-stack star functionality with backend support
- Implemented user-specific starred data with proper authorization
- Created/updated APIs for toggling and fetching starred items
- Integrated star UI with optimistic updates in frontend
- Added "Starred" section in sidebar with navigation support
- Redesigned login and register pages with consistent UI system
- Fixed authentication flow (login, register, token handling, protected routes)
- Improved state management and backend sync for reliable data flow
- Added error handling and edge case coverage

**Issues Found:**

- Prisma schema mismatch causing relation errors in star functionality
- Block fetching service returning invalid or inconsistent data
- /auth/me endpoint not returning correct user data
- JWT middleware not properly validating or attaching user context
- Frontend not fully syncing with backend state
- Missing optimistic UI handling for star toggle
- No handling for failed star toggle (UI not reverting)
- Unauthorized access not redirecting to login
- Empty starred list not handled properly

**Fixes Applied:**

- Fixed Prisma schema relations to correctly map user and starred data
- Updated block fetching service to return consistent and valid responses
- Corrected /auth/me endpoint to return authenticated user data
- Fixed JWT middleware to properly validate token and attach user info
- Synced frontend state management with backend responses

---

### Entry 3

**Tool:** Codex  
**Task:** Fix star UI behavior and handle edge cases

### Prompt

"Fix the star toggle behavior in the existing application. Implement optimistic UI updates so the star state updates instantly, add rollback logic if the API request fails, handle unauthorized responses by redirecting the user to the login page, and show a proper empty state when no starred items are available. Ensure smooth frontend-backend synchronization without rebuilding the project."

### Output Summary

- Improved star toggle UX with optimistic updates
- Added rollback mechanism for failed API calls
- Implemented redirect to login on unauthorized access
- Added empty state UI for no starred items
- Enhanced frontend-backend sync for better reliability

**Issues Found:**

- Star UI was not updating instantly
- No rollback when API call failed
- Unauthorized users were not redirected properly
- No empty state handling for starred list

**Fixes Applied:**

- Implemented optimistic UI updates for star toggle
- Added rollback logic for failed star actions
- Added redirect handling for unauthorized users
- Handled empty state for starred items

## 📅 16-04-2026

### Entry 1

**Tool:** Codex  
**Task:** Fix block transformation and drag-and-drop functionality

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like application. Fix the block editor behavior so that when a user types '/' and selects a block type, the current block transforms instead of creating a new one below. Maintain cursor position correctly. Also fix the drag-and-drop functionality so blocks can be reordered properly using the drag handle. Ensure smooth UX and proper state synchronization without rebuilding the project."

### Output Summary

- Fixed slash command behavior to transform current block instead of creating a new one
- Maintained cursor position after block transformation
- Removed unnecessary extra block creation
- Implemented working drag-and-drop functionality for block reordering
- Synced block order changes with backend
- Improved overall editor UX and interaction flow

**Issues Found:**

- Slash command was creating a new block instead of transforming the current one
- Cursor was moving to a new block unexpectedly
- Extra unnecessary blocks were being created
- Drag-and-drop functionality was not working despite visible drag handle

**Fixes Applied:**

- Updated editor logic to transform the current block on slash command
- Fixed cursor handling to remain in the transformed block
- Prevented unintended block creation
- Implemented proper drag-and-drop logic for reordering blocks
- Synced reordered state with backend

---

### Entry 2

**Tool:** Codex  
**Task:** Add trash, starred filters, and analytics APIs

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like application. Add support for trash (soft delete), starred filtering, and analytics APIs. Implement query-based filtering for documents and blocks using ?starred=true and ?trashed=true. Also create an analytics endpoint to return total documents, deleted documents, total blocks, and share count per document. Do not rebuild the project. Ensure clean architecture and production-ready implementation."

### Output Summary

- Added soft delete (trashed flag) for documents
- Implemented starred functionality for documents and blocks
- Added query-based filtering (?starred=true, ?trashed=true)
- Created analytics endpoint (/api/documents/analytics)
- Updated backend services and routes

**Issues Found:**

- API endpoints returning 500 Internal Server Error
- Query parameter handling issues ("true" not parsed correctly)
- Possible schema mismatch for starred/trashed fields
- Route conflict between dynamic routes and /analytics
- Database queries failing due to undefined or incorrect filters

**Fixes Applied:**  
- Fixed query parsing by properly converting "true"/"false" strings to booleans and validating params before DB queries.
- Resolved route conflicts and schema mismatches (added default values for starred/trashed and ensured /analytics is declared before dynamic routes).

---

### Entry 3

**Tool:** Codex  
**Task:** Identify and analyze critical editor and API issues

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like block editor application. The system is facing multiple critical issues in editor behavior, document lifecycle, and API reliability. Analyze problems related to block splitting, merging, deletion, API failures, trash functionality, share count, and document creation. Do not rebuild the project. Identify root causes and explain why these issues are occurring."

### Output Summary

- Identified issues in block splitting (Enter key) and merging (Backspace)
- Detected failures in block update API causing editor inconsistency
- Found problems in trash system (soft delete not working)
- Identified document creation and share count failures
- Highlighted synchronization issues between frontend and backend

**Issues Found:**

- Backspace not merging blocks correctly or deleting empty blocks
- Enter key causing duplication or incorrect splitting
- Block update API returning 500 errors
- Trash functionality failing (503 error, no soft delete)
- Share count not updating
- New document creation not persisting
- Editor state becoming inconsistent due to API failures

**Fixes Applied:**  
- Fixed editor bugs (Enter/Backspace) and ensured stable API handling with proper validation.
- Resolved trash, share count, and document persistence issues with correct DB updates and error handling.

---

### Entry 4

**Tool:** Codex  
**Task:** Fix editor behavior, API failures, and document lifecycle

### Prompt

"Act as a senior full-stack engineer working on an existing Notion-like application. Fix critical issues in editor behavior, backend APIs, and document lifecycle without rebuilding the project. Ensure Enter key splits blocks correctly, Backspace merges or deletes blocks appropriately, and cursor position is maintained. Fix block update API (500 error), document delete API (503 error), and ensure soft delete (trash) works correctly. Implement reliable document creation and share count updates. Ensure frontend and backend are fully synchronized, handle all edge cases, and deliver a stable, production-ready system."

### Output Summary

- Fixed Enter key behavior for correct block splitting without duplication
- Implemented proper Backspace handling (merge + delete empty blocks)
- Restored block update API functionality
- Fixed document deletion with proper soft delete (trash system)
- Enabled reliable document creation and persistence
- Implemented share count updates with backend sync
- Improved frontend-backend synchronization
- Stabilized editor state and interactions

**Issues Found:**

- Incorrect block splitting and merging logic
- API failures (500/503) breaking editor functionality
- Trash system not persisting state
- Document creation flow broken
- Share count not updating
- Cursor position inconsistencies
- State mismatch between frontend and backend

**Fixes Applied:**

- Rewrote block split and merge logic with proper cursor handling
- Fixed block update API and ensured valid request handling
- Implemented soft delete with proper DB updates
- Fixed document creation API and frontend integration
- Added share count increment logic on share action
- Synced frontend state with backend responses
- Added error handling to prevent editor breakage  


## 📅 17-04-2026

### Entry 1

**Tool:** Claude  
**Task:** Implement advanced filtering system (search, date, block type, pinned) in dashboard without breaking existing logic.

### Prompt

Add combinable filters: debounced search (title/content), date (today/7/30 days), block type (multi-select), and pinned toggle with clean UI integration.

### Output Summary

- Added optimized filtering using existing state, debounced search, efficient multi-filter logic, and pin/unpin feature with real-time UI updates.

**Issues Found:**
- Potential performance issues with large datasets if filtering not memoized.  
- Pinned state not present earlier, requires proper storage handling.

**Fixes Applied:**
- Used debouncing + memoization to prevent re-renders.  
- Added "pinned" property and toggle handling without affecting existing APIs.

**Improvements Needed:**
- Can extend to backend-level filtering for scalability.  
- Add sorting (pinned first, recent first) for better UX.

---

### Entry 2

**Tool:** Codex  
**Task:** Add real-time word and character count feature in the editor.

### Prompt

Display live word & character count for the current document, updating dynamically without modifying existing logic.

### Output Summary

Used existing editor state to calculate counts, updates instantly on typing, integrated with a clean minimal UI at the bottom.

**Issues Found:**
- Character count is slightly inaccurate (counts extra spaces/formatting).  
Image count is not included.

**Fixes Applied:**
- counts characters without whitespace, which avoids inflated totals from extra spaces/new lines
Shows total images in the document

---

### Entry 3

**Tool:** Codex  
**Task:** Add a “How It Works” guide page

### Prompt

Create a new “How It Works” page that explains the platform (overview, document usage, features like sharing/starring/pinning). Keep it clean, minimal, and consistent with existing UI. Support light/dark themes. Do not modify existing logic—only add a new page/route using existing styles.

### Output Summary

A new guide page was added with structured sections explaining platform usage and features. It matches the existing UI and works in both themes without affecting current functionality.

**Issues Found:**

- Minor spacing and contrast issues in dark mode

**Fixes Applied:**

- Improved contrast for dark theme
- Adjusted spacing and layout consistency
- Reused existing styles for uniform design

---

### Entry 4

**Tool:** Codex

**Task:** Add pagination to dashboard page

### Prompt
Add pagination to the dashboard to limit documents per page.Include Previous/Next and page controls, maintain layout, preserve sorting/filtering, and handle edge cases. Do not modify existing logic—only extend using current data/state.

### Output Summary
Pagination was added to the dashboard, limiting documents per page with smooth navigation controls. Existing layout, sorting, and filtering remain unchanged, and the UI works consistently across all pages.

**Issues Found:**
None

**Fixes Applied:**
None
