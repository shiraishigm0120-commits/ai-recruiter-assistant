const cloud = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });

// 云存储 fileID = cloud://<envId>.<bucket>/<path>，bucket 对当前环境固定
const ENV_ID = 'ai-recruit-d1guqh8a95b2dcbb9';
const BUCKET = '6169-ai-recruit-d1guqh8a95b2dcbb9-1477498882';
const SESSION_TTL = 30 * 24 * 3600 * 1000; // 30 天

function fileID(path) {
  return `cloud://${ENV_ID}.${BUCKET}/${path}`;
}

async function readJSON(path) {
  try {
    const res = await app.downloadFile({ fileID: fileID(path) });
    const buf = res && res.fileContent;
    if (!buf) return null;
    return JSON.parse(Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf));
  } catch (e) {
    return null;
  }
}

async function writeJSON(path, obj) {
  await app.uploadFile({
    cloudPath: path,
    fileContent: Buffer.from(JSON.stringify(obj), 'utf8')
  });
}

async function removeFile(path) {
  try {
    await app.deleteFile({ fileList: [fileID(path)] });
  } catch (e) {
    // 不存在则忽略
  }
}

async function getSession(token) {
  if (!token) return null;
  const s = await readJSON(`acc/sessions/${token}.json`);
  if (!s || s.expiresAt < Date.now()) return null;
  return s;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function validUsername(u) {
  return typeof u === 'string' && /^[a-zA-Z0-9_-]{2,32}$/.test(u);
}

function validPassword(p) {
  return typeof p === 'string' && p.length >= 6 && p.length <= 64;
}

exports.main = async (event) => {
  event = event || {};
  const action = event.action;

  switch (action) {
    case 'register': {
      const { username, password } = event;
      if (!validUsername(username)) return { ok: false, err: '用户名需2-32位，仅限字母/数字/_/-' };
      if (!validPassword(password)) return { ok: false, err: '密码需6-64位' };
      if (await readJSON(`acc/users/${username}.json`)) return { ok: false, err: '用户名已存在' };
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      await writeJSON(`acc/users/${username}.json`, { salt, hash, createdAt: Date.now() });
      return { ok: true };
    }

    case 'login': {
      const { username, password } = event;
      const u = await readJSON(`acc/users/${username}.json`);
      if (!u) return { ok: false, err: '用户名或密码错误' };
      const a = Buffer.from(hashPassword(password, u.salt), 'hex');
      const b = Buffer.from(u.hash, 'hex');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return { ok: false, err: '用户名或密码错误' };
      }
      const token = crypto.randomBytes(32).toString('hex');
      await writeJSON(`acc/sessions/${token}.json`, { username, expiresAt: Date.now() + SESSION_TTL });
      return { ok: true, token, username };
    }

    case 'logout': {
      if (event.token) await removeFile(`acc/sessions/${event.token}.json`);
      return { ok: true };
    }

    case 'me': {
      const s = await getSession(event.token);
      if (!s) return { ok: false, err: '未登录' };
      return { ok: true, username: s.username };
    }

    case 'pull': {
      const s = await getSession(event.token);
      if (!s) return { ok: false, err: '未登录' };
      const d = await readJSON(`acc/userdata/${s.username}.json`);
      if (!d) return { ok: true, jobs: [], updatedAt: 0 };
      return { ok: true, jobs: d.jobs || [], updatedAt: d.updatedAt || 0 };
    }

    case 'push': {
      const s = await getSession(event.token);
      if (!s) return { ok: false, err: '未登录' };
      const jobs = Array.isArray(event.jobs) ? event.jobs : [];
      await writeJSON(`acc/userdata/${s.username}.json`, {
        jobs,
        updatedAt: event.updatedAt || Date.now()
      });
      return { ok: true };
    }

    default:
      return { ok: false, err: '未知操作' };
  }
};
