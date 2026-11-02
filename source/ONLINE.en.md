# Online rankings and your data

[日本語](ONLINE.md)

When a normal run begins, the game sends the selected difficulty and ruleset version to the same server that hosts the game and receives a run ID and random seed. If the connection fails, you can still play, but that run cannot be submitted online. Practice, diagnostic runs and older local records are excluded.

Only when you press the submission button on the results screen does the game send your chosen name, score, difficulty, reached stage, clear status, play time, life, defeats, returned bullets, best chain, hits, capture uses, healing events, score breakdown and run registration. The score breakdown separates defeat points including multipliers, return points, and remaining-life bonuses awarded before boss-clear healing.

Your name, score, difficulty, reached stage, clear status, rank, play time, life, defeats, returned bullets, best chain, hits, capture uses, healing events and score breakdown become public in the rankings. **Do not enter your real name, contact details or another person's personal information.**

An anonymous browser-identification cookie, lasting at most one year and marked HttpOnly and SameSite=Lax, identifies one best record per browser and difficulty. Ties are ordered by stage reached and then earlier submission. A different device or browser, or deleting the cookie, creates a separate identity. There is no account or cross-device synchronization. Clearing local records does not delete online records.

The submission deadline is two hours after starting. After a connection failure, you can retry the same name and result on that result screen. Closing the page, returning to the title or starting another run discards pending submission data. If confirmation is uncertain, resending the same frozen result avoids a duplicate submission.

The server stores the best record, its run details and the anonymous identifier. A lower score, or an equal score at the same stage, does not replace the details of the best record. Missing details in older records are shown as **Not recorded** and are not reconstructed from historical run registrations. If an older server does not support detailed submissions, the client sends only the original fields and omits healing events and score breakdown.

Unfinished run registrations are eligible for cleanup one day after the two-hour submission deadline. Completed retry-comparison records are eligible after seven days. Cleanup occurs on subsequent requests, so these are approximate retention periods. To limit abusive request rates, the server briefly stores a hash derived from the IP address and a daily key. Raw IP addresses are not stored in the ranking database. Ordinary hosting access logs are managed separately.

Scores are reported by the client and checked for consistency. The server does not replay and independently recalculate the entire game.
