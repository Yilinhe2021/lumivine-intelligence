# Lumivine Intelligence — Deployment Guide

An AI study-abroad assessment system running on Cloudflare Pages. Parents answer a questionnaire on the site, and AI generates a downloadable PDF assessment report.

---

## ⚠️ Security first: about the API key

**Never write your Anthropic API key into any code file.** This project is designed to read the key from a Cloudflare environment variable.

> If you have ever exposed your API key in chat, email, a screenshot, or anywhere else, go to the [Anthropic console](https://console.anthropic.com/settings/keys) immediately, revoke it, and generate a new one. An exposed key can be used by anyone and will run up charges on your account.

---

## Deploy method 1: drag-and-drop upload (simplest, good for a first test)

1. Zip the whole project folder, or just have the folder ready
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. Give the project a name (e.g. `lumivine`) and drag the whole folder in
4. Once uploaded, go to the project's **Settings → Environment variables → Production** and add:
   - Name: `ANTHROPIC_API_KEY`, value: your real key (click **Encrypt** to store it securely)
   - (Optional) Name: `CLAUDE_MODEL`, value: `claude-sonnet-4-5` (or another model your account supports)
5. Under **Settings → Functions**, confirm Functions are enabled (uploading a `functions/` directory enables this automatically)
6. Go back to **Deployments** and click **Retry deployment** so the environment variables take effect
7. Open the assigned `*.pages.dev` URL to use the site

> Note: drag-and-drop uploads sometimes have unstable Functions support. If `/api/generate` errors out, switch to the command-line method below.

---

## Deploy method 2: wrangler CLI (most stable, recommended for production)

Requires Node.js (18+) installed first.

```bash
# 1. Enter the project directory
cd lumivine-intelligence

# 2. Install wrangler
npm install

# 3. Log in to Cloudflare (opens a browser to authorize)
npx wrangler login

# 4. Configure the production API key (you'll be prompted to paste it; input won't be shown on screen)
npx wrangler pages secret put ANTHROPIC_API_KEY
#    paste your key, press enter

# (Optional) configure the model
npx wrangler pages secret put CLAUDE_MODEL
#    enter claude-sonnet-4-5

# 5. Deploy
npx wrangler pages deploy .
```

On success this prints a URL like `https://xxx.lumivine-intelligence.pages.dev`.

---

## Deploy method 3: connect a Git repository (best for ongoing maintenance)

1. Push the project to GitHub / GitLab (`.gitignore` is already set up so secrets won't leak)
2. Cloudflare Pages → **Create** → **Connect to Git** → select the repository
3. Build settings:
   - Framework preset: `None`
   - Build command: leave empty
   - Build output directory: `/`
4. Add `ANTHROPIC_API_KEY` under **Settings → Environment variables**
5. Every push to the main branch triggers an automatic redeploy

---

## Local testing

```bash
# Copy the env var template and fill in your key (.dev.vars is not committed to git)
cp .dev.vars.example .dev.vars
# Edit .dev.vars and fill in the real key

# Start the local dev server
npx wrangler pages dev .
# Open http://localhost:8788
```

---

## Real-time lead notification (auto-notify advisors when a parent leaves contact info)

When a parent leaves a WeChat ID / phone number on the last question of the questionnaire, the system pushes that lead to the advisor team immediately (without waiting for report generation to finish), so leads don't just end up "buried in a PDF" with nobody following up.

Setup:
1. Create a Slack **Incoming Webhook** (or a Feishu group bot — both support the `{"text": "..."}` format) and get the webhook URL
2. Cloudflare Pages → project → **Settings → Environment variables → Production**, add a variable named `LEAD_WEBHOOK_URL` with that webhook address as the value
3. Redeploy for it to take effect

Leaving this variable unset has no effect on report generation — you just won't get real-time notifications; the lead's contact info still ends up in the PDF the parent downloads.

---

## Viewing analytics data (conversion funnel)

The site has built-in minimal analytics (`functions/api/track.js`) that logs key events: `page_view` (homepage/assessment page visit), `cta_click` (homepage "start assessment" click), `assessment_started` (entered the questionnaire), `section_reached` (reached each section — useful for seeing where users drop off), `report_generate_start` / `report_generated` / `report_generate_error`, `preview_view`, `pdf_download`. No names, GPA, or other questionnaire content is collected.

How to view it:
- Live CLI logs: `npx wrangler pages deployment tail`
- Or Cloudflare Dashboard → project → **Logs** (requires Workers Logs / Logpush — exact location depends on your dashboard version)

If you want fuller traffic analytics (page views/unique visitors, geography, device, Core Web Vitals), you can additionally enable **Cloudflare Web Analytics** (Dashboard → Analytics & Logs → Web Analytics → Add site). Once you have a beacon token, add this before `</body>` in both `index.html` and `assess.html`:
```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "your-token"}'></script>
```

---

## Connecting a custom domain

After deploying, add your own domain under the project's **Custom domains** tab (e.g. `assess.lumivine.com`) and follow the prompts to configure DNS.

---

## FAQ

**Q: Clicking "generate report" shows "ANTHROPIC_API_KEY not configured"**
A: The environment variable isn't set, or it was set but the site wasn't redeployed. Re-run `wrangler pages secret put` and `deploy` as in method 2.

**Q: Report generation times out**
A: A Claude call typically takes 30-60 seconds. Cloudflare Pages Functions don't consume CPU time while waiting on an external API, so this is usually fine. If timeouts happen frequently, consider upgrading to a paid Workers plan.

**Q: Chinese characters show up as boxes in the PDF**
A: The PDF is generated client-side (via html2canvas + jsPDF), using whichever fonts are installed on the visitor's computer. On a Chinese-language system this renders correctly. If you want guaranteed font embedding, consider switching to a server-side rendering approach later.

**Q: I want to change the questions / colors / report copy**
A: Questions live in the `QUESTIONS` array at the top of `app.js`; colors live in `:root` in `index.html` and the `C` object in `app.js`; the AI generation logic and report copy live in `SYSTEM_PROMPT` in `functions/api/generate.js`.

---

## File structure

```
lumivine-intelligence/
├── index.html              # Frontend: marketing homepage, with a "start assessment" entry point
├── assess.html              # Frontend: the assessment questionnaire UI
├── app.js                  # Questionnaire logic + report rendering + SVG charts + PDF export
├── functions/
│   └── api/
│       ├── generate.js     # Backend: calls Claude (key read from an environment variable)
│       ├── config-status.js
│       └── track.js        # Backend: minimal analytics, logs funnel events to Functions logs
├── wrangler.toml           # Cloudflare configuration
├── _routes.json            # Functions routing scope
├── package.json
├── .gitignore
├── .dev.vars.example       # Local dev environment variable template
└── DEPLOY.md               # This file
```
