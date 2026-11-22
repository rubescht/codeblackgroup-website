#!/usr/bin/env python3
"""Adds or refreshes the security meta tags on every page.
Run after editing any inline <script>:  python3 tools/csp.py"""
import re, hashlib, base64, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORM_API = "https://golden-shield.onrender.com"
HUBSPOT = {
 "script": "https://*.hs-scripts.com https://*.hs-analytics.net https://*.hs-banner.com https://*.hscollectedforms.net https://*.hsadspixel.net https://*.usemessages.com https://*.hubspot.com https://*.hsforms.net",
 "connect": "https://*.hubspot.com https://*.hubapi.com https://*.hs-banner.com https://*.hscollectedforms.net https://*.hsforms.com https://*.hs-analytics.net https://*.hubspot.net https://*.usemessages.com",
 "img": "https://*.hubspot.com https://*.hubspot.net https://*.hsforms.com https://*.hs-analytics.net https://*.hs-banner.com",
 "frame": "https://*.hubspot.com https://*.hsforms.net https://*.hsforms.com https://*.usemessages.com",
}
START, END = "<!-- security:start -->", "<!-- security:end -->"
for path in sorted(glob.glob(os.path.join(ROOT, "**", "index.html"), recursive=True)):
    if "node_modules" in path: continue
    s = open(path, encoding="utf-8").read()
    s = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", s, flags=re.S)
    hashes = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", s, flags=re.S):
        hashes.append("'sha256-" + base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode() + "'")
    hs = "hs-scripts.com" in s
    gf = "fonts.googleapis.com" in s
    d = {
        "default-src": ["'self'"],
        "script-src": ["'self'"] + hashes + ([HUBSPOT["script"]] if hs else []),
        "style-src": ["'self'", "'unsafe-inline'"] + (["https://fonts.googleapis.com"] if gf else []),
        "font-src": ["'self'", "data:"] + (["https://fonts.gstatic.com"] if gf else []),
        "img-src": ["'self'", "data:", "https://codeblackgroup.com.au"] + ([HUBSPOT["img"]] if hs else []),
        "media-src": ["'self'"],
        "connect-src": ["'self'", FORM_API] + ([HUBSPOT["connect"]] if hs else []),
        "worker-src": ["'self'", "blob:"],
        "frame-src": [HUBSPOT["frame"]] if hs else ["'none'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "upgrade-insecure-requests": [],
    }
    csp = "; ".join((k + " " + " ".join(v)).strip() for k, v in d.items())
    rel = os.path.relpath(os.path.join(ROOT, "assets", "guard.js"), os.path.dirname(path)).replace(os.sep, "/")
    block = (f'{START}\n<meta http-equiv="Content-Security-Policy" content="{csp}">\n'
             f'<meta name="referrer" content="strict-origin-when-cross-origin">\n'
             f'<script src="{rel}"></script>\n{END}\n')
    s = re.sub(r'(<meta name="viewport"[^>]*>\n?)', lambda m: m.group(1) + block, s, count=1)
    if START not in s: s = s.replace("<head>\n", "<head>\n" + block, 1)
    open(path, "w", encoding="utf-8").write(s)
    print(os.path.relpath(path, ROOT), len(hashes), "inline scripts hashed", "+HubSpot" if hs else "")
