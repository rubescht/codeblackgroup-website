# Licensed artwork for the Government & NFP page

Place the licensed Aboriginal artwork here as `gov-nfp-artwork.jpg` (landscape, about 2000px wide, under 400KB).
The page blends it softly into the hero, the Government section and the contact section, and only shows it once this file exists.

Then fill in the credit in `not-for-profit/index.html` (search for `var ART=`): title, artist, and the artist's people/Country,
and run `python3 tools/csp.py` before committing (the inline script is pinned by hash).

Only use artwork licensed from the Aboriginal artist or their agent, with permission for website use.
