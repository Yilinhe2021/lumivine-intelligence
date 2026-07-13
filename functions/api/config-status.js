// functions/api/config-status.js
export async function onRequestGet(context) {
  const configured = !!context.env.ANTHROPIC_API_KEY;
  return new Response(JSON.stringify({ configured }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
