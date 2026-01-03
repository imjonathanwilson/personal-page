# Static HTML to Next.js Migration Requirements

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for migrating Jonathan Wilson's personal portfolio website from a static HTML/CSS/JavaScript implementation to a modern Next.js framework using Static Site Generation (SSG). The objective is to modernize the codebase while maintaining 100% visual and functional parity with the current implementation.

**Application Name:** Jonathan Wilson Portfolio Website

### 1.2 Scope

#### In Scope
- Conversion of single HTML file to Next.js application with static export
- Migration of Three.js 3D visualization from CDN to npm package
- Conversion of embedded CSS to modular CSS (CSS Modules or styled-components)
- Conversion of vanilla JavaScript to React components with hooks
- Update of GitHub Actions CI/CD pipeline for Next.js build process
- Update of Ansible deployment scripts to deploy Next.js build artifacts
- Preservation of all visual styling, animations, and interactive features
- Maintenance of responsive design for mobile devices (768px and 480px breakpoints)
- SEO optimization through Next.js metadata and static generation

#### Out of Scope
- Changes to visual design or layout
- Modifications to content structure or copy
- Changes to AWS infrastructure (S3, CloudFront, EC2 architecture remains unchanged)
- Implementation of server-side rendering or API routes
- Addition of new features or functionality
- Changes to domain configuration or SSL certificates
- Database integration or dynamic content

### 1.3 Target Audience
- **Primary:** Development team implementing the migration
- **Secondary:** DevOps engineers managing CI/CD pipeline
- **Tertiary:** Stakeholders reviewing migration progress and outcomes

### 1.4 Definitions and Acronyms
- **SSG:** Static Site Generation - pre-rendering pages at build time
- **CDN:** Content Delivery Network
- **Three.js:** JavaScript 3D library
- **CI/CD:** Continuous Integration/Continuous Deployment
- **ACM:** AWS Certificate Manager
- **CloudFront:** AWS content delivery network service
- **S3:** AWS Simple Storage Service
- **EC2:** AWS Elastic Compute Cloud
- **SRE:** Site Reliability Engineer
- **WCAG:** Web Content Accessibility Guidelines
- **SEO:** Search Engine Optimization

### 1.5 References
- [Next.js Documentation - Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Three.js Documentation](https://threejs.org/docs/)
- Current implementation: `/home/jdubz/personal-page/website/jonathan-wilson-90s.html`
- GitHub Actions workflow: `/home/jdubz/personal-page/.github/workflows/deploy.yml`
- Ansible playbook: `/home/jdubz/personal-page/ansible/playbook.yml`
- Terraform configuration: `/home/jdubz/personal-page/terraform/`

## 2. Goals and Objectives

### 2.1 Business Goals
1. **Modernize Codebase:** Adopt industry-standard React/Next.js framework to improve maintainability and developer experience
2. **Improve Development Velocity:** Enable faster iteration and testing through component-based architecture
3. **Enhance Code Quality:** Implement TypeScript and modern tooling for better code quality and fewer runtime errors
4. **Future-Proof Infrastructure:** Create foundation for future enhancements without requiring complete rewrite
5. **Maintain Zero Downtime:** Ensure migration does not impact website availability or user experience

### 2.2 User Goals
1. **Preserve User Experience:** Users experience identical visual design and interactions before and after migration
2. **Maintain Performance:** Page performance remains equivalent or improves
3. **Ensure Accessibility:** Current accessibility level is maintained or improved
4. **Cross-Browser Compatibility:** Website continues to function across all supported browsers

### 2.3 Success Metrics
1. **Visual Parity:** 100% pixel-perfect match on desktop (verified by visual regression testing)
2. **Mobile Parity:** 100% match on mobile devices at 768px and 480px breakpoints
3. **Performance:** Lighthouse performance score ≥ 90
4. **Deployment Success:** CI/CD pipeline achieves 100% success rate on main branch
5. **Zero Regressions:** No broken links, missing assets, or JavaScript errors in production
6. **Animation Fidelity:** Three.js visualization and typing animation function identically to current implementation

## 3. User Stories

### 3.1 Developer Stories

**US-DEV-001:** Next.js Project Initialization
- **As a** developer
- **I want** to initialize a Next.js project with TypeScript and static export configuration
- **So that** I have a modern framework foundation for the migration
- **Acceptance Criteria:**
  - Next.js 14+ is installed with TypeScript support
  - `next.config.js` includes `output: 'export'` configuration
  - Project builds successfully with `npm run build`
  - Static export generates files in `out/` directory

**US-DEV-002:** Three.js Integration
- **As a** developer
- **I want** to install Three.js as an npm package and integrate it into a React component
- **So that** the 3D visualization works without CDN dependencies
- **Acceptance Criteria:**
  - Three.js r128 is installed via npm
  - 3D visualization renders identically to current implementation
  - Component handles window resize events properly
  - No console errors related to Three.js initialization

**US-DEV-003:** CSS Migration
- **As a** developer
- **I want** to convert embedded CSS to CSS Modules or styled-components
- **So that** styles are modular and maintainable
- **Acceptance Criteria:**
  - All CSS is extracted from HTML and organized into module files
  - Responsive breakpoints (768px, 480px) are preserved
  - No visual differences from original design
  - No CSS conflicts or specificity issues

**US-DEV-004:** Component Architecture
- **As a** developer
- **I want** to break down the page into React components
- **So that** the code is maintainable and follows React best practices
- **Acceptance Criteria:**
  - Components are created for: Terminal, TerminalHeader, TerminalBody, ThreeScene, InfoContent
  - Each component has clear responsibilities and props interfaces
  - Components use TypeScript for type safety
  - No prop drilling; state is managed appropriately

**US-DEV-005:** Animation Implementation
- **As a** developer
- **I want** to implement the typing animation using React hooks
- **So that** the terminal typing effect works as in the original
- **Acceptance Criteria:**
  - Typing animation starts after 500ms delay
  - Characters appear at 75ms intervals
  - Cursor blinks with 1s animation cycle
  - Animation is client-side only (useEffect with proper dependencies)

### 3.2 DevOps Stories

**US-DEVOPS-001:** GitHub Actions Pipeline Update
- **As a** DevOps engineer
- **I want** to update the GitHub Actions workflow to build Next.js
- **So that** the CI/CD pipeline automatically builds and deploys the new application
- **Acceptance Criteria:**
  - Node.js 18+ is installed in the workflow
  - `npm ci` installs dependencies
  - `npm run build` generates static export
  - Build artifacts from `out/` directory are prepared for deployment
  - Build fails if Next.js build fails

**US-DEVOPS-002:** Ansible Playbook Update
- **As a** DevOps engineer
- **I want** to update the Ansible playbook to deploy Next.js build output
- **So that** deployment process works with new directory structure
- **Acceptance Criteria:**
  - Ansible copies all files from `out/` directory
  - Directory ownership and permissions are set correctly
  - Nginx serves `index.html` and all static assets
  - Deployment handles JavaScript and CSS files correctly

**US-DEVOPS-003:** Build Artifact Management
- **As a** DevOps engineer
- **I want** to ensure build artifacts are properly generated and transferred
- **So that** deployment receives all necessary files
- **Acceptance Criteria:**
  - `out/` directory contains index.html, _next/ folder, and all assets
  - Static files are optimized and minified
  - Source maps are excluded from production build
  - All referenced assets are included in build output

### 3.3 End User Stories

**US-USER-001:** Visual Consistency
- **As a** website visitor
- **I want** the website to look identical to the current version
- **So that** I have a consistent experience
- **Acceptance Criteria:**
  - Terminal header with window controls appears the same
  - Green text on black background is preserved
  - Three.js grid visualization renders identically
  - Font family, sizes, and spacing match exactly

**US-USER-002:** Mobile Experience
- **As a** mobile user
- **I want** the website to be fully responsive on my device
- **So that** I can view content comfortably on smaller screens
- **Acceptance Criteria:**
  - 3D canvas is hidden on screens < 768px width
  - Text is readable and properly sized on mobile
  - No horizontal scrolling or overflow issues
  - Touch interactions work properly

**US-USER-003:** Interactive Features
- **As a** website visitor
- **I want** all interactive features to work as expected
- **So that** I can engage with the content
- **Acceptance Criteria:**
  - Typing animation plays on page load
  - Cursor blinks continuously
  - Keyboard input shows temporary message
  - Links are clickable and open in new tabs

## 4. Functional Requirements

### 4.1 Application Structure

**REQ-STRUCT-001:** Next.js Application Structure
- **Priority:** High
- **Description:** The application MUST be structured as a Next.js application using the App Router.
- **Details:**
  - Use Next.js 14 or later
  - Implement App Router architecture (`app/` directory)
  - Configure static export in `next.config.js`
  - Use TypeScript for all components and configuration

**REQ-STRUCT-002:** Static Export Configuration
- **Priority:** High
- **Description:** The application MUST be configured for static export only.
- **Details:**
  - Set `output: 'export'` in `next.config.js`
  - No server-side rendering features SHALL be used
  - No API routes SHALL be implemented
  - All rendering MUST occur at build time

**REQ-STRUCT-003:** Directory Organization
- **Priority:** Medium
- **Description:** The application SHOULD follow Next.js best practices for directory organization.
- **Details:**
  - Components in `app/components/` or `components/` directory
  - Styles in `styles/` directory or co-located with components
  - Public assets in `public/` directory
  - Configuration files at project root

### 4.2 Three.js Visualization

**REQ-3D-001:** Three.js Package Installation
- **Priority:** High
- **Description:** Three.js MUST be installed as an npm package (version r128) instead of using CDN.
- **Details:**
  - Install `three@0.128.0` via npm
  - Import from `three` package in components
  - No CDN script tags SHALL be present

**REQ-3D-002:** Scene Initialization
- **Priority:** High
- **Description:** The Three.js scene MUST be initialized in a React component using useEffect hook.
- **Details:**
  - Scene initialization occurs in useEffect with empty dependency array
  - Canvas is rendered into a dedicated container element
  - Scene is created with identical parameters to current implementation
  - Camera position: (0, 18, 40) with lookAt (0, 0, -4)
  - FOV: 50 degrees

**REQ-3D-003:** SGI FileVision Interface Recreation
- **Priority:** High
- **Description:** The SGI FileVision-style 3D interface MUST be recreated with pixel-perfect accuracy.
- **Details:**
  - Grid of blocks representing Unix directories
  - Block sizes: 2.5x2.5x2.5 (standard) and 2.5x1.75x2.5 (highlighted)
  - Block positions aligned to 4-unit grid spacing on X and Z axes
  - Root block at position (0, 1.25, 8)
  - 63 directory blocks arranged in 7 rows (9 blocks per row)
  - Green shader material with pulsing animation
  - Highlighted "proxy" block with brighter shader

**REQ-3D-004:** Shader Implementation
- **Priority:** High
- **Description:** Custom shaders MUST be implemented for the block materials.
- **Details:**
  - Two shader materials: standard and highlighted
  - Standard shader: green glow with 0.4 base brightness
  - Highlighted shader: brighter green (0.9 brightness) with enhanced rim lighting
  - Time-based pulsing animation
  - Edge highlighting for 3D effect
  - Proper alpha/transparency values

**REQ-3D-005:** Lighting System
- **Priority:** High
- **Description:** The lighting system MUST match the current implementation.
- **Details:**
  - Ambient light: color 0x003300, intensity 0.8
  - Directional light: color 0x00aa66, intensity 1, position (5, 10, 7)
  - Point light: color 0x00cc66, intensity 1, distance 20, position (-5, 8, 5)
  - Spotlight: color 0x00ff66, intensity 5, targeting "proxy" block
  - Light beam cylinder: radius 2, height 20, opacity 0.2
  - Ground circle highlight: radius 2, opacity 0.3

**REQ-3D-006:** Grid Floor
- **Priority:** Medium
- **Description:** A grid floor MUST be rendered beneath the blocks.
- **Details:**
  - GridHelper with size 50 and 15 divisions
  - Colors: 0x006600 (major lines), 0x004400 (minor lines)
  - Position: y = -1, z = 10

**REQ-3D-007:** Window Resize Handling
- **Priority:** High
- **Description:** The Three.js scene MUST respond to window resize events.
- **Details:**
  - Event listener attached to window resize
  - Camera aspect ratio updated
  - Projection matrix recalculated
  - Renderer size updated
  - Cleanup on component unmount

**REQ-3D-008:** Animation Loop
- **Priority:** High
- **Description:** The animation loop MUST update shader time uniforms.
- **Details:**
  - requestAnimationFrame used for animation loop
  - Shader time uniform incremented by 0.01 per frame
  - Blocks remain static (no rotation)
  - Animation cleaned up on component unmount

**REQ-3D-009:** Mobile Behavior
- **Priority:** High
- **Description:** The 3D canvas MUST be hidden on mobile devices.
- **Details:**
  - CSS media query: `display: none` for screens < 768px width
  - Canvas container not rendered on mobile (optional optimization)
  - No Three.js initialization errors on mobile

### 4.3 Terminal Interface

**REQ-TERM-001:** Terminal Header Component
- **Priority:** High
- **Description:** A terminal header component MUST replicate the current window controls and title.
- **Details:**
  - Window control buttons: close (red #ff5f57), minimize (yellow #ffbd2e), maximize (green #28c940)
  - Button size: 12px diameter circles (10px on mobile)
  - Title text: "jonathan-wilson@homepage:~"
  - Background color: #333
  - Border bottom: 1px solid #555

**REQ-TERM-002:** Terminal Body Component
- **Priority:** High
- **Description:** The terminal body MUST display the info container with proper styling.
- **Details:**
  - Centered layout with flexbox
  - Info container max-width: 800px
  - Background: rgba(0, 15, 0, 0.85)
  - Border radius: 5px
  - Padding: 40px (20px on mobile, 15px on small mobile)

**REQ-TERM-003:** Content Structure
- **Priority:** High
- **Description:** The content MUST be structured in semantic sections.
- **Details:**
  - Command line prompt with "> " prefix
  - Command text: "cat about_me.txt"
  - Blinking cursor after command
  - Name heading (h1): "Jonathan Wilson"
  - Title heading (h2): "Senior Site Reliability Engineer"
  - Contact links: GitHub and LinkedIn
  - Description paragraphs
  - Projects section with "ls -la projects/" command
  - Skills section with "man skills" command

**REQ-TERM-004:** Typography
- **Priority:** High
- **Description:** Typography MUST match the current implementation exactly.
- **Details:**
  - Font family: 'Courier New', 'monospace'
  - h1 size: 2.5em (1.8em on mobile, 1.5em on small mobile)
  - h2 size: 1.8em (1.3em on mobile, 1.1em on small mobile)
  - Paragraph size: 1.1em (0.95em on mobile, 0.85em on small mobile)
  - Line height: 1.6 (1.5 on small mobile)
  - h1 color: #fff with text-shadow: 0 0 5px rgba(0, 255, 0, 0.5)
  - h2 and links color: #0f0
  - Link hover: #0ff with underline

**REQ-TERM-005:** Footer
- **Priority:** Low
- **Description:** A footer SHOULD display the "[Press any key to continue...]" message.
- **Details:**
  - Position: absolute bottom on desktop, relative on mobile
  - Color: #555
  - Font size: 0.9em (0.8em on mobile)
  - Changes to "Command not found" message on keypress for 2 seconds

### 4.4 Animations

**REQ-ANIM-001:** Typing Animation
- **Priority:** High
- **Description:** The typing animation MUST replicate the current implementation.
- **Details:**
  - Animation starts 500ms after page load
  - Characters appear at 75ms intervals
  - Text: "cat about_me.txt"
  - Implemented using useEffect and setTimeout
  - Cleanup on component unmount

**REQ-ANIM-002:** Cursor Blink
- **Priority:** High
- **Description:** The cursor MUST blink continuously.
- **Details:**
  - CSS keyframes animation named "blink"
  - Duration: 1 second
  - Infinite loop
  - Opacity: 1 (0%, 100%), 0 (50%)
  - Width: 8px, height: 1.2em
  - Background color: #0f0

**REQ-ANIM-003:** Keyboard Interaction
- **Priority:** Medium
- **Description:** Keyboard input SHOULD trigger temporary footer message change.
- **Details:**
  - Event listener on document keydown
  - Changes footer to "Command not found. Type 'help' for options."
  - Reverts after 2 seconds
  - Cleanup on component unmount

### 4.5 Responsive Design

**REQ-RESP-001:** Desktop Layout
- **Priority:** High
- **Description:** The desktop layout MUST maintain current design for screens ≥ 768px.
- **Details:**
  - Full viewport height (100vh)
  - 3D canvas visible
  - Fixed footer positioning
  - Standard font sizes and padding

**REQ-RESP-002:** Tablet/Mobile Layout (768px)
- **Priority:** High
- **Description:** The layout MUST adapt for screens < 768px width.
- **Details:**
  - 3D canvas hidden (display: none)
  - Body overflow-y: auto, overflow-x: hidden
  - Info container padding: 20px 10px
  - Reduced font sizes
  - Relative footer positioning
  - Terminal text white-space: pre-wrap

**REQ-RESP-003:** Small Mobile Layout (480px)
- **Priority:** High
- **Description:** The layout MUST further adapt for screens < 480px width.
- **Details:**
  - Info container padding: 15px 8px
  - Further reduced font sizes
  - Contact links word-break: break-all
  - Terminal text font-size: 0.65em

**REQ-RESP-004:** Overflow Prevention
- **Priority:** High
- **Description:** The application MUST prevent horizontal scrolling on all screen sizes.
- **Details:**
  - Max-width: calc(100vw - 20px) on mobile info container
  - Overflow-x: hidden on terminal and terminal-body
  - Word-wrap and overflow-wrap on text elements
  - No elements exceeding viewport width

### 4.6 External Links

**REQ-LINK-001:** GitHub Link
- **Priority:** High
- **Description:** GitHub link MUST navigate to correct profile.
- **Details:**
  - href: "https://github.com/imjonathanwilson"
  - target: "_blank"
  - rel: "noopener noreferrer" (for security)
  - Text: "github.com/imjonathanwilson"

**REQ-LINK-002:** LinkedIn Link
- **Priority:** High
- **Description:** LinkedIn link MUST navigate to correct profile.
- **Details:**
  - href: "https://linkedin.com/in/imjonathanwilson"
  - target: "_blank"
  - rel: "noopener noreferrer" (for security)
  - Text: "linkedin.com/in/imjonathanwilson"

### 4.7 SEO and Metadata

**REQ-SEO-001:** Page Title
- **Priority:** High
- **Description:** Page title MUST be set correctly.
- **Details:**
  - Title: "Jonathan Wilson - Terminal"
  - Implemented in Next.js metadata

**REQ-SEO-002:** Meta Tags
- **Priority:** Medium
- **Description:** Appropriate meta tags SHOULD be included.
- **Details:**
  - charset: UTF-8
  - viewport: width=device-width, initial-scale=1.0
  - description meta tag (recommended)
  - og:tags for social sharing (optional)

## 5. Non-Functional Requirements

### 5.1 Performance

**REQ-PERF-001:** Page Load Performance
- **Priority:** High
- **Description:** Initial page load MUST achieve optimal performance.
- **Measurement:** Lighthouse performance audit
- **Target:** Performance score ≥ 90

**REQ-PERF-002:** Bundle Size
- **Priority:** Medium
- **Description:** Total JavaScript bundle size SHOULD be ≤ 500KB (gzipped).
- **Measurement:** Next.js build output analysis
- **Target:** Main bundle < 300KB, Three.js chunk < 200KB

**REQ-PERF-003:** Asset Optimization
- **Priority:** Medium
- **Description:** Static assets MUST be optimized for production.
- **Details:**
  - CSS minified
  - JavaScript minified and tree-shaken
  - No source maps in production build
  - Compression enabled via CloudFront

### 5.2 Security

**REQ-SEC-001:** Dependency Security
- **Priority:** High
- **Description:** All npm dependencies MUST be free of known high/critical vulnerabilities.
- **Measurement:** `npm audit` output
- **Target:** Zero high or critical vulnerabilities

**REQ-SEC-002:** External Links Security
- **Priority:** High
- **Description:** External links MUST include `rel="noopener noreferrer"` attribute.
- **Details:**
  - Prevents window.opener access
  - Prevents referrer information leakage
  - Applied to all target="_blank" links

**REQ-SEC-003:** Content Security Policy
- **Priority:** Low
- **Description:** Content Security Policy headers MAY be implemented.
- **Details:**
  - Allow self-hosted scripts and styles
  - Allow Three.js WebGL context
  - Prevent inline script execution (if feasible)

**REQ-SEC-004:** HTTPS Enforcement
- **Priority:** High
- **Description:** All traffic MUST be served over HTTPS.
- **Details:**
  - Maintained via existing CloudFront configuration
  - No changes required to infrastructure

### 5.3 Usability

**REQ-USE-001:** Browser Compatibility
- **Priority:** High
- **Description:** The application MUST function correctly in modern browsers.
- **Supported Browsers:**
  - Chrome 90+ (desktop and mobile)
  - Firefox 88+ (desktop and mobile)
  - Safari 14+ (desktop and mobile)
  - Edge 90+ (desktop)
- **Testing:** Manual testing in each browser

**REQ-USE-002:** Keyboard Navigation
- **Priority:** Medium
- **Description:** Interactive elements SHOULD be accessible via keyboard.
- **Details:**
  - Links focusable with Tab key
  - Visual focus indicators present
  - Keyboard events handled appropriately

**REQ-USE-003:** Error Handling
- **Priority:** High
- **Description:** The application MUST handle errors gracefully.
- **Details:**
  - No unhandled JavaScript errors in console
  - Three.js initialization errors caught and logged
  - Fallback UI if 3D canvas fails to initialize (optional)

### 5.4 Reliability

**REQ-REL-001:** Build Stability
- **Priority:** High
- **Description:** The build process MUST be deterministic and repeatable.
- **Details:**
  - Same input produces identical output
  - No random build failures
  - Dependencies locked with package-lock.json

**REQ-REL-002:** Cross-Platform Builds
- **Priority:** High
- **Description:** The application MUST build successfully on Linux (GitHub Actions).
- **Details:**
  - No OS-specific dependencies
  - File paths use forward slashes
  - Tested in ubuntu-latest runner

**REQ-REL-003:** Deployment Success Rate
- **Priority:** High
- **Description:** Deployments to production MUST succeed consistently.
- **Measurement:** GitHub Actions workflow success rate
- **Target:** 99%+ success rate

### 5.5 Maintainability

**REQ-MAINT-001:** Code Quality
- **Priority:** Medium
- **Description:** Code SHOULD follow Next.js and React best practices.
- **Details:**
  - TypeScript for type safety
  - ESLint configuration for code consistency
  - Prettier for code formatting (optional)
  - Meaningful variable and component names

**REQ-MAINT-002:** Component Testability
- **Priority:** Low
- **Description:** Components MAY be structured to facilitate testing.
- **Details:**
  - Pure functional components where possible
  - Clear separation of concerns
  - Testing setup with Jest/React Testing Library (optional)

**REQ-MAINT-003:** Documentation
- **Priority:** Medium
- **Description:** Code SHOULD include inline comments for complex logic.
- **Details:**
  - Three.js shader code documented
  - Animation logic explained
  - Component props documented with JSDoc or TypeScript

### 5.6 Portability

**REQ-PORT-001:** Static File Portability
- **Priority:** High
- **Description:** The build output MUST be deployable to any static hosting service.
- **Details:**
  - Output is self-contained in `out/` directory
  - No server-side dependencies
  - All assets referenced with relative paths
  - Works on file:// protocol (optional)

**REQ-PORT-002:** Development Environment
- **Priority:** Medium
- **Description:** The application SHOULD be developable on Windows, macOS, and Linux.
- **Details:**
  - Node.js 18+ required
  - npm or yarn for dependency management
  - Cross-platform file paths

### 5.7 Accessibility

**REQ-A11Y-001:** WCAG Compliance
- **Priority:** Medium
- **Description:** The application SHOULD meet WCAG 2.1 Level A standards.
- **Details:**
  - Sufficient color contrast (green on black meets 7:1 ratio)
  - Semantic HTML elements
  - Alt text for images (none currently present)
  - Keyboard accessible links

**REQ-A11Y-002:** Screen Reader Support
- **Priority:** Low
- **Description:** Content MAY be readable by screen readers.
- **Details:**
  - Semantic HTML structure
  - Proper heading hierarchy (h1, h2)
  - ARIA labels where appropriate (optional)

**REQ-A11Y-003:** Reduced Motion
- **Priority:** Low
- **Description:** Animations MAY respect prefers-reduced-motion setting.
- **Details:**
  - CSS media query to disable animations if preferred
  - Affects cursor blink and typing animation

## 6. Technical Requirements

### 6.1 Technology Stack

**REQ-TECH-001:** Next.js Framework
- **Priority:** High
- **Required Version:** Next.js 14.0.0 or later
- **Configuration:** App Router with static export

**REQ-TECH-002:** React
- **Priority:** High
- **Required Version:** React 18.2.0 or later (dependency of Next.js)

**REQ-TECH-003:** TypeScript
- **Priority:** High
- **Required Version:** TypeScript 5.0.0 or later
- **Configuration:** Strict mode enabled

**REQ-TECH-004:** Three.js
- **Priority:** High
- **Required Version:** Three.js 0.128.0 (exact version for compatibility)

**REQ-TECH-005:** Node.js
- **Priority:** High
- **Required Version:** Node.js 18.0.0 or later
- **Justification:** Next.js 14 compatibility

### 6.2 Platform and Browser Compatibility

**REQ-PLAT-001:** Desktop Operating Systems
- **Supported:** Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **Browser:** See REQ-USE-001

**REQ-PLAT-002:** Mobile Operating Systems
- **Supported:** iOS 14+, Android 10+
- **Browser:** Safari (iOS), Chrome (Android)

**REQ-PLAT-003:** Browser Requirements
- **JavaScript:** ES2020 support required
- **CSS:** Grid and Flexbox support required
- **WebGL:** WebGL 1.0 support required for 3D visualization

### 6.3 Build Configuration

**REQ-BUILD-001:** Package.json Scripts
- **Priority:** High
- **Required Scripts:**
  - `dev`: Development server (`next dev`)
  - `build`: Production build (`next build`)
  - `start`: Not applicable for static export (may show error)
  - `lint`: ESLint (`next lint`)

**REQ-BUILD-002:** Next.js Configuration
- **Priority:** High
- **File:** `next.config.js` or `next.config.mjs`
- **Required Settings:**
  ```javascript
  output: 'export'
  images: { unoptimized: true } // Required for static export
  ```

**REQ-BUILD-003:** TypeScript Configuration
- **Priority:** High
- **File:** `tsconfig.json`
- **Required Settings:**
  - `strict: true`
  - `jsx: "preserve"`
  - Next.js paths configuration

### 6.4 Styling Approach

**REQ-STYLE-001:** CSS Modules or Styled-Components
- **Priority:** High
- **Options:**
  - CSS Modules (recommended for simplicity)
  - styled-components (requires additional configuration)
- **Decision:** CSS Modules for easier migration

**REQ-STYLE-002:** Global Styles
- **Priority:** High
- **Details:**
  - Global resets (*, body) in `app/globals.css`
  - Applied in root layout
  - Includes keyframes animations

**REQ-STYLE-003:** Component Styles
- **Priority:** High
- **Details:**
  - Scoped to components via CSS Modules
  - Co-located with component files
  - Media queries included in module files

### 6.5 Data Storage

**REQ-DATA-001:** No Database Required
- **Priority:** N/A
- **Details:** Application is fully static with hardcoded content

**REQ-DATA-002:** Content Management
- **Priority:** Low
- **Details:** Content MAY be extracted to JSON or TypeScript constants for easier updates

### 6.6 Deployment Environment

**REQ-DEPLOY-001:** Target Environment
- **Priority:** High
- **Environment:** AWS EC2 instance running Amazon Linux 2023
- **Web Server:** Nginx
- **Deployment Method:** Ansible over AWS Systems Manager Session Manager

**REQ-DEPLOY-002:** Build Artifacts
- **Priority:** High
- **Details:**
  - Build generates static files in `out/` directory
  - All files from `out/` deployed to `/var/www/html/` on EC2
  - Includes: index.html, _next/ folder, favicon, etc.

**REQ-DEPLOY-003:** CloudFront Integration
- **Priority:** High
- **Details:**
  - CloudFront continues to serve content from EC2 origin
  - S3 maintenance page remains as failover
  - CloudFront cache invalidation required after deployment

## 7. Design Considerations

### 7.1 Component Architecture

**REQ-DESIGN-001:** Component Breakdown
- **Priority:** High
- **Proposed Components:**
  - `RootLayout` - App router layout with global styles
  - `HomePage` - Main page component
  - `TerminalWindow` - Container for terminal UI
  - `TerminalHeader` - Window controls and title
  - `TerminalBody` - Content area
  - `ThreeScene` - Three.js canvas and initialization
  - `InfoContent` - Text content and commands
  - `TypedCommand` - Typing animation component
  - `Footer` - Footer with keyboard interaction

**REQ-DESIGN-002:** State Management
- **Priority:** Medium
- **Details:**
  - useState for simple component state (typing animation progress)
  - useRef for DOM references (Three.js canvas)
  - No global state management required (Redux, Zustand not needed)

**REQ-DESIGN-003:** Effect Management
- **Priority:** High
- **Details:**
  - useEffect for Three.js initialization (empty deps array)
  - useEffect for typing animation (empty deps array)
  - useEffect for keyboard listeners (empty deps array)
  - Cleanup functions for all effects

### 7.2 File Organization

**REQ-ORG-001:** Directory Structure
- **Priority:** Medium
- **Proposed Structure:**
  ```
  /
  ├── app/
  │   ├── layout.tsx           # Root layout
  │   ├── page.tsx             # Home page
  │   ├── globals.css          # Global styles
  │   └── components/
  │       ├── TerminalWindow/
  │       │   ├── TerminalWindow.tsx
  │       │   └── TerminalWindow.module.css
  │       ├── ThreeScene/
  │       │   ├── ThreeScene.tsx
  │       │   └── ThreeScene.module.css
  │       └── [other components]
  ├── public/
  │   └── [static assets if needed]
  ├── package.json
  ├── tsconfig.json
  ├── next.config.js
  └── README.md
  ```

**REQ-ORG-002:** Code Co-location
- **Priority:** Low
- **Details:** Component files and their styles MAY be co-located in component folders

### 7.3 Branding and Style

**REQ-BRAND-001:** Color Scheme Preservation
- **Priority:** High
- **Colors:**
  - Background: #000 (black)
  - Text: #0f0 (green)
  - Headings: #fff (white) with green glow
  - Links: #0f0, hover: #0ff (cyan)
  - Terminal header: #333 (dark gray)
  - Window controls: #ff5f57 (red), #ffbd2e (yellow), #28c940 (green)

**REQ-BRAND-002:** Terminal Aesthetic
- **Priority:** High
- **Details:**
  - Monospace font family maintained
  - Terminal prompt "> " preserved
  - Command-line interaction style preserved
  - SGI FileVision aesthetic in 3D visualization

## 8. Testing and Quality Assurance

### 8.1 Testing Strategy

**REQ-TEST-001:** Manual Testing
- **Priority:** High
- **Scope:**
  - Visual comparison between old and new implementation
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile device testing (iOS and Android)
  - Responsive breakpoint testing

**REQ-TEST-002:** Build Testing
- **Priority:** High
- **Scope:**
  - Verify `npm run build` succeeds without errors
  - Verify `out/` directory contains all expected files
  - Verify no 404 errors in built application
  - Verify JavaScript executes without console errors

**REQ-TEST-003:** Deployment Testing
- **Priority:** High
- **Scope:**
  - Deploy to staging environment first
  - Verify CloudFront serves content correctly
  - Verify cache invalidation works
  - Verify failover to S3 maintenance page still functions

**REQ-TEST-004:** Performance Testing
- **Priority:** Medium
- **Scope:**
  - Run Lighthouse audit
  - Measure page load time
  - Check bundle size
  - Verify no performance regressions

**REQ-TEST-005:** Automated Testing (Optional)
- **Priority:** Low
- **Scope:**
  - Unit tests for utility functions (if any)
  - Component tests with React Testing Library
  - Visual regression tests with Percy or Chromatic
  - End-to-end tests with Playwright

### 8.2 Acceptance Criteria

**REQ-AC-001:** Visual Acceptance
- **Criteria:**
  - Side-by-side comparison shows no visual differences
  - All colors, fonts, spacing match exactly
  - Animations appear identical
  - Mobile layouts match current implementation

**REQ-AC-002:** Functional Acceptance
- **Criteria:**
  - Typing animation plays correctly
  - Cursor blinks continuously
  - Links open in new tabs
  - Keyboard interaction works
  - 3D visualization renders correctly
  - Window resize handled properly

**REQ-AC-003:** Performance Acceptance
- **Criteria:**
  - Lighthouse score ≥ 90
  - No JavaScript errors in console
  - Bundle size acceptable

**REQ-AC-004:** Deployment Acceptance
- **Criteria:**
  - GitHub Actions workflow completes successfully
  - Website accessible at production URL
  - CloudFront cache invalidation works
  - No deployment errors

### 8.3 Quality Gates

**REQ-QA-001:** Pre-Deployment Checklist
- **Required:**
  - [ ] Build succeeds without errors
  - [ ] TypeScript compilation successful
  - [ ] ESLint passes with no errors
  - [ ] Manual testing complete
  - [ ] Visual comparison approved
  - [ ] Mobile testing complete
  - [ ] Performance metrics acceptable
  - [ ] No console errors
  - [ ] External links verified

## 9. Deployment and Release

### 9.1 GitHub Actions Pipeline Changes

**REQ-CI-001:** Node.js Setup
- **Priority:** High
- **Changes Required:**
  - Add step to install Node.js 18.x using `actions/setup-node@v4`
  - Add npm cache configuration
  - Install before deploy-website job

**REQ-CI-002:** Build Step
- **Priority:** High
- **Changes Required:**
  - Add new job or step: `build-nextjs` (runs before deploy-website)
  - Working directory: root (where package.json is located)
  - Steps:
    1. Checkout code
    2. Setup Node.js
    3. Run `npm ci` (clean install)
    4. Run `npm run build`
    5. Upload `out/` directory as artifact

**REQ-CI-003:** Artifact Transfer
- **Priority:** High
- **Changes Required:**
  - Use `actions/upload-artifact@v4` to save build output
  - Name: `nextjs-build`
  - Path: `out/`
  - Retention: Minimal duration sufficient for deployment

**REQ-CI-004:** Deploy Step Update
- **Priority:** High
- **Changes Required:**
  - Download artifact before Ansible playbook execution
  - Extract to workspace
  - Update Ansible to copy from `out/` directory

### 9.2 Ansible Playbook Changes

**REQ-ANSIBLE-001:** Source Directory Change
- **Priority:** High
- **Changes Required:**
  - Update `Copy website HTML file` task
  - Change `src` from `../website/jonathan-wilson-90s.html` to `../out/index.html`
  - Update `dest` to `{{ website_dir }}/index.html`

**REQ-ANSIBLE-002:** Additional File Copy
- **Priority:** High
- **Changes Required:**
  - Add new task: `Copy Next.js static files`
  - Use `synchronize` or `copy` module
  - Copy entire `../out/` directory contents to `{{ website_dir }}/`
  - Preserve directory structure
  - Set correct ownership and permissions

**REQ-ANSIBLE-003:** Nginx Configuration
- **Priority:** Low
- **Changes Required (if needed):**
  - Ensure Nginx serves `index.html` by default
  - Ensure Nginx serves `_next/` directory correctly
  - Add MIME types for .js, .css, .map files (should be default)

### 9.3 Release Strategy

**REQ-REL-001:** Phased Rollout
- **Priority:** Medium
- **Approach:**
  - Phase 1: Deploy to development/staging branch
  - Phase 2: Manual testing and validation
  - Phase 3: Merge to main and deploy to production
  - Rollback plan: Revert Git commit and redeploy previous version

**REQ-REL-002:** Feature Branch Development
- **Priority:** High
- **Approach:**
  - Create feature branch: `feature/nextjs-migration`
  - Implement all changes in feature branch
  - Test in feature branch pipeline
  - Create pull request for review
  - Merge after approval and successful tests

**REQ-REL-003:** Rollback Plan
- **Priority:** High
- **Procedure:**
  1. Identify deployment failure or critical bug
  2. Revert merge commit on main branch
  3. Push revert commit
  4. GitHub Actions automatically redeploys previous version
  5. Verify website functionality restored
  6. Investigate and fix issue in feature branch

### 9.4 Deployment Verification

**REQ-VERIFY-001:** Post-Deployment Checks
- **Priority:** High
- **Checklist:**
  - [ ] Website loads successfully
  - [ ] No 404 errors in browser network tab
  - [ ] No JavaScript console errors
  - [ ] Three.js visualization renders
  - [ ] Typing animation works
  - [ ] Links are clickable
  - [ ] Mobile view works correctly
  - [ ] CloudFront cache invalidation completed

**REQ-VERIFY-002:** Monitoring
- **Priority:** Medium
- **Details:**
  - Monitor CloudFront access logs (optional)
  - Check for 4xx/5xx error rates
  - Verify metrics in AWS CloudWatch

## 10. Maintenance and Support

### 10.1 Ongoing Maintenance

**REQ-MAINT-004:** Dependency Updates
- **Priority:** Medium
- **Process:**
  - Run `npm outdated` to check for updates
  - Update minor and patch versions
  - Test thoroughly before deploying
  - Update major versions with caution (breaking changes)

**REQ-MAINT-005:** Security Patching
- **Priority:** High
- **Process:**
  - Monitor `npm audit` output
  - Apply security patches immediately
  - Test and deploy promptly

**REQ-MAINT-006:** Next.js Version Updates
- **Priority:** Low
- **Process:**
  - Review Next.js release notes
  - Test in development branch
  - Update when stable and beneficial

### 10.2 Support Procedures

**REQ-SUP-001:** Issue Reporting
- **Priority:** Low
- **Process:**
  - Issues reported via GitHub Issues
  - Include browser, device, and reproduction steps
  - Assign priority based on severity

**REQ-SUP-002:** Bug Fixes
- **Priority:** High (for critical bugs)
- **Process:**
  - Reproduce issue locally
  - Fix in feature branch
  - Test thoroughly
  - Deploy via standard CI/CD pipeline

### 10.3 Documentation Maintenance

**REQ-DOC-001:** README Updates
- **Priority:** Medium
- **Changes Required:**
  - Update README.md with Next.js setup instructions
  - Document local development: `npm install`, `npm run dev`
  - Document build process: `npm run build`
  - Document deployment process (unchanged except build step)

**REQ-DOC-002:** Code Comments
- **Priority:** Low
- **Details:**
  - Maintain inline comments for complex logic
  - Update comments when code changes
  - Document any deviations from standard patterns

## 11. Migration Execution Plan

### 11.1 Development Phases

**PHASE-001:** Project Setup
- Initialize Next.js project with TypeScript
- Configure static export
- Install dependencies (Three.js, etc.)
- Set up directory structure
- Configure ESLint and TypeScript

**PHASE-002:** CSS Migration
- Extract CSS from HTML file
- Create global styles file
- Create CSS Modules for components
- Implement responsive media queries
- Test styles in isolation

**PHASE-003:** Component Development
- Create TerminalWindow component
- Create TerminalHeader component
- Create InfoContent component
- Create TypedCommand component with animation
- Create Footer component with keyboard interaction
- Test components individually

**PHASE-004:** Three.js Integration
- Create ThreeScene component
- Implement scene initialization in useEffect
- Recreate SGI FileVision grid layout
- Implement shader materials
- Add lighting system
- Implement animation loop
- Test on desktop and mobile

**PHASE-005:** Integration and Testing
- Integrate all components in HomePage
- Test responsive layouts
- Test animations and interactions
- Visual comparison with original
- Cross-browser testing
- Performance testing with Lighthouse

**PHASE-006:** CI/CD Pipeline Updates
- Update GitHub Actions workflow
- Add Node.js setup
- Add build step
- Configure artifact upload/download
- Update Ansible playbook
- Test pipeline in feature branch

**PHASE-007:** Deployment and Validation
- Deploy to production
- Post-deployment verification
- Monitor for errors
- Performance validation

### 11.2 Dependencies and Prerequisites

**PREREQ-001:** Development Environment
- Node.js 18+ installed locally
- Git installed and configured
- Access to GitHub repository
- Code editor (VS Code recommended)

**PREREQ-002:** AWS and Infrastructure Access
- AWS credentials configured in GitHub Secrets
- Access to Terraform state (for outputs)
- Access to EC2 instance via Session Manager
- CloudFront cache invalidation permissions

**PREREQ-003:** Knowledge Requirements
- React and Next.js familiarity
- TypeScript basic knowledge
- Three.js understanding (or willingness to learn)
- CSS Modules or styled-components experience
- Git and GitHub Actions knowledge

### 11.3 Risk Mitigation

**RISK-001:** Three.js Integration Complexity
- **Risk:** Three.js may be difficult to integrate with React and SSR/SSG
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Use dynamic import with `ssr: false` if needed
  - Initialize Three.js only in useEffect (client-side)
  - Test early in development process
  - Reference existing Next.js + Three.js examples

**RISK-002:** Visual Regression
- **Risk:** New implementation may not match original exactly
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Side-by-side comparison during development
  - Take screenshots of original for reference
  - Pixel-perfect CSS measurement
  - Thorough testing at all breakpoints

**RISK-003:** Build or Deployment Failure
- **Risk:** CI/CD pipeline may fail after changes
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - Test pipeline in feature branch first
  - Implement rollback procedure
  - Monitor first production deployment closely
  - Keep old workflow as backup

**RISK-004:** Performance Degradation
- **Risk:** Next.js bundle may be larger or slower than static HTML
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Monitor bundle size during development
  - Use Next.js production optimizations
  - Implement code splitting if needed
  - Run Lighthouse audits regularly

**RISK-005:** Mobile Compatibility Issues
- **Risk:** Responsive design may break on certain devices
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Test on real devices (iOS and Android)
  - Use browser DevTools device emulation
  - Test at exact breakpoints (768px, 480px)
  - Ensure overflow handling is correct

**RISK-006:** Browser Compatibility Issues
- **Risk:** Application may not work in all target browsers
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Next.js handles transpilation automatically
  - Test in all target browsers manually
  - Check caniuse.com for WebGL support
  - Provide fallback message if WebGL unavailable (optional)

## 12. Success Criteria Summary

The migration will be considered successful when ALL of the following criteria are met:

### 12.1 Functional Success
- [ ] Website loads without errors
- [ ] Typing animation plays correctly
- [ ] Cursor blinks continuously
- [ ] Three.js visualization renders identically to original
- [ ] All links open in new tabs
- [ ] Keyboard interaction works
- [ ] Mobile responsive design functions at 768px and 480px breakpoints
- [ ] No horizontal scrolling on any screen size

### 12.2 Visual Success
- [ ] Side-by-side comparison shows pixel-perfect match on desktop
- [ ] Mobile layouts match original exactly
- [ ] All colors match exactly (black, green, white, etc.)
- [ ] Fonts and typography identical
- [ ] Animations have same timing and appearance
- [ ] Three.js scene appearance unchanged

### 12.3 Technical Success
- [ ] Next.js build completes without errors
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with no errors
- [ ] No JavaScript console errors
- [ ] Lighthouse performance score ≥ 90
- [ ] Bundle size ≤ 500KB (gzipped)
- [ ] npm audit shows zero high/critical vulnerabilities

### 12.4 Deployment Success
- [ ] GitHub Actions workflow completes successfully
- [ ] Website deployed to EC2 instance
- [ ] CloudFront serves content correctly
- [ ] Cache invalidation works
- [ ] Post-deployment verification passes
- [ ] No downtime during deployment

### 12.5 Documentation Success
- [ ] README.md updated with new setup instructions
- [ ] Code includes appropriate comments
- [ ] Migration documented for future reference

## 13. Appendix

### 13.1 Current Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **3D Library:** Three.js r128 (CDN)
- **Font:** Courier New (system font)
- **Infrastructure:** AWS (EC2, S3, CloudFront)
- **IaC:** Terraform
- **Configuration Management:** Ansible
- **CI/CD:** GitHub Actions
- **Version Control:** Git (GitHub)

### 13.2 Future Technology Stack
- **Framework:** Next.js 14+
- **Language:** TypeScript 5+
- **UI Library:** React 18+
- **3D Library:** Three.js 0.128.0 (npm)
- **Styling:** CSS Modules
- **Build Tool:** Next.js built-in (webpack/turbopack)
- **Infrastructure:** Unchanged (AWS EC2, S3, CloudFront)
- **IaC:** Terraform (minimal changes)
- **Configuration Management:** Ansible (updated for Next.js)
- **CI/CD:** GitHub Actions (updated workflow)
- **Version Control:** Git (GitHub)

### 13.3 Key Files and Locations

**Current Implementation:**
- HTML: `/home/jdubz/personal-page/website/jonathan-wilson-90s.html`
- Maintenance page: `/home/jdubz/personal-page/website/maintenance.html`

**Infrastructure:**
- Terraform: `/home/jdubz/personal-page/terraform/`
- Ansible: `/home/jdubz/personal-page/ansible/`
- GitHub Actions: `/home/jdubz/personal-page/.github/workflows/deploy.yml`

**New Implementation (to be created):**
- Next.js root: `/home/jdubz/personal-page/` (or new subdirectory if preferred)
- Components: `/home/jdubz/personal-page/app/components/`
- Styles: `/home/jdubz/personal-page/styles/` or co-located with components
- Build output: `/home/jdubz/personal-page/out/` (generated)

### 13.4 Reference Links
- [Next.js Static Exports Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Three.js Documentation](https://threejs.org/docs/)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### 13.5 Contacts and Stakeholders
- **Project Owner:** Jonathan Wilson (imjonathanwilson)
- **Repository:** https://github.com/imjonathanwilson/personal-page (assumed)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Status:** Draft
**Next Review Date:** Upon completion of migration
