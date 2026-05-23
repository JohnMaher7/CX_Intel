# Sales → Implementation Consultant Handoff — Discovery Session

**Date:** 2026-02-18
**Attendees:** Lena (Senior Implementation Consultant, DACH), Devon (IC Team Lead, EMEA), Rachel (RevOps), Alex (AI Ops, observer)
**Setting:** 60-min Zoom

---

**Devon:** This handoff is where a lot of our slipped go-lives originate. Let me frame it. An AE closes a deal in Salesforce — say a Professional-tier annual contract for a 300-employee DACH manufacturer with Personio Payroll, time tracking, and a DATEV export requirement. The AE has been on this account for maybe three months. They know the HR director, they probably know which legacy HRIS we're replacing, they know the customer wants to be live for the July payroll run.

**Lena:** And almost none of that gets to me in usable form.

**Devon:** Right. So the AE marks Closed Won. Our Zap pushes the account into Rocketlane and creates a project skeleton. An IC is assigned based on country, language, and capacity. Slack notification fires to the IC. That's the automated handoff.

**Rachel:** There's also the "Implementation Brief" template the AE is supposed to fill in before Closed Won — twenty-two fields. Countries in scope, employee count per country, payroll provider being replaced, integration list, target go-live date, who the project sponsor is on the customer side, anything non-standard in the contract.

**Lena:** "Supposed to."

**Rachel:** Yeah. Completion rate is 38%. Of the completed ones, maybe half are usable — the rest are one-word answers, "see attached proposal," or copy-paste from the sales deck.

**Alex:** *(side note)* Classic handoff data-quality problem. Need to probe what info exists *elsewhere* if not in the brief.

**Lena:** The information exists. It's just scattered. There's six to twelve Gong recordings per deal with auto-transcripts. There's the email thread in Outlook. There's the proposal in Google Drive, the technical scoping deck the Solutions Engineer built, sometimes a Loom from the SE walking through a custom DATEV setup. There might be a Notion page from a discovery workshop. I can find it all, but it takes me three to four hours per new customer to reconstruct what the AE already knew.

**Devon:** And we have a 5-business-day SLA from Closed Won to kickoff call. Lena spends half a day mining Gong and Drive, then another half day building the kickoff agenda and the Rocketlane project plan, on top of her existing portfolio of 11 active implementations.

**Lena:** The painful part — about 25% of the time I get on the kickoff call and the customer says something like, "Right, so we specifically bought this because we need it to integrate with our existing Slack and our learning platform — what's the timeline for those?" And I'm hearing it for the first time. It is *definitely* in a Gong call somewhere. The AE absolutely heard it. But it never made the brief.

**Rachel:** We talked about hiring a "handoff specialist" whose only job is to pre-digest the artefacts for ICs. €85k loaded cost per head and we'd need at least three to cover the volume.

**Devon:** *(side note while reading)* What about a 30-min handoff call AE-to-IC for every Closed Won?

**Lena:** We tried that in 2024. AEs hated it — quota's quota, they're chasing the next deal. They'd show up unprepared and we'd get the same shallow summary twice. Calendar lag was four days average. Bigger deals got priority, smaller ones got skipped. Killed it after a quarter.

**Alex:** *(side note)* The bottleneck is synthesis of artefacts the company already paid to produce. LLM-shaped problem.

**Devon:** There's a downstream piece too. Implementation playbooks. When Lena starts a new project, she's pattern-matching mentally — "this looks like the Hamburg dental group from last summer, I should reuse that DATEV configuration approach." But that knowledge lives in her head. Sara, who just joined the team six weeks ago, has none of that. She's reading every project from scratch.

**Lena:** And our Confluence has playbooks, but they're generic. "How to set up Personio Payroll." Not, "what to do when a 250-person DACH customer is migrating from Sage HR with a custom seniority calculation." Which is the actual situation about 15% of the time.

**Devon:** Bad kickoffs correlate strongly with delayed go-lives. We measured it last quarter. When the kickoff is rated "unprepared" by the customer in our post-call survey, the go-live slips on average 6.5 weeks. When the kickoff is rated "well-prepared," average slip is 1.2 weeks.

**Rachel:** And delayed go-lives correlate with first-year churn. Pulled the numbers in November. Year-one churn is 2.1x higher for projects that slipped past their original go-live by more than 30 days.

**Lena:** Which is heartbreaking, because the customer didn't do anything wrong. We just couldn't get our act together internally to read the calls they were on.

---

## Supplemental context

- Implementation Consultant team: 34 ICs across EMEA. DACH segment is biggest (16 ICs); UK & Ireland 6; Iberia 5; Benelux 4; France 3.
- Deal flow: ~75 new implementations/month across all segments and tiers.
- Tools: Salesforce (CRM), Rocketlane (PS platform — project plans, customer-facing tasks, time tracking), Gong (call recording, transcripts, AI summaries — internal Gong product, not our own LLM), Google Workspace, Notion (internal docs), Slack, Confluence (implementation playbooks).
- Gong has 6–12 calls per deal with auto-transcripts in source language and English. SE scoping decks are usually attached.
- Rocketlane has a structured "Implementation Brief" form at project creation, identical to the Salesforce template. Same low completion rate.
- Standard implementation phases for a typical DACH customer: Discovery → HR Core setup → Payroll setup (if applicable) → Integrations (DATEV, Slack/Teams, SSO/SCIM) → Training → Go-Live → Hypercare. Each phase has its own playbook in Confluence.
- DATEV integration is by far the most variable phase. Customer-side DATEV setups range from greenfield to 15 years of accumulated quirks.
- No LLM tooling in the handoff or playbook reuse process today. ICs occasionally use ChatGPT personally for ad-hoc questions but it's not sanctioned for customer data.
- Leadership goal: cut average DACH time-to-go-live from 14 weeks to 10 weeks by year-end without adding headcount.
