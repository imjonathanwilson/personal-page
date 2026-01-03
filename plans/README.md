# Plans Directory - Next.js Migration Project

**Last Updated:** 2026-01-02
**Purpose:** Central location for all project planning, requirements, and phase-specific documentation

---

## 📁 Directory Structure

```
plans/
├── README.md                    # This file - directory guide
├── roadmap.md                   # Main project roadmap (phases, workstreams, progress)
├── requirements.md              # Complete project requirements specification
├── priorities.md                # Business analysis (RICE, SWOT, MoSCoW)
├── 00-preparation/              # Phase 0: Baseline & Preparation
├── 02-css-migration/            # Phase 2: CSS Migration
├── 03-components/               # Phase 3: Component Architecture
├── 04-threejs/                  # Phase 4: Three.js Integration
├── 05-qa-testing/               # Phase 5: QA & Testing
├── 06-cicd/                     # Phase 6: CI/CD Pipeline
├── 07-deployment/               # Phase 7: Production Deployment
├── 08-documentation/            # Phase 8: Documentation & Cleanup
└── completed/                   # Archive for completed phase documentation
```

---

## 📄 Root Files (Project-Wide)

### `roadmap.md` ⭐ **PRIMARY REFERENCE**
**Purpose:** Master project plan with phases, workstreams, synchronization points, and progress tracking
**Use Case:** Check current phase, next tasks, overall progress, agent coordination
**Updated By:** Both agents (Bob & Asheron)
**Update Frequency:** After each phase/step completion

### `requirements.md`
**Purpose:** Complete technical and functional requirements specification
**Use Case:** Reference for what needs to be implemented (features, constraints, acceptance criteria)
**Updated By:** Project Manager / Requirements changes
**Update Frequency:** As requirements evolve

### `priorities.md`
**Purpose:** Business analysis using RICE scoring, SWOT analysis, MoSCoW prioritization
**Use Case:** Understand why features matter, business impact, strategic priorities
**Updated By:** Business Analyst
**Update Frequency:** Major milestone reviews

---

## 📂 Phase Directories

### `00-preparation/` - Phase 0: Baseline & Preparation
**Status:** ✅ Complete (2026-01-01)
**Purpose:** Capture baseline from original site before migration

**Contents:**
- `baseline/` - Reference materials from original HTML site
  - `component-architecture.md` - 15 React components identified from HTML
  - `animation-timing.md` - Exact timing values (typing: 75ms, cursor: 1s)
  - `shader-colors.md` - Three.js shader formulas and color values
  - `performance.md` - Original site performance metrics
  - `environment.md` - Development environment specifications
  - `screenshot-guide.md` - Manual screenshot capture instructions
  - `screenshots/` - Visual baseline screenshots (to be captured)
- `infrastructure-analysis.md` - AWS infrastructure baseline (Asheron)

**Key Documents:**
- **`baseline/component-architecture.md`** - Component structure reference
- **`baseline/animation-timing.md`** - Animation timing reference (critical for parity)
- **`baseline/shader-colors.md`** - Three.js shader reference (critical for Phase 4)

---

### `02-css-migration/` - Phase 2: CSS Migration
**Status:** ✅ Complete (2026-01-01)
**Purpose:** Migrate CSS from original HTML to Next.js with CSS modules

**Contents:**
- `responsive-validation.md` - Asheron's validation of responsive breakpoints, color palette, typography scaling

**Key Documents:**
- **`responsive-validation.md`** - Validation report confirming 100% CSS compliance

---

### `03-components/` - Phase 3: Component Architecture
**Status:** ✅ Complete (2026-01-02)
**Purpose:** Build React component hierarchy (4 iterations: Terminal, Content, Animations, Integration)

**Contents:**
- `validation-plan.md` - Asheron's validation strategy for Phase 3
- `validation-reports/` - Iteration-by-iteration validation reports
  - `iteration1-validation-report.md` - TerminalWindow & TerminalHeader (10/10 PASS)
  - `iteration2-validation-report.md` - InfoContent component (10/10 PASS)
  - `iteration3-validation-report.md` - TypedCommand & Footer (10/10 PASS)
  - `iteration4-validation-report.md` - Full page integration (10/10 PASS)

**Key Documents:**
- **`validation-plan.md`** - Validation strategy and acceptance criteria
- **`validation-reports/iteration4-validation-report.md`** - Final integration sign-off

---

### `04-threejs/` - Phase 4: Three.js Integration
**Status:** 🔄 In Progress (12.5% - Step 1/8 complete)
**Purpose:** Implement Three.js visualization with 64 blocks, custom shaders, lighting

**Contents:**
- (Future) Step-by-step implementation plans
- (Future) Shader validation reports
- (Future) Visual parity comparison reports

**Expected Documents:**
- Workstream 4.1 implementation plans (Bob)
- Workstream 4.2 validation reports (Asheron)
- Shader color deviation analysis
- Performance benchmarks

---

### `05-qa-testing/` - Phase 5: QA & Testing
**Status:** ⏸️ Not Started
**Purpose:** Comprehensive testing, performance validation, cross-browser testing

**Expected Documents:**
- Functional test reports
- Lighthouse audit reports
- Cross-browser compatibility matrix
- Security audit results

---

### `06-cicd/` - Phase 6: CI/CD Pipeline
**Status:** ⏸️ Not Started
**Purpose:** Update GitHub Actions and Ansible for Next.js deployment

**Expected Documents:**
- CI/CD implementation plan
- Pipeline validation reports
- Rollback procedures

---

### `07-deployment/` - Phase 7: Production Deployment
**Status:** ⏸️ Not Started
**Purpose:** Deploy Next.js migration to production with zero downtime

**Expected Documents:**
- Pre-deployment checklists
- Deployment execution reports
- Post-deployment validation
- Production monitoring summaries

---

### `08-documentation/` - Phase 8: Documentation & Cleanup
**Status:** ⏸️ Not Started
**Purpose:** Complete code documentation and project cleanup

**Expected Documents:**
- Code documentation reports
- Migration summary
- Maintenance procedures

---

### `completed/` - Archive
**Purpose:** Archive documentation for completed phases (keeps active directories clean)

**Contents:**
- `roadmap-archive.md` - Archived Phase 0-3 detailed planning (moved from main roadmap)

---

## 🔍 How to Use This Directory

### For Agents (Bob & Asheron)

**Starting a new phase:**
1. Check `roadmap.md` for current phase and next steps
2. Navigate to the phase directory (e.g., `04-threejs/`)
3. Review baseline documents if needed (in `00-preparation/baseline/`)
4. Create implementation plans in the phase directory
5. Update `roadmap.md` with progress

**Validating work:**
1. Check the phase directory for validation plans
2. Create validation reports in the phase directory
3. Reference baseline documents for compliance checks
4. Update `roadmap.md` with validation results

**Need baseline reference:**
- Animation timing: `00-preparation/baseline/animation-timing.md`
- Component structure: `00-preparation/baseline/component-architecture.md`
- Shader colors: `00-preparation/baseline/shader-colors.md`
- Original performance: `00-preparation/baseline/performance.md`

### For Project Managers

**Check progress:**
- `roadmap.md` - Overall project status
- Phase directories - Detailed phase-specific work

**Review requirements:**
- `requirements.md` - Technical specifications
- `priorities.md` - Business priorities

**Validate milestones:**
- Phase directories → `validation-reports/` subdirectories

---

## 📊 Current Status (2026-01-02)

**Overall Progress:** 50% (8 of 16 agent-phase combinations complete)

| Phase | Status | Location |
|-------|--------|----------|
| Phase 0 | ✅ Complete | `00-preparation/` |
| Phase 1 | ✅ Complete | (No planning docs - straightforward setup) |
| Phase 2 | ✅ Complete | `02-css-migration/` |
| Phase 3 | ✅ Complete | `03-components/` |
| Phase 4 | 🔄 In Progress (12.5%) | `04-threejs/` |
| Phase 5 | ⏸️ Not Started | `05-qa-testing/` |
| Phase 6 | ⏸️ Not Started | `06-cicd/` |
| Phase 7 | ⏸️ Not Started | `07-deployment/` |
| Phase 8 | ⏸️ Not Started | `08-documentation/` |

**Next Milestone:** Phase 4 Step 2 - Custom Shader Implementation (Bob)

---

## 🏗️ Directory Naming Convention

**Format:** `{phase-number}-{phase-name}/`

**Why numbered?**
- Enforces sequential order (phases have dependencies)
- Alphabetical sorting = chronological order
- Easy to identify current phase at a glance

**Phase 1 Missing?**
- Phase 1 (Foundation Setup) was straightforward Next.js initialization
- No complex planning documents needed
- Implementation details in `devlog/phase1-nextjs-foundation-setup.md`

---

## 📝 File Naming Conventions

**Validation Reports:** `iteration{N}-validation-report.md` or `{step-name}-validation.md`
**Planning Docs:** `{descriptive-name}-plan.md`
**Reference Docs:** `{topic-name}.md` (in baseline/)
**Archive Docs:** `{original-name}-archive.md`

---

## 🔗 Related Directories

- `/devlog/` - Chronological development logs for each phase/iteration (Bob & Asheron)
- `/personal-page-nextjs/` - Next.js codebase (implementation)
- `/website/` - Original static HTML site (baseline reference)

---

**Maintained By:** Project Manager
**Last Reorganization:** 2026-01-02
**Reason:** Improved clarity, phase-based organization, easier navigation for agents
