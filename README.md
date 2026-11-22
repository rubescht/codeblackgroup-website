# Code Black Group website

Static site for codeblackgroup.com.au. Deployed on Render as a static site (publish directory: repo root, no build step).

## Security
Every page carries a Content Security Policy, referrer policy and anti-framing guard (`assets/guard.js`).
The policy pins each inline script by hash, so **after editing any inline `<script>` run `python3 tools/csp.py`**.
Enquiry forms post to the Golden Shield API, which enforces origin checks, a signed proof-of-work challenge,
a honeypot, minimum fill time, rate limits and daily caps.
