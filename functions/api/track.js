// functions/api/track.js
// Minimal analytics: logs key funnel events (questionnaire started / section reached /
// report generated / PDF downloaded).
// Stores no PII — only the event name plus anonymous step info, written to Cloudflare
// Functions logs. View it via Cloudflare Dashboard → project → Logs (live logs) or
// `wrangler pages deployment tail`.
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const event = typeof body.event === "string" ? body.event.slice(0, 64) : "unknown";
    const meta = typeof body.meta === "string" ? body.meta.slice(0, 64) : "";
    const ua = context.request.headers.get("user-agent") || "";
    const country = context.request.cf ? context.request.cf.country : "";
    console.log(JSON.stringify({ t: Date.now(), event, meta, country, ua: ua.slice(0, 80) }));
    return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: { "content-type": "application/json" } });
  }
}
