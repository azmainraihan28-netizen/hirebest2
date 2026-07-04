# HireBest — Product Requirements Document (PRD)

**Version:** 1.0
**Last updated:** 2026-07-04
**Owner:** Product
**Status:** Draft

---

## 1. Overview

HireBest is an AI-powered CV screening platform for recruiters, HR teams, and hiring managers. Users paste a job description, drop in a batch of CVs (PDF, DOCX, PNG, JPG), and receive a 0–100 match score for each candidate along with written reasoning cited against the JD.

**One-line pitch:** Screen 100 CVs in 38 seconds — with AI reasoning you can actually trust.

## 2. Problem

Recruiters spend 6–8 hours per role manually reading resumes. Legacy ATSs (Greenhouse, Lever, Workable) are built for pipeline management, not fast, opinionated screening. Existing "AI resume screeners" return opaque scores with no citations, so recruiters don't trust them and re-do the work by hand.

## 3. Goals & Non-Goals

### Goals
- Cut time-to-shortlist from hours to under 1 minute for a batch of 100 CVs.
- Deliver AI scores with JD-cited reasoning that a senior recruiter agrees with ≥90% of the time.
- Support the entire top-of-funnel workflow: parse → score → shortlist → compare → outreach.
- Ship a self-serve SaaS with a 14-day free trial and clear upgrade paths.

### Non-Goals (v1)
- Full ATS replacement (pipelines, offers, onboarding).
- Sourcing / candidate discovery.
- Interview scheduling and calendar integrations.
- Native mobile apps.

## 4. Target Users

| Persona | Plan fit | Core need |
|---|---|---|
| Solo recruiter / consultant | Starter ($49/mo) | Fast turnaround on client roles without hiring an assistant |
| Startup HR (2–5 people) | Growth ($99/mo) | Bulk screening + shortlist collaboration |
| HR department / agency | Team ($199/mo) | Analytics, API access, role-based permissions |
| Enterprise (500+ headcount) | Enterprise (Custom) | SSO, ATS integration, SLA, on-prem option |

## 5. User Stories

- **As a solo recruiter**, I paste a JD and drop 80 PDFs so I can shortlist 5 candidates before my client call.
- **As an HR lead**, I compare my top 3 candidates side-by-side so I can justify my pick to the hiring manager.
- **As a hiring manager**, I generate interview questions tailored to a candidate's CV so I can prep in 2 minutes.
- **As an ops lead**, I export screening results to CSV so I can share them in Slack.
- **As an admin**, I invite teammates and control who sees which roles.

## 6. Functional Requirements

### 6.1 Screening Workflow
- Create a new screening: paste JD, upload CVs (drag-and-drop, folder upload).
- Supported formats: PDF, DOCX, PNG, JPG (OCR for image CVs).
- Batch size: up to 200 CVs per screening.
- Per-candidate output: match score (0–100), verdict (Fit / Maybe / Not Fit), reasoning citing JD requirements, extracted skills, experience summary.

### 6.2 Shortlist & Compare
- Pin candidates to a shortlist per role.
- Side-by-side compare modal: skills, experience, gaps, score breakdown.

### 6.3 Interview Questions
- Generate tailored interview questions per candidate based on their CV vs the JD.
- Export as PDF.

### 6.4 Outreach
- Generate personalised interview invite and rejection email drafts.
- Copy to clipboard or export.

### 6.5 Analytics (Team plan and up)
- Screenings over time, avg fit ratio, most common missing skills, funnel by role.

### 6.6 Reports
- Per-candidate PDF report (score, reasoning, extracted profile).
- CSV export of full screening.

### 6.7 Account & Billing
- Email + Google sign-in.
- Plan management, upgrades, cancellation, invoices.
- Stripe-based checkout, monthly and annual billing (annual saves ~29%).
- Access-code redemption (admin-issued).

### 6.8 Admin
- Stats panel, user/subscription management, audit log, access codes.

## 7. Non-Functional Requirements

- **Performance:** 100-CV batch scored in ≤60s p95 (target 38s median).
- **Accuracy:** ≥90% agreement with senior recruiter blind-rating (measured quarterly on held-out set).
- **Availability:** 99.9% monthly uptime for authenticated app; 99.95% for marketing site.
- **Security:** Per-user data isolation via Supabase RLS, encrypted at rest, encrypted in transit (TLS 1.2+), CSP-hardened frontend.
- **Privacy:** GDPR-compliant. CVs stored only in the user's workspace, never used for model training. Data deletion on request within 30 days.
- **Accessibility:** WCAG 2.1 AA for the marketing site and core dashboard flows.
- **Mobile:** Marketing site and dashboard responsive down to 375px; no horizontal overflow.

## 8. Tech Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind v4, Framer Motion, React Router 7.
- **Backend:** Vercel serverless (`@vercel/node`), Supabase (Postgres + Auth + RLS).
- **AI:** LLM-based scoring pipeline (JD ↔ CV comparison with reasoning + citation).
- **Parsing:** `pdfjs-dist` for PDFs, `mammoth` for DOCX, OCR fallback for images.
- **PDF reports:** `@react-pdf/renderer`; Puppeteer + `@sparticuz/chromium` for server-side render where needed.
- **Payments:** Stripe.
- **Hosting:** Vercel.

## 9. Pricing (reference — see [pricing page](src/pages/Pricing.tsx))

| Plan | Price | CV limit | Users | Highlights |
|---|---|---|---|---|
| Starter | $49/mo | Metered | 1 | 3 job slots, AI scoring, CSV export |
| Growth | $99/mo | Metered | 3 | 10 job slots, bulk upload, compare, branding |
| Team | $199/mo | Metered | 10 | Unlimited slots, analytics, API, RBAC |
| Enterprise | Custom | Custom | Custom | ATS integration, SSO, SLA, on-prem |

All paid plans include a 14-day free trial. Annual billing saves ~29%.

## 10. Success Metrics

**North Star:** Weekly Active Screenings (WAS) per paying seat.

**Guardrails / KPIs**
- Trial → paid conversion ≥ 15%.
- Monthly churn ≤ 5% on Starter, ≤ 3% on Growth+.
- p95 batch scoring latency ≤ 60s for 100 CVs.
- CSAT on scoring reasoning ≥ 4.3 / 5.
- Support tickets per active account ≤ 0.4 / month.

## 11. Release Milestones

| Milestone | Scope | Status |
|---|---|---|
| M1 — Core screening | Upload, parse, score, verdict, CSV export | Shipped |
| M2 — Shortlist & compare | Pin, side-by-side compare, interview questions | Shipped |
| M3 — Billing & plans | Stripe, 4 tiers, trial, access codes | Shipped |
| M4 — Analytics + Team | Dashboard analytics, RBAC, API access | In progress |
| M5 — ATS integrations | Greenhouse, Lever, Workday connectors | Planned |
| M6 — SSO & on-prem | SAML SSO, self-hosted option for Enterprise | Planned |

## 12. Risks & Open Questions

- **Model drift / accuracy regression** — need automated eval harness against a labelled recruiter set before each model swap.
- **PDF parsing edge cases** — heavily designed CVs (multi-column, images) can degrade scoring; mitigation via OCR fallback and error surfacing (already partly addressed — see recent fix for PDF generation error surfacing).
- **Pricing sensitivity vs. Greenhouse/Lever** — solo recruiter segment is price-sensitive; watch Starter → Growth upgrade rate.
- **GDPR / data residency** — EU customers may require EU-region hosting; TBD for Enterprise.
- **Bulk API abuse** — API access on Team plan needs rate limits and per-key quotas.

## 13. Out of Scope (this version)

- Candidate-facing portal.
- Video interview / assessment tooling.
- Payroll, onboarding, HRIS features.
- Native iOS / Android apps.

---

_This PRD is a living document. Update the version and date at the top when scope changes._
