// functions/api/track.js
// 极简埋点：记录关键漏斗事件（开始问卷 / 到达某分区 / 生成报告 / 下载PDF）
// 不存储任何 PII，只记录事件名 + 匿名步骤信息，写入 Cloudflare Functions 日志
// 查看方式：Cloudflare Dashboard → 项目 → Logs（实时日志）或 `wrangler pages deployment tail`
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
