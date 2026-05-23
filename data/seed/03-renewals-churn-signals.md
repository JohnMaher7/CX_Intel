# Help-Centre Knowledge-Base Maintenance — Discovery Session

**Date:** 2026-02-25
**Attendees:** Marta (KB Content Lead), Hannes (Technical Writer, DE), Caro (Support Enablement), Alex (AI Ops, observer)
**Setting:** 50-min Zoom

---

**Marta:** We maintain the customer-facing help centre in six languages — English, German, French, Spanish, Italian, Dutch. About 1,250 articles in EN, 1,180 in DE, and somewhere between 700 and 950 in each of the other four. The gaps are the first problem.

**Alex:** And the second?

**Marta:** Drift. Our Product team ships UI and feature changes every two weeks. Roughly 30% of our articles reference a screenshot or a click-path that's at least one release out of date. Some articles are silently wrong — they describe a setting that's moved, or a permission that's been renamed.

**Hannes:** And those wrong articles power Intercom Fin. Fin reads our help centre and answers customer questions on the help-centre chat. If the article tells a customer to click a menu that doesn't exist, Fin tells them the same thing. We get tickets escalated out of Fin every day where the customer is annoyed because they followed Fin's instructions and nothing matched their screen.

**Caro:** Support enablement sees the same in reverse. We rely on the internal Confluence playbooks, but also on the public help centre when we onboard new agents. New agents trust what they read, and then they relay outdated steps to customers.

**Alex:** *(side note)* Two distinct populations consume these articles — Fin, and humans. Both inherit the drift.

**Marta:** Right. And the maintenance model is broken. We're a team of three: me, Hannes for German, and a freelance pool for FR/ES/IT/NL translations. Two of us full-time, one half. The Product team ships changes through a Linear project we don't have permission to subscribe to. We find out about changes from release notes, from Support telling us they're seeing weird tickets, or from a customer flagging it on the chat.

**Hannes:** German and English I can usually keep within two weeks of a release, because I read the release notes the day they ship and I know which articles touch which feature. French, Spanish, Italian, Dutch — those lag by two to six months. Sometimes longer. We had a French article about the new performance review module that was wrong for the entire first quarter the feature was live.

**Marta:** And the freelance translator pipeline has its own friction. We send a batch of updated EN articles to the agency once a month. They translate and return them in three weeks. We review and publish. The whole cycle is six to eight weeks for non-DE languages.

**Caro:** Meanwhile Support agents are writing their own internal "real answers" in Confluence to compensate. We have a side wiki called "what the help-centre says vs. what's actually true." It's 140 articles long. Half of them should just be published as the real article.

**Alex:** *(side note)* So there's tribal knowledge in Support that's correct, and a public KB that's stale. The bridge between them is manual and isn't happening.

**Marta:** Right. And no one's mapped the inverse — for each Fin escalation, which article led to it. Intercom logs the conversation but doesn't tag back to a source article in a way I can pull. So I have no signal on which articles are causing the most pain.

**Hannes:** I'd love a flag on each article that says, "this references a screenshot taken before release X.Y, please review." Right now I open every article on the suspect list manually after a major release.

**Caro:** And honestly the worst pain is for the non-English markets. A French HR manager gets stuck, asks Fin in French, Fin gives them an out-of-date answer in French, they escalate, and we have to find a French-speaking agent. The article was fixed in English three months ago and just never made it through translation.

**Alex:** *(side note)* The signal chain — release notes → article impact → translation queue → Fin behaviour — is entirely disconnected today. Each link is a candidate.

**Marta:** Leadership keeps asking when we're going to "use AI on the help centre." I'm cautious because Fin already *is* AI, and it's only as good as what we feed it. Garbage in, garbage out. If we want better Fin answers, fixing the underlying articles is the lever, not adding more AI on top.

**Caro:** And we have a hard line from Legal: no customer data, no employee data, in any LLM call. The help-centre content itself is fine — it's all public — but we can't pipe customer questions out to a third-party LLM without going through the data classification review.

**Hannes:** The other thing that bites is structured changes. When Product renames a field, like "Stellenbezeichnung" to "Position," it changes in twelve articles. Finding all twelve is a grep job today, and we sometimes miss one. Then a customer reads the missed one in Italian translation and gets confused.

**Marta:** And we don't track which articles get the most Fin traffic. So we don't know where to invest. We could be perfecting a quarterly article about something five customers a year care about, while the top-ten-traffic articles rot.

---

## Supplemental context

- KB team: 3 people. Marta (lead, EN-first), Hannes (German content full-time), one part-time coordinator. Freelance agency pool for FR/ES/IT/NL translation. Portuguese coming Q3.
- Article volume per language: EN ~1,250, DE ~1,180, FR ~890, ES ~840, NL ~770, IT ~720.
- Tools: Help Center CMS (custom built on Contentful), Confluence (internal playbooks + "what's actually true" side wiki), Intercom Fin (customer-facing chatbot on help-centre, reads articles directly), Linear (Product team's planning tool — KB team can read but not subscribe to changes).
- Release cadence: every 2 weeks. Major releases monthly. UI redesigns once a year.
- Fin metrics: deflects ~22% of would-be help-centre tickets. Escalation rate ~18% of conversations. No article-attribution on escalations today.
- Translation cycle: ~6–8 weeks from EN publish to FR/ES/IT/NL publish via agency. €0.18/word, ~€220k annual translation spend.
- Data classification rule: no customer or employee PII may be sent to external LLMs. Public help-centre content is unrestricted. Internal Confluence is "Internal" tier and requires review for LLM use.
- The Support team's parallel "what's actually true" Confluence wiki is unofficial and not visible to customers.
- No analytics tying Fin escalations back to specific source articles.
- Leadership wants help-centre operations to scale to 8 languages by end of year without proportional team growth.
