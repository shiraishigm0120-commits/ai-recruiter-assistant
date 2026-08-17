// Cloudflare Worker：DeepSeek API 代理
// 作用：把 DeepSeek key 藏在 Worker 里，浏览器调这个 Worker，Worker 转发给 DeepSeek，解决浏览器跨域(CORS)限制。
// 部署后，把 Worker 的 URL（形如 https://xxx.workers.dev）填进 AI招聘助手 的「设置 → 代理地址」。

export default {
  async fetch(request, env) {
    // 处理跨域预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
    }

    if (!env.DEEPSEEK_KEY) {
      return new Response(JSON.stringify({ error: '未配置 DEEPSEEK_KEY 密钥' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    const body = await request.json();

    // 转发给 DeepSeek
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DEEPSEEK_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
