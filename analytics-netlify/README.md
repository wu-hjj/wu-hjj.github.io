# HJW City Analytics (independent of Cloudflare)

A tiny private-report geolocation counter for the existing GitHub Pages site.
Only stores Amsterdam-local calendar date, ISO country and approximate city, one
anonymous Netlify Blob per page view. No IP, visitor ID, precise timestamp, URL,
referrer, browser fingerprint or cookies are saved by application code.
Geolocation can be wrong (VPNs, university proxies, mobile carriers).

## One-time setup

1. In https://app.netlify.com create a new project from GitHub repository
   **wu-hjj/wu-hjj.github.io**. Set **Base directory** to `analytics-netlify`.
   This project is *only an API*; your existing GitHub Pages remains the public site.
2. Under Project configuration > Environment variables, create a **private**
   **REPORT_TOKEN** (long random value) with Functions scope. Redeploy. Never
   commit the secret or put it in browser JavaScript.
3. Check the Netlify project URL and Functions deployment, then replace
   REPLACE-WITH-YOUR-SITE in `frontend/tracker-snippet.html` with your Netlify
   domain. **Only then** add the snippet before `</body>` in the root
   `index.html`. You can remove the old Cloudflare beacon at the same time.
4. Update your site's privacy notice before enabling third-party analytics.

View a private city report:

```bash
curl 'https://YOUR-SITE.netlify.app/.netlify/functions/report?from=2026-11-01&to=2026-11-07' -H 'x-report-token: YOUR_PRIVATE_REPORT_TOKEN'
```

Never put the report token in the webpage. A report is an aggregate of page
views, **not** unique people, university affiliation or verified city residence.

### Exclude yourself

In browser devtools on wu-hjj.github.io, run:

```js
localStorage.setItem('hjw_ignore_stats', '1');
```

Or use `localStorage.removeItem('hjw_ignore_stats')` to resume counting.

### Data quality and privacy notes

- Browser DNT / Global Privacy Control signals suppress collection.
- Requests from bots with known user-agent patterns are skipped but bot
  detection is imperfect.
- Netlify sees network-level IPs during request processing; our app does not
  store IPs. Hosting provider logs and applicable privacy law still matter.
- No automatic retention deletion is implemented in this version. Set a
  retention policy before collecting long-term data.
- Collections start after live activation; no historical city reconstruction.
- To test locally run `node --test tests/*.test.mjs`.
