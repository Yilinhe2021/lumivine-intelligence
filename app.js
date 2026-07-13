// ============================================================
// Lumivine Intelligence — frontend logic
// Questionnaire flow + report rendering + SVG charts + PDF export
// ============================================================

const QUESTIONS = [
  { id: "name", section: "基本信息", section_en: "Basic Info", section_idx: 1, question: "您孩子的姓名是？", question_en: "What is your child's name?", subtitle: "我们将在报告中使用这个名字（可以是昵称或英文名）", subtitle_en: "We'll use this name in the report (nickname or English name is fine)", type: "text", placeholder: "例如：李同学 / Alex", placeholder_en: "e.g. Alex", required: true },
  { id: "grade", section: "基本信息", section_en: "Basic Info", section_idx: 1, question: "孩子当前的年级？", question_en: "What grade is your child currently in?", subtitle: "选择最接近的选项", subtitle_en: "Pick the closest option", type: "single", options: ["高一 (Sophomore)", "高二 (Junior)", "高三 (Senior)", "Gap Year", "其他"], options_en: ["Sophomore", "Junior", "Senior", "Gap Year", "Other"], required: true },
  { id: "gender", section: "基本信息", section_en: "Basic Info", section_idx: 1, question: "孩子的性别？", question_en: "Child's gender?", type: "single", options: ["男", "女", "不便透露"], options_en: ["Male", "Female", "Prefer not to say"], required: false },
  { id: "school_type", section: "基本信息", section_en: "Basic Info", section_idx: 1, question: "孩子目前就读什么类型的学校？", question_en: "What type of school does your child currently attend?", subtitle: "学校类型会影响 GPA 与课程的换算方式", subtitle_en: "School type affects how GPA and coursework are converted", type: "single", options: ["国内公立学校（高考体系）", "国内公立学校国际部", "国内私立国际学校", "海外高中", "其他"], options_en: ["Domestic public school (Gaokao track)", "Domestic public school, international dept.", "Domestic private international school", "Overseas high school", "Other"], required: true },
  { id: "school", section: "基本信息", section_en: "Basic Info", section_idx: 1, question: "学校的具体名称是？", question_en: "What is the school's name?", subtitle: "学校声誉是评估时的重要参考之一（可填\"不便透露\"）", subtitle_en: "School reputation is one input to the assessment (you may enter \"prefer not to say\")", type: "text", placeholder: "例如：北京 XX 中学 / Shanghai American School", placeholder_en: "e.g. Shanghai American School", required: false },
  { id: "gpa", section: "学术成绩", section_en: "Academics", section_idx: 2, question: "孩子目前的 GPA 大概是多少？", question_en: "What is your child's current GPA, roughly?", subtitle: "请说明满分制（例如：3.85/4.0 或 87/100）。不清楚可跳过", subtitle_en: "Please specify the scale (e.g. 3.85/4.0 or 87/100). Skip if unsure", type: "text", placeholder: "例如：3.85/4.0 或 88/100", placeholder_en: "e.g. 3.85/4.0 or 88/100", required: false },
  { id: "rank", section: "学术成绩", section_en: "Academics", section_idx: 2, question: "孩子在年级中的大致排名？", question_en: "Roughly where does your child rank in their grade?", subtitle: "可以填具体名次或大致区间", subtitle_en: "Exact rank or a rough range both work", type: "single", options: ["年级前 5%", "年级前 10%", "年级前 25%", "年级前 50%", "50% 之后", "不清楚 / 学校不排名"], options_en: ["Top 5%", "Top 10%", "Top 25%", "Top 50%", "Below 50%", "Unsure / school doesn't rank"], required: false },
  { id: "sat", section: "学术成绩", section_en: "Academics", section_idx: 2, question: "SAT 或 ACT 考试情况？", question_en: "SAT or ACT status?", subtitle: "已考过请填分数，还没考请说明计划", subtitle_en: "If taken, enter the score; otherwise describe the plan", type: "text", placeholder: "例如：SAT 1490 / 计划 2026 秋季考 / 还没规划", placeholder_en: "e.g. SAT 1490 / planning Fall 2026 / no plan yet", required: false },
  { id: "toefl", section: "学术成绩", section_en: "Academics", section_idx: 2, question: "TOEFL 或 IELTS 成绩？", question_en: "TOEFL or IELTS score?", subtitle: "已考过请填分数，没考过可跳过", subtitle_en: "Enter score if taken, otherwise skip", type: "text", placeholder: "例如：TOEFL 108 / IELTS 7.5 / 还没考", placeholder_en: "e.g. TOEFL 108 / IELTS 7.5 / not taken yet", required: false },
  { id: "ap_ib", section: "学术成绩", section_en: "Academics", section_idx: 2, question: "孩子修了哪些 AP / IB / A-Level 课程？", question_en: "Which AP / IB / A-Level courses has your child taken?", subtitle: "尽量列出科目和成绩；不清楚可跳过", subtitle_en: "List subjects and scores if possible; skip if unsure", type: "textarea", placeholder: "例如：\nAP Calc BC: 5\nAP Physics C: 4\nAP CS A: 5\n（共 6 门 AP）", placeholder_en: "e.g.\nAP Calc BC: 5\nAP Physics C: 4\nAP CS A: 5\n(6 APs total)", required: false },
  { id: "target_majors", section: "申请目标", section_en: "Goals", section_idx: 3, question: "孩子意向申请什么专业方向？", question_en: "What major(s) is your child interested in?", subtitle: "可填具体专业，或大致方向（如\"理工类，倾向 CS\"）", subtitle_en: "Specific major or a general direction (e.g. \"STEM, leaning CS\")", type: "text", placeholder: "例如：CS、应用数学 / 商科方向 / 还不确定", placeholder_en: "e.g. CS, Applied Math / Business / not sure yet", required: false },
  { id: "target_countries", section: "申请目标", section_en: "Goals", section_idx: 3, question: "主要考虑申请哪个国家？", question_en: "Which countries are you mainly considering?", subtitle: "可以多选", subtitle_en: "You may select more than one", type: "multi", options: ["美国", "英国", "加拿大", "澳大利亚", "香港", "新加坡", "其他"], options_en: ["USA", "UK", "Canada", "Australia", "Hong Kong", "Singapore", "Other"], required: true },
  { id: "budget", section: "申请目标", section_en: "Goals", section_idx: 3, question: "家庭可承担的年度留学预算？", question_en: "What annual budget can the family support?", subtitle: "这会影响选校范围（公立 vs 私立、是否需要奖学金）", subtitle_en: "This affects the school range (public vs private, need for financial aid)", type: "single", options: ["无明显上限", "8 万美元以上", "6-8 万美元", "4-6 万美元", "4 万美元以下，需要奖学金", "不便透露"], options_en: ["No hard limit", "Above $80k", "$60k-$80k", "$40k-$60k", "Below $40k, needs aid", "Prefer not to say"], required: false },
  { id: "competitions", section: "软实力", section_en: "Soft Skills", section_idx: 4, question: "孩子参加过哪些学科竞赛或获得过什么奖项？", question_en: "What academic competitions or awards has your child participated in / won?", subtitle: "数学、物理、计算机、生物、化学、商赛、辩论、写作等均可。请尽量说明奖项级别（国际/国家/省/市/校）", subtitle_en: "Math, physics, CS, biology, chemistry, business, debate, writing, etc. Please note the award level (international/national/provincial/city/school)", type: "textarea", placeholder: "例如：\nAMC 12 全国前 5%\nUSACO Silver\n物理碗 Top 100", placeholder_en: "e.g.\nAMC 12 top 5% nationally\nUSACO Silver\nPhysics Bowl Top 100", required: false },
  { id: "research", section: "软实力", section_en: "Soft Skills", section_idx: 4, question: "孩子有没有科研经历？", question_en: "Any research experience?", subtitle: "跟教授做项目、暑期科研营、独立研究、论文等。即使浅尝辄止也可填", subtitle_en: "Working with a professor, summer research programs, independent research, papers, etc. Brief experience counts too", type: "textarea", placeholder: "例如：\n暑期在 XX 教授实验室做了 2 个月机器学习项目，未发表", placeholder_en: "e.g.\n2-month summer ML project in a professor's lab, unpublished", required: false },
  { id: "leadership", section: "软实力", section_en: "Soft Skills", section_idx: 4, question: "孩子的课外活动和领导力经历？", question_en: "Extracurriculars and leadership experience?", subtitle: "社团、学生会、组织创办、长期投入的兴趣等。请说明角色和持续时长", subtitle_en: "Clubs, student government, founding an organization, long-term interests. Please note role and duration", type: "textarea", placeholder: "例如：\n机器人社团社长（2 年）\n校刊编辑（1 年）", placeholder_en: "e.g.\nRobotics club president (2 years)\nSchool paper editor (1 year)", required: false },
  { id: "community", section: "软实力", section_en: "Soft Skills", section_idx: 4, question: "孩子参加过哪些社会服务或公益活动？", question_en: "What community service or volunteer activities has your child done?", subtitle: "美国名校非常看重这一维度。即使零散的志愿活动也可填", subtitle_en: "US top schools value this highly. Even occasional volunteering counts", type: "textarea", placeholder: "例如：\n暑期支教 2 周\n敬老院志愿者（不定期）\n暂无", placeholder_en: "e.g.\n2-week summer teaching program\nOccasional nursing home volunteering\nNone yet", required: false },
  { id: "talents", section: "软实力", section_en: "Soft Skills", section_idx: 4, question: "孩子有什么艺术、音乐或体育方面的特长？", question_en: "Any talents in art, music, or sport?", subtitle: "请说明级别（业余/专业/比赛获奖）", subtitle_en: "Please note the level (amateur/professional/award-winning)", type: "textarea", placeholder: "例如：\n钢琴十级\n校篮球队队长\n暂无", placeholder_en: "e.g.\nPiano Level 10\nSchool basketball team captain\nNone yet", required: false },
  { id: "unique_traits", section: "个人特质", section_en: "Character", section_idx: 5, question: "您觉得孩子有什么独特的地方？", question_en: "What do you feel is unique about your child?", subtitle: "性格、兴趣、特殊经历、独特视角等任何让 TA 区别于同龄人的东西。对文书叙事很重要", subtitle_en: "Personality, interests, unusual experiences, unique perspective — anything that sets them apart. Important for essay narrative", type: "textarea", placeholder: "可以从孩子的好奇心、坚持过的事、独特视角、跨学科兴趣等角度描述", placeholder_en: "Consider their curiosity, something they've stuck with, a unique perspective, cross-disciplinary interests", required: false },
  { id: "other_notes", section: "个人特质", section_en: "Character", section_idx: 5, question: "还有什么想让我们了解的吗？", question_en: "Anything else you'd like us to know?", subtitle: "任何您觉得我们应该知道的家庭情况、孩子近况、特殊需求等", subtitle_en: "Family context, recent developments, special needs — anything relevant", type: "textarea", placeholder: "（可选）", placeholder_en: "(optional)", required: false },
  { id: "contact", section: "咨询意向", section_en: "Contact", section_idx: 6, question: "方便留下联系方式吗？", question_en: "Would you like to leave a contact method?", subtitle: "报告生成后，慧木顾问会主动联系您，帮您解读报告并讨论下一步规划（可选，不影响报告生成）", subtitle_en: "After the report is generated, a Lumivine advisor will reach out to walk through it with you (optional, doesn't affect report generation)", type: "text", placeholder: "微信号 / 手机号", placeholder_en: "WeChat ID / phone number", required: false },
];
// Minimal analytics: log key funnel events to Cloudflare Functions logs (no PII)
function track(event, meta) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta: meta || "" }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

const TOTAL = QUESTIONS.length;
const TOTAL_SECTIONS = Math.max(...QUESTIONS.map((q) => q.section_idx));

let currentIdx = 0;
let answers = {};
let reportData = null;
let currentLang = localStorage.getItem("lumivine_lang") || "zh";

const UI = {
  zh: {
    part: (i, n) => `第 ${i}/${n} 部分`, skip: "不太清楚 / 跳过这一题", back: "← 上一题", next: "下一题 →", generate: "生成报告 ✦",
    progressNote: (pct, min) => min > 0 ? `已完成 ${pct}% · 预计还需约 ${min} 分钟` : `已完成 ${pct}% · 最后一步啦`,
    genSub: "这通常需要 30-60 秒，请稍候", genMsgs: ["正在分析孩子的画像...", "正在评估八大竞争力维度...", "正在提炼优势与短板...", "正在匹配适合的院校组合...", "正在制定申请策略...", "正在完成风险评估...", "正在排版报告...", "正在连接 AI 引擎...", "生成遇到问题"],
    doneTitle: "报告已生成", doneSub: "您的个性化留学评估报告已准备就绪", download: "下载 PDF 报告", preview: "在线预览", restart: "重新评估",
    required: "这是必填项，请填写后继续", regenerate: "重新生成",
    multiHint: "可选择多个选项", generating: "生成中...", connecting: "正在连接 AI 引擎...", layingOut: "正在排版报告...",
    errFail: "生成失败", errServer: (s) => `服务返回错误（${s}），请稍后重试。`, errStream: "生成中断，请重试。", errParse: "报告数据解析失败，请重试一次。", errGeneric: "生成遇到问题",
  },
  en: {
    part: (i, n) => `Part ${i}/${n}`, skip: "Not sure / Skip this one", back: "← Previous", next: "Next →", generate: "Generate Report ✦",
    progressNote: (pct, min) => min > 0 ? `${pct}% done · about ${min} min left` : `${pct}% done · almost there`,
    genSub: "This usually takes 30-60 seconds, please wait", genMsgs: ["Analyzing your child's profile...", "Evaluating eight competitiveness dimensions...", "Distilling strengths & weaknesses...", "Matching suitable schools...", "Building the application strategy...", "Finishing the risk assessment...", "Laying out the report...", "Connecting to the AI engine...", "Something went wrong"],
    doneTitle: "Report Ready", doneSub: "Your personalized study-abroad assessment report is ready", download: "Download PDF Report", preview: "Preview Online", restart: "Start Over",
    required: "This field is required, please fill it in to continue", regenerate: "Try Again",
    multiHint: "You may select multiple options", generating: "Generating...", connecting: "Connecting to the AI engine...", layingOut: "Laying out the report...",
    errFail: "Generation failed", errServer: (s) => `The server returned an error (${s}), please try again shortly.`, errStream: "Generation was interrupted, please try again.", errParse: "Failed to parse the report data, please try again.", errGeneric: "Something went wrong",
  },
};

function applyStaticI18n() {
  const dict = {
    zh: {
      "welcome.title": '3 分钟，看清孩子的<br><span class="accent">名校竞争力</span>',
      "welcome.sub": "回答几个简单的问题，慧木 AI 将为您生成<br>一份专业的个性化留学评估报告",
      "welcome.f1t": "八维度诊断", "welcome.f1d": "名校录取标准全解析", "welcome.f2t": "精准选校", "welcome.f2d": "冲刺/保底组合", "welcome.f3t": "PDF 报告", "welcome.f3d": "可下载的专业文档",
      "welcome.start": "开始评估 →", "welcome.note": "无需注册 · 所有问题均可跳过",
      "q.skip": UI.zh.skip, "q.back": UI.zh.back,
      "gen.sub": UI.zh.genSub, "done.title": UI.zh.doneTitle, "done.sub": "您可以直接查看网页版，或下载可保存的 PDF 报告", "done.download": UI.zh.download, "done.preview": "查看网页版", "done.restart": UI.zh.restart, "done.hint": "提示：查看网页版后，右上角随时可点击“← 返回结果页”，再回来下载 PDF",
    },
    en: {
      "welcome.title": 'See your child\'s<br><span class="accent">college competitiveness</span> in 3 minutes',
      "welcome.sub": "Answer a few simple questions and Lumivine AI will generate<br>a professional, personalized assessment report",
      "welcome.f1t": "8-Dimension Diagnosis", "welcome.f1d": "Full breakdown of top-school admission standards", "welcome.f2t": "Precise School List", "welcome.f2d": "Reach / Safety combination", "welcome.f3t": "PDF Report", "welcome.f3d": "Downloadable professional document",
      "welcome.start": "Start Assessment →", "welcome.note": "No sign-up required · Every question is skippable",
      "q.skip": UI.en.skip, "q.back": UI.en.back,
      "gen.sub": UI.en.genSub, "done.title": UI.en.doneTitle, "done.sub": "You can view the web version directly, or download a savable PDF report", "done.download": UI.en.download, "done.preview": "View Web Version", "done.restart": UI.en.restart, "done.hint": "Tip: after viewing the web version, click \u201c← Back to results\u201d in the top-right corner anytime to return and download the PDF",
    },
  }[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => { const k = el.getAttribute("data-i18n"); if (dict[k] !== undefined) el.textContent = dict[k]; });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { const k = el.getAttribute("data-i18n-html"); if (dict[k] !== undefined) el.innerHTML = dict[k]; });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lumivine_lang", lang);
  document.getElementById("langZh").classList.toggle("active", lang === "zh");
  document.getElementById("langEn").classList.toggle("active", lang === "en");
  applyStaticI18n();
  const qs = document.getElementById("questionScreen");
  if (qs && qs.classList.contains("active")) renderQuestion();
}

async function init() {
  try {
    const res = await fetch("/api/config-status");
    const data = await res.json();
    if (!data.configured) document.getElementById("configWarn").classList.add("show");
  } catch (e) { /* ignore */ }
  initSegments();
  setLang(currentLang);
  track("page_view", "assess");
}
init();

function initSegments() {
  const container = document.getElementById("progressSegs");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 1; i <= TOTAL_SECTIONS; i++) {
    const seg = document.createElement("div");
    seg.className = "progress-seg";
    const fill = document.createElement("div");
    fill.className = "fill";
    fill.id = `seg-fill-${i}`;
    seg.appendChild(fill);
    container.appendChild(seg);
  }
}

function startAssessment() {
  document.getElementById("welcome").style.display = "none";
  document.getElementById("questionScreen").classList.add("active");
  currentIdx = 0;
  renderQuestion();
  track("assessment_started");
}

const trackedSections = new Set();

function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, "&quot;"); }

function renderQuestion() {
  const q = QUESTIONS[currentIdx];
  const L = UI[currentLang];
  const isEn = currentLang === "en";
  const qText = isEn ? (q.question_en || q.question) : q.question;
  const qSub = isEn ? (q.subtitle_en || q.subtitle) : q.subtitle;
  const qPh = isEn ? (q.placeholder_en || q.placeholder) : q.placeholder;
  const qOpts = isEn ? (q.options_en || q.options) : q.options;
  const qSection = isEn ? (q.section_en || q.section) : q.section;
  if (!trackedSections.has(q.section_idx)) { trackedSections.add(q.section_idx); track("section_reached", String(q.section_idx)); }
  updateProgress();
  document.getElementById("sectionTag").textContent = `${qSection} · ${L.part(q.section_idx, TOTAL_SECTIONS)}`;
  document.getElementById("qText").textContent = qText;
  document.getElementById("qSub").textContent = qSub || "";
  document.getElementById("skipBtn").textContent = L.skip;
  document.getElementById("skipBtn").style.display = q.required ? "none" : "block";
  document.getElementById("backBtn").textContent = L.back;
  document.getElementById("backBtn").style.visibility = currentIdx === 0 ? "hidden" : "visible";

  const area = document.getElementById("inputArea");
  area.innerHTML = "";
  const saved = answers[q.id];

  if (q.type === "text") {
    area.innerHTML = `<input class="input-field" id="inp" placeholder="${qPh || ""}" value="${saved ? esc(saved) : ""}">`;
    if (q.id === "contact") {
      const noteTxt = isEn
        ? "By providing your contact info, you agree that a Lumivine advisor may reach out once to discuss your report. We never sell or share your information with third parties, and you may leave this blank."
        : "留下联系方式即代表您同意慧木顾问就本次报告与您联系一次。我们不会向第三方出售或共享您的信息，此项完全可选。";
      area.innerHTML += `<p class="privacy-note">${noteTxt}</p>`;
    }
    setTimeout(() => document.getElementById("inp").focus(), 80);
  } else if (q.type === "textarea") {
    area.innerHTML = `<textarea class="input-field" id="inp" placeholder="${qPh || ""}">${saved || ""}</textarea>`;
    setTimeout(() => document.getElementById("inp").focus(), 80);
  } else if (q.type === "single") {
    let h = '<div class="options">';
    qOpts.forEach((opt, i) => {
      const canonical = q.options[i];
      const sel = saved === canonical ? "selected" : "";
      h += `<div class="option ${sel}" onclick="selectSingle(this,'${esc(canonical)}')"><div class="checkbox">${sel ? "✓" : ""}</div><span>${opt}</span></div>`;
    });
    area.innerHTML = h + "</div>";
  } else if (q.type === "multi") {
    let h = `<div class="multi-hint">${L.multiHint}</div><div class="options">`;
    const arr = Array.isArray(saved) ? saved : [];
    qOpts.forEach((opt, i) => {
      const canonical = q.options[i];
      const sel = arr.includes(canonical) ? "selected" : "";
      h += `<div class="option ${sel}" onclick="toggleMulti(this,'${esc(canonical)}')"><div class="checkbox">${sel ? "✓" : ""}</div><span>${opt}</span></div>`;
    });
    area.innerHTML = h + "</div>";
  }
  document.getElementById("nextBtn").textContent = currentIdx === TOTAL - 1 ? L.generate : L.next;
}

function selectSingle(el, value) {
  document.querySelectorAll(".option").forEach((o) => { o.classList.remove("selected"); o.querySelector(".checkbox").textContent = ""; });
  el.classList.add("selected");
  el.querySelector(".checkbox").textContent = "✓";
  answers[QUESTIONS[currentIdx].id] = value;
}

function toggleMulti(el, value) {
  const qid = QUESTIONS[currentIdx].id;
  if (!Array.isArray(answers[qid])) answers[qid] = [];
  const arr = answers[qid];
  const i = arr.indexOf(value);
  if (i === -1) { arr.push(value); el.classList.add("selected"); el.querySelector(".checkbox").textContent = "✓"; }
  else { arr.splice(i, 1); el.classList.remove("selected"); el.querySelector(".checkbox").textContent = ""; }
}

function saveTextInput() {
  const q = QUESTIONS[currentIdx];
  if (q.type === "text" || q.type === "textarea") {
    const inp = document.getElementById("inp");
    if (inp && inp.value.trim()) answers[q.id] = inp.value.trim();
  }
}

function nextQuestion() {
  saveTextInput();
  const q = QUESTIONS[currentIdx];
  if (q.required && !answers[q.id]) { alert(UI[currentLang].required); return; }
  if (currentIdx === TOTAL - 1) { generateReport(); return; }
  currentIdx++; renderQuestion();
}
function prevQuestion() { saveTextInput(); if (currentIdx > 0) { currentIdx--; renderQuestion(); } }
function skipQuestion() { if (currentIdx === TOTAL - 1) { generateReport(); return; } currentIdx++; renderQuestion(); }

const SECONDS_PER_QUESTION = 11; // rough heuristic used to estimate remaining time

function updateProgress() {
  const pct = Math.round(((currentIdx + 1) / TOTAL) * 100);
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressInfo").textContent = `${currentIdx + 1} / ${TOTAL}`;

  const remainingQuestions = TOTAL - (currentIdx + 1);
  const remainingMin = Math.round((remainingQuestions * SECONDS_PER_QUESTION) / 60);
  const noteEl = document.getElementById("progressNote");
  if (noteEl) {
    noteEl.textContent = UI[currentLang].progressNote(pct, remainingMin);
    noteEl.classList.add("show");
  }

  for (let i = 1; i <= TOTAL_SECTIONS; i++) {
    const idxs = QUESTIONS.reduce((acc, q, idx) => { if (q.section_idx === i) acc.push(idx); return acc; }, []);
    const fillEl = document.getElementById(`seg-fill-${i}`);
    if (!fillEl || idxs.length === 0) continue;
    const start = idxs[0], end = idxs[idxs.length - 1];
    let segPct;
    if (currentIdx > end) segPct = 100;
    else if (currentIdx < start) segPct = 0;
    else segPct = Math.round(((currentIdx - start + 1) / idxs.length) * 100);
    fillEl.style.width = segPct + "%";
  }
}

const GEN_MESSAGES = ["正在分析孩子的画像...", "正在评估八大竞争力维度...", "正在匹配适合的院校组合...", "正在制定申请策略...", "正在生成数据可视化...", "正在排版报告..."];

async function generateReport() {
  track("report_generate_start");
  document.getElementById("questionScreen").classList.remove("active");
  document.getElementById("generating").classList.add("active");
  document.getElementById("progressFill").style.width = "100%";
  document.getElementById("progressInfo").textContent = UI[currentLang].generating;
  const pn = document.getElementById("progressNote");
  if (pn) pn.classList.remove("show");
  document.querySelector(".spinner").style.display = "block";
  document.getElementById("errorMsg").classList.remove("show");
  document.getElementById("errorMsg").innerHTML = "";

  const genMsg = document.getElementById("genMsg"), genFill = document.getElementById("genBarFill");
  genMsg.textContent = UI[currentLang].connecting;
  genFill.style.width = "5%";

  function updateStreamProgress(text) {
    const gm = UI[currentLang].genMsgs;
    let pct = 8, msg = gm[0];
    if (text.includes('"dimensions"')) { pct = 25; msg = gm[1]; }
    if (text.includes('"top_strengths"')) { pct = 45; msg = gm[2]; }
    if (text.includes('"schools"')) { pct = 60; msg = gm[3]; }
    if (text.includes('"strategy"')) { pct = 78; msg = gm[4]; }
    if (text.includes('"risks"')) { pct = 90; msg = gm[5]; }
    genFill.style.width = pct + "%";
    genMsg.textContent = msg;
  }

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (!res.ok) {
      let msg = UI[currentLang].errFail;
      try { const err = await res.json(); msg = err.error || msg; }
      catch { msg = UI[currentLang].errServer(res.status); }
      throw new Error(msg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "{";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      if (accumulated.includes("[[STREAM_ERROR]]")) {
        throw new Error(UI[currentLang].errStream);
      }
      updateStreamProgress(accumulated);
    }

    genMsg.textContent = UI[currentLang].layingOut;
    genFill.style.width = "96%";

    let raw = accumulated.trim();
    if (raw.startsWith("```")) raw = raw.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    const lastBrace = raw.lastIndexOf("}");
    if (lastBrace !== -1) raw = raw.slice(0, lastBrace + 1);

    try {
      reportData = JSON.parse(raw);
    } catch (e) {
      throw new Error(UI[currentLang].errParse);
    }

    reportData.student_name = answers.name || "学生";
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    reportData.report_id = `LMV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${rand}`;
    reportData.generated_at = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;

    genFill.style.width = "100%";
    buildReportDOM(reportData);
    track("report_generated", answers.contact ? "with_contact" : "no_contact");

    setTimeout(() => {
      document.getElementById("generating").classList.remove("active");
      document.getElementById("done").classList.add("active");
      document.getElementById("downloadBtn").onclick = downloadPDF;
      const note = document.getElementById("followupNote");
      if (note) note.textContent = answers.contact ? (currentLang === "en" ? `We'll reach out via "${answers.contact}" to walk through this report` : `我们会通过「${answers.contact}」与您联系，进一步解读这份报告`) : "";
    }, 500);
  } catch (e) {
    track("report_generate_error", e.message ? e.message.slice(0, 40) : "unknown");
    const errEl = document.getElementById("errorMsg");
    errEl.innerHTML = "‼ " + e.message + `<br><br><button class="btn btn-primary" onclick="generateReport()" style="font-size:14px;padding:10px 24px">${UI[currentLang].regenerate}</button>`;
    errEl.classList.add("show");
    document.getElementById("genMsg").textContent = UI[currentLang].errGeneric;
    document.querySelector(".spinner").style.display = "none";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    const qs = document.getElementById("questionScreen");
    if (qs && qs.classList.contains("active")) {
      const q = QUESTIONS[currentIdx];
      if (q && q.type !== "textarea") { e.preventDefault(); nextQuestion(); }
    }
  }
});

// ============================================================
// SVG chart generation (coffee/tan color palette)
// ============================================================
const C = {
  espresso: "#3a2a1a", coffee: "#6f4e37", caramel: "#a6824c", wheat: "#d9b779",
  cream: "#faf4e8", creamDeep: "#f3e8d2", tan: "#ede0c8", olive: "#7d8c69",
  gray: "#9a8d78", line: "#e6d9bf",
  stGood: "#7d8c69", stMid: "#c0892d", stGap: "#b5612e", stNa: "#b8ac95",
};
function statusColor(s) { return { green: C.stGood, yellow: C.stMid, red: C.stGap, gray: C.stNa }[s] || C.stNa; }

const STATIC_DIM_DESC = {
  "学术硬实力": "GPA、标化成绩、课程难度与所在学校声誉，是名校筛选的第一道门槛。",
  "学术深度":   "对意向专业的深度探索证据：竞赛、科研、独立项目、学术阅读等。",
  "领导力":     "在社团、组织或项目中的领导角色，强调持续时长与可衡量的影响力。",
  "社会贡献":   "对社区、议题或弱势群体的真实投入，看重影响深度而非时数。",
  "个人特质":   "独特兴趣、跨学科探索、文书叙事中的故事性与人格特质。",
  "国际视野":   "海外交流、跨文化合作、多语言能力或对国际议题的深度参与。",
  "艺术特长":   "音乐、艺术、戏剧、体育等领域的专业级成就，强调长期热情。",
  "申请呈现":   "文书深度、推荐信差异化、活动列表策略与面试表现等申请素材质量。",
};
const STATIC_DIM_LIST = ["学术硬实力","学术深度","领导力","社会贡献","个人特质","国际视野","艺术特长","申请呈现"];
function dimDescByIndex(name, idx) {
  return STATIC_DIM_DESC[name] || STATIC_DIM_DESC[STATIC_DIM_LIST[idx]] || "";
}

function gaugeSVG(score, tier, gap) {
  const cx = 200, cy = 200, r = 150, w = 46;
  const polar = (deg) => { const rad = (Math.PI * deg) / 180; return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]; };
  const arc = (startDeg, endDeg, color) => {
    const [x1, y1] = polar(startDeg), [x2, y2] = polar(endDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  const scoreDeg = 180 - (score / 100) * 180;
  const col = score >= 75 ? C.coffee : score >= 60 ? C.caramel : C.wheat;
  let ticks = "";
  [0, 25, 50, 75, 100].forEach((v) => { const [tx, ty] = (() => { const rad = (Math.PI * (180 - (v / 100) * 180)) / 180; return [cx + (r + 32) * Math.cos(rad), cy - (r + 32) * Math.sin(rad)]; })(); ticks += `<text x="${tx}" y="${ty}" font-size="13" fill="${C.gray}" text-anchor="middle" dominant-baseline="middle">${v}</text>`; });
  return `<svg viewBox="0 0 400 270" width="400" height="270" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto">
    ${arc(180, 0, C.tan)}
    ${arc(180, scoreDeg, col)}
    ${ticks}
    <text x="${cx}" y="${cy - 18}" font-size="64" font-weight="800" fill="${C.coffee}" text-anchor="middle">${score}</text>
    <text x="${cx}" y="${cy + 14}" font-size="15" fill="${C.espresso}" text-anchor="middle">综合竞争力指数</text>
    <text x="${cx}" y="${cy + 38}" font-size="13" fill="${C.gray}" text-anchor="middle">目标档次：${tier}</text>
    ${gap > 0 ? `<text x="${cx}" y="${cy + 62}" font-size="13" font-weight="700" fill="${C.caramel}" text-anchor="middle">距下一档次差 ${gap} 分</text>` : ""}
  </svg>`;
}

function radarSVG(dims) {
  const cx = 300, cy = 280, R = 175, n = dims.length;
  const safeName = (s) => (s && s.length > 5) ? s.slice(0, 4) : (s || "");
  const pt = (i, val) => { const ang = (Math.PI * 2 * i) / n - Math.PI / 2; const rr = (val / 100) * R; return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]; };
  let grid = "";
  [25, 50, 75, 100].forEach((lv) => {
    let pts = [];
    for (let i = 0; i < n; i++) { const [x, y] = pt(i, lv); pts.push(`${x},${y}`); }
    grid += `<polygon points="${pts.join(" ")}" fill="none" stroke="${C.line}" stroke-width="1"/>`;
  });
  let axes = "", labels = "";
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(i, 100);
    axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${C.line}" stroke-width="1"/>`;
    const [lx, ly] = pt(i, 118);
    const anchor = Math.abs(lx - cx) < 10 ? "middle" : lx > cx ? "start" : "end";
    labels += `<text x="${lx}" y="${ly}" font-size="14" fill="${C.espresso}" text-anchor="${anchor}" dominant-baseline="middle">${safeName(dims[i].name)}</text>`;
  }
  let dataPts = [], dots = "";
  for (let i = 0; i < n; i++) { const [x, y] = pt(i, dims[i].score); dataPts.push(`${x},${y}`); dots += `<circle cx="${x}" cy="${y}" r="6" fill="${statusColor(dims[i].status)}" stroke="white" stroke-width="2"/>`; }
  return `<svg viewBox="0 0 600 560" width="500" height="467" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;height:auto">
    ${grid}${axes}
    <polygon points="${dataPts.join(" ")}" fill="${C.caramel}" fill-opacity="0.22" stroke="${C.coffee}" stroke-width="2.5"/>
    ${dots}${labels}
  </svg>`;
}

function gapBarSVG(dims, target = 85) {
  const W = 720, rowH = 46, padL = 130, padR = 50, top = 20;
  const H = top * 2 + dims.length * rowH;
  const barW = W - padL - padR;
  let rows = "";
  dims.forEach((d, i) => {
    const y = top + i * rowH;
    const sc = d.score, col = statusColor(d.status);
    rows += `<text x="${padL - 12}" y="${y + rowH / 2}" font-size="14" fill="${C.espresso}" text-anchor="end" dominant-baseline="middle">${d.name}</text>`;
    rows += `<rect x="${padL}" y="${y + 10}" width="${barW}" height="22" rx="11" fill="${C.tan}"/>`;
    rows += `<rect x="${padL}" y="${y + 10}" width="${(sc / 100) * barW}" height="22" rx="11" fill="${col}"/>`;
    rows += `<text x="${padL + (sc / 100) * barW + 8}" y="${y + 21}" font-size="13" font-weight="700" fill="${C.espresso}" dominant-baseline="middle">${sc}</text>`;
  });
  const tx = padL + (target / 100) * barW;
  rows += `<line x1="${tx}" y1="${top}" x2="${tx}" y2="${H - top}" stroke="${C.coffee}" stroke-width="2" stroke-dasharray="5,4"/>`;
  rows += `<text x="${tx}" y="${top - 6}" font-size="12" font-weight="700" fill="${C.coffee}" text-anchor="middle">名校期待 ${target}+</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">${rows}</svg>`;
}

function schoolDistSVG(schools) {
  const W = 740, H = 440, padL = 64, padR = 36, padT = 56, padB = 60;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xFor = (rank) => padL + plotW - ((Math.min(Math.max(rank, 1), 60) - 1) / 59) * plotW;
  const yFor = (p) => padT + plotH - (p) * plotH;

  let bg = `<rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="${C.cream}" fill-opacity="0.35"/>`;
  bg += `<rect x="${padL}" y="${padT}" width="${plotW * 0.5}" height="${plotH * 0.5}" fill="${C.stGood}" fill-opacity="0.07"/>`;
  bg += `<rect x="${padL + plotW * 0.5}" y="${padT + plotH * 0.5}" width="${plotW * 0.5}" height="${plotH * 0.5}" fill="${C.stGap}" fill-opacity="0.07"/>`;
  bg += `<text x="${padL + plotW * 0.25}" y="${padT + 22}" font-size="11" fill="${C.stGood}" fill-opacity="0.55" text-anchor="middle" font-weight="700" letter-spacing="3">SAFETY ZONE</text>`;
  bg += `<text x="${padL + plotW * 0.75}" y="${padT + plotH - 12}" font-size="11" fill="${C.stGap}" fill-opacity="0.55" text-anchor="middle" font-weight="700" letter-spacing="3">REACH ZONE</text>`;

  let grid = "";
  [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
    const y = yFor(p);
    grid += `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="${C.line}" stroke-opacity="0.6" stroke-width="0.5"/>`;
  });
  [1, 15, 30, 45, 60].forEach((r) => {
    const x = xFor(r);
    grid += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="${C.line}" stroke-opacity="0.35" stroke-width="0.5"/>`;
  });

  let axes = "";
  axes += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="${C.coffee}" stroke-width="1.5"/>`;
  axes += `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${C.coffee}" stroke-width="1.5"/>`;
  [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
    const y = yFor(p);
    axes += `<text x="${padL - 10}" y="${y}" font-size="11" fill="${C.espresso}" text-anchor="end" dominant-baseline="middle" font-weight="500">${(p * 100).toFixed(0)}%</text>`;
    axes += `<line x1="${padL - 5}" y1="${y}" x2="${padL}" y2="${y}" stroke="${C.coffee}" stroke-width="1.2"/>`;
  });
  [1, 15, 30, 45, 60].forEach((r) => {
    const x = xFor(r);
    axes += `<text x="${x}" y="${padT + plotH + 18}" font-size="11" fill="${C.espresso}" text-anchor="middle" font-weight="500">#${r}</text>`;
    axes += `<line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 5}" stroke="${C.coffee}" stroke-width="1.2"/>`;
  });
  axes += `<text x="${padL + plotW / 2}" y="${H - 18}" font-size="12" fill="${C.coffee}" text-anchor="middle" font-weight="700" letter-spacing="1">US News 综合排名（→ 越靠右越难录取）</text>`;
  axes += `<text x="18" y="${padT + plotH / 2}" font-size="12" fill="${C.coffee}" text-anchor="middle" font-weight="700" letter-spacing="1" transform="rotate(-90 18 ${padT + plotH / 2})">预估录取概率</text>`;

  const groups = [["reach", C.stGap], ["safety", C.stGood]];
  let dots = "";
  groups.forEach(([k, col]) => {
    (schools[k] || []).forEach((s) => {
      const x = xFor(s.us_news_rank), y = yFor(s.admit_probability);
      dots += `<circle cx="${x}" cy="${y}" r="14" fill="${col}" fill-opacity="0.18"/>`;
      dots += `<circle cx="${x}" cy="${y}" r="8.5" fill="${col}" stroke="white" stroke-width="2.5"/>`;
      const px = x + 14, py = y - 7.5;
      dots += `<g>
        <rect x="${px}" y="${py}" width="76" height="15" rx="2.5" fill="${col}" fill-opacity="0.92"/>
        <rect x="${px + 5}" y="${py + 4}" width="${50 + (s.school_name_cn || '').length}" height="2" rx="1" fill="white" fill-opacity="0.6"/>
        <rect x="${px + 5}" y="${py + 9}" width="${30 + (s.school_name_cn || '').length * 0.5}" height="2" rx="1" fill="white" fill-opacity="0.45"/>
      </g>`;
    });
  });

  const legX = padL + plotW - 163, legY = padT + 8;
  let legend = `<g>
    <rect x="${legX}" y="${legY}" width="155" height="46" rx="6" fill="white" fill-opacity="0.95" stroke="${C.line}" stroke-width="1"/>
    <circle cx="${legX + 16}" cy="${legY + 16}" r="6" fill="${C.stGap}"/>
    <text x="${legX + 28}" y="${legY + 20}" font-size="11" fill="${C.espresso}" font-weight="600">冲刺档 Reach</text>
    <text x="${legX + 124}" y="${legY + 20}" font-size="10" fill="${C.caramel}" font-weight="600">${(schools.reach || []).length} 所</text>
    <circle cx="${legX + 16}" cy="${legY + 34}" r="6" fill="${C.stGood}"/>
    <text x="${legX + 28}" y="${legY + 38}" font-size="11" fill="${C.espresso}" font-weight="600">保底档 Safety</text>
    <text x="${legX + 124}" y="${legY + 38}" font-size="10" fill="${C.caramel}" font-weight="600">${(schools.safety || []).length} 所</text>
  </g>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
    ${bg}
    ${grid}
    ${dots}
    ${axes}
    ${legend}
  </svg>`;
}

function statusBadge(s) {
  const map = { green: ["优秀", C.stGood], yellow: ["待提升", C.stMid], red: ["明显短板", C.stGap], gray: ["待呈现", C.stNa] };
  const [label, col] = map[s] || map.gray;
  return `<span class="rp-badge" style="background:${col}1a;color:${col}"><span class="rp-dot" style="background:${col}"></span>${label}</span>`;
}

function schoolCard(s, cat) {
  const catCol = { reach: C.stGap, match: C.stMid, safety: C.stGood }[cat];
  return `<div class="rp-school" style="border-left:5px solid ${catCol}">
    <div class="rp-school-head"><div><span class="rp-school-cn">${s.school_name_cn}</span><span class="rp-school-en">${s.school_name}</span></div><div class="rp-school-rank">US News #${s.us_news_rank}</div></div>
    <div class="rp-school-metrics">
      <div><div class="rp-ml">预估录取概率</div><div class="rp-mv">${Math.round(s.admit_probability * 100)}%</div></div>
      <div><div class="rp-ml">综合匹配度</div><div class="rp-mv">${s.fit_score}/100</div></div>
      <div><div class="rp-ml">所在地</div><div class="rp-mv-sm">${s.location}</div></div>
    </div>
    <div class="rp-school-detail"><span style="color:${C.olive};font-weight:700">优势 · </span>${s.key_advantage}</div>
    <div class="rp-school-detail"><span style="color:${C.stGap};font-weight:700">风险 · </span>${s.key_risk}</div>
    <div class="rp-hint">破局方向：${s.breakthrough_hint}</div>
  </div>`;
}

function buildReportDOM(r) {
  const dims = r.dimensions || [];
  const sch = r.schools || { reach: [], match: [], safety: [] };
  const strat = r.strategy || { timeline: [], risks: [] };

  const strengths = (r.top_strengths || []).slice(0, 4).map(s => `<li><span class="rp-pill-icon" style="background:${C.olive}">✓</span><span>${s}</span></li>`).join("");
  const weaknesses = (r.top_weaknesses || []).slice(0, 4).map(w => `<li><span class="rp-pill-icon" style="background:${C.caramel}">!</span><span>${w}</span></li>`).join("");

  const dimBoxes = dims.slice(0, 8).map((d, i) => `<div class="rp-dimbox"><div class="rp-dim-name">${d.name}</div><div class="rp-dim-en">${d.name_en}</div><div class="rp-dim-desc">${dimDescByIndex(d.name, i)}</div></div>`).join("");

  const gapDims = dims.filter(d => d.status !== "green");
  const showDims = (gapDims.length > 0 ? gapDims : dims).slice(0, 8);
  const gapRows = showDims.map(d => `<tr><td><strong>${d.name}</strong></td><td>${statusBadge(d.status)}</td><td>${d.diagnosis}</td></tr>`).join("");
  const compactTable = showDims.length > 6;

  const reachShow = (sch.reach || []).slice(0, 1);
  const safetyShow = (sch.safety || []).slice(0, 1);
  const reachLocked = Math.max(0, (sch.reach || []).length - 1);
  const safetyLocked = Math.max(0, (sch.safety || []).length - 1);
  const noSchoolFallback = (label) => `<div class="rp-hint" style="margin-top:0">暂无${label}档学校数据，请联系慧木顾问获取完整选校方案。</div>`;
  const lockedHint = (n, label) => n > 0
    ? `<div class="rp-more-hint">本档次还有 <strong>${n}</strong> 所匹配学校未展示。联系慧木顾问获取完整列表与每所学校的针对性策略 →</div>`
    : "";

  const timeline = (strat.timeline || []).slice(0, 3).map(p => `<div class="rp-tl ${p.importance >= 3 ? "key" : ""}"><div class="rp-tl-head"><span class="rp-tl-phase">${p.phase}</span><span class="rp-tl-period">${p.period}</span><span class="rp-tl-stars">${"★".repeat(p.importance)}</span></div><div class="rp-tl-note-big">${p.note || ""}</div></div>`).join("");

  const risks = (strat.risks || []).slice(0, 3).map(rk => `<div class="rp-risk"><div class="rp-risk-title">${rk.title}</div><div class="rp-risk-desc">${rk.description}</div></div>`).join("");

  const html = `
  <div id="reportDoc">
  <div class="rp-page rp-cover">
    <div><div class="rp-cover-logo">LUMIVINE<span style="color:${C.wheat}">.</span></div><div class="rp-cover-cn">慧木咨询 · INTELLIGENCE</div></div>
    <div class="rp-cover-center"><div class="rp-cover-type">个 性 化 留 学 评 估 报 告</div><div class="rp-cover-title">美国本科申请<br>综合竞争力评估</div><div class="rp-cover-student">${r.student_name} 同学</div></div>
    <div><div class="rp-cover-meta"><div><div class="rp-cl">报告编号</div><div class="rp-cv">${r.report_id}</div></div><div><div class="rp-cl">生成日期</div><div class="rp-cv">${r.generated_at}</div></div><div><div class="rp-cl">综合竞争力</div><div class="rp-cv">${r.overall_score} / 100</div></div></div><div class="rp-confidential">CONFIDENTIAL · 本报告仅供 ${r.student_name} 同学家庭使用</div></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 01</div><div class="rp-stitle">综合竞争力诊断</div><div class="rp-rule"></div>
    <div class="rp-hero">${gaugeSVG(r.overall_score, r.target_tier, r.gap_to_target)}</div>
    <div class="rp-cards">
      <div class="rp-card"><div class="rp-card-num">${r.overall_score}</div><div class="rp-card-desc">综合竞争力指数<br>（中国申请池基准）</div></div>
      <div class="rp-card"><div class="rp-card-num" style="font-size:22px">${r.target_tier}</div><div class="rp-card-desc">当前可冲刺的<br>院校档次</div></div>
      <div class="rp-card"><div class="rp-card-num">${r.gap_to_target}<span style="font-size:16px">分</span></div><div class="rp-card-desc">距离下一档次<br>的关键差距</div></div>
    </div>
    <div class="rp-callout"><div class="rp-tag">AI 综合判断</div><p>${r.consultant_diagnosis}</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>02 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 02</div><div class="rp-stitle">学生画像 360°</div><div class="rp-rule"></div>
    <p class="rp-p">${r.profile_summary}</p>
    <div class="rp-subtitle">八大维度能力图谱</div>
    <div style="text-align:center;margin-top:6px">${radarSVG(dims)}</div>
    <div class="rp-foot"><span>${r.report_id}</span><span>03 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-subtitle">核心优势</div><ul class="rp-pill good">${strengths}</ul>
    <div class="rp-subtitle">关键提升项</div><ul class="rp-pill warn">${weaknesses}</ul>
    <div class="rp-callout"><div class="rp-tag">顾问视角</div><p>每一个"提升项"背后，都对应着一套需要专业判断的解决路径。如何将这些差距转化为有竞争力的申请素材，是慧木顾问团队签约后为每个学生量身定制的核心工作。</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>04 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 03</div><div class="rp-stitle">美国名校的八大评估维度</div><div class="rp-rule"></div>
    <p class="rp-p">美国 Top 30 名校采用"全面评估"（Holistic Review），从以下八个维度综合判断每一位申请者。下方列出的是名校在每个维度上看重的核心要素。</p>
    <div class="rp-dimgrid">${dimBoxes}</div>
    <div class="rp-foot"><span>${r.report_id}</span><span>05 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 04</div><div class="rp-stitle">${r.student_name} 同学的关键短板</div><div class="rp-rule"></div>
    <p class="rp-p">下方仅列出当前评估中标记为"待提升""明显短板"或"待呈现"的维度——这些是孩子距离目标院校之间需要重点突破的环节。条形图先给出八大维度的整体相对位置。</p>
    <div style="margin:20px 0">${gapBarSVG(dims)}</div>
    <div class="rp-callout"><div class="rp-tag">如何解读</div><p>条形长度代表当前水平，咖啡色虚线代表名校期待的基准线（85+）。距离虚线越远的维度，越是需要在申请前重点突破的环节。下一页将逐条说明每个短板的针对性诊断。</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>06 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-subtitle">短板维度的针对性诊断</div>
    <table class="rp-table${compactTable ? " compact" : ""}"><thead><tr><th style="width:24%">短板维度</th><th style="width:16%">现状评估</th><th>针对此学生的诊断</th></tr></thead><tbody>${gapRows}</tbody></table>
    <div class="rp-callout"><div class="rp-tag">重要提示</div><p>每一个短板的提升都有其黄金时间窗口与最优路径——错误的努力方向不仅浪费时间，甚至可能适得其反。慧木顾问团队将基于孩子的具体情况制定精准的提升方案。</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>07 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 05</div><div class="rp-stitle">推荐院校组合</div><div class="rp-rule"></div>
    <p class="rp-p">基于 ${r.student_name} 同学的综合画像，我们设计了"冲刺—保底"两档共 ${(sch.reach||[]).length + (sch.safety||[]).length} 所学校的组合。我们刻意省略了中间档——让家长在"冲刺梦校"与"稳妥兜底"之间做出清晰的战略决策，避免认知模糊带来的资源分散。</p>
    <div class="rp-chart-wrap" style="margin:16px 0">${schoolDistSVG(sch)}</div>
    <div class="rp-lock-cta">
      <div class="rp-lock-text">
        <div class="rp-lock-title">完整选校名单为顾问专属服务内容</div>
        <div class="rp-lock-desc">联系慧木顾问解锁针对孩子的精准选校方案与每所学校的破局策略</div>
      </div>
    </div>
    <div class="rp-foot"><span>${r.report_id}</span><span>08 / 14</span></div>
  </div>

  <div class="rp-page">
    <p class="rp-p" style="margin-bottom:14px;color:${C.gray};font-size:13px">以下每档选取 1 所学校作为示例展示，其余学校的详细分析与申请策略需要联系顾问解锁。</p>

    <div class="rp-grouplabel"><span class="rp-gldot" style="background:${C.stGap}"></span>冲刺档 Reach · 示例</div>
    ${reachShow.length ? reachShow.map(s => schoolCard(s, "reach")).join("") : noSchoolFallback("冲刺")}
    ${lockedHint(reachLocked, "冲刺")}

    <div class="rp-grouplabel"><span class="rp-gldot" style="background:${C.stGood}"></span>保底档 Safety · 示例</div>
    ${safetyShow.length ? safetyShow.map(s => schoolCard(s, "safety")).join("") : noSchoolFallback("保底")}
    ${lockedHint(safetyLocked, "保底")}

    <div class="rp-lock-cta" style="margin-top:24px">
      <div class="rp-lock-text">
        <div class="rp-lock-title">为孩子定制完整选校策略</div>
        <div class="rp-lock-desc">每所学校的招生偏好、ED/EA 策略、文书侧重点都不同。慧木顾问将为 ${r.student_name} 同学的具体情况定制每所学校的针对性方案。</div>
      </div>
    </div>

    <div class="rp-foot"><span>${r.report_id}</span><span>09 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 06</div><div class="rp-stitle">申请季关键路径</div><div class="rp-rule"></div>
    <p class="rp-p">下面是申请季的关键阶段总览。每个阶段的具体执行计划，将在签约后由顾问基于孩子情况定制。</p>
    <div style="margin-top:20px">${timeline}</div>
    <div class="rp-callout"><div class="rp-tag">早申策略</div><p>${strat.early_decision_hint || ""}</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>10 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 07</div><div class="rp-stitle">申请季流程关键风险</div><div class="rp-rule"></div>
    <p class="rp-p">除了能力维度的差距之外，申请季的流程本身潜藏着若干关键风险点——这些是即使学生硬实力达标，也可能让最终结果功亏一篑的环节。</p>
    <div style="margin-top:14px">${risks}</div>
    <div class="rp-foot"><span>${r.report_id}</span><span>11 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">SECTION 08</div><div class="rp-stitle">慧木咨询的方法论</div><div class="rp-rule"></div>
    <div class="rp-philo"><h3>我们相信什么</h3><p>每个孩子的名校之路都不是标准化产品，而是基于其独特画像、家庭目标与个人成长节奏的精细化路径设计。</p><p style="margin-top:10px">我们不承诺"保 Top X"——那是不负责任的市场话术。但我们承诺：</p><ul class="rp-promise"><li>用最严谨的方法论，评估孩子当前的真实位置</li><li>用最深的资源网络，为孩子匹配适合的提升路径</li><li>用最个性化的服务，陪伴申请季每一个关键决策</li><li>用招生官的视角，把孩子的潜力转化为有效的申请素材</li></ul></div>
    <p class="rp-p" style="margin-top:18px">本报告已为您呈现孩子当前的竞争力诊断与方向性建议。但正如您所见——<strong>真正的挑战不在于"知道差什么"，而在于"如何高效地补足"</strong>。</p>
    <p class="rp-p">如果您希望了解针对 ${r.student_name} 同学情况的具体规划方案，欢迎预约慧木资深顾问的 1 对 1 深度咨询。</p>
    <div class="rp-foot"><span>${r.report_id}</span><span>12 / 14</span></div>
  </div>

  <div class="rp-page">
    <div class="rp-snum">APPENDIX</div><div class="rp-stitle">报告的边界与下一步</div><div class="rp-rule"></div>
    <p class="rp-p">为确保严谨与透明，我们需要说明本报告的能力边界。</p>
    <div class="rp-subtitle">本报告已覆盖</div>
    <ul class="rp-limit"><li>基于八大维度的综合竞争力诊断</li><li>当前画像与目标院校的差距分析</li><li>个性化的院校组合建议与录取概率评估</li><li>申请季关键路径与风险方向提示</li></ul>
    <div class="rp-subtitle">以下环节需要专业顾问深度介入</div>
    <p class="rp-p" style="font-size:14px;color:${C.gray}">以下工作涉及实时招生信息、个性化深度判断与资源对接，AI 系统暂无法独立完成：</p>
    <ul class="rp-limit"><li>学生独特个人故事的深度挖掘与文书叙事构建</li><li>各维度短板的具体提升路径与项目资源匹配</li><li>推荐信策略的个性化设计与协调</li><li>各校招生官当年偏好的动态把握</li><li>文书多轮打磨、面试模拟与申请季全程动态调整</li></ul>
    <div class="rp-callout"><p>如需将本报告中的规划落地执行，建议预约慧木顾问 1 对 1 深度咨询。</p></div>
    <div class="rp-foot"><span>${r.report_id}</span><span>13 / 14</span></div>
  </div>

  <div class="rp-page rp-backcover">
    <div class="rp-cover-logo">LUMIVINE<span style="color:${C.wheat}">.</span></div><div class="rp-cover-cn" style="margin-top:6px">慧木咨询 · INTELLIGENCE</div>
    <div class="rp-cta"><div style="font-size:18px;font-weight:700;color:${C.wheat};margin-bottom:8px">预约 1 对 1 深度咨询</div><p style="font-size:13px;color:rgba(255,255,255,0.85);margin:0">让资深顾问为 ${r.student_name} 同学<br>解读这份报告，并制定专属规划方案</p><div class="rp-qr">微信二维码</div><p style="font-size:12px;color:${C.wheat};margin:0">扫码添加顾问 · 备注报告编号 ${r.report_id}</p></div>
    <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:30px;font-style:italic">每个孩子都有属于自己的名校之路。</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:22px">© 2026 Lumivine Intelligence · 慧木咨询. 本报告内容为保密信息。</p>
  </div>
  </div>`;

  const mount = document.getElementById("reportMount");
  mount.innerHTML = injectReportStyles() + html;
}

function injectReportStyles() {
  return `<style>
  #reportDoc { font-family: "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif; color:${C.espresso}; }
  @page { size: A4; margin: 0; }
  .rp-page { width:210mm; height:297mm; padding:20mm 18mm; position:relative; background:white; box-sizing:border-box; page-break-after:always; break-after:page; overflow:hidden; }
  .rp-snum { font-size:12px; color:${C.caramel}; font-weight:700; letter-spacing:2px; margin-bottom:4px; }
  .rp-stitle { font-size:24px; color:${C.coffee}; font-weight:700; margin-bottom:6px; }
  .rp-rule { width:50px; height:3px; background:${C.wheat}; margin-bottom:20px; }
  .rp-subtitle { font-size:17px; color:${C.coffee}; font-weight:700; margin:18px 0 10px; padding-left:12px; border-left:4px solid ${C.wheat}; }
  .rp-p { font-size:15px; line-height:1.8; margin-bottom:10px; text-align:justify; }
  .rp-foot { position:absolute; bottom:12mm; left:18mm; right:18mm; display:flex; justify-content:space-between; font-size:9px; color:${C.gray}; border-top:0.5px solid ${C.line}; padding-top:4px; }
  .rp-cover, .rp-backcover { background:${C.espresso} linear-gradient(160deg,${C.espresso} 0%,${C.coffee} 70%,#2a1d12 100%); color:white; display:flex; flex-direction:column; padding:28mm 20mm; }
  .rp-cover { justify-content:space-between; }
  .rp-cover-logo { font-size:32px; font-weight:800; letter-spacing:2px; }
  .rp-cover-cn { font-size:13px; color:${C.wheat}; letter-spacing:3px; margin-top:5px; }
  .rp-cover-center { margin:auto 0; }
  .rp-cover-type { font-size:14px; color:${C.wheat}; letter-spacing:6px; margin-bottom:14px; }
  .rp-cover-title { font-size:40px; font-weight:800; line-height:1.3; }
  .rp-cover-student { font-size:25px; color:${C.wheat}; font-weight:600; margin-top:22px; }
  .rp-cover-meta { border-top:1px solid rgba(255,255,255,0.2); padding-top:18px; display:flex; gap:36px; font-size:12px; }
  .rp-cl { color:${C.wheat}; margin-bottom:4px; } .rp-cv { color:white; font-weight:600; font-size:13px; }
  .rp-confidential { font-size:10px; color:${C.wheat}; letter-spacing:2px; margin-top:14px; }
  .rp-hero { background:${C.cream}; border-radius:16px; padding:20px; text-align:center; margin-bottom:18px; }
  .rp-cards { display:flex; gap:12px; }
  .rp-card { flex:1; background:white; border:1px solid ${C.line}; border-radius:12px; padding:18px 14px; border-top:3px solid ${C.wheat}; text-align:center; }
  .rp-card-num { font-size:30px; font-weight:800; color:${C.coffee}; } .rp-card-desc { font-size:12px; color:${C.gray}; margin-top:5px; line-height:1.5; }
  .rp-callout { background:${C.cream}; border-left:4px solid ${C.caramel}; border-radius:0 12px 12px 0; padding:16px 20px; margin:16px 0; font-size:14px; line-height:1.75; }
  .rp-callout p { margin:0; } .rp-tag { font-size:11px; color:${C.caramel}; font-weight:700; letter-spacing:1px; margin-bottom:6px; }
  .rp-pill { list-style:none; } .rp-pill li { background:${C.cream}; border-radius:10px; padding:13px 16px; margin-bottom:10px; font-size:14px; display:flex; gap:12px; align-items:flex-start; line-height:1.65; }
  .rp-pill.good li { border-left:3px solid ${C.olive}; } .rp-pill.warn li { border-left:3px solid ${C.caramel}; }
  .rp-pill-icon { flex-shrink:0; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; }
  .rp-dimgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
  .rp-dimbox { border:1px solid ${C.line}; border-radius:12px; padding:14px 16px; background:#fffdf9; }
  .rp-dim-name { font-size:15px; font-weight:700; color:${C.coffee}; margin-bottom:3px; }
  .rp-dim-en { font-size:10px; color:${C.gray}; letter-spacing:1px; margin-bottom:7px; }
  .rp-dim-desc { font-size:12.5px; line-height:1.6; }
  .rp-table { width:100%; border-collapse:collapse; }
  .rp-table.compact td { padding:8px 13px; font-size:12px; line-height:1.5; }
  .rp-table.compact th { padding:8px 13px; }
  .rp-table th { background:${C.coffee}; color:white; font-size:13px; font-weight:600; padding:11px 13px; text-align:left; }
  .rp-table th:first-child { border-radius:8px 0 0 0; } .rp-table th:last-child { border-radius:0 8px 0 0; }
  .rp-table td { padding:12px 13px; font-size:13px; border-bottom:1px solid ${C.line}; vertical-align:top; line-height:1.65; }
  .rp-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap; }
  .rp-dot { width:7px; height:7px; border-radius:50%; }
  .rp-school { border:1px solid ${C.line}; border-radius:12px; padding:16px 18px; margin-bottom:12px; background:#fffdf9; }
  .rp-school-head { display:flex; justify-content:space-between; align-items:baseline; }
  .rp-school-cn { font-size:18px; font-weight:700; color:${C.coffee}; } .rp-school-en { font-size:11px; color:${C.gray}; margin-left:8px; }
  .rp-school-rank { font-size:11px; color:${C.caramel}; font-weight:700; }
  .rp-school-metrics { display:flex; gap:24px; margin:10px 0; }
  .rp-ml { font-size:11px; color:${C.gray}; } .rp-mv { font-size:16px; font-weight:700; color:${C.coffee}; } .rp-mv-sm { font-size:13px; font-weight:600; }
  .rp-school-detail { font-size:13px; margin-top:6px; line-height:1.55; }
  .rp-hint { background:${C.cream}; border-radius:8px; padding:8px 12px; font-size:12px; margin-top:8px; font-style:italic; }
  .rp-grouplabel { font-size:16px; font-weight:700; margin:18px 0 12px; display:flex; align-items:center; gap:10px; color:${C.coffee}; }
  .rp-gldot { width:13px; height:13px; border-radius:3px; }

  .rp-lock-cta { display:flex; gap:14px; align-items:flex-start; background:linear-gradient(135deg,${C.cream},${C.creamDeep}); border:1.5px dashed ${C.caramel}; border-radius:14px; padding:18px 22px; margin-top:18px; }
  .rp-lock-text { flex:1; }
  .rp-lock-title { font-size:15px; font-weight:700; color:${C.coffee}; margin-bottom:4px; }
  .rp-lock-title::before { content:"顾问专属 · "; color:${C.caramel}; font-weight:800; font-size:11px; letter-spacing:1px; vertical-align:middle; }
  .rp-lock-desc { font-size:13px; color:${C.espresso}; line-height:1.6; }
  .rp-more-hint { background:${C.cream}; border:1px solid ${C.line}; border-radius:10px; padding:11px 16px; margin:6px 0 14px; font-size:13px; color:${C.espresso}; line-height:1.6; }
  .rp-chart-wrap { position:relative; }

  .rp-tl { border-left:2px solid ${C.caramel}; padding:0 0 22px 22px; position:relative; margin-left:8px; }
  .rp-tl::before { content:""; position:absolute; left:-7px; top:2px; width:12px; height:12px; border-radius:50%; background:${C.coffee}; border:2px solid white; }
  .rp-tl.key::before { background:${C.wheat}; width:14px; height:14px; left:-8px; }
  .rp-tl-head { display:flex; align-items:baseline; gap:10px; margin-bottom:8px; flex-wrap:wrap; }
  .rp-tl-phase { font-size:17px; font-weight:700; color:${C.coffee}; }
  .rp-tl-period { font-size:12px; color:${C.gray}; }
  .rp-tl-stars { color:${C.wheat}; font-size:12px; }
  .rp-tl-note-big { font-size:13.5px; color:${C.espresso}; line-height:1.75; }

  .rp-risk { background:#fbf3ea; border:1px solid #e8d2bb; border-radius:12px; padding:14px 18px; margin-bottom:12px; }
  .rp-risk-title { font-size:15px; font-weight:700; color:${C.stGap}; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
  .rp-risk-title::before { content:"!"; display:inline-flex; width:20px; height:20px; background:${C.stGap}; color:white; border-radius:50%; align-items:center; justify-content:center; font-size:12px; }
  .rp-risk-desc { font-size:13px; line-height:1.7; }
  .rp-philo { background:linear-gradient(160deg,${C.espresso},${C.coffee}); color:white; border-radius:16px; padding:28px; }
  .rp-philo h3 { font-size:19px; margin-bottom:12px; color:${C.wheat}; } .rp-philo p { color:rgba(255,255,255,0.92); font-size:14px; line-height:1.75; }
  .rp-promise { list-style:none; margin-top:14px; } .rp-promise li { padding:8px 0 8px 28px; position:relative; font-size:13.5px; color:rgba(255,255,255,0.95); line-height:1.6; }
  .rp-promise li::before { content:"✓"; position:absolute; left:0; color:${C.wheat}; font-weight:700; font-size:15px; }
  .rp-limit { list-style:none; } .rp-limit li { font-size:13px; padding:8px 0 8px 24px; position:relative; border-bottom:1px dashed ${C.line}; line-height:1.6; }
  .rp-limit li::before { content:"›"; position:absolute; left:4px; color:${C.caramel}; font-weight:700; font-size:14px; }
  .rp-backcover { justify-content:center; align-items:center; text-align:center; padding:36mm 20mm; }
  .rp-cta { background:rgba(255,255,255,0.06); border:1px solid ${C.wheat}66; border-radius:16px; padding:28px 36px; margin-top:22px; }
  .rp-qr { width:96px; height:96px; background:white; border-radius:8px; margin:16px auto; display:flex; align-items:center; justify-content:center; color:${C.gray}; font-size:10px; }
  </style>`;
}

function previewReport() {
  track("preview_view");
  const mount = document.getElementById("reportMount");
  document.getElementById("mainContainer").style.display = "none";
  document.querySelector(".topbar").style.display = "none";
  document.querySelector(".progress-track").style.display = "none";
  document.getElementById("progressSegs").style.display = "none";
  const pn0 = document.getElementById("progressNote");
  if (pn0) pn0.style.display = "none";
  mount.style.display = "block";
  mount.style.padding = "20px 0";
  mount.style.background = C.tan;
  if (!document.getElementById("backToDone")) {
    const b = document.createElement("button");
    b.id = "backToDone"; b.className = "btn btn-primary";
    b.style.cssText = "position:fixed;top:16px;right:16px;z-index:200";
    b.textContent = currentLang === "en" ? "← Back to results" : "← 返回结果页";
    b.onclick = backFromPreview;
    document.body.appendChild(b);
  }
  document.querySelectorAll("#reportDoc .rp-page").forEach((p) => { p.style.margin = "0 auto 20px"; p.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)"; p.style.maxWidth = "210mm"; });
  window.scrollTo(0, 0);
}

function backFromPreview() {
  const mount = document.getElementById("reportMount");
  mount.style.display = "none";
  document.getElementById("mainContainer").style.display = "";
  document.querySelector(".topbar").style.display = "";
  document.querySelector(".progress-track").style.display = "";
  document.getElementById("progressSegs").style.display = "";
  const b = document.getElementById("backToDone");
  if (b) b.remove();
  window.scrollTo(0, 0);
}

function downloadPDF() {
  track("pdf_download");
  const btn = document.getElementById("downloadBtn");
  const orig = btn.textContent;
  btn.textContent = "正在生成 PDF...";
  btn.disabled = true;

  const mount = document.getElementById("reportMount");
  mount.style.cssText = "display:block; position:fixed; top:0; left:0; width:210mm; background:white; z-index:9990; opacity:0; pointer-events:none;";

  const overlay = document.createElement("div");
  overlay.id = "pdfOverlay";
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(58,42,26,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#d9b779;font-family:inherit";
  overlay.innerHTML = '<div style="width:48px;height:48px;border:4px solid rgba(217,183,121,0.3);border-top-color:#d9b779;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:18px"></div><div style="font-size:18px;font-weight:700">正在生成 PDF 报告...</div><div style="font-size:13px;margin-top:8px;color:rgba(255,255,255,0.7)">约需 10-30 秒，请稍候</div>';
  document.body.appendChild(overlay);

  const cleanup = () => {
    mount.style.cssText = "display:none";
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    btn.textContent = orig;
    btn.disabled = false;
  };

  setTimeout(async () => {
    // We no longer use html2pdf.js's all-in-one pipeline (internally it clones the whole
    // report into its own container, then splits it into pages by canvas height — in our
    // testing this repeatedly produced blank pages / content squeezed to the left, and was
    // hard to reproduce reliably). Instead we take the most direct and reliable approach:
    // each .rp-page is already exactly one page (210mm x 297mm), so we screenshot each page
    // individually and add them to the PDF one at a time, forcing every image to fill the
    // full page — no automatic pagination/scaling guesswork involved.
    try {
      const pages = Array.from(document.querySelectorAll("#reportDoc .rp-page"));
      if (!pages.length) throw new Error("未找到报告内容");

      const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      pdf.save(`Lumivine_${reportData.student_name}_${reportData.report_id}.pdf`);
      cleanup();
    } catch (e) {
      cleanup();
      alert("PDF 生成失败：" + e.message + '\n\n可尝试点击"在线预览"后用浏览器自带的"打印 → 存为 PDF"。');
    }
  }, 200);
}
