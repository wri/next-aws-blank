# Restoration Diagnostic - Product Requirements Document

## 1. Executive Summary

**Product:** Restoration Diagnostic Web Application (MVP)  
**Timeline:** 3 months development (January - March 20, 2026)  
**Current Phase:** Design finalization → Development start  
**Team:** 1.5 developers + AI  
**Core Purpose:** Transform the 15-year-old Excel-based Restoration Diagnostic into a collaborative web application that enables stakeholders to assess enabling conditions for landscape restoration through structured workshops.

---

## 2. Product Goals

1. **Enable Real-Time Collaboration:** Move from file-based to web-based collaborative assessment
2. **Standardize Data Collection:** Capture high-quality qualitative data for AI trend analysis
3. **Support Multi-Country Benchmarking:** Aggregate cross-country data for portfolio insights
4. **Facilitate Workshop Environments:** Design for projection, offline capability, and consensus-building

---

## 3. User Personas

### 3.1 Restoration Coordinators (Primary)
- **Context:** Field-based, multi-year project leads
- **Needs:** Offline workshop support, stakeholder buy-in, baseline documentation
- **Success Metric:** Structured inception phase completed with documented consensus

### 3.2 Government Planners (Secondary)
- **Context:** 5-year planning cycles, multi-ministry coordination
- **Needs:** Visual bottleneck identification, GESI/finance alignment reporting
- **Success Metric:** 3-5 critical policy barriers identified and communicated

### 3.3 Technical Specialists (Tertiary)
- **Context:** WRI/partner analysts, cross-country oversight
- **Needs:** Multi-assessment data access, longitudinal tracking capability
- **Success Metric:** Portfolio-wide trends accessible and exportable

---

## 4. MVP Feature Scope

### 4.1 Landing Page
**Purpose:** Public entry point and product education

**MVP Requirements:**
- Product overview and value proposition
- Download historical Excel tool (legacy support)
- "Start New Assessment" CTA
- English-only interface (multi-language deferred to post-MVP)
- Responsive design for 1920x1080 projection and tablet (1024x768)

---

### 4.2 Assessment Setup Flow
**Purpose:** Initialize collaborative assessment session

**MVP Requirements:**
- Generate unique assessment ID + shareable URL
- Capture core metadata:
  - Assessment name
  - Diagnostic year
  - Project type (GEF_8, WRI, other)
  - Lead coordinator (name, email, job title, organization)
  - Region information (name, geography type, countries, sub-region, ecosystems)
- Set password for assessment access

**Deferred to Post-MVP:**
- Baseline document uploads
- GIS URL integration
- Workshop date tracking

**Technical Requirements:**
- URL pattern: `/assessment/{assessment_id}`
- Password encryption
- Session-based access control

---

### 4.3 Collaborative Assessment Engine
**Purpose:** Core 3-theme diagnostic interface

#### 4.3.1 Structure
Based on diagnostic framework:
1. **Context & Instructions** (read-only guidance)
2. **Motivate** - Questions across Governance/Gender/Finance
3. **Enable** - Questions across Governance/Gender/Finance  
4. **Implement** - Questions across Governance/Gender/Finance

#### 4.3.2 Question Interface (Per Question)
**MVP Requirements:**
- **Question Text** (English only, responsive layout)
- **Score Selection:**
  - Options: Yes/No/Partially
  - Visual indicator (traffic-light style)
- **Qualitative Input:**
  - "Answer" text area (minimum 100 characters)
  - "Action Item" field
  - "Responsible" field
  - "Deadline" field
  - "Status" field

**Deferred to Post-MVP:**
- Notes field
- Per-question document uploads
- Multi-language support
- Real-time collaboration indicators
- Comment threads

#### 4.3.3 Navigation
**MVP Requirements:**
- Progress tracking (questions completed)
- Theme tabs (Motivate → Enable → Implement)
- Auto-save functionality
- Last update timestamp

**Deferred to Post-MVP:**
- Save state synchronization across multiple users
- Conflict resolution UI

#### 4.3.4 Technical Requirements
- Auto-save every 30 seconds
- Local storage backup (IndexedDB)
- Basic offline capability (read-only mode when disconnected)

---

### 4.4 Authentication & Access Control
**Purpose:** Secure assessment access

**MVP Requirements:**
- Password-based assessment access via direct URL
- Single session per assessment (no concurrent editing in MVP)
- Session timeout after 24 hours of inactivity

**Deferred to Post-MVP:**
- Invite link generation with role-based access
- Multi-user concurrent editing
- View vs edit permissions
- Admin panel

---

### 4.5 Reporting & Export
**Purpose:** Visualize and communicate results

#### 4.5.1 Summary Dashboard
**MVP Requirements:**
- **Score Overview:**
  - Grid view of Yes/No/Partially scores across themes and dimensions
  - List of action items with responsible parties and deadlines
- **Metadata Display:**
  - Assessment name, year, project type
  - Lead coordinator information
  - Last update timestamp

**Deferred to Post-MVP:**
- Visual bottleneck heatmap
- Consensus metrics
- Submission workflow

#### 4.5.2 Export Formats
**MVP Requirements:**
- **CSV Data Export:**
  - All responses with metadata
  - Assessment information
  - Timestamp tracking

**Deferred to Post-MVP:**
- PDF report generation
- Branded WRI template
- Document reference inclusion

#### 4.5.3 Multi-Assessment Views
**Deferred to Post-MVP:**
- Longitudinal comparison
- Cross-country benchmarking
- Advanced filtering

---

## 5. Technical Architecture

### 5.1 Frontend
- **Framework:** Next.js 15.1.7 (App Router, React 19)
- **Styling:** Tailwind 4 + @worldresources/wri-design-systems
- **State Management:** React Context API
- **Offline:** IndexedDB for local persistence

### 5.2 Backend
- **Runtime:** Node.js 22.14.0
- **API:** Next.js API Routes
- **ORM:** TypeORM 0.3.x for entity management and migrations
- **Database:** PostgreSQL (schema defined in Restoration_Diagnostic_Preliminary_Schema.dbml)
- **Database Client:** pg (PostgreSQL driver)
- **Authentication:** Password-based sessions (NextAuth.js or custom)

### 5.3 Infrastructure
- **Hosting:** Per existing Terraform configuration
- **Database:** PostgreSQL (managed via RDS or similar)

**Deferred to Post-MVP:**
- AWS S3 file storage
- CDN optimization
- Service Worker for advanced offline mode

---

## 6. Database Implementation

The database schema is defined in `docs/resources/Restoration_Diagnostic_Preliminary_Schema.dbml`.

**MVP Tables:**
- `diagnostic` - Question sets (English only for MVP)
- `assessments` - Assessment instances with core metadata
- `answers` - Response data with scoring and qualitative inputs
- `lead` - Coordinator information
- `region` - Geographic context (excluding GIS for MVP)

**Deferred to Post-MVP:**
- `files` - Document attachments
- `invite` - Multi-user access control
- `admin` - System administration

**Enums:**
- `score_enum`: Yes, No, Partially
- `project_type_enum`: GEF_8, WRI, other

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load: <3s on 3G connection
- Auto-save latency: <2s
- Offline mode: Read-only access to loaded assessment

### 7.2 Accessibility
- WCAG 2.1 AA compliance for form inputs
- Keyboard navigation for assessment flow
- Basic screen reader support

### 7.3 Internationalization
**MVP:** English only
**Post-MVP:** Spanish, Portuguese, French

### 7.4 Security
- HTTPS-only
- Password minimum 8 characters
- Session timeout: 24 hours
- Data encryption in transit

---

## 8. Development Phases (12-Week MVP Timeline)

### Foundation (Weeks 1-3)
**Week 1:**
- TypeORM setup and configuration
- Entity definitions (Lead, Assessment, Region, Answer, Diagnostic)
- Initial migration generation and execution
- Development environment setup
- Authentication system implementation

**Week 2:**
- Landing page with assessment creation
- Assessment setup flow (core metadata only)
- Password-based access control

**Week 3:**
- WRI Design System integration
- Question interface prototype
- IndexedDB setup for auto-save

### Core Engine (Weeks 4-7)
**Week 4:**
- Full assessment engine (24 questions across 3 themes)
- Score selection UI (Yes/No/Partially)
- Answer text area with character validation

**Week 5:**
- Action item, responsible, deadline, status fields
- Theme navigation tabs
- Progress tracking

**Week 6:**
- Auto-save mechanism (30-second intervals)
- Local storage fallback
- Session management

**Week 7:**
- Question data population from diagnostic table
- Read-only Context & Instructions section
- Last update timestamp display

### Reporting & Testing (Weeks 8-11)
**Week 8:**
- Summary dashboard (score grid view)
- Action items list view
- Metadata display

**Week 9:**
- CSV export functionality
- Database-compliant export structure
- Download mechanism

**Week 10:**
- Cross-browser testing (Chrome, Safari, Edge)
- Responsive testing (1920x1080, 1024x768)
- Basic accessibility audit

**Week 11:**
- Workshop projection testing
- Offline mode validation
- Performance optimization

### Deployment & Pilot (Week 12)
**Week 12:**
- Production deployment
- Pilot with 1-2 restoration coordinators
- Critical bug fixes
- Documentation handoff

---

## 9. Out of Scope for MVP

### Features Deferred to Post-MVP
1. **Multi-language support** (Spanish, Portuguese, French)
2. **Real-time collaboration** (concurrent editing, presence indicators)
3. **Role-based access control** (view/edit permissions, invite system)
4. **Document uploads** (baseline files, per-question attachments)
5. **PDF report generation**
6. **GIS integration** (map embeds, visualization)
7. **Admin panel** (diagnostic management, user oversight)
8. **Advanced analytics** (longitudinal views, cross-country benchmarking)
9. **Comment threads** per question
10. **Deadline reminder notifications**
11. **Assessment submission workflow** (locking, reopening)
12. **Service Worker** for full offline mode
13. **Historical data migration** from Excel assessments

---

## 10. Open Questions for Stakeholders

### 10.1 MVP Validation
1. **Question Set:** Is the current Excel question structure final, or subject to revision during development?
2. **Pilot Scope:** How many coordinators are available for Week 12 testing?
3. **Success Criteria:** What minimum functionality must work for MVP acceptance?

### 10.2 Data & Content
4. **Question Migration:** Will WRI provide final English question text by Week 1, or should we extract from Excel?
5. **Diagnostic Versioning:** Can MVP assume single diagnostic version (v1.0), or must it support multiple?

### 10.3 Post-MVP Priorities
6. **Phase 2 Timeline:** When should multi-language support be ready (6 months post-MVP)?
7. **Real-Time vs Async:** Is concurrent editing critical for Phase 2, or acceptable for Phase 3?
8. **Document Storage:** What file size limits and types are expected for post-MVP uploads?

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Design changes during dev | High | Freeze design by Week 1, defer changes to post-MVP |
| Single-user limitation | Medium | Communicate clearly in UI ("Save before sharing link") |
| Offline mode expectations | Medium | Document read-only limitation, plan Service Worker for Phase 2 |
| Question data migration | Low | Validate Excel extraction by end of Week 1 |
| Browser compatibility issues | Medium | Test on target browsers weekly starting Week 10 |

---

## 12. Appendix

### A. Reference Materials
- Excel Tool: `docs/resources/Restoration_Diagnostic_Assessment_Tool.csv`
- Database Schema: `docs/resources/Restoration_Diagnostic_Preliminary_Schema.dbml`
- Infrastructure: `terraform/infrastructure/`

### B. Design Specifications
- Minimum screen width: 1024px (tablet)
- Projection resolution: 1920x1080
- Font scaling: Support up to 200% browser zoom
- Color contrast: WCAG AA minimum (4.5:1 for body text)

### C. Browser Support
- Chrome/Edge (Chromium): Last 2 versions
- Safari: Last 2 versions
- Firefox: Last 2 versions

**Mobile support deferred to post-MVP**

---

## 13. Out of Scope Reasoning

### Timeline Math
- 12 weeks ÷ 3 phases = 4 weeks per phase
- Complex features (real-time sync, PDF generation, multi-language) require 2-3 weeks each
- Including all features would require 6-9 months, not 3

### Technical Complexity vs. Time
- **Real-time collaboration (#2):** Requires WebSocket infrastructure, conflict resolution UI, testing across network conditions (3+ weeks)
- **PDF generation (#5):** Needs templating engine, multi-page rendering, internationalization support (2+ weeks)
- **Multi-language (#1):** Translation management, text expansion testing, RTL layout prep (2+ weeks)
- **Service Worker (#12):** Offline sync logic, cache invalidation, background sync APIs (2+ weeks)

### MVP Definition
- Single user can create → complete → export an assessment
- All 24 questions answerable with scores + qualitative data
- Data persists and is exportable (CSV minimum)
- **That's the core workflow.** Everything else enhances it.

### Risk Mitigation
- Deferred features have external dependencies (S3 storage #4, authentication providers #13)
- MVP validates core value proposition before investing in polish

---

**Document Version:** 1.0
**Last Updated:** January 20, 2026  
**Owner:** FlexDev Team, WRI Product Studio  
**Next Review:** Week 6 (mid-development checkpoint)