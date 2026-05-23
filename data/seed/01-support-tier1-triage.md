# Tier 1 Support Triage — Discovery Session

**Date:** 2026-02-12
**Attendees:** Sebastian (Tier 1 Lead, Munich), Priya (Support Ops Manager), Jordan (CX Director), Alex (AI Ops, observer)
**Setting:** 45-min Zoom

---

**Jordan:** OK, walk us through what happens when a customer ticket lands in Tier 1. End to end.

**Sebastian:** A ticket comes in through Zendesk — email, in-product help widget, or escalated out of Fin on the help-centre. Agent reads the subject, opens it, and tries to bucket it. We run nine categories: payroll, time & attendance, absence, contracts & documents, integrations, mobile app, GDPR / data subject requests, account & permissions, and "other."

**Priya:** And payroll is the one that keeps me up at night, because anything tagged payroll has a four-hour SLA, not the standard two business days.

**Sebastian:** Right. After categorising, the agent picks priority — P1 to P4 — checks the customer record in our admin tool, sees the plan (Essential, Professional, Enterprise), how many employees they have, what country mix they're set up for, whether they're using Personio Payroll or a partner provider like DATEV. Then they look for related open tickets.

**Jordan:** How long is that per ticket?

**Sebastian:** Clean ticket, 90 seconds. Messy one — long German email from an HR generalist who's described three problems in one message, with a screenshot of their payroll preview — easily five, six minutes before we start actually helping.

**Alex:** *(side note)* Triage time is the headline cost. Worth quantifying weekly volume and the language mix.

**Priya:** About 2,100 tickets a week into Tier 1. Sixty percent German, thirty English, the rest split across French, Spanish, Italian, Dutch. We run three queues — DE, EN, "other languages" — and the other-languages queue is staffed by whoever happens to speak it that day.

**Sebastian:** I audited a sample last quarter. Twenty-six percent of tickets were in the wrong category. The biggest miss is integrations — agents tag a DATEV sync error as "payroll" because the customer wrote "my payroll is wrong," when it's actually that the DATEV export failed and no payslips were generated. Different team, different fix.

**Priya:** And our "other" bucket is about 16% of volume. Half of those are actually contract template questions that the agents don't recognise because the customer described them in HR-speak — "the seniority field isn't pulling through to my Arbeitsvertrag."

**Jordan:** What about the response itself?

**Sebastian:** Roughly 45% of Tier 1 tickets are recurring patterns. Resetting employee passwords, re-sending mobile app invites, "where do I download the SEPA file," "how do I add a new absence type," "the org chart isn't updating." We have macros for most of them, in English and German. The Romance-language and Dutch macros are usually translated copies that haven't been updated in a year.

**Priya:** Macros drift constantly. The Personio UI changed in November and we still have macros telling customers to click "Mitarbeiterstammdaten" in a menu that no longer exists.

**Alex:** *(side note)* Two distinct opportunities here — auto-categorisation, and detection of stale macros. Probe further on Fin.

**Jordan:** What does Intercom Fin handle on the help-centre today?

**Sebastian:** Fin deflects about 22% of would-be tickets — mostly password resets, mobile app onboarding, and "where do I find my payslip" employee questions. But Fin's answers are only as good as the help-centre articles, and those are uneven in non-English languages. We get a steady drip of escalations from Fin that say something like, "the article doesn't match what I see on screen."

**Jordan:** What about escalations to Tier 2?

**Sebastian:** About 14% escalate. Of those, integrations and payroll-rules questions go to a dedicated technical queue. The escalation form is six fields plus a free-text "what I've tried" summary. We have a problem where agents skip the summary because they're rushed, and Tier 2 bounces it back asking for repro steps.

**Alex:** *(side note)* The bounce-back rate is a hidden tax — quantify it.

**Priya:** Roughly 32% of escalations come back with "need more info." That's another round-trip with the customer, in their language, and our first-response SLA is already ticking.

**Jordan:** And resolution data?

**Sebastian:** Agent picks a resolution code — 27 codes, about ten of them never used — writes a one-line internal note, closes. We do almost nothing with that data downstream. Nobody could tell you which integration is generating the most pain this quarter.

**Priya:** Which means when the Product team asks "what's blowing up?" we answer from gut feel. And right now my gut says SCIM provisioning with Entra ID, but I genuinely couldn't prove it.

---

## Supplemental context

- Tier 1 team: 22 agents across Munich, Madrid, Dublin. Two leads. Average tenure 11 months.
- Volume: ~2,100 tickets/week. Peaks on the first business day of the month (payroll runs) and Mondays. Language mix roughly 60% DE, 30% EN, 10% FR/ES/IT/NL combined.
- Tools: Zendesk (ticketing), Intercom Fin (help-centre chat deflection), internal Personio admin tool, Confluence (macros + internal KB), Help Center CMS (customer-facing KB in six languages).
- Existing automation: Fin deflects ~22% of help-centre interactions before they become tickets. Keyword-based auto-routing exists for password resets and SSO. No LLM-based categorisation or summarisation in the ticket pipeline.
- Tier 2 split into Payroll Specialists, Integrations, Security & GDPR.
- Customer base: ~14,000 companies, mostly DACH SMB/mid-market HR teams (10–2,000 employees). About 35% use Personio Payroll; the rest use DATEV, ADP, or local providers via export.
- GDPR data subject access requests (DSARs) are ~3% of volume but disproportionately senior-agent time because of legal review.
- No funded AI project in Support yet. Leadership has approved exploration time but wants concrete impact estimates.
