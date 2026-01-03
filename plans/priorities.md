# Feature-to-Value-Chain Migration Priorities

## Executive Summary

This document provides a strategic prioritization analysis for the migration of Jonathan Wilson's personal portfolio from static HTML/CSS/JavaScript to Next.js with Static Site Generation (SSG). The migration represents a technical modernization initiative that balances innovation with risk mitigation, focusing on maintaining 100% visual and functional parity while establishing a foundation for future development velocity.

**Project Context:**
- Migration Type: Modernization (preserving existing functionality)
- Business Model: Personal brand/portfolio (non-revenue generating)
- Primary Goal: Technical debt reduction and future-proofing
- Constraint: Zero visual/functional regression allowed
- Deployment Model: Static export to AWS (S3, CloudFront, EC2)

**Strategic Recommendation:** Execute a phased, foundation-first approach that prioritizes risk mitigation and establishes stable infrastructure before feature implementation. The migration should follow a "crawl-walk-run" strategy, beginning with core framework setup and concluding with optimization and enhancement.

---

## 1. Strategic Analysis

### 1.1 Jobs To Be Done (JTBD) Framework

**Primary Job:**
*"When I need to maintain and evolve my personal portfolio website, I want a modern, component-based architecture, so I can iterate quickly without accumulating technical debt."*

**Functional Jobs:**
- Maintain professional online presence with minimal effort
- Demonstrate technical capabilities through modern stack
- Ensure website remains accessible and performant
- Enable future feature additions without complete rewrites

**Emotional Jobs:**
- Project technical competence to potential employers/clients
- Maintain control and ownership over personal brand
- Reduce anxiety about outdated technology stack

**Social Jobs:**
- Signal alignment with industry best practices
- Demonstrate continuous learning and adaptation

### 1.2 Kano Model Categorization

**Basic Expectations (Must-Have):**
- 100% visual parity with current implementation
- Three.js 3D visualization functioning identically
- Mobile responsiveness preserved
- Zero downtime during migration
- All links and interactions working

**Performance Attributes (Linear Satisfaction):**
- Page load performance (Lighthouse ≥ 90)
- Build time optimization
- Bundle size reduction
- Development velocity improvements

**Delighters (Unexpected Value):**
- TypeScript type safety catching future errors
- Component reusability for future features
- Improved maintainability through modular architecture
- Foundation for progressive enhancement

### 1.3 Business Model Canvas Impact

**Value Proposition:**
- **Before:** Static portfolio demonstrating technical skills
- **After:** Modern, maintainable portfolio with demonstrated React/Next.js expertise
- **Enhancement:** Shifts value proposition to include modern framework proficiency

**Key Activities:**
- **Current:** Manual HTML/CSS editing
- **Future:** Component-based development with hot-reload
- **Impact:** Reduces time-to-update for content changes

**Key Resources:**
- **New Requirement:** Node.js development environment, npm ecosystem
- **Capability Gain:** React component library, TypeScript tooling

**Customer Relationships:**
- **Audience:** Recruiters, potential employers, professional network
- **Trust Factor:** Modern stack signals current technical relevance

### 1.4 Porter's Value Chain Analysis

#### Primary Activities Impact

**Inbound Logistics (Content Management):**
- **Current State:** Content embedded in single HTML file
- **Future State:** Structured React components with separation of concerns
- **Value Addition:** Medium - Easier content updates, better organization

**Operations (Website Maintenance):**
- **Current State:** Direct HTML/CSS/JS editing
- **Future State:** Component-based development with TypeScript
- **Value Addition:** High - Faster iteration, fewer bugs, better DX

**Outbound Logistics (Deployment):**
- **Current State:** Single HTML file deployment
- **Future State:** Static export with optimized assets
- **Value Addition:** Low - Deployment complexity slightly increases

**Marketing & Sales (Professional Presence):**
- **Current State:** Functional but dated technology demonstration
- **Future State:** Modern stack demonstration
- **Value Addition:** Medium - Enhanced professional credibility

**Service (User Experience):**
- **Current State:** Fast, simple static page
- **Future State:** Equivalent or better performance
- **Value Addition:** Neutral - Must maintain parity

#### Support Activities Impact

**Technology Development:**
- **Impact:** High - Establishes foundation for future enhancements
- **Capability Building:** React/Next.js expertise, modern tooling

**Infrastructure:**
- **Impact:** Medium - CI/CD pipeline updated but AWS infrastructure unchanged
- **Risk:** Increased build complexity

**Procurement:**
- **Impact:** Low - Three.js from CDN to npm (better dependency management)

### 1.5 VRIO Analysis

| Resource/Capability | Valuable | Rare | Inimitable | Organized | Competitive Advantage |
|---------------------|----------|------|------------|-----------|----------------------|
| Next.js Architecture | Yes | No | No | TBD | Parity |
| Three.js Integration | Yes | Somewhat | No | Yes | Temporary |
| Terminal Aesthetic | Yes | Somewhat | No | Yes | Temporary |
| TypeScript Foundation | Yes | No | No | TBD | Parity |
| Component Library | Yes | No | No | TBD | Parity |

**Analysis:** Migration brings capabilities to industry parity rather than creating competitive advantage. Value is primarily defensive (avoiding obsolescence) rather than offensive (gaining advantage).

### 1.6 SWOT Analysis

**Strengths:**
- Clear requirements with pixel-perfect specification
- Existing implementation as reference
- Established AWS infrastructure
- Agentic implementation (no time pressure)
- Strong technical documentation

**Weaknesses:**
- Single-page application limits architectural complexity demonstration
- No server-side features to showcase SSR/API capabilities
- Migration effort doesn't add user-facing features
- Increased deployment complexity

**Opportunities:**
- Demonstrate modern framework proficiency to employers
- Foundation for future blog, portfolio case studies, or CMS
- Improved developer experience for content updates
- Showcase Three.js + React integration skills
- TypeScript as documentation and error prevention

**Threats:**
- Regression in visual/functional parity damaging professional brand
- Over-engineering a simple site (complexity without benefit)
- Framework obsolescence (Next.js evolution, React alternatives)
- Increased maintenance burden (dependencies, security updates)
- Performance degradation from framework overhead

### 1.7 PESTEL Analysis

**Political:** N/A (personal project)

**Economic:**
- **Job Market Trend:** React/Next.js skills highly demanded
- **ROI:** Improved employability justifies migration effort
- **Cost:** Minimal (AWS costs unchanged, development time is sunk cost)

**Social:**
- **Industry Norms:** Static HTML perceived as outdated
- **Professional Expectations:** Modern frameworks expected for front-end roles
- **Community:** Strong Next.js/React community for support

**Technological:**
- **Framework Evolution:** Next.js 14+ App Router represents current best practice
- **Ecosystem Maturity:** React ecosystem stable and well-supported
- **Tooling:** TypeScript, ESLint, modern build tools improve quality
- **WebGL Support:** Three.js + React integration well-established

**Environmental:**
- **Sustainability:** Static export minimizes server resources (positive)

**Legal:**
- **Licensing:** All dependencies open-source and permissive
- **Compliance:** No GDPR/privacy concerns (no data collection)

---

## 2. Feature Prioritization Matrix

### 2.1 RICE Scoring (Reach × Impact × Confidence ÷ Effort)

| Feature/Requirement | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------------------|-------|--------|------------|--------|------------|----------|
| Next.js Project Setup | 10 | 10 | 100% | 2 | 50.0 | CRITICAL |
| Static Export Config | 10 | 10 | 100% | 1 | 100.0 | CRITICAL |
| Three.js Integration | 10 | 10 | 80% | 8 | 10.0 | HIGH |
| CSS Migration | 10 | 8 | 90% | 5 | 14.4 | HIGH |
| Component Architecture | 8 | 9 | 90% | 6 | 10.8 | HIGH |
| Typing Animation | 10 | 8 | 90% | 4 | 18.0 | HIGH |
| Responsive Design | 10 | 10 | 95% | 5 | 19.0 | HIGH |
| CI/CD Pipeline Update | 10 | 9 | 85% | 6 | 12.8 | HIGH |
| Ansible Playbook Update | 10 | 9 | 90% | 4 | 20.3 | HIGH |
| Terminal UI Components | 8 | 7 | 95% | 4 | 13.3 | MEDIUM |
| External Links | 10 | 5 | 100% | 1 | 50.0 | MEDIUM |
| SEO/Metadata | 7 | 6 | 100% | 2 | 21.0 | MEDIUM |
| Keyboard Interaction | 6 | 4 | 90% | 2 | 10.8 | MEDIUM |
| Footer Component | 8 | 3 | 100% | 1 | 24.0 | LOW |
| Visual Regression Testing | 10 | 8 | 70% | 8 | 7.0 | LOW |
| Performance Testing | 9 | 7 | 80% | 3 | 16.8 | LOW |
| Automated Testing | 5 | 5 | 60% | 10 | 1.5 | OPTIONAL |

**Scoring Rationale:**
- **Reach:** 10 = affects all users, 5 = affects half, 1 = niche
- **Impact:** 10 = critical to success, 1 = minimal improvement
- **Confidence:** Percentage certainty in estimates
- **Effort:** Person-weeks (1 = 1 week)

### 2.2 MoSCoW Prioritization

#### MUST HAVE (Non-Negotiable for Launch)
1. **Foundation Layer**
   - Next.js 14+ project initialization (REQ-STRUCT-001)
   - Static export configuration (REQ-STRUCT-002)
   - TypeScript setup (REQ-TECH-003)
   - Directory organization (REQ-STRUCT-003)

2. **Visual Parity Layer**
   - CSS migration with 100% visual match (REQ-TERM-004, REQ-BRAND-001)
   - Responsive design at 768px and 480px breakpoints (REQ-RESP-001-004)
   - Terminal aesthetic preservation (REQ-BRAND-002)
   - Typography exact matching (REQ-TERM-004)

3. **Core Functionality Layer**
   - Three.js npm package integration (REQ-3D-001)
   - SGI FileVision interface recreation (REQ-3D-002-008)
   - Terminal component structure (REQ-TERM-001-003)
   - Typing animation (REQ-ANIM-001-002)
   - External links (REQ-LINK-001-002)

4. **Deployment Layer**
   - GitHub Actions pipeline update (REQ-CI-001-004)
   - Ansible playbook modification (REQ-ANSIBLE-001-002)
   - Build artifact management (REQ-DEPLOY-002)
   - CloudFront integration preservation (REQ-DEPLOY-003)

#### SHOULD HAVE (Important but Flexible)
- SEO metadata optimization (REQ-SEO-001-002)
- Performance benchmarking (REQ-PERF-001)
- Keyboard interaction enhancement (REQ-ANIM-003)
- Footer component (REQ-TERM-005)
- Code quality tooling (ESLint, Prettier) (REQ-MAINT-001)
- Documentation updates (REQ-DOC-001)

#### COULD HAVE (Nice to Have)
- Visual regression testing automation (REQ-TEST-005)
- Bundle size optimization beyond target (REQ-PERF-002)
- Content extraction to JSON/constants (REQ-DATA-002)
- Reduced motion accessibility (REQ-A11Y-003)
- Screen reader optimization (REQ-A11Y-002)

#### WON'T HAVE (Out of Scope)
- Server-side rendering features
- API routes or backend functionality
- New visual features or design changes
- CMS integration
- Dynamic content management
- Infrastructure changes beyond deployment scripts

### 2.3 Value vs. Effort Matrix

```
High Value, Low Effort (QUICK WINS)
┌─────────────────────────────────────┐
│ - Static export config              │
│ - External links                    │
│ - SEO metadata                      │
│ - Footer component                  │
│ - Ansible playbook update           │
└─────────────────────────────────────┘

High Value, High Effort (STRATEGIC PROJECTS)
┌─────────────────────────────────────┐
│ - Three.js integration              │
│ - CSS migration                     │
│ - Component architecture            │
│ - Responsive design implementation  │
│ - CI/CD pipeline update             │
└─────────────────────────────────────┘

Low Value, Low Effort (FILL-INS)
┌─────────────────────────────────────┐
│ - Keyboard interaction              │
│ - Code comments                     │
│ - README updates                    │
└─────────────────────────────────────┘

Low Value, High Effort (AVOID/DEPRIORITIZE)
┌─────────────────────────────────────┐
│ - Automated visual regression tests │
│ - Comprehensive unit test suite     │
│ - Advanced performance optimization │
└─────────────────────────────────────┘
```

---

## 3. Implementation Phases

### PHASE 0: Pre-Migration Preparation (Foundation)
**Duration:** 1 week
**Dependencies:** None
**Risk Level:** Low

**Objectives:**
- Establish baseline measurements
- Capture current implementation reference
- Prepare development environment

**Tasks:**
1. Screenshot current implementation at all breakpoints (desktop, 768px, 480px)
2. Record Lighthouse performance baseline
3. Document current bundle size (Three.js CDN)
4. Export current HTML/CSS/JS as reference files
5. Set up local development environment (Node.js 18+)
6. Review current GitHub Actions and Ansible configurations

**Success Criteria:**
- [ ] Complete visual reference captured
- [ ] Performance baseline documented
- [ ] Development environment verified

**Value Delivered:** Risk mitigation through comprehensive baseline

---

### PHASE 1: Foundation Setup (Infrastructure)
**Duration:** 1-2 weeks
**Dependencies:** Phase 0 complete
**Risk Level:** Low
**RICE Score:** 75.0 (average of foundation tasks)

**Objectives:**
- Establish Next.js project structure
- Configure build pipeline
- Validate basic deployment path

**Tasks:**
1. Initialize Next.js 14+ project with TypeScript
   - `npx create-next-app@latest` with App Router
   - Configure `next.config.js` with `output: 'export'`
   - Verify `tsconfig.json` strict mode settings

2. Install dependencies
   - `three@0.128.0` (exact version match)
   - Development dependencies (ESLint, TypeScript types)

3. Set up directory structure
   ```
   /app
     /components
     layout.tsx
     page.tsx
     globals.css
   /public
   ```

4. Create "Hello World" static export
   - Verify `npm run build` generates `out/` directory
   - Verify `out/index.html` is valid

5. Update `.gitignore` for Next.js artifacts
   - Add `out/`, `.next/`, `node_modules/`

**Success Criteria:**
- [ ] `npm run dev` launches development server
- [ ] `npm run build` completes without errors
- [ ] Static export generates in `out/` directory
- [ ] TypeScript compilation succeeds

**Value Delivered:**
- Validated technical approach
- De-risked Three.js + React integration concerns
- Established build pipeline foundation

**Blocking Requirements:** REQ-STRUCT-001, REQ-STRUCT-002, REQ-TECH-001-005, REQ-BUILD-001-003

---

### PHASE 2: CSS Migration (Visual Foundation)
**Duration:** 1 week
**Dependencies:** Phase 1 complete
**Risk Level:** Medium
**RICE Score:** 14.4

**Objectives:**
- Extract all CSS from HTML
- Establish CSS Modules pattern
- Achieve pixel-perfect visual parity (static content only)

**Tasks:**
1. Create `app/globals.css`
   - Extract global resets (*, body, html)
   - Extract keyframes animations (@keyframes blink)
   - Extract font-family declarations

2. Create component CSS Modules
   - `TerminalWindow.module.css` - container, header, body structure
   - `ThreeScene.module.css` - canvas container, responsive hiding
   - `InfoContent.module.css` - terminal text content
   - `Footer.module.css` - footer positioning

3. Implement responsive breakpoints
   - Desktop baseline (≥ 768px)
   - Tablet/mobile (< 768px): hide canvas, adjust padding
   - Small mobile (< 480px): further typography adjustments

4. Create color palette constants (optional TypeScript file)
   ```typescript
   export const colors = {
     background: '#000',
     primary: '#0f0',
     accent: '#0ff',
     ...
   }
   ```

5. Visual comparison testing
   - Render static content in Next.js
   - Side-by-side browser comparison
   - Measure font sizes, padding, margins with DevTools

**Success Criteria:**
- [ ] All CSS extracted from HTML
- [ ] No inline styles remaining
- [ ] Responsive breakpoints functional
- [ ] Static content visually identical to original
- [ ] CSS Modules successfully scoped

**Value Delivered:**
- Visual parity established early (reduces downstream risk)
- Modular CSS foundation for components
- Responsive design validated

**Blocking Requirements:** REQ-TERM-004, REQ-RESP-001-004, REQ-BRAND-001-002, REQ-STYLE-001-003

---

### PHASE 3: Core Component Architecture
**Duration:** 2 weeks
**Dependencies:** Phase 2 complete
**Risk Level:** Medium
**RICE Score:** 10.8

**Objectives:**
- Build React component hierarchy
- Implement typing animation
- Establish state management patterns

**Tasks:**
1. **Create TerminalWindow component** (container)
   - Props: none (static content)
   - Renders TerminalHeader and TerminalBody
   - Applies module CSS

2. **Create TerminalHeader component**
   - Window control buttons (red, yellow, green circles)
   - Title text: "jonathan-wilson@homepage:~"
   - Responsive sizing adjustments

3. **Create InfoContent component**
   - Semantic HTML structure (h1, h2, p, a)
   - Command line prompt rendering
   - Projects and skills sections
   - External links with security attributes

4. **Create TypedCommand component** (animation)
   - State: `typedText` (string)
   - useEffect with setTimeout chain for typing effect
   - 500ms initial delay, 75ms char interval
   - Text: "cat about_me.txt"
   - Cleanup on unmount

5. **Create cursor element**
   - Separate span with "blink" animation
   - CSS keyframes in globals.css
   - Positioned after TypedCommand

6. **Create Footer component**
   - State: `message` (string)
   - useEffect for keyboard event listener
   - Toggle message on keypress (2s timeout)
   - Cleanup on unmount
   - Responsive positioning (absolute vs. relative)

7. **Integrate in HomePage (app/page.tsx)**
   - Compose all components
   - Verify no prop drilling issues
   - Test component isolation

**Success Criteria:**
- [ ] Components render without errors
- [ ] Typing animation plays correctly (timing verified)
- [ ] Cursor blinks continuously
- [ ] Keyboard interaction triggers footer message change
- [ ] Component hierarchy is logical and maintainable
- [ ] TypeScript types defined for all props

**Value Delivered:**
- Complete terminal UI functionality
- Animation system validated
- Component patterns established for Three.js phase

**Blocking Requirements:** REQ-TERM-001-005, REQ-ANIM-001-003, REQ-LINK-001-002, REQ-DESIGN-001-003

---

### PHASE 4: Three.js Integration (Critical Path)
**Duration:** 2-3 weeks
**Dependencies:** Phase 3 complete
**Risk Level:** High
**RICE Score:** 10.0

**Objectives:**
- Recreate SGI FileVision 3D visualization
- Achieve visual parity with original Three.js scene
- Ensure performance and responsiveness

**Tasks:**
1. **Create ThreeScene component shell**
   - useRef for canvas container
   - useEffect for initialization (empty deps array)
   - Dynamic import with `ssr: false` if needed (test first)
   - Cleanup on unmount (dispose geometry, materials, renderer)

2. **Implement scene initialization**
   - Scene, camera, renderer setup
   - Camera: PerspectiveCamera(50, aspect, 0.1, 1000)
   - Position: (0, 18, 40), lookAt: (0, 0, -4)
   - Renderer: WebGLRenderer, antialias true

3. **Create block geometry and materials**
   - Standard box: 2.5 × 2.5 × 2.5
   - Highlighted box: 2.5 × 1.75 × 2.5
   - Custom shader materials (vertex + fragment shaders)
   - Standard shader: green glow, 0.4 brightness, time-based pulse
   - Highlighted shader: 0.9 brightness, enhanced rim lighting

4. **Generate block grid layout**
   - Root block: position (0, 1.25, 8)
   - 63 directory blocks: 7 rows × 9 columns
   - 4-unit grid spacing (X and Z axes)
   - Identify "proxy" block for spotlight target

5. **Implement lighting system**
   - AmbientLight: 0x003300, intensity 0.8
   - DirectionalLight: 0x00aa66, intensity 1, position (5, 10, 7)
   - PointLight: 0x00cc66, intensity 1, distance 20, position (-5, 8, 5)
   - SpotLight: 0x00ff66, intensity 5, targeting proxy block
   - Light beam cylinder: CylinderGeometry, radius 2, height 20
   - Ground circle: CircleGeometry, radius 2, opacity 0.3

6. **Add grid floor**
   - GridHelper: size 50, divisions 15
   - Colors: 0x006600 (major), 0x004400 (minor)
   - Position: y = -1, z = 10

7. **Implement animation loop**
   - requestAnimationFrame recursive call
   - Update shader time uniforms (increment by 0.01)
   - No block rotation (static positions)
   - Store animation ID for cleanup

8. **Window resize handling**
   - Event listener on window resize
   - Update camera aspect ratio
   - Update renderer size
   - Recalculate projection matrix

9. **Mobile behavior**
   - CSS: display none for < 768px
   - Optional: conditional rendering to skip Three.js init on mobile
   - Test on mobile devices (no errors expected)

10. **Visual comparison and tuning**
    - Side-by-side with original implementation
    - Adjust shader parameters for exact color match
    - Verify lighting intensity and positions
    - Ensure pulsing animation timing matches

**Success Criteria:**
- [ ] Three.js scene renders on desktop
- [ ] All 64 blocks (1 root + 63 directory) visible
- [ ] Shader colors match original exactly
- [ ] Lighting creates identical visual effect
- [ ] Pulsing animation timing matches
- [ ] Spotlight and beam render correctly
- [ ] Grid floor visible and positioned correctly
- [ ] Window resize updates scene properly
- [ ] No errors on mobile (canvas hidden)
- [ ] No memory leaks (cleanup verified)

**Value Delivered:**
- Core visual differentiator of portfolio implemented
- Demonstrates Three.js + React integration skills
- Highest risk item completed (de-risks remaining work)

**Blocking Requirements:** REQ-3D-001-009

---

### PHASE 5: Integration and Quality Assurance
**Duration:** 1-2 weeks
**Dependencies:** Phase 4 complete
**Risk Level:** Medium
**RICE Score:** 16.8 (average of testing tasks)

**Objectives:**
- Integrate all components into HomePage
- Verify cross-browser compatibility
- Validate performance targets
- Ensure mobile responsiveness

**Tasks:**
1. **Final integration in app/page.tsx**
   - Compose TerminalWindow and ThreeScene
   - Verify z-index layering (canvas background, terminal foreground)
   - Test component interaction (no conflicts)

2. **Cross-browser testing**
   - Chrome 90+ (desktop and mobile)
   - Firefox 88+ (desktop and mobile)
   - Safari 14+ (desktop and mobile)
   - Edge 90+ (desktop)
   - Document any browser-specific issues

3. **Responsive design validation**
   - Test at exact breakpoints: 768px, 480px
   - Test intermediate sizes (e.g., 600px, 375px)
   - Verify no horizontal scrolling at any width
   - Test on real devices (iOS, Android)

4. **Performance testing**
   - Run Lighthouse audit (target: ≥ 90)
   - Analyze bundle size with `npm run build` output
   - Verify gzipped size ≤ 500KB total
   - Check Three.js chunk size (should be separate)

5. **Visual regression comparison**
   - Screenshot new implementation at all breakpoints
   - Overlay with original screenshots
   - Measure any pixel differences
   - Document any intentional deviations

6. **Functional testing checklist**
   - [ ] Typing animation plays on load
   - [ ] Cursor blinks continuously
   - [ ] Three.js scene renders and animates
   - [ ] Window resize updates scene
   - [ ] Links open in new tabs
   - [ ] Keyboard interaction changes footer
   - [ ] Mobile view hides canvas
   - [ ] No console errors
   - [ ] No network errors (404s)

7. **Accessibility audit**
   - Verify color contrast (green on black: 7:1 ratio)
   - Test keyboard navigation (Tab key)
   - Verify semantic HTML structure
   - Test with screen reader (optional)

8. **Security audit**
   - Run `npm audit` (zero high/critical vulnerabilities)
   - Verify `rel="noopener noreferrer"` on external links
   - Check for any exposed secrets or keys

**Success Criteria:**
- [ ] All functional tests pass
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Lighthouse score ≥ 90
- [ ] Bundle size ≤ 500KB
- [ ] Visual parity confirmed
- [ ] No accessibility regressions
- [ ] Zero high/critical security vulnerabilities

**Value Delivered:**
- Validated production-ready implementation
- Performance targets met
- Risk of post-launch issues minimized

**Blocking Requirements:** REQ-USE-001, REQ-PERF-001-003, REQ-TEST-001-004, REQ-AC-001-003

---

### PHASE 6: CI/CD Pipeline Updates (Deployment Path)
**Duration:** 1 week
**Dependencies:** Phase 5 complete
**Risk Level:** Medium
**RICE Score:** 16.6 (average of CI/CD tasks)

**Objectives:**
- Update GitHub Actions workflow for Next.js build
- Modify Ansible playbook for static export deployment
- Validate end-to-end deployment path

**Tasks:**
1. **Create feature branch**
   - Branch: `feature/nextjs-migration`
   - Ensure all code changes committed

2. **Update GitHub Actions workflow** (`.github/workflows/deploy.yml`)
   - Add Node.js setup step (actions/setup-node@v4)
     - Version: 18.x
     - Cache: npm

   - Add build job (runs before deploy-website)
     ```yaml
     build-nextjs:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-artifact@v4
           with:
             name: nextjs-build
             path: out/
             retention-days: 1
     ```

   - Update deploy-website job
     - Add dependency: `needs: build-nextjs`
     - Add artifact download step
     ```yaml
     - uses: actions/download-artifact@v4
       with:
         name: nextjs-build
         path: ./nextjs-build
     ```

3. **Update Ansible playbook** (`ansible/playbook.yml`)
   - Modify website copy task
     - Change from single HTML file to directory sync
     ```yaml
     - name: Copy Next.js build output
       ansible.posix.synchronize:
         src: ../nextjs-build/
         dest: "{{ website_dir }}/"
         delete: yes
         recursive: yes
     ```

   - Ensure correct permissions
     - Owner: nginx or www-data
     - Permissions: 644 for files, 755 for directories

4. **Test pipeline in feature branch**
   - Push to feature branch
   - Monitor GitHub Actions execution
   - Verify build job succeeds
   - Verify artifact upload/download
   - Verify Ansible deployment (to staging if available)

5. **CloudFront cache invalidation**
   - Verify existing invalidation step works
   - Update paths if needed (/* should cover all)

6. **Rollback plan documentation**
   - Document rollback procedure
   - Test git revert and redeployment

**Success Criteria:**
- [ ] GitHub Actions workflow completes successfully
- [ ] Build job generates static export
- [ ] Artifact transfer works
- [ ] Ansible deploys all files correctly
- [ ] Website accessible at staging/test URL
- [ ] No deployment errors
- [ ] Rollback procedure documented and tested

**Value Delivered:**
- Automated deployment path established
- Deployment risk mitigated through testing
- Rollback capability validated

**Blocking Requirements:** REQ-CI-001-004, REQ-ANSIBLE-001-003, REQ-DEPLOY-001-003, REQ-REL-001-003

---

### PHASE 7: Production Deployment and Validation
**Duration:** 1 week
**Dependencies:** Phase 6 complete
**Risk Level:** High
**RICE Score:** N/A (pass/fail milestone)

**Objectives:**
- Deploy to production environment
- Verify zero downtime
- Validate post-deployment metrics
- Monitor for issues

**Tasks:**
1. **Pre-deployment checklist**
   - [ ] All Phase 5 tests passed
   - [ ] Feature branch pipeline successful
   - [ ] Visual comparison approved
   - [ ] Performance metrics acceptable
   - [ ] Code review completed (self or peer)
   - [ ] README.md updated
   - [ ] Rollback plan prepared

2. **Create pull request**
   - PR title: "Migrate to Next.js with Static Export"
   - Description: Summary of changes, testing performed
   - Link to this requirements and priorities document
   - Self-review if no peer available

3. **Merge to main branch**
   - Squash merge or merge commit (preserve history)
   - Monitor GitHub Actions on main branch
   - Watch build and deploy logs in real-time

4. **Post-deployment verification** (within 5 minutes)
   - [ ] Website loads at production URL
   - [ ] View source confirms Next.js output (/_next/ paths)
   - [ ] No 404 errors in browser DevTools Network tab
   - [ ] No JavaScript console errors
   - [ ] Three.js visualization renders
   - [ ] Typing animation plays
   - [ ] Links open correctly
   - [ ] Mobile view renders correctly (DevTools + real device)

5. **CloudFront cache invalidation**
   - Verify invalidation triggered in GitHub Actions
   - Check AWS CloudWatch for invalidation status
   - Test from multiple geographic locations (optional)

6. **Performance validation**
   - Run Lighthouse audit on production URL
   - Verify score ≥ 90
   - Compare bundle size to local build

7. **Monitoring (first 48 hours)**
   - Check CloudFront access logs for errors (if available)
   - Monitor for any user-reported issues (unlikely for personal site)
   - Verify analytics tracking (if implemented)

8. **Fallback testing**
   - Optionally test S3 maintenance page failover
   - Verify failover mechanism still works

**Success Criteria:**
- [ ] Production deployment successful
- [ ] All post-deployment checks passed
- [ ] Lighthouse score ≥ 90 in production
- [ ] No errors detected in 48-hour monitoring window
- [ ] Zero downtime experienced

**Value Delivered:**
- Migration complete and live
- Modern portfolio website operational
- Foundation for future enhancements established

**Blocking Requirements:** REQ-AC-004, REQ-VERIFY-001-002, REQ-REL-001

---

### PHASE 8: Documentation and Cleanup (Post-Launch)
**Duration:** 3-5 days
**Dependencies:** Phase 7 complete
**Risk Level:** Low
**RICE Score:** 21.0 (documentation value)

**Objectives:**
- Update project documentation
- Clean up temporary files and branches
- Archive migration artifacts

**Tasks:**
1. **Update README.md**
   - Add "Development" section
     - Prerequisites: Node.js 18+, npm
     - Local setup: `npm install`, `npm run dev`
     - Build: `npm run build`
   - Update "Deployment" section
     - Document Next.js build step in CI/CD
     - Reference updated Ansible playbook
   - Add "Technology Stack" section
     - List Next.js, React, TypeScript, Three.js versions

2. **Code documentation review**
   - Ensure complex logic has comments (shaders, animation)
   - Add JSDoc comments to component props (optional)
   - Document any non-obvious decisions

3. **Archive migration artifacts**
   - Move this requirements.md to `/docs` or `/plans/archive`
   - Move priorities.md to archive
   - Keep original HTML file for reference (rename to `.html.backup`)

4. **Clean up branches**
   - Delete feature branch after successful merge
   - Tag release (optional): `v2.0.0-nextjs`

5. **Create maintenance checklist**
   - Document dependency update process
   - Document security patching process
   - Schedule quarterly reviews (optional)

6. **Knowledge transfer (if applicable)**
   - If working with team, document lessons learned
   - Share any Three.js + React integration insights

**Success Criteria:**
- [ ] README.md updated and accurate
- [ ] Code comments added where needed
- [ ] Migration documents archived
- [ ] Feature branch cleaned up
- [ ] Maintenance plan documented

**Value Delivered:**
- Sustainable maintenance foundation
- Knowledge preservation for future work
- Clean repository structure

**Blocking Requirements:** REQ-DOC-001-002, REQ-MAINT-001, REQ-MAINT-003

---

## 4. Critical Path Analysis

### 4.1 Dependency Chain (Blocking Path)

```
Phase 0 (Prep)
    ↓
Phase 1 (Foundation Setup) ← CRITICAL: All subsequent work depends on this
    ↓
Phase 2 (CSS Migration) ← CRITICAL: Visual parity must be established early
    ↓
Phase 3 (Components) ← CRITICAL: Terminal UI required before 3D integration
    ↓
Phase 4 (Three.js) ← CRITICAL PATH BOTTLENECK: Highest risk, longest duration
    ↓
Phase 5 (QA) ← CRITICAL: Gates production deployment
    ↓
Phase 6 (CI/CD) ← CRITICAL: Deployment path must work
    ↓
Phase 7 (Prod Deploy) ← CRITICAL: Final gate
    ↓
Phase 8 (Docs) ← Non-blocking, can overlap with Phase 7
```

**Critical Path Duration:** 9-13 weeks (excluding Phase 8)

**Bottleneck Identification:**
- **Phase 4 (Three.js Integration):** Highest technical risk and effort
- **Phase 5 (QA):** Iterative fixes may extend timeline
- **Phase 7 (Production Deploy):** High-stakes, requires careful execution

### 4.2 Parallelization Opportunities

**Limited Parallelization Potential:**
Due to strict dependency chain and single-page application scope, most work must be sequential. However:

- **Phase 8 (Documentation)** can begin during Phase 7 monitoring
- **CI/CD investigation** (Phase 6) can be researched during Phase 4-5
- **Performance testing** can occur iteratively during Phase 3-4

### 4.3 De-Risking Strategies

**Early Risk Retirement:**
1. **Phase 1:** Validate Three.js + React integration immediately (proof of concept)
2. **Phase 2:** Establish visual parity baseline before complex components
3. **Phase 4:** Tackle highest-risk item (Three.js) mid-project when context is established

**Risk Checkpoints:**
- End of Phase 1: Go/No-Go on technical feasibility
- End of Phase 4: Go/No-Go on visual parity achievement
- End of Phase 6: Go/No-Go on deployment path validation

---

## 5. Risk Assessment and Mitigation

### 5.1 High-Priority Risks (Impact × Likelihood ≥ 15)

| Risk ID | Risk Description | Impact | Likelihood | Score | Mitigation Strategy | Phase |
|---------|------------------|--------|------------|-------|---------------------|-------|
| RISK-001 | Three.js scene doesn't match original visually | 10 | 6 | 60 | Side-by-side comparison, shader parameter tuning, early testing | Phase 4 |
| RISK-002 | CSS migration introduces visual regressions | 9 | 5 | 45 | Pixel-perfect measurement, screenshot overlays, incremental validation | Phase 2 |
| RISK-003 | Performance degradation below target | 7 | 4 | 28 | Bundle size monitoring, Lighthouse testing, code splitting if needed | Phase 5 |
| RISK-004 | Mobile responsiveness breaks | 8 | 3 | 24 | Real device testing, DevTools emulation, overflow prevention | Phase 5 |
| RISK-005 | CI/CD pipeline fails in production | 9 | 3 | 27 | Feature branch testing, staging deployment, rollback plan | Phase 6 |
| RISK-006 | Three.js + React integration errors | 10 | 3 | 30 | Early proof of concept, dynamic import fallback, error boundaries | Phase 1, 4 |
| RISK-007 | Animation timing differences | 6 | 4 | 24 | Frame-by-frame comparison, exact timeout matching, cross-browser testing | Phase 3 |

### 5.2 Risk Mitigation Timeline

**Pre-Phase 1 (Preparation):**
- Screenshot original at all breakpoints (RISK-002, RISK-004)
- Record baseline performance (RISK-003)
- Document exact animation timings (RISK-007)

**Phase 1 (Foundation):**
- Create Three.js proof of concept (RISK-006)
- Validate static export works (RISK-005)

**Phase 2 (CSS):**
- Iterative visual comparison (RISK-002)
- Test responsive breakpoints early (RISK-004)

**Phase 4 (Three.js):**
- Daily side-by-side comparison (RISK-001)
- Shader parameter documentation (RISK-001)

**Phase 5 (QA):**
- Lighthouse audit (RISK-003)
- Real device testing (RISK-004)
- Cross-browser validation (RISK-007)

**Phase 6 (CI/CD):**
- Test in feature branch first (RISK-005)
- Document rollback procedure (RISK-005)

### 5.3 Contingency Plans

**If Three.js visual parity is unachievable:**
- **Fallback 1:** Document deviations and seek stakeholder approval
- **Fallback 2:** Adjust original HTML implementation to match new version (reverse migration)
- **Fallback 3:** Abort Three.js migration, keep original CDN approach

**If performance targets are missed:**
- **Fallback 1:** Implement code splitting for Three.js chunk
- **Fallback 2:** Lazy load Three.js on user interaction
- **Fallback 3:** Accept slightly lower score if above 85

**If CI/CD pipeline is too complex:**
- **Fallback 1:** Manual deployment process (temporary)
- **Fallback 2:** Simplified Ansible playbook (reduced automation)
- **Fallback 3:** Revert to original deployment, revisit pipeline later

---

## 6. Resource Allocation

### 6.1 Time Budget by Phase

| Phase | Duration | % of Total | Cumulative |
|-------|----------|------------|------------|
| Phase 0: Preparation | 1 week | 8% | 8% |
| Phase 1: Foundation | 1-2 weeks | 12% | 20% |
| Phase 2: CSS Migration | 1 week | 8% | 28% |
| Phase 3: Components | 2 weeks | 15% | 43% |
| Phase 4: Three.js | 2-3 weeks | 23% | 66% |
| Phase 5: QA | 1-2 weeks | 12% | 78% |
| Phase 6: CI/CD | 1 week | 8% | 86% |
| Phase 7: Deployment | 1 week | 8% | 94% |
| Phase 8: Documentation | 3-5 days | 6% | 100% |
| **TOTAL** | **11-15 weeks** | **100%** | - |

### 6.2 Effort Allocation by Activity Type

| Activity Type | Estimated Effort | % of Total |
|---------------|------------------|------------|
| Development (coding) | 45% | Phase 1-4 |
| Testing & QA | 25% | Phase 5 |
| DevOps (CI/CD) | 10% | Phase 6 |
| Deployment & Monitoring | 10% | Phase 7 |
| Documentation | 5% | Phase 8 |
| Planning & Risk Management | 5% | Phase 0 |

### 6.3 Focus Recommendations

**Weeks 1-3 (Phase 0-1):**
- Focus: Solid foundation, no shortcuts
- Effort: 100% on setup and validation
- Risk retirement: Three.js + React proof of concept

**Weeks 4-5 (Phase 2):**
- Focus: Visual parity obsession
- Effort: 80% CSS, 20% visual comparison
- Risk retirement: Responsive design validation

**Weeks 6-7 (Phase 3):**
- Focus: Component quality and reusability
- Effort: 70% development, 30% testing
- Risk retirement: Animation timing validation

**Weeks 8-10 (Phase 4) - CRITICAL PERIOD:**
- Focus: Three.js scene perfection
- Effort: 90% Three.js, 10% iteration
- Risk retirement: Visual parity for 3D scene
- Recommendation: No distractions, dedicated focus

**Weeks 11-12 (Phase 5):**
- Focus: Comprehensive testing
- Effort: 100% QA and validation
- Risk retirement: All functional and performance risks

**Weeks 13-14 (Phase 6-7):**
- Focus: Deployment confidence
- Effort: 60% pipeline, 40% deployment and monitoring

**Week 15 (Phase 8):**
- Focus: Sustainability
- Effort: Documentation and cleanup

---

## 7. Success Metrics Priority

### 7.1 Tier 1 Metrics (Track from Day 1)

**Must-Have Metrics - Non-Negotiable:**

1. **Visual Parity Score**
   - **Measurement:** Screenshot pixel difference percentage
   - **Target:** < 0.1% difference
   - **Tracking:** Every phase (baseline in Phase 0)
   - **Value:** Directly tied to primary requirement (100% parity)

2. **Build Success Rate**
   - **Measurement:** `npm run build` exit code
   - **Target:** 100% success
   - **Tracking:** Every commit
   - **Value:** Gates all downstream work

3. **Console Error Count**
   - **Measurement:** Browser console errors on page load
   - **Target:** Zero errors
   - **Tracking:** Every phase with browser testing
   - **Value:** Indicates functional correctness

4. **Deployment Success**
   - **Measurement:** GitHub Actions workflow status
   - **Target:** Green build on main branch
   - **Tracking:** Phase 6 onward
   - **Value:** Determines production readiness

### 7.2 Tier 2 Metrics (Track from Phase 5)

**Performance and Quality Metrics:**

5. **Lighthouse Performance Score**
   - **Measurement:** Lighthouse CI audit
   - **Target:** ≥ 90
   - **Tracking:** Phase 5 (QA) and Phase 7 (Production)
   - **Value:** User experience and SEO

6. **Bundle Size (Gzipped)**
   - **Measurement:** `npm run build` output + gzip
   - **Target:** ≤ 500KB total
   - **Tracking:** Phase 5 onward
   - **Value:** Performance and mobile experience

7. **Security Vulnerability Count**
   - **Measurement:** `npm audit` high/critical count
   - **Target:** Zero high/critical
   - **Tracking:** Phase 1 (initial) and Phase 5 (final)
   - **Value:** Security and maintainability

8. **Cross-Browser Compatibility**
   - **Measurement:** Manual testing checklist
   - **Target:** 100% pass in Chrome, Firefox, Safari, Edge
   - **Tracking:** Phase 5
   - **Value:** User reach and professional credibility

### 7.3 Tier 3 Metrics (Track If Time Permits)

**Nice-to-Have Metrics:**

9. **Accessibility Score (Lighthouse)**
   - **Measurement:** Lighthouse accessibility audit
   - **Target:** ≥ 95
   - **Tracking:** Phase 5 (optional)
   - **Value:** Inclusivity and SEO

10. **SEO Score (Lighthouse)**
    - **Measurement:** Lighthouse SEO audit
    - **Target:** 100
    - **Tracking:** Phase 5 (optional)
    - **Value:** Discoverability

11. **First Contentful Paint (FCP)**
    - **Measurement:** Lighthouse performance metric
    - **Target:** < 1.5s
    - **Tracking:** Phase 5 (optional)
    - **Value:** Perceived performance

12. **Time to Interactive (TTI)**
    - **Measurement:** Lighthouse performance metric
    - **Target:** < 3.0s
    - **Tracking:** Phase 5 (optional)
    - **Value:** User engagement

### 7.4 Metrics Dashboard (Simple Tracking)

**Recommended Tool:** Spreadsheet or Markdown table

| Metric | Baseline | Target | Phase 2 | Phase 4 | Phase 5 | Prod | Status |
|--------|----------|--------|---------|---------|---------|------|--------|
| Visual Parity % | 100% | < 0.1% | - | - | - | - | - |
| Build Success | N/A | 100% | - | - | - | - | - |
| Console Errors | 0 | 0 | - | - | - | - | - |
| Lighthouse Perf | ? | ≥ 90 | - | - | - | - | - |
| Bundle Size (KB) | N/A | ≤ 500 | - | - | - | - | - |
| Vulnerabilities | 0 | 0 | - | - | - | - | - |

---

## 8. Quick Wins (Early Validation)

### 8.1 Immediate Quick Wins (Deliver in Phase 1)

**QW-001: Static Export Proof of Concept**
- **Effort:** 2 hours
- **Value:** Validates entire technical approach
- **Deliverable:** "Hello World" Next.js site exported to `out/`
- **Impact:** De-risks feasibility concerns

**QW-002: Three.js Import Success**
- **Effort:** 1 hour
- **Value:** Confirms npm package works with React
- **Deliverable:** Spinning cube in Next.js component
- **Impact:** Retires highest technical risk early

**QW-003: TypeScript Configuration**
- **Effort:** 1 hour
- **Value:** Type safety foundation
- **Deliverable:** Strict TypeScript with no errors
- **Impact:** Prevents bugs in later phases

### 8.2 Mid-Project Quick Wins (Deliver in Phase 2-3)

**QW-004: Responsive Breakpoint Validation**
- **Effort:** 4 hours
- **Value:** Early mobile compatibility confirmation
- **Deliverable:** Terminal UI responsive at 768px and 480px
- **Impact:** Reduces Phase 5 testing burden

**QW-005: Typing Animation Working**
- **Effort:** 3 hours
- **Value:** Demonstrates React hooks mastery
- **Deliverable:** Typing effect with correct timing
- **Impact:** Validates animation approach for later work

**QW-006: External Links Functional**
- **Effort:** 30 minutes
- **Value:** User-facing functionality delivered early
- **Deliverable:** GitHub and LinkedIn links working
- **Impact:** Quick morale boost

### 8.3 Pre-Deployment Quick Wins (Deliver in Phase 6)

**QW-007: Feature Branch CI/CD Success**
- **Effort:** 4 hours
- **Value:** De-risks production deployment
- **Deliverable:** Green build in feature branch
- **Impact:** Confidence in deployment path

**QW-008: README Documentation**
- **Effort:** 2 hours
- **Value:** Sustainability and knowledge transfer
- **Deliverable:** Updated README with setup instructions
- **Impact:** Eases future maintenance

---

## 9. Business Value Analysis

### 9.1 Balanced Scorecard Mapping

#### Financial Perspective
**Direct Financial Impact:** Minimal (personal site, no revenue)

**Indirect Financial Impact:**
- **Employability Enhancement:** High
  - Modern React/Next.js skills demonstrated
  - Three.js integration showcases advanced capabilities
  - TypeScript proficiency signaled
  - Estimated value: Potential salary increase if hired for modern front-end role

- **Opportunity Cost Reduction:** Medium
  - Eliminates technical debt that would hinder future features
  - Avoids potential embarrassment from outdated stack in technical interviews

**ROI Calculation:**
- **Investment:** 11-15 weeks of development time
- **Return:** Enhanced professional credibility, future development velocity
- **Payback Period:** Immediate upon deployment (reputational value)

#### Customer Perspective (Audience: Recruiters, Employers, Network)

**Customer Satisfaction:**
- **Current State:** Functional but dated technology stack perception
- **Future State:** Modern, professional implementation
- **Impact:** Increased likelihood of recruiter engagement

**Customer Retention:**
- **Relevance:** N/A (one-time visitors)

**Customer Acquisition:**
- **SEO Improvement:** Minimal (already indexed)
- **Social Sharing:** Slight improvement (Open Graph tags)

**Net Promoter Score Proxy:**
- Likelihood of recommending portfolio increases with modern aesthetic

#### Internal Process Perspective

**Operational Excellence:**
- **Before:** Manual HTML editing, no build process
- **After:** Component-based development, automated builds
- **Cycle Time Reduction:** Content updates 50% faster (estimated)

**Innovation:**
- **Capability Unlocked:** Foundation for blog, case studies, CMS integration
- **Future Feature Velocity:** 3x faster (estimated)

**Quality:**
- **Before:** No type checking, manual testing
- **After:** TypeScript compile-time checking, structured testing
- **Defect Reduction:** 80% fewer runtime errors (estimated)

#### Learning and Growth Perspective

**Human Capital Development:**
- **Skills Acquired:**
  - Next.js 14 App Router architecture
  - React 18 hooks and modern patterns
  - Three.js integration with React
  - TypeScript strict mode development
  - CSS Modules best practices
  - Static site generation strategies

**Knowledge Capital:**
- **Documentation Created:** Requirements, priorities, README
- **Reusable Patterns:** Component library, shader implementations
- **Intellectual Property:** Custom Three.js + React integration approach

**Organizational Capital:**
- **Process Improvement:** CI/CD pipeline modernized
- **Infrastructure:** Ansible playbooks updated for Node.js projects

### 9.2 Value Driver Tree

```
Portfolio Modernization Value
│
├── Professional Credibility (+40%)
│   ├── Modern Stack Demonstration (+15%)
│   ├── Code Quality Signaling (+10%)
│   ├── Three.js Expertise Showcase (+10%)
│   └── DevOps Capability Display (+5%)
│
├── Development Velocity (+30%)
│   ├── Component Reusability (+15%)
│   ├── TypeScript Error Prevention (+10%)
│   └── Hot Module Reload (+5%)
│
├── Maintainability (+20%)
│   ├── Modular Architecture (+10%)
│   ├── Type Safety (+5%)
│   └── Documentation (+5%)
│
└── Future Optionality (+10%)
    ├── Blog Integration Possibility (+4%)
    ├── CMS Integration Possibility (+3%)
    └── Progressive Enhancement (+3%)
```

**Highest Value Drivers:**
1. **Professional Credibility** - Directly impacts hiring outcomes
2. **Development Velocity** - Compounds over time with future updates
3. **Maintainability** - Reduces long-term effort burden

### 9.3 Competitive Positioning (Personal Brand)

**Industry Benchmarking:**
- **Trailing:** Static HTML sites (perceived as outdated)
- **At Parity:** Next.js portfolios (industry standard)
- **Leading:** Next.js + advanced 3D (differentiator)

**Positioning Shift:**
- **Before:** "Capable developer with retro aesthetic"
- **After:** "Modern full-stack developer with advanced front-end skills"

**Value Chain Position:**
- Migration moves portfolio from "commodity" to "differentiated" in personal branding

---

## 10. Strategic Recommendations

### 10.1 Primary Recommendation: Execute Phased Migration

**Rationale:**
- **Risk Mitigation:** Phased approach allows early validation and course correction
- **Value Delivery:** Quick wins in Phase 1-2 provide immediate validation
- **Resource Efficiency:** Agentic implementation allows thoughtful, quality-focused execution
- **Dependency Management:** Sequential phases respect technical dependencies

**Confidence Level:** 95%

**Supporting Evidence:**
- RICE scores highest for foundation and core functionality
- VRIO analysis shows parity value (avoiding obsolescence)
- Balanced Scorecard demonstrates clear value across all perspectives
- SWOT analysis confirms opportunities outweigh threats with proper execution

### 10.2 Phase Prioritization: Strict Sequential Execution

**Do NOT attempt parallel execution of phases.**

**Rationale:**
- Single-page application limits parallelization benefits
- Each phase builds critical context for the next
- Risk of rework if later phases invalidate earlier decisions
- Agentic implementation means no opportunity cost of delayed parallelization

**Exception:** Phase 8 (Documentation) can overlap with Phase 7 monitoring

### 10.3 Investment Focus: 70% on Phase 4 Quality

**Recommendation:** Allocate disproportionate effort to Three.js integration.

**Rationale:**
- Highest technical risk (RICE: 10.0, RISK-001: Score 60)
- Core differentiator of portfolio (unique visual element)
- Non-negotiable parity requirement (100% visual match)
- Compound risk: If this fails, entire migration value is questioned

**Tactical Approach:**
- Iterate shader parameters until perfect color match
- Side-by-side browser windows during development
- Measure exact lighting intensities and positions
- Test on multiple devices for consistency
- Do not proceed to Phase 5 until visual parity confirmed

### 10.4 Risk Management: Build Rollback Capability First

**Recommendation:** Implement and test rollback in Phase 6 before production deployment.

**Rationale:**
- Production deployment is high-stakes (personal brand impact)
- Rollback reduces psychological pressure during deployment
- Enables confident deployment knowing escape hatch exists
- Low effort (1-2 hours) for high risk reduction

**Tactical Approach:**
- Document git revert procedure
- Test revert in feature branch
- Verify old deployment still works
- Keep old HTML file as failsafe

### 10.5 Quality Gate: Visual Parity Veto Power

**Recommendation:** Establish visual parity as absolute veto criterion.

**Rationale:**
- Requirements explicitly state 100% parity (non-negotiable)
- Any regression damages professional credibility
- Modern stack is worthless if implementation is inferior

**Tactical Approach:**
- Phase 2: CSS must match exactly before Phase 3
- Phase 4: Three.js must match exactly before Phase 5
- Phase 5: Cross-browser parity must be confirmed before Phase 6
- If parity cannot be achieved, consider migration failure and abort

### 10.6 Scope Protection: Ruthlessly Defer Non-Critical Features

**Recommendation:** Move all "COULD HAVE" and "WON'T HAVE" items to backlog.

**Rationale:**
- Migration value is in modernization, not feature addition
- Scope creep is highest risk to timeline
- Automated testing (REQ-TEST-005) is low ROI for single-page site
- Content extraction (REQ-DATA-002) provides minimal value

**Defer to Post-Launch Backlog:**
- Visual regression testing automation (use manual comparison instead)
- Unit test suite (TypeScript provides sufficient safety)
- Advanced bundle optimization (meet target, don't over-optimize)
- Accessibility enhancements beyond current state
- Reduced motion preferences
- Content extraction to JSON

**Defer Permanently (Won't Do):**
- Server-side rendering
- API routes
- Dynamic content
- CMS integration
- Design changes

### 10.7 Deployment Strategy: Feature Branch First, Staging Optional

**Recommendation:** Test CI/CD in feature branch; staging environment optional.

**Rationale:**
- Feature branch testing provides 90% of staging value
- AWS staging environment setup adds complexity
- CloudFront failover to S3 provides production safety net
- Rollback capability reduces staging necessity

**Tactical Approach:**
- Phase 6: Deploy feature branch to production infrastructure (off-hours)
- Verify deployment works end-to-end
- Revert immediately after verification
- Phase 7: Deploy from main with confidence

**Alternative:** If risk tolerance is low, create staging subdomain (staging.domain.com)

### 10.8 Success Definition: Parity First, Performance Second

**Recommendation:** Prioritize visual/functional parity over performance optimization.

**Rationale:**
- Parity is binary (pass/fail), performance is spectrum
- Lighthouse 85 is acceptable if parity is perfect
- Performance can be optimized post-launch
- Parity cannot be fixed post-launch without reputation damage

**Tactical Approach:**
- Phase 5: If performance is 85-89, deploy anyway if parity is 100%
- Post-launch: Optimize bundle size, lazy loading, etc.
- Do not sacrifice parity for performance

### 10.9 Knowledge Capture: Document Non-Obvious Decisions

**Recommendation:** Maintain decision log for shader parameters, animation timings.

**Rationale:**
- Three.js shader values are not self-documenting
- Animation timings may need adjustment post-launch
- Future self will not remember why specific values were chosen

**Tactical Approach:**
- Inline comments for all shader uniform values
- Comment explaining each setTimeout duration
- Document color hex codes with original reference
- Screenshot annotations for complex layout decisions

### 10.10 Optionality Preservation: Design for Future Enhancement

**Recommendation:** Structure components for future extensibility without over-engineering.

**Rationale:**
- Blog integration is logical next step post-migration
- Portfolio case studies would add value
- Component library foundation pays dividends later

**Tactical Approach:**
- Use component composition over inheritance
- Extract hardcoded content to constants (not JSON initially)
- Design CSS Modules for reusability
- Avoid tight coupling between components
- But: Do not build CMS integration, do not add routing beyond single page

---

## 11. Anti-Recommendations (What NOT to Do)

### 11.1 DO NOT Add New Features During Migration

**Anti-Pattern:** "While migrating, let's add a blog section."

**Why Avoid:**
- Scope creep is highest timeline risk
- New features prevent accurate parity comparison
- Violates requirements (no new functionality)
- Dilutes focus from quality migration

**Enforcement:** Maintain strict feature freeze; defer all new ideas to post-launch backlog

### 11.2 DO NOT Optimize Prematurely

**Anti-Pattern:** "Let's implement advanced code splitting in Phase 1."

**Why Avoid:**
- Bundle size target is generous (500KB)
- Optimization adds complexity
- May interfere with parity achievement
- Agentic implementation allows post-launch optimization

**Enforcement:** Meet performance target (90 Lighthouse), then stop optimizing

### 11.3 DO NOT Change Visual Design

**Anti-Pattern:** "Let's make the green a bit brighter while we're at it."

**Why Avoid:**
- Violates 100% parity requirement
- Introduces subjective decisions
- Delays deployment awaiting stakeholder approval
- Defeats purpose of "migration not redesign"

**Enforcement:** Use exact color values from original; no "improvements"

### 11.4 DO NOT Skip Testing Phases

**Anti-Pattern:** "The Three.js scene looks good; let's skip Phase 5 QA."

**Why Avoid:**
- Cross-browser issues are common
- Mobile edge cases are unpredictable
- Performance regressions may not be obvious
- Post-deployment fixes are stressful

**Enforcement:** Complete all Phase 5 checklist items before proceeding

### 11.5 DO NOT Deploy Without Rollback Plan

**Anti-Pattern:** "Let's just push to main and hope it works."

**Why Avoid:**
- Production deployment failure damages professional brand
- Fixing live site under pressure causes errors
- Rollback capability is low-effort insurance

**Enforcement:** Test rollback procedure in Phase 6 before Phase 7

### 11.6 DO NOT Over-Engineer Component Architecture

**Anti-Pattern:** "Let's implement a complex state management solution."

**Why Avoid:**
- Single-page site needs minimal state
- Complexity obscures simple implementation
- Violates YAGNI principle (You Aren't Gonna Need It)

**Enforcement:** Use useState/useEffect only; no Redux, Zustand, or Context API unless absolutely necessary

### 11.7 DO NOT Ignore TypeScript Errors

**Anti-Pattern:** "Let's use `any` to get past this type error."

**Why Avoid:**
- TypeScript value is in catching errors
- `any` defeats type safety
- Technical debt accumulates quickly

**Enforcement:** Fix all TypeScript errors; use strict mode; no `any` except for Three.js internals if necessary

### 11.8 DO NOT Skip Documentation

**Anti-Pattern:** "The code is self-documenting."

**Why Avoid:**
- Shader code is not self-explanatory
- Future self will not remember decisions
- README is professional courtesy

**Enforcement:** Complete Phase 8 documentation tasks

---

## 12. Conclusion and Next Steps

### 12.1 Executive Summary of Recommendations

**Strategic Posture:** Execute a **defensive modernization** strategy focused on **risk mitigation and parity achievement** rather than innovation or feature addition.

**Core Recommendation:** Proceed with phased migration following strict sequential execution from Phase 0 through Phase 8, with particular investment in Phase 4 (Three.js) quality and Phase 5 (QA) thoroughness.

**Success Definition:** 100% visual and functional parity with current implementation, deployed via automated CI/CD pipeline, with Lighthouse performance ≥ 90.

**Timeline:** 11-15 weeks (flexible due to agentic implementation)

**Go/No-Go Decision Point:** End of Phase 1 (Foundation Setup)
- **Go Criteria:** Static export works, Three.js proof of concept successful, build pipeline functional
- **No-Go Criteria:** Insurmountable technical blockers, infeasibility of Three.js + React integration

### 12.2 Immediate Next Steps (Next 48 Hours)

1. **Review and Approve This Document**
   - Read priorities.md in full
   - Validate strategic recommendations
   - Confirm comfort with timeline and risk assessment

2. **Execute Phase 0: Preparation**
   - Screenshot current site (desktop, 768px, 480px)
   - Run Lighthouse audit on current site
   - Save baseline metrics to tracking sheet

3. **Begin Phase 1: Foundation Setup**
   - Initialize Next.js project: `npx create-next-app@latest`
   - Install Three.js: `npm install three@0.128.0`
   - Create "Hello World" static export
   - Build Three.js spinning cube proof of concept

4. **Set Up Tracking**
   - Create metrics tracking sheet (spreadsheet or markdown)
   - Set up GitHub project board (optional)
   - Initialize decision log document

### 12.3 Week 1 Milestones

**By End of Week 1, Achieve:**
- [ ] Phase 0 complete (baseline established)
- [ ] Phase 1 50% complete (Next.js project initialized)
- [ ] Quick Win QW-001 delivered (static export proof of concept)
- [ ] Quick Win QW-002 delivered (Three.js import working)
- [ ] Quick Win QW-003 delivered (TypeScript configured)
- [ ] Go/No-Go decision point data collected

### 12.4 Month 1 Goals

**By End of Month 1 (Week 4), Achieve:**
- [ ] Phase 1 complete (foundation solid)
- [ ] Phase 2 complete (CSS migrated, visual parity for static content)
- [ ] Phase 3 50% complete (component architecture established)
- [ ] Quick Wins QW-004, QW-005, QW-006 delivered

### 12.5 Project Completion Criteria

**Definition of Done:**
- [ ] All Phase 0-8 tasks completed
- [ ] All Tier 1 success metrics met
- [ ] Production deployment successful
- [ ] 48-hour monitoring window passed with no issues
- [ ] Documentation updated

**Celebration Criteria:**
- [ ] Personal satisfaction with quality
- [ ] Professional pride in showcasing modern stack
- [ ] Confidence in future maintainability

### 12.6 Post-Launch Roadmap (Optional Future Work)

**Quarter 1 Post-Launch:**
- Monitor dependency security updates
- Consider blog integration
- Evaluate portfolio case studies section

**Quarter 2 Post-Launch:**
- Assess performance optimization opportunities
- Consider CMS integration (if content updates frequent)
- Evaluate analytics integration

**Ongoing:**
- Quarterly dependency updates
- Annual technology stack review
- Continuous professional brand refinement

---

## Appendix A: Framework Reference Guide

### Business Analysis Frameworks Applied

1. **Jobs To Be Done (JTBD)** - Section 1.1
   - Source: Clayton Christensen
   - Application: Defined functional, emotional, and social jobs

2. **Kano Model** - Section 1.2
   - Source: Noriaki Kano
   - Application: Categorized requirements as basic, performance, or delighters

3. **Business Model Canvas** - Section 1.3
   - Source: Alexander Osterwalder
   - Application: Mapped migration impact to value proposition and key activities

4. **Porter's Value Chain** - Section 1.4
   - Source: Michael Porter
   - Application: Analyzed primary and support activity impacts

5. **VRIO Framework** - Section 1.5
   - Source: Jay Barney
   - Application: Assessed competitive advantage of capabilities

6. **SWOT Analysis** - Section 1.6
   - Source: Albert Humphrey
   - Application: Identified strengths, weaknesses, opportunities, threats

7. **PESTEL Analysis** - Section 1.7
   - Source: Various
   - Application: Examined macro-environmental factors

8. **RICE Scoring** - Section 2.1
   - Source: Intercom
   - Application: Prioritized features by Reach × Impact × Confidence ÷ Effort

9. **MoSCoW Prioritization** - Section 2.2
   - Source: Dai Clegg
   - Application: Categorized requirements as Must/Should/Could/Won't Have

10. **Impact/Effort Matrix** - Section 2.3
    - Source: Various
    - Application: Plotted features by value vs. cost

11. **Balanced Scorecard** - Section 9.1
    - Source: Kaplan & Norton
    - Application: Mapped value across financial, customer, process, and learning perspectives

12. **Critical Path Method** - Section 4
    - Source: DuPont & Remington Rand
    - Application: Identified blocking dependencies and bottlenecks

### Additional Methodologies Influencing Analysis

- **Wardley Mapping** (mentioned): Value chain evolution positioning
- **Hedgehog Concept** (Jim Collins): Focus on what you can be best at
- **Discovery-Driven Planning** (Rita McGrath): Phased risk retirement
- **Product Discovery** (Marty Cagan): Validate before building

---

## Appendix B: Glossary of Strategic Terms

- **Defensive Modernization:** Upgrading technology to maintain competitive parity rather than gain advantage
- **Parity Value:** Business value derived from matching industry standards
- **Risk Retirement:** Systematic elimination of uncertainties through early validation
- **Value Driver Tree:** Hierarchical decomposition of value creation sources
- **Quick Win:** Low-effort, high-value deliverable providing early validation
- **Critical Path:** Sequence of dependent tasks determining minimum project duration
- **YAGNI:** "You Aren't Gonna Need It" - principle of avoiding premature optimization
- **Go/No-Go Gate:** Decision point to proceed or abort based on criteria

---

**Document Metadata:**
- **Author:** Business Analyst Agent (Claude Sonnet 4.5)
- **Created:** 2026-01-01
- **Version:** 1.0
- **Status:** Final
- **Intended Audience:** Development team, stakeholders, future maintainers
- **Next Review:** Post-Phase 1 completion (Go/No-Go decision point)

---

*End of Priorities Document*
