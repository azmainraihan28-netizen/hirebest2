---
title: "How to Screen 100 CVs in 38 Seconds"
excerpt: "A walkthrough of how AI scoring compresses a full afternoon of resume review into a single coffee break — without losing nuance."
category: "Tutorials"
date: "2026-02-01"
readTime: "6 min read"
author: "HireBest Team"
authorBio: "We build AI resume screening tools for SMEs and recruiting agencies."
coverImage: "/og-image.png"
draft: false
---

## Where the 38 seconds comes from

38 seconds is the median time for a 100-CV batch on HireBest's scoring engine, measured across batches submitted in January and February 2026. The range is 28–54 seconds depending on file size and OCR complexity (image-based CVs take slightly longer than clean PDFs). 100 CVs in under a minute is not a marketing number — it is what the system logs show.

For context: a recruiter reading CVs at a brisk pace — 3–4 minutes per resume, skimming for the headline signals — takes 5–7 hours to get through 100 applications. Most do not read 100. They read 30–40 before fatigue sets in and the rest land in a mental "probably not" pile.

## What actually happens in those 38 seconds

When you drop 100 CVs and a job description into HireBest, three things run in parallel for each candidate:

**Extraction.** The parser reads the raw file — PDF, DOCX, PNG, or SVG — and pulls structured data: current title, company history, years of experience, education, skills listed, and any certifiable accomplishments. For image-based CVs, OCR runs first.

**Matching.** The scoring model reads the extracted candidate data against your job description. It is looking for explicit matches (the JD says "Python" and the CV mentions Python), implicit matches (the JD says "data pipeline experience" and the CV lists three ETL tools), and gaps (the JD requires "team lead experience" and there is no management signal anywhere in the CV).

**Output generation.** For each candidate, the model writes a 0–100 fit score, a brief rationale citing which JD requirements were met and which were missing, and 3–5 interview questions targeting the specific gaps in that candidate's profile.

All of this happens concurrently across all 100 CVs. That is why the batch time is closer to 38 seconds than 38 minutes — it is not sequential.

## What the output looks like

After a batch completes, you see a ranked list. Each row has: candidate name, score, a one-line summary of the match, and an expandable detail view. The detail view shows the full reasoning and the generated interview questions.

A score of 82 might look like this: *"Strong Python and SQL match. 5 years of relevant experience aligns with JD requirement. Missing: team lead experience — no management signals in CV. Suggested question: Walk me through a situation where you had to coordinate work across more than one person without formal authority."*

That question did not come from a template. It came from the gap analysis on that specific CV against that specific JD.

## Where the model is cautious

The scoring engine is intentionally conservative on ambiguous signals. A CV that says "worked with data tools" without naming any specific tools will not score highly for a role requiring dbt and Snowflake — even if the candidate probably knows them. The model does not invent capability claims. It scores what it can read.

This creates a known false-negative pattern: candidates with sparse CVs — people who write "managed reporting infrastructure" rather than listing the specific stack — score lower than their actual competence warrants. Worth knowing before you filter anyone out solely based on score. The score is a triage tool, not a hiring decision.

## The actual time saving

If a hiring manager was previously spending 4 hours screening 50 CVs per role and hiring for 20 roles per year, that is 80 hours of resume reading annually. At a fully-loaded cost of $60/hour, that is $4,800 of management time on a task that takes the AI 8 minutes total.

HireBest Advanced costs $900/year. The arithmetic is not complicated.
