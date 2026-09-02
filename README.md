# IS Career Launchpad — BYU Junior Core Case Prototype

A static, no-build website built for the BYU IS Junior Core Case Competition
("IS Career Launchpad") brief: a Career Path Discovery module (Part 1) and
an Interview Prep module (Part 2), both functional in the browser with no
server, database, or build step required.

## Structure

```
index.html          Home / landing page
part1.html           Part 1 — Career Path Discovery (decision tree + full detail on all 8 paths)
part2.html           Part 2 — Interview Prep (job select + behavioral/technical mock interview)
css/styles.css        Shared styles
js/data.js             All content: 8 career paths, decision tree, interview Q&A, data sources
js/decision-tree.js    Logic for part1.html
js/interview.js        Logic for part2.html
```

## How it maps to the case requirements

**Part 1 — Career Path Discovery** covers 8 of the case's suggested career
tracks (exceeds the 4-path minimum): Software/Application Developer,
Business/Systems Analyst, Data Analyst/Data Scientist, Cybersecurity
Analyst, IT Project Manager, UX Designer/Product Manager, ERP/Systems
Consultant, and Cloud/Infrastructure Engineer. A tile-based decision tree
(no dropdowns) funnels the user to a recommended path with a plain-language
"why this fits you" explanation, then every path can be opened for full
detail: day-to-day work, required skills/tools, entry-level expectations,
salary range, growth trajectory, and what makes a strong candidate. Salary
figures and expectations are grounded in real 2026 data (BLS, Glassdoor,
ZipRecruiter, PayScale, Salary.com) — see the "About this data" note at the
bottom of Part 1 for the full source list.

**Part 2 — Interview Prep** covers the same 8 paths. Each has 4 questions
(2 behavioral, 2 technical) patterned on real entry-level interview formats
(Glassdoor's interview-question database, company career pages, and
technical-interview guides like GeeksforGeeks), not generic prompts. The
user gets a text box to attempt their own answer before revealing a strong
sample answer — nothing is graded or saved, it's just a comparison point.

## Where to add more content

Everything content-related lives in **`js/data.js`**:

- `CAREER_PATHS` — the 8 paths, each with `dayToDay`, `skillsAndTools`,
  `entryLevelExpectations`, `salaryRange`, `growthTrajectory`, and
  `strongCandidate`.
- `DECISION_TREE` — the 5 questions; each option has a `scores` object
  (`{ careerId: points }`) driving the recommendation, plus a `reason`
  string shown on the results page.
- `INTERVIEW_QUESTIONS` — keyed by career `id`, each an array of
  `{ type: "behavioral" | "technical", question, sample }`.
- `DATA_SOURCES` — the source list rendered on Part 1.

**Important:** every `id` used in `DECISION_TREE` scores and
`INTERVIEW_QUESTIONS` keys must exactly match a `CAREER_PATHS` id.

## Deploying to GitHub Pages

1. Push this folder's contents to a GitHub repo (root of the repo, or a
   `/docs` folder).
2. In the repo, go to **Settings → Pages**, and set the source to the
   branch (and folder) you pushed to.
3. GitHub publishes the site at `https://<username>.github.io/<repo>/`.

No build tools or dependencies required — it works as a plain HTML file
set, which also satisfies the case's "must run in any browser" constraint.

## Notes for your team / video demo

- Part 2 can be deep-linked with `part2.html?job=<career-id>` — Part 1's
  results page and career-detail panel both use this to jump straight into
  a specific path's interview, which is a good beat to show in the demo.
- Decision tree scoring is simple additive points; ties are broken by
  whichever career is listed first in `CAREER_PATHS`.
- Be ready to speak to: how you validated the salary/skills data (see
  Sources), why these 8 tracks, and how you picked the interview question
  formats — these map directly to the case's "Guiding Questions" section.
