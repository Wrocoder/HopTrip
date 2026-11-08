# V4 release candidate — 2026-11-08

Owner authorized production deployment of the completed V4 package. Candidate is based on production/main 3c70a19e8ac961747e08a372b26d7c6b8c982871 and contains the tested working copy's V4 runtime changes, tests and V4 documentation. Original workspace/IDE/private environment and unrelated historical documentation removals are preserved outside this checkout.

Pre-publication: full API 1387 PASS including 20 isolated PostgreSQL tests, 0 skipped; Ruff/mypy, 379 Node tests, lint and production build PASS. Six deploy/rollback scenarios PASS. 742 runtime source/assets byte-identical to the working copy tested through V4-14. No new migrations, no dependency changes, no installed deployer change. Source diff whitespace check PASS (one fixture EOF normalized); raw historical evidence logs retain original whitespace.

Bounded publication scan: 2657 tracked text files, 422 binary files, no strong private-key/GitHub-token/AWS-key or private-env-path findings. This does not certify binary/archive contents or absence of all sensitive values.

Candidate browser acceptance is in progress; production is gated on its latest results and GitHub checks for the exact published SHA. Deployment will use the existing root-owned hoptrip-deploy, with image/static/database backups, compatibility preflight and automatic application rollback. Current source/backup paths and postflight results will be recorded in the original workspace after rollout, without advancing main with an undeployed evidence-only commit.

Alerts/email/Telegram signup/delivery remain disabled; existing events worker remains enabled. Provider settings, subscriber consent and program approvals are not changed by this release. Real user sessions, field CWV/INP and GSC follow-up remain outside deployment acceptance.
