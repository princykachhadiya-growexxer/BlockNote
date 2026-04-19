# AI Usage Log

---

## 📅 2026-04-13

### Entry 1

**Tool:** Claude

**What I asked for:**
"Create a full-stack setup using Next.js frontend, Node.js (Express) backend, PostgreSQL database, and Prisma ORM with proper folder structure."

**What it generated:**
- Monorepo-style workspace structure with separate `frontend/` and `backend/` directories
- `package.json` files for both frontend and backend
- Starter Next.js app with basic routing
- Express server entry point (`server.js`, `app.js`)
- Prisma ORM initial setup with schema and client configuration

**What was wrong or missing:**
Nothing was broken at this stage. The generated structure was valid and matched the intended monorepo layout. No runtime errors on first run.

**What I changed and why:**
No changes were needed. Verified that the folder structure, Prisma client generation, and Express server startup all worked correctly before proceeding.

---

### Entry 2

**Tool:** Claude

**What I asked for:**
"Implement authentication with backend APIs, JWT and refresh token flow, and a minimal frontend to verify auth locally."

**What it generated:**
- Auth controller, service, and middleware files
- Password hashing using bcrypt
- JWT access token (15 min) and refresh token (7 days) helpers
- Shared validation schemas using Zod
- Minimal login and register UI in Next.js to verify the auth flow locally

**What was wrong or missing:**
- Monorepo path resolution issues caused environment variables and migration files to load incorrectly when running from the root
- Prisma version compatibility error appeared during `prisma generate` — the version Claude assumed was not compatible with the installed Node version

**What I changed and why:**
- Manually fixed monorepo path issues by adjusting how `dotenv` was loaded relative to the backend working directory
- Downgraded Prisma to a compatible version to resolve the `prisma generate` failure — Claude had assumed the latest version without checking Node compatibility

---

### Entry 3

**Tool:** Claude

**What I asked for:**
"Implement document APIs with ownership checks and a minimal dashboard for create, list, rename, and delete flows."

**What it generated:**
- Document repository, service, and controller layers
- Ownership checks on every document route — each query filters by `user_id` to prevent cross-account access
- Zod validation schemas for document operations
- Minimal frontend dashboard connected to the authenticated session
- Basic CRUD flows: create, list, rename, delete

**What was wrong or missing:**
- The frontend fetch calls used incorrect API paths, causing 404 errors on all document requests
- Environment variable `API_PROXY_TARGET` was not being picked up correctly in the monorepo setup — Next.js was not forwarding `/api/*` requests to the backend

**What I changed and why:**
- Corrected the API base path used in frontend fetch calls to match the backend route structure (`/api/documents`)
- Fixed `next.config.mjs` rewrite rule to correctly read `API_PROXY_TARGET` from the environment, ensuring all `/api/*` requests proxied to the Express server

---

### Entry 4

**Tool:** Claude

**What I asked for:**
"Change the UI of the dashboard, login, and register pages while maintaining the same color scheme."

**What it generated:**
- Updated layout and visual design for dashboard, login, and register pages
- Maintained the existing color scheme throughout
- Improved spacing, hierarchy, and overall readability

**What was wrong or missing:**
No functional issues. The generated UI matched the existing design language and color variables without introducing regressions.

**What I changed and why:**
No changes were required. The output was accepted as-is after verifying visual consistency across pages.

---

## 📅 2026-04-14

### Entry 1

**Tool:** Codex

**What I asked for:**
"Act as a professional frontend developer and UI/UX designer. Create a modern, responsive landing page for a web application that is a simplified Notion-like block-based document editor and apply a new color scheme. Connect it to existing login and register pages and apply the color theme to the whole web app."

**What it generated:**
- A modern, responsive landing page with feature highlights and CTA buttons
- A new color scheme applied globally via CSS variables
- Landing page connected to existing `/login` and `/register` routes
- Consistent color theme applied across all existing pages

**What was wrong or missing:**
No functional issues were found. The landing page rendered correctly and linked to the auth pages as expected.

**What I changed and why:**
No changes were required. The output integrated cleanly with the existing routing and style system.

---

### Entry 2

**Tool:** Codex

**What I asked for:**
"Act as a senior frontend developer and UI/UX designer. You are working on an existing web application. Extend the current codebase by adding a left-side drawer (sidebar). Do not rebuild the project. Include app logo/name at the top, navigation items (Dashboard, Starred Pages), and a bottom section with a theme toggle and logout button."

**What it generated:**
- A left-side drawer sidebar added to the existing layout without rebuilding
- App logo and name displayed at the top of the sidebar
- Navigation items: Dashboard and Starred Pages
- Bottom section with theme toggle and logout button
- Sidebar integrated with existing routing and session state

**What was wrong or missing:**
No issues were found. The sidebar rendered correctly and did not break existing page layouts.

**What I changed and why:**
No changes were required. The sidebar was accepted after verifying it worked across all existing routes.

---

### Entry 3

**Tool:** Claude

**What I asked for:**
"Implement block-system foundation and replace the temporary verification UI with real home, auth, dashboard, and document pages."

**What it generated:**
- Block validation schemas and type contracts
- Block CRUD API routes (`GET`, `POST`, `PATCH`, `DELETE`)
- Routed frontend with auth provider wrapping protected pages
- Redesigned home, auth, dashboard, and document pages
- Document workspace rendering blocks fetched from the backend

**What was wrong or missing:**
- Deployment failed due to incorrect import paths in the monorepo — module resolution broke when running outside the `backend/` directory
- API paths in the frontend were inconsistent between development and production environments

**What I changed and why:**
- Fixed all import paths to use correct relative references from each package's root
- Aligned API base URLs across environments by ensuring `API_PROXY_TARGET` was consistently applied
- Verified routing worked end-to-end before merging the block system into the main branch

---

### Entry 4

**Tool:** Claude

**What I asked for:**
"Fix the 'Add Block' button, upgrade the editor to a modern Notion-style rich editor, handle edge cases properly, and ensure backend consistency and data integrity."

**What it generated:**
- Fixed core editor interactions including block creation and keyboard handling
- Improved editor UX toward a Notion-style experience
- Enhanced block management and rendering logic
- Strengthened backend validation for block type and content fields

**What was wrong or missing:**
- Drag and drop was not updating local state correctly or syncing changes to the backend
- Slash command was triggering API calls too early — before the user had finished selecting a block type
- Block type changes were creating new blocks instead of transforming the existing one
- Cursor position was lost during edits, jumping to the start of the block
- Rendering logic was defaulting all blocks to `paragraph` regardless of the stored `block.type`
- Backend was accepting requests from invalid origins (e.g. `/`) without rejecting them
- Backend block type validation was incomplete — unsupported types were silently stored

**What I changed and why:**
- Made slash command frontend-only until the user finalizes the block type selection — API call only fires on confirmation
- Added cursor position preservation logic after block content updates
- Added explicit block type validation on the backend to reject unsupported values before they reach the database
- Fixed rendering to use `block.type` from the API response instead of defaulting to `paragraph`

---

## 📅 2026-04-15

### Entry 1

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like web application. Add backend-integrated star functionality and fix the authentication flow to properly match the backend. Do not rebuild the project. Ensure clicking star updates instantly, starred pages appear in the sidebar, data persists after reload, only authorized users see their stars, and auth works seamlessly with the backend."

**What it generated:**
- Backend-integrated star functionality with instant UI updates on click
- Starred pages displayed in the sidebar with navigation support
- Star data persisting correctly after page reload
- Star data restricted to the authenticated user — no cross-user leakage
- Authentication flow corrected to align with backend JWT handling

**What was wrong or missing:**
No functional issues were found in this initial pass. The star toggle and sidebar integration worked as expected.

**What I changed and why:**
No changes were required at this stage. The output was validated by testing star toggle, reload persistence, and sidebar display.

---

### Entry 2

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like web application. Add backend-integrated star functionality and fix authentication flow to match the backend. Do not rebuild the project. Implement user-specific starred data, secure APIs, proper UI updates, sidebar integration, and a redesigned login/register experience with a consistent design system and improved UX."

**What it generated:**
- Full-stack star functionality with backend APIs for toggling and fetching starred items
- User-specific starred data with authorization enforced at the API level
- Optimistic UI updates for star toggle with frontend state management
- Starred section in the sidebar with navigation
- Redesigned login and register pages with a consistent UI system
- Fixed authentication flow including login, register, token handling, and protected route redirects

**What was wrong or missing:**
- Prisma schema did not correctly define the relation between `User` and starred items, causing relation errors on queries
- Block fetching service was returning inconsistent data shapes, breaking the document editor
- `/auth/me` endpoint was not returning the correct authenticated user object
- JWT middleware was not properly attaching `userId` to the request context, causing downstream authorization failures
- Frontend was not reverting star state when an API call failed (no rollback)
- Unauthorized requests were not redirecting to the login page
- Empty starred list had no UI handling — showed a blank section in the sidebar

**What I changed and why:**
- Fixed Prisma schema relations to correctly map `User` → `DocumentStar` and `User` → `BlockStar`
- Updated block fetching service to return a consistent shape that matched the frontend's expected structure
- Corrected `/auth/me` to return the sanitized user object (id, email, created_at) instead of the raw Prisma result
- Fixed JWT middleware to extract `userId` from the token payload and attach it to `req.userId` before passing to controllers

---

### Entry 3

**Tool:** Codex

**What I asked for:**
"Fix the star toggle behavior in the existing application. Implement optimistic UI updates so the star state updates instantly, add rollback logic if the API request fails, handle unauthorized responses by redirecting the user to the login page, and show a proper empty state when no starred items are available."

**What it generated:**
- Optimistic UI updates for star toggle — state changes immediately on click
- Rollback mechanism that reverts the star state if the API call fails
- Redirect to login page on `401 Unauthorized` response
- Empty state UI for the starred section when no items are starred

**What was wrong or missing:**
- Star UI was not updating instantly — it waited for the API response before reflecting the change
- No rollback logic when the API call failed — star state stayed toggled incorrectly
- Unauthorized users were not being redirected to login
- Empty starred list rendered a blank section with no feedback to the user

**What I changed and why:**
- Implemented optimistic updates so the star icon toggles instantly, with the API call firing in the background
- Added rollback to revert the UI state if the API returns an error
- Added a `401` response handler in `authFetch` to redirect to `/login`
- Added an empty state message in the sidebar's starred section

---

## 📅 2026-04-16

### Entry 1

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like application. Fix the block editor behavior so that when a user types '/' and selects a block type, the current block transforms instead of creating a new one below. Maintain cursor position correctly. Also fix the drag-and-drop functionality so blocks can be reordered properly using the drag handle."

**What it generated:**
- Slash command now transforms the current block instead of creating a new block below
- Cursor position maintained in the transformed block after type change
- Drag-and-drop functionality working via the drag handle
- Block reorder state synced with the backend after drag completes

**What was wrong or missing:**
- Slash command was creating a new block instead of transforming the existing one — this resulted in duplicate blocks
- Cursor was jumping to the newly created block instead of staying in the current one
- Drag-and-drop handle was visible but non-functional — reorder events were not firing

**What I changed and why:**
- Updated the slash command handler to call `PATCH /api/documents/:docId/blocks/:blockId` on the existing block instead of `POST` to create a new one
- Fixed cursor handling to refocus and position correctly within the transformed block
- Implemented proper drag event listeners and wired the reorder result to `POST /api/documents/:docId/blocks/reorder`

---

### Entry 2

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like application. Add support for trash (soft delete), starred filtering, and analytics APIs. Implement query-based filtering for documents and blocks using ?starred=true and ?trashed=true. Also create an analytics endpoint to return total documents, deleted documents, total blocks, and share count per document."

**What it generated:**
- Soft delete for documents via a `deleted_at` timestamp field
- Query-based filtering: `?starred=true` and `?trashed=true` on document and block endpoints
- Analytics endpoint at `GET /api/documents/analytics` returning document totals, deleted count, block count, and share count
- Updated backend services and routes to support the new filters

**What was wrong or missing:**
- Analytics endpoint returned 500 errors — the route was declared after dynamic routes like `/:id`, causing the router to treat `"analytics"` as a document ID
- Query parameters `"true"` and `"false"` were being compared as strings instead of booleans, causing filters to always return all records
- Schema was missing default values for `share_count` and `deleted_at`, causing DB queries to fail on older records

**What I changed and why:**
- Moved the `/analytics` route declaration above `/:id` in the router to prevent it being matched as a dynamic segment
- Added a `parseBooleanQuery` utility to explicitly convert `"true"`/`"false"` strings to booleans before passing them to Prisma queries
- Added default values (`0` for `share_count`, `null` for `deleted_at`) in the Prisma schema and ran a migration to backfill existing records

---

### Entry 3

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like block editor application. The system is facing multiple critical issues in editor behavior, document lifecycle, and API reliability. Analyze problems related to block splitting, merging, deletion, API failures, trash functionality, share count, and document creation. Do not rebuild the project. Identify root causes and explain why these issues are occurring."

**What it generated:**
- Root cause analysis for Enter key block splitting producing duplicate or incorrectly ordered blocks
- Identified Backspace merge logic as missing — empty blocks were not being deleted
- Detected that block update API was returning 500 due to missing field validation
- Found that the trash system's `deleted_at` update was not being committed correctly
- Identified share count as never incrementing because the increment was not wired to the share action
- Highlighted frontend-backend state mismatch as the root cause of editor inconsistency after API failures

**What was wrong or missing:**
- The analysis was accurate but produced no code fixes — this entry was purely diagnostic
- Enter key split logic was identified as the core problem: AI had initially suggested using integer `order_index` values (1, 2, 3) for block ordering, which left no room to insert a new block between two existing ones without rewriting all subsequent indices

**What I changed and why:**
- Decided to manually redesign the `order_index` approach rather than accept the AI's integer-based suggestion. Switched to a **Float-based gap system** (e.g. 1000, 2000, 1500 for a block inserted between them). This allows arbitrary insertions without touching sibling blocks. This decision was made manually because the AI's integer approach would have caused cascading updates on every split or reorder operation, making the system fragile at scale.

---

### Entry 4

**Tool:** Codex

**What I asked for:**
"Act as a senior full-stack engineer working on an existing Notion-like application. Fix critical issues in editor behavior, backend APIs, and document lifecycle without rebuilding the project. Ensure Enter key splits blocks correctly, Backspace merges or deletes blocks appropriately, and cursor position is maintained. Fix block update API (500 error), document delete API (503 error), and ensure soft delete (trash) works correctly."

**What it generated:**
- Enter key split logic: updates the current block with left-side content and creates a new block with right-side content using a computed `order_index` midpoint
- Backspace merge logic: merges the current block's content into the previous block and deletes the current one
- Fixed block update API by adding validation for required fields before the Prisma call
- Fixed soft delete by ensuring `deleted_at` was set in a proper Prisma `update()` call with a transaction
- Share count increment wired to the share enable action
- Frontend state synced with backend responses after every mutation

**What was wrong or missing:**
- The Enter key split initially generated by the AI inserted the new block at a fixed `order_index` of `current + 1` (integer arithmetic), which conflicted with the Float-based gap system already in place. This caused blocks to overlap in ordering.
- Backspace merge did not handle the case where the previous block was of a different type (e.g. merging a `paragraph` into a `heading`) — it blindly concatenated content without type-checking
- Cursor position after split was placed at the start of the new right-side block instead of the beginning

**What I changed and why:**
- Manually rewrote the Enter split logic to use a Float midpoint between the current block's `order_index` and the next block's `order_index` (e.g. `(current + next) / 2`). This ensures the new block slots between its neighbors without disturbing any other blocks. This was a manual fix because the AI's integer approach was incompatible with the Float gap system.
- Added a type guard in Backspace merge to only merge blocks of the same or compatible types — mismatched types are handled by deleting the empty block instead of merging content
- Fixed cursor placement to position at the start of the new right-side block's content area after split, matching expected Notion-style behavior
- Added auto-renormalization logic: when Float gaps collapse below `0.001`, all blocks in the document are reassigned evenly spaced `order_index` values to prevent future ordering instability

---

## 2026-04-17

### Entry 1

**Tool:** Claude

**What I asked for:**
"Add combinable filters to the dashboard: debounced search (by title/content), date range (today / 7 days / 30 days), block type multi-select, and a pinned toggle. Integrate cleanly with the existing UI without modifying existing APIs."

**What it generated:**
- Debounced search filter operating on document titles using existing state
- Date range filter with presets: today, last 7 days, last 30 days
- Block type multi-select filter using `blockTypes` metadata already present on documents
- Pinned toggle that pins documents to the top of the list
- All filters combined using memoized logic to avoid unnecessary re-renders

**What was wrong or missing:**
- Filtering was not memoized initially — applying multiple filters simultaneously caused excessive re-renders on each keystroke
- Pinned state had no storage backing — pinned documents reset on page reload because `localStorage` was not used

**What I changed and why:**
- Wrapped filter logic in `useMemo` to prevent recomputation unless filter values or document list actually changed
- Added `localStorage` persistence for pinned document IDs so pinned state survives page reloads — this was added manually since the AI omitted it

---

### Entry 2

**Tool:** Codex

**What I asked for:**
"Display live word and character count for the current document, updating dynamically on every keystroke without modifying existing editor logic."

**What it generated:**
- Word and character count derived from existing editor block state
- Count updates instantly as the user types
- Displayed in a minimal UI element at the bottom of the editor

**What was wrong or missing:**
- Character count was inflated — it was counting all whitespace including newlines and extra spaces between blocks
- Image blocks were not included in the block count display

**What I changed and why:**
- Modified the character count to strip leading/trailing whitespace and collapse internal spaces before counting, preventing inflated totals
- Added image block counting to the document stats display so the count reflects all block types, not just text

---

### Entry 3

**Tool:** Codex

**What I asked for:**
"Create a new 'How It Works' guide page that explains the platform — overview, document usage, features like sharing, starring, and pinning. Keep it clean, minimal, and consistent with the existing UI. Support light and dark themes. Do not modify existing logic — only add a new page and route using existing styles."

**What it generated:**
- A new `/guide` route with structured sections explaining platform features
- Design consistent with existing pages using shared CSS variables
- Light and dark theme support using the existing `ThemeProvider`

**What was wrong or missing:**
- Minor contrast issues in dark mode — some text was not readable against the dark background
- Spacing was inconsistent between sections compared to the rest of the app

**What I changed and why:**
- Adjusted text color values for dark mode to meet readable contrast ratios using existing CSS variables
- Standardized section spacing and padding to match the dashboard layout for visual consistency

---

### Entry 4

**Tool:** Codex

**What I asked for:**
"Add pagination to the dashboard to limit documents displayed per page. Include Previous/Next controls and page number display. Maintain existing layout, sorting, and filtering. Handle edge cases. Do not modify existing logic — only extend using current data and state."

**What it generated:**
- Pagination controls added below the document list with Previous/Next buttons and current page indicator
- Documents sliced client-side from the filtered and sorted list
- Existing layout, sorting, and filtering preserved
- Edge cases handled: no documents on current page redirects to last valid page; disabled Previous on first page and Next on last page

**What was wrong or missing:**
No issues were found. Pagination worked correctly with all existing filter and sort combinations.

**What I changed and why:**
No changes were required. Verified that pagination reset to page 1 when filters changed and that all edge cases (empty list, single page) were handled correctly.