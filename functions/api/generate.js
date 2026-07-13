// functions/api/generate.js
// Cloudflare Pages Function — calls Claude server-side to generate assessment report data
// The API key is read from an environment variable (set ANTHROPIC_API_KEY in the Cloudflare
// dashboard) and must never be hardcoded

// ===== School knowledge base (kept server-side, never exposed to the client) =====
const SCHOOLS = [
  { id: "stanford", name: "Stanford University", name_cn: "斯坦福大学", location: "Stanford, CA", rank: 3, intl_admit: 0.04, gpa: [3.96, 4.0], sat: [1500, 1570], majors: ["CS", "Engineering", "Business", "Economics"], cn_pct: 0.06, notes: "极度看重学术热情和创造力。SCEA 早申。" },
  { id: "mit", name: "MIT", name_cn: "麻省理工学院", location: "Cambridge, MA", rank: 2, intl_admit: 0.03, gpa: [3.95, 4.0], sat: [1530, 1580], majors: ["CS", "Math", "Physics", "EECS"], cn_pct: 0.05, notes: "理工科顶级。看重 maker spirit、竞赛/科研深度。" },
  { id: "harvard", name: "Harvard University", name_cn: "哈佛大学", location: "Cambridge, MA", rank: 3, intl_admit: 0.05, gpa: [3.95, 4.0], sat: [1500, 1580], majors: ["Economics", "Government", "CS", "Biology"], cn_pct: 0.06, notes: "看重领导力、社会影响力和学术深度。REA 早申。" },
  { id: "princeton", name: "Princeton University", name_cn: "普林斯顿大学", location: "Princeton, NJ", rank: 1, intl_admit: 0.05, gpa: [3.93, 4.0], sat: [1510, 1570], majors: ["Math", "Physics", "Economics", "CS"], cn_pct: 0.05, notes: "本科教育最强，看重学术研究潜质。" },
  { id: "yale", name: "Yale University", name_cn: "耶鲁大学", location: "New Haven, CT", rank: 5, intl_admit: 0.05, gpa: [3.95, 4.0], sat: [1500, 1560], majors: ["Political Science", "Economics", "History", "Biology"], cn_pct: 0.06, notes: "文理见长，看重人文素养与领导力。" },
  { id: "columbia", name: "Columbia University", name_cn: "哥伦比亚大学", location: "New York, NY", rank: 12, intl_admit: 0.04, gpa: [3.91, 4.0], sat: [1490, 1560], majors: ["Engineering", "Economics", "CS", "Journalism"], cn_pct: 0.09, notes: "Core Curriculum。纽约金融/媒体优势。" },
  { id: "upenn", name: "University of Pennsylvania", name_cn: "宾夕法尼亚大学", location: "Philadelphia, PA", rank: 6, intl_admit: 0.06, gpa: [3.9, 4.0], sat: [1500, 1570], majors: ["Business (Wharton)", "Engineering", "Nursing"], cn_pct: 0.07, notes: "Wharton 商学院全球第一。ED 优势显著。" },
  { id: "cornell", name: "Cornell University", name_cn: "康奈尔大学", location: "Ithaca, NY", rank: 11, intl_admit: 0.08, gpa: [3.85, 4.0], sat: [1470, 1550], majors: ["Engineering", "CS", "Hotel Administration", "Agriculture"], cn_pct: 0.08, notes: "藤校中规模最大，专业丰富。" },
  { id: "uchicago", name: "University of Chicago", name_cn: "芝加哥大学", location: "Chicago, IL", rank: 10, intl_admit: 0.05, gpa: [3.9, 4.0], sat: [1510, 1570], majors: ["Economics", "Math", "Physics", "Political Science"], cn_pct: 0.08, notes: "学术氛围极重，看重思辨能力。ED1/ED2。" },
  { id: "duke", name: "Duke University", name_cn: "杜克大学", location: "Durham, NC", rank: 7, intl_admit: 0.06, gpa: [3.9, 4.0], sat: [1490, 1560], majors: ["Public Policy", "Economics", "Engineering", "CS"], cn_pct: 0.06, notes: "南部 Ivy。看重 well-rounded 学生。" },
  { id: "northwestern", name: "Northwestern University", name_cn: "西北大学", location: "Evanston, IL", rank: 9, intl_admit: 0.07, gpa: [3.88, 4.0], sat: [1490, 1560], majors: ["Journalism", "Engineering", "Economics", "Theatre"], cn_pct: 0.07, notes: "Medill 新闻、Bienen 音乐顶级。ED 优势大。" },
  { id: "cmu", name: "Carnegie Mellon University", name_cn: "卡内基梅隆大学", location: "Pittsburgh, PA", rank: 24, intl_admit: 0.08, gpa: [3.84, 4.0], sat: [1490, 1560], majors: ["CS", "Engineering", "Drama", "Design", "AI"], cn_pct: 0.15, notes: "SCS（计算机学院）全美顶级，录取率仅 6%。" },
  { id: "ucla", name: "UCLA", name_cn: "加州大学洛杉矶分校", location: "Los Angeles, CA", rank: 15, intl_admit: 0.07, gpa: [4.0, 4.31], sat: [1405, 1550], majors: ["Film", "Engineering", "Psychology", "CS"], cn_pct: 0.09, notes: "UC 系统旗舰。Film、CS 极难进。" },
  { id: "ucb", name: "UC Berkeley", name_cn: "加州大学伯克利分校", location: "Berkeley, CA", rank: 15, intl_admit: 0.09, gpa: [3.86, 4.27], sat: [1330, 1530], majors: ["CS (EECS)", "Engineering", "Business (Haas)", "Economics"], cn_pct: 0.1, notes: "EECS 是全美最难进的本科 CS 项目之一。" },
  { id: "usc", name: "University of Southern California", name_cn: "南加州大学", location: "Los Angeles, CA", rank: 27, intl_admit: 0.1, gpa: [3.83, 4.0], sat: [1450, 1540], majors: ["Film", "Business (Marshall)", "Engineering"], cn_pct: 0.15, notes: "电影学院全球第一。校友网络强。EA 早申。" },
  { id: "nyu", name: "NYU", name_cn: "纽约大学", location: "New York, NY", rank: 30, intl_admit: 0.07, gpa: [3.7, 4.0], sat: [1470, 1560], majors: ["Business (Stern)", "Film (Tisch)", "Economics", "CS"], cn_pct: 0.16, notes: "Stern、Tisch 顶级。无校园。ED 优势大。" },
  { id: "umich", name: "University of Michigan", name_cn: "密歇根大学", location: "Ann Arbor, MI", rank: 21, intl_admit: 0.13, gpa: [3.88, 4.0], sat: [1410, 1530], majors: ["Engineering", "Business (Ross)", "Economics"], cn_pct: 0.07, notes: "公立常春藤。Ross 商学院顶级。" },
  { id: "uci", name: "UC Irvine", name_cn: "加州大学欧文分校", location: "Irvine, CA", rank: 33, intl_admit: 0.2, gpa: [3.96, 4.26], sat: [1280, 1490], majors: ["CS", "Business", "Biology"], cn_pct: 0.12, notes: "性价比极高，CS 项目近年崛起。" },
  { id: "ucsd", name: "UC San Diego", name_cn: "加州大学圣地亚哥分校", location: "San Diego, CA", rank: 28, intl_admit: 0.18, gpa: [3.96, 4.26], sat: [1310, 1500], majors: ["CS", "Engineering", "Biology", "Cognitive Science"], cn_pct: 0.13, notes: "理工科 + 生物医学强势。" },
  { id: "purdue", name: "Purdue University", name_cn: "普渡大学", location: "West Lafayette, IN", rank: 46, intl_admit: 0.45, gpa: [3.5, 3.9], sat: [1190, 1450], majors: ["Engineering", "CS", "Aviation"], cn_pct: 0.09, notes: "工程学院全美 Top 10，性价比之王。" },
];

const SYSTEM_PROMPT = `你是一位极其资深的美国本科申请顾问，曾在哈佛、斯坦福招生办公室有内部信息渠道。你正在为一位潜在客户（慧木咨询 Lumivine Intelligence 的潜在签约家庭）的孩子做免费的初步评估报告。

# 你的任务
基于家长提供的孩子信息，生成一份专业、有判断力、有商业目的的完整评估报告数据。

# 八大评估维度（必须严格按此顺序输出，名字必须使用以下精确 4 字版本）
1. 学术硬实力 / Academic Strength
2. 学术深度 / Academic Depth
3. 领导力 / Leadership
4. 社会贡献 / Community Impact
5. 个人特质 / Character
6. 国际视野 / Global Perspective
7. 艺术特长 / Talent
8. 申请呈现 / Application Craft

每个维度打分 0-100，status 取值：green(80+优秀)、yellow(50-79待提升)、red(0-49明显短板)、gray(信息不足/暂未呈现)。
dimensions[i].diagnosis 必须是针对【这个学生】的差距诊断（30-50字），不要写名校通用要求那种宏观描述（那是另一节负责的）。

# 极其重要的写作约束："诊断到肉，治疗留白"
这是销售工具，不是真实咨询。诊断要清晰，但解决方案必须模糊。
✅ 可以写：「在 Top 20 申请池中这一维度呈现深度不足」「内容存在但叙事不足，是典型的执行挑战」「时间窗口紧迫」
❌ 严禁写：任何具体的"做什么、找哪个项目、参加什么竞赛、发什么论文"——绝不能泄露具体方案。

# 篇幅极其重要（输出冗长会导致超时）
- profile_summary: 80-100字（只描述孩子的基本画像与定位，不做评价——评价由 consultant_diagnosis 承担）
- consultant_diagnosis: 50-80字（核心判断，最关键的 1-2 句话，绝不超过 80字）
- dimensions diagnosis: 30-50字 每条
- top_strengths: 每条 ≤25字
- top_weaknesses: 每条 ≤40字
- timeline note: 60-100字 每条
- risks description: 50-70字 每条

# overall_score 与档次
90+→Top 10；80-89→Top 10-20；70-79→Top 20-30；60-69→Top 30-50；50-59→Top 50-80；<50→Top 80-100。
target_tier 填对应档次。gap_to_target 填到下一档次需补的分数。

# 选校（共 10 所，仅冲刺与保底两档，不要匹配档）
5 reach（概率<25%，US News Top 30 区间）+ 5 safety（概率>55%，US News 30-60 区间）= 共 10 所。
**重要：本报告刻意省略"匹配档"——我们的设计逻辑是让家长在"冲刺梦校"与"稳妥保底"之间做清晰判断，避免中间档的认知模糊。**
school_name/school_name_cn/location/us_news_rank 必须与院库精确一致，同一学校只出现一次。
录取概率基于该校 intl_admit + 学生 GPA/SAT 相对 middle50 + 专业匹配度 + 中国学生竞争综合判断。
key_advantage/key_risk/breakthrough_hint 各一句话不超过 25 字。

# 策略
timeline 正好 3 阶段。每阶段【只输出 phase / period / importance / note 四个字段】（不要 tasks 字段！我们不需要任务清单）。note 是 60-100 字的一段话，描述此阶段的整体方向、关键节点与价值，给家长看的。
early_decision_hint 60-80 字，不明说哪所 ED，给专业判断但留余地。

# 风险（重要！）
risks 正好 3 条。【必须】聚焦于申请季的【流程类风险】，绝不重复 dimensions 中已写过的"能力短板"。
合适的 risks 类别例如：
- 选校决策与早申战略时机
- 标化考试规划与时间窗口
- 申请呈现质量风险（文书素材挖掘深度、推荐信策略协调）
- 申请季动态调整与决策风险
title 是风险类别名称（不要写"XX维度缺失"这种），description 50-70 字暗示不专业介入的后果。

# 风格
全部中文。专业、克制、有判断力，像资深医生写诊断。制造紧迫感但不焦虑营销。
重要：所有文字字段都要严格控制在规定字数内，宁可精炼也不要超长。`;

const SCHEMA = `{
  "overall_score": 0-100整数,
  "target_tier": "如 Top 20-30",
  "gap_to_target": 整数,
  "profile_summary": "80-100字孩子基本画像与定位",
  "consultant_diagnosis": "50-80字核心判断,最多1-2句话",
  "dimensions": [{"name":"4字维度名严格按指定顺序","name_en":"英文名","score":0-100,"status":"green|yellow|red|gray","diagnosis":"30-50字针对此学生的诊断"} 正好8个],
  "top_strengths": ["3条优势,每条25字内"],
  "top_weaknesses": ["3条短板,每条40字内,模糊化且含销售钩子"],
  "schools": {
    "reach": [{"school_name":"","school_name_cn":"","location":"","us_news_rank":整数,"admit_probability":0-1小数,"fit_score":0-100,"key_advantage":"25字内","key_risk":"25字内","breakthrough_hint":"25字内"} 正好5所],
    "safety": [...同结构,正好5所]
  },
  "strategy": {
    "early_decision_hint": "60-80字",
    "timeline": [{"phase":"如 高二暑假","period":"如 2026年6-8月","importance":1-3,"note":"60-100字描述此阶段方向价值"} 正好3阶段,不要 tasks 字段],
    "risks": [{"title":"申请季流程类风险名","description":"50-70字"} 正好3条]
  }
}`;

function buildUserMessage(a) {
  const labels = {
    name: "姓名", grade: "年级", gender: "性别", school: "就读学校", school_type: "学校类型",
    gpa: "GPA", rank: "年级排名", sat: "SAT/ACT", toefl: "TOEFL/IELTS", ap_ib: "AP/IB/A-Level课程",
    target_majors: "意向专业", target_countries: "目标国家", budget: "家庭预算",
    competitions: "学科竞赛与奖项", research: "科研经历", leadership: "课外活动与领导力",
    community: "社会服务经历", talents: "艺术/体育特长", unique_traits: "独特性", other_notes: "其他信息",
  };
  let lines = [];
  for (const [k, label] of Object.entries(labels)) {
    let v = a[k];
    if (Array.isArray(v)) v = v.join("、");
    lines.push(`【${label}】${v ? v : "（家长未提供）"}`);
  }
  const schoolList = SCHOOLS.map(s =>
    `[${s.id}] ${s.name}(${s.name_cn}) | #${s.rank} | ${s.location} | 国际生录取率${(s.intl_admit * 100).toFixed(0)}% | GPA ${s.gpa[0]}-${s.gpa[1]} | SAT ${s.sat[0]}-${s.sat[1]} | 强项:${s.majors.join("/")} | 中国学生${(s.cn_pct * 100).toFixed(0)}% | ${s.notes}`
  ).join("\n");

  return `# 家长提供的孩子信息\n${lines.join("\n")}\n\n# 可选院校库\n${schoolList}\n\n# 任务\n按八大维度评估，挑选8-10所学校组合，生成完整报告数据。严格遵守"诊断到肉治疗留白"原则。school_name必须与院库精确一致，同一学校只能出现在一个档位。`;
}

// Lead notification: when a parent leaves contact info, push it to the advisor team
// immediately (without waiting for report generation to finish).
// Requires the LEAD_WEBHOOK_URL environment variable in the Cloudflare dashboard
// (a Slack or Feishu Incoming Webhook both work, format {text: "..."})
async function notifyLead(env, answers) {
  const webhookUrl = env.LEAD_WEBHOOK_URL;
  if (!webhookUrl || !answers.contact) return;
  const now = new Date().toISOString();
  const lines = [
    `*新的留学评估线索* (${now})`,
    `姓名：${answers.name || "（未填）"}`,
    `联系方式：${answers.contact}`,
    `年级：${answers.grade || "（未填）"}`,
    `意向专业：${answers.target_majors || "（未填）"}`,
    `目标国家：${Array.isArray(answers.target_countries) ? answers.target_countries.join("、") : (answers.target_countries || "（未填）")}`,
    `预算：${answers.budget || "（未填）"}`,
  ];
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
  } catch (e) {
    /* Notification failures must not affect report generation — fail silently */
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "服务端未配置 ANTHROPIC_API_KEY。请在 Cloudflare 后台 Settings → Environment variables 中添加。" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "请求格式错误" }, 400);
  }

  const answers = body.answers || {};
  // Leaving contact info counts as a qualified lead — notify the advisor team asynchronously
  // right away (without waiting for report generation to finish, and without blocking the response)
  context.waitUntil(notifyLead(env, answers));
  const model = env.CLAUDE_MODEL || "claude-sonnet-4-5";
  const userMsg = buildUserMessage(answers);
  const fullSystem = `${SYSTEM_PROMPT}\n\n你必须严格以 JSON 输出，符合以下结构：\n${SCHEMA}\n\n只返回 JSON 对象，不要任何前后文字或 markdown 代码块标记。所有中文字段用中文。`;

  let claudeResp;
  try {
    claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4500,
        temperature: 0.4,
        system: fullSystem,
        stream: true, // stream the output while it's generated, to avoid a Cloudflare 524 timeout
        messages: [
          { role: "user", content: userMsg },
          { role: "assistant", content: "{" },
        ],
      }),
    });
  } catch (e) {
    return jsonResponse({ error: "调用 Claude API 失败：" + e.message }, 502);
  }

  if (!claudeResp.ok) {
    const errText = await claudeResp.text();
    return jsonResponse({ error: `Claude API 返回错误 (${claudeResp.status}): ${errText.slice(0, 300)}` }, 502);
  }

  // Convert Claude's SSE event stream into plain-text deltas and keep pushing them to the client.
  // Note: what the client receives is the continuation Claude wrote after the prefilled "{",
  //       so the client needs to prepend "{" itself.
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  (async () => {
    const reader = claudeResp.body.getReader();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "content_block_delta" && evt.delta && typeof evt.delta.text === "string") {
              await writer.write(encoder.encode(evt.delta.text));
            }
          } catch {
            /* ignore non-JSON heartbeat lines */
          }
        }
      }
    } catch (e) {
      try { await writer.write(encoder.encode(`\n[[STREAM_ERROR]] ${e.message}`)); } catch {}
    } finally {
      try { await writer.close(); } catch {}
    }
  })();

  return new Response(readable, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-content-type-options": "nosniff",
    },
  });
}
