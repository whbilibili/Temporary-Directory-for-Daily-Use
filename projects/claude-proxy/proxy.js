#!/usr/bin/env node
/**
 * Claude Desktop → NewAPI 本地转发代理
 *
 * 作用：对 Claude 桌面版暴露标准 Anthropic 接口，
 *       内部将请求转发到公司 newapi 网关，支持任意模型。
 *
 * 使用：
 *   node proxy.js
 *
 * Claude 桌面版配置：
 *   Gateway base URL: http://localhost:19090
 *   Gateway API key:  填你的 newapi key
 *   inferenceModels:  填你想用的模型名（与网关一致即可）
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

// ─── 配置区 ────────────────────────────────────────────────────────────────
const CONFIG = {
  // 本地监听端口
  port: 19090,

  // 上游 newapi 网关地址
  upstreamBaseUrl: "https://newapi.waimai.st.sankuai.com",

  // 模型名映射表
  // key: Claude 桌面版里填的模型名（必须 claude- 开头才能通过校验）
  // value: 实际转发给网关的模型名
  modelMapping: {
    // opus-4.7 能直接通过校验，无需映射
    "claude-gemini-3.1-pro-preview": "gemini-3.1-pro-preview",
    "claude-gpt-5.4":                "gpt-5.4",
    // 如需添加更多模型，按此格式继续追加
  },
};
// ──────────────────────────────────────────────────────────────────────────

const upstream = new URL(CONFIG.upstreamBaseUrl);

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

const server = http.createServer((req, res) => {
  let body = [];

  req.on("data", (chunk) => body.push(chunk));

  req.on("end", () => {
    const rawBody = Buffer.concat(body);
    let bodyStr = rawBody.toString("utf8");

    // 模型名映射：替换请求体中的模型名
    if (bodyStr && Object.keys(CONFIG.modelMapping).length > 0) {
      try {
        const parsed = JSON.parse(bodyStr);
        if (parsed.model && CONFIG.modelMapping[parsed.model]) {
          const originalModel = parsed.model;
          parsed.model = CONFIG.modelMapping[parsed.model];
          log(`模型映射: ${originalModel} → ${parsed.model}`);
          bodyStr = JSON.stringify(parsed);
        }
      } catch (e) {
        // 非 JSON body，跳过映射
      }
    }

    const finalBody = Buffer.from(bodyStr, "utf8");

    // 构造转发请求头
    const headers = { ...req.headers };
    headers["host"] = upstream.host;
    headers["content-length"] = finalBody.length;
    // 移除可能导致问题的头
    delete headers["connection"];
    delete headers["transfer-encoding"];

    const options = {
      hostname: upstream.hostname,
      port: upstream.port || (upstream.protocol === "https:" ? 443 : 80),
      path: req.url,
      method: req.method,
      headers,
    };

    log(`→ ${req.method} ${req.url}`);

    const protocol = upstream.protocol === "https:" ? https : http;
    const proxyReq = protocol.request(options, (proxyRes) => {
      log(`← ${proxyRes.statusCode} ${req.url}`);

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      log(`✗ 转发失败: ${err.message}`);
      res.writeHead(502);
      res.end(JSON.stringify({ error: { message: `Proxy error: ${err.message}`, type: "proxy_error" } }));
    });

    proxyReq.write(finalBody);
    proxyReq.end();
  });

  req.on("error", (err) => {
    log(`✗ 请求错误: ${err.message}`);
  });
});

server.listen(CONFIG.port, "127.0.0.1", () => {
  log(`✓ 代理已启动，监听 http://127.0.0.1:${CONFIG.port}`);
  log(`✓ 上游网关: ${CONFIG.upstreamBaseUrl}`);
  log(`─────────────────────────────────────────`);
  log(`Claude 桌面版配置：`);
  log(`  Gateway base URL: http://localhost:${CONFIG.port}`);
  log(`  Gateway API key:  填你的 newapi key`);
  log(`  inferenceModels:  填网关支持的任意模型名`);
  log(`─────────────────────────────────────────`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`✗ 端口 ${CONFIG.port} 已被占用，请修改 CONFIG.port`);
  } else {
    log(`✗ 服务器错误: ${err.message}`);
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  log("代理已停止");
  process.exit(0);
});
