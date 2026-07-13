# Lumivine Intelligence · 慧木咨询 — 部署指南

一个跑在 Cloudflare Pages 上的 AI 留学评估系统。家长在网页上一题一题回答，AI 生成可下载的 PDF 评估报告。

---

## ⚠️ 安全第一：关于 API Key

**绝对不要把 Anthropic API Key 写进任何代码文件。** 本项目设计为从 Cloudflare 环境变量读取密钥。

> 如果你曾在聊天、邮件、截图等任何地方暴露过你的 API Key，请立即去 [Anthropic 后台](https://console.anthropic.com/settings/keys) 作废它并重新生成一个。暴露的 key 任何人都能用，会产生你账户的费用。

---

## 部署方式一：拖拽上传（最简单，推荐先用这个测试）

1. 把整个项目文件夹压缩，或直接准备好这个文件夹
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
3. 给项目起个名字（例如 `lumivine`），把整个文件夹拖进去上传
4. 上传完成后，进入项目的 **Settings → Environment variables → Production**，添加：
   - 变量名：`ANTHROPIC_API_KEY`，值：你的真实 key（点击 **Encrypt** 加密保存）
   - （可选）变量名：`CLAUDE_MODEL`，值：`claude-sonnet-4-5`（或你账户支持的其他模型）
5. **Settings → Functions** 确认 Functions 已启用（上传含 `functions/` 目录会自动启用）
6. 回到 **Deployments**，点击 **Retry deployment** 让环境变量生效
7. 打开分配的 `*.pages.dev` 网址即可使用

> 注意：拖拽上传方式有时对 Functions 支持不稳定。如果 `/api/generate` 报错，改用下面的命令行方式。

---

## 部署方式二：命令行 wrangler（最稳定，推荐正式用）

需要先装 Node.js（18+）。

```bash
# 1. 进入项目目录
cd lumivine-intelligence

# 2. 安装 wrangler
npm install

# 3. 登录 Cloudflare（会打开浏览器授权）
npx wrangler login

# 4. 配置生产环境的 API Key（会提示你粘贴，输入不会显示在屏幕上）
npx wrangler pages secret put ANTHROPIC_API_KEY
#    粘贴你的 key，回车

# （可选）配置模型
npx wrangler pages secret put CLAUDE_MODEL
#    输入 claude-sonnet-4-5

# 5. 部署
npx wrangler pages deploy .
```

部署成功后会输出一个 `https://xxx.lumivine-intelligence.pages.dev` 网址。

---

## 部署方式三：连接 Git 仓库（适合长期维护）

1. 把项目推到 GitHub / GitLab（`.gitignore` 已配置好，不会泄露密钥）
2. Cloudflare Pages → **Create** → **Connect to Git** → 选择仓库
3. 构建设置：
   - Framework preset: `None`
   - Build command: 留空
   - Build output directory: `/`
4. 在 **Settings → Environment variables** 添加 `ANTHROPIC_API_KEY`
5. 每次 push 到主分支会自动重新部署

---

## 本地测试

```bash
# 复制环境变量文件并填入 key（.dev.vars 不会被 git 提交）
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 填入真实 key

# 启动本地开发服务器
npx wrangler pages dev .
# 打开 http://localhost:8788
```

---

## 线索实时通知（家长留联系方式后自动通知顾问）

家长在问卷最后一题留下微信号/手机号后，系统会立即（不等报告生成完成）把这条线索推给顾问团队，避免线索只是"塞进 PDF 里"没人跟进。

配置方式：
1. 在 Slack 里新建一个 **Incoming Webhook**（或飞书群机器人，同样支持 `{"text": "..."}` 格式），拿到 Webhook URL
2. Cloudflare Pages → 项目 → **Settings → Environment variables → Production**，添加变量 `LEAD_WEBHOOK_URL`，值为该 Webhook 地址
3. 重新部署生效

不配置这个变量也完全不影响报告生成——只是不会有实时通知，线索仍会保留在家长自己下载的 PDF 里。

---

## 查看埋点数据（转化漏斗）

网站已内置极简埋点（`functions/api/track.js`），记录关键事件：`page_view`（首页/评估页访问）、`cta_click`（首页点击开始评估）、`assessment_started`（进入问卷）、`section_reached`（到达每个分区，可看出用户在哪一部分流失）、`report_generate_start` / `report_generated` / `report_generate_error`、`preview_view`、`pdf_download`。不采集任何姓名、GPA 等具体问卷内容。

查看方式：
- 命令行实时日志：`npx wrangler pages deployment tail`
- 或 Cloudflare Dashboard → 项目 → **Logs**（需 Workers Logs / Logpush，具体入口以后台为准）

如果想要更完整的流量分析（PV/UV、地域、设备、Core Web Vitals），可以额外开启 **Cloudflare Web Analytics**（Dashboard → Analytics & Logs → Web Analytics → Add site），拿到 beacon token 后把以下代码加入 `index.html` 和 `assess.html` 的 `</body>` 前：
```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "你的token"}'></script>
```

---

## 绑定自定义域名

部署后在项目的 **Custom domains** 标签页添加你自己的域名（例如 `assess.lumivine.com`），按提示配置 DNS 即可。

---

## 常见问题

**Q: 点击生成报告后报 "未配置 ANTHROPIC_API_KEY"**
A: 环境变量没配好，或配置后没重新部署。按方式二重新 `wrangler pages secret put` 并 `deploy`。

**Q: 生成报告超时**
A: Claude 调用约需 30-60 秒。Cloudflare Pages Functions 在等待外部 API 时不消耗 CPU 时间，通常没问题。若频繁超时，考虑升级到 Workers 付费计划。

**Q: PDF 里中文是方块**
A: PDF 由浏览器端 html2pdf 生成，用的是访问者电脑的字体。中文系统正常显示。如需嵌入字体确保万无一失，可后续改为服务端渲染方案。

**Q: 想改问题 / 配色 / 报告文案**
A: 问题在 `app.js` 顶部的 `QUESTIONS` 数组；配色在 `index.html` 的 `:root` 和 `app.js` 的 `C` 对象；AI 生成逻辑和话术在 `functions/api/generate.js` 的 `SYSTEM_PROMPT`。

---

## 文件结构

```
lumivine-intelligence/
├── index.html              # 前端：官网首页（营销页，含"开始评估"入口）
├── assess.html              # 前端：评估问卷界面
├── app.js                  # 问卷逻辑 + 报告渲染 + SVG 图表 + PDF 导出
├── functions/
│   └── api/
│       ├── generate.js     # 后端：调用 Claude（密钥从环境变量读）
│       ├── config-status.js
│       └── track.js        # 后端：极简埋点，记录漏斗事件到 Functions 日志
├── wrangler.toml           # Cloudflare 配置
├── _routes.json            # Functions 路由范围
├── package.json
├── .gitignore
├── .dev.vars.example       # 本地开发环境变量模板
└── DEPLOY.md               # 本文件
```
