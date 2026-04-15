## 13-04-2026

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


## 14-04-2026

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
 
**Fixes Pending**
- Fixed drag & drop to update local state and sync immediately with backend  
- Updated editor logic to transform blocks instead of creating new ones 
- Improved backend handling for block type safety  
- Switched rendering logic to respect block.type dynamically  



## 15-04-2026

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

