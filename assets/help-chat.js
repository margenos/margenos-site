/* Margenos Help: the 24/7 chat bubble on margenos.com.
   Talks to /api/support/chat on the Margenos backend. Signed-out on the
   website, so it answers questions, sends password resets and opens tickets;
   account-specific help happens in the app or the extension. */
(function () {
  if (window.__mgHelp) return;
  window.__mgHelp = true;

  var API = 'https://margenos-production.up.railway.app/api/support/chat';
  var KEY = 'mg-help-chat';
  var HELLO = "Hi! I'm Margenos Help. Ask me about plans, the Chrome extension, the app, Walmart fees, or your account. I'm here 24/7.";
  var CHIPS = ['How do I start the free trial?', 'How does the Chrome extension work?', 'I forgot my password', 'Talk to a person'];

  var css = '' +
    '.mgh-btn{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;background:#39FF14;color:#05210A;border:0;border-radius:999px;padding:13px 18px;font:800 15px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(57,255,20,.35),0 2px 8px rgba(0,0,0,.4)}' +
    '.mgh-btn svg{width:18px;height:18px}' +
    '.mgh-box{position:fixed;right:20px;bottom:84px;z-index:2147483000;width:370px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 110px);display:none;flex-direction:column;background:#0D1526;color:#F2F6FF;border:1px solid rgba(255,255,255,.1);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.6);font:14.5px/1.5 Inter,system-ui,sans-serif;overflow:hidden}' +
    '.mgh-box.open{display:flex}' +
    '.mgh-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,rgba(57,255,20,.14),rgba(167,139,250,.1));border-bottom:1px solid rgba(255,255,255,.08)}' +
    '.mgh-head b{font-weight:900;letter-spacing:.5px}.mgh-head small{display:block;color:#94A3C4;font-size:12px}' +
    '.mgh-dot{width:8px;height:8px;border-radius:50%;background:#39FF14;box-shadow:0 0 8px #39FF14;display:inline-block;margin-right:5px}' +
    '.mgh-x{margin-left:auto;background:none;border:0;color:#94A3C4;font-size:22px;cursor:pointer;line-height:1}' +
    '.mgh-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.mgh-m{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}' +
    '.mgh-m.bot{background:#141E33;border:1px solid rgba(255,255,255,.07);align-self:flex-start;border-bottom-left-radius:4px}' +
    '.mgh-m.me{background:#39FF14;color:#05210A;align-self:flex-end;border-bottom-right-radius:4px;font-weight:600}' +
    '.mgh-m a{color:#7CFFB2}' +
    '.mgh-typing{align-self:flex-start;color:#94A3C4;font-size:13px}' +
    '.mgh-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}' +
    '.mgh-chips button{background:rgba(57,255,20,.08);border:1px solid rgba(57,255,20,.35);color:#B8FFA0;border-radius:999px;padding:6px 10px;font:600 12.5px Inter,system-ui,sans-serif;cursor:pointer}' +
    '.mgh-form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.08)}' +
    '.mgh-form textarea{flex:1;resize:none;height:42px;max-height:110px;background:#141E33;color:#F2F6FF;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;font:inherit}' +
    '.mgh-form textarea:focus{outline:none;border-color:#39FF14}' +
    '.mgh-form button{background:#39FF14;color:#05210A;border:0;border-radius:12px;padding:0 14px;font-weight:900;cursor:pointer}' +
    '.mgh-form button:disabled{opacity:.5;cursor:default}' +
    '.mgh-foot{padding:0 14px 10px;color:#5C6B8C;font-size:11.5px}' +
    '@media (max-width:480px){.mgh-box{right:8px;left:8px;width:auto;bottom:76px;height:calc(100vh - 100px)}.mgh-btn{right:14px;bottom:14px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.className = 'mgh-btn';
  btn.setAttribute('aria-label', 'Open Margenos Help chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Help';

  var box = document.createElement('div');
  box.className = 'mgh-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Margenos Help');
  box.innerHTML =
    '<div class="mgh-head"><div><b>Margenos Help</b><small><span class="mgh-dot"></span>Online 24/7 \u00b7 usually replies in seconds</small></div><button class="mgh-x" aria-label="Close">\u00d7</button></div>' +
    '<div class="mgh-log" aria-live="polite"></div>' +
    '<div class="mgh-chips"></div>' +
    '<form class="mgh-form"><textarea rows="1" placeholder="Type your question\u2026" aria-label="Message" maxlength="1500"></textarea><button type="submit" aria-label="Send">\u27a4</button></form>' +
    '<div class="mgh-foot">AI assistant. For anything it can\u2019t solve, it passes you to a person. support@margenos.com</div>';

  document.body.appendChild(btn);
  document.body.appendChild(box);

  var log = box.querySelector('.mgh-log');
  var chips = box.querySelector('.mgh-chips');
  var form = box.querySelector('.mgh-form');
  var input = form.querySelector('textarea');
  var send = form.querySelector('button');
  var busy = false;

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-24))); } catch (e) {} }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function linkify(t) {
    return esc(t)
      .replace(/(https?:\/\/[^\s<)]+[^\s<).,!?])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi, '$1<a href="mailto:$2">$2</a>');
  }
  function bubble(role, text) {
    var d = document.createElement('div');
    d.className = 'mgh-m ' + (role === 'user' ? 'me' : 'bot');
    d.innerHTML = linkify(text);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function render() {
    log.innerHTML = '';
    bubble('assistant', HELLO);
    history.forEach(function (m) { bubble(m.role, m.content); });
    chips.innerHTML = '';
    if (!history.length) {
      CHIPS.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = c;
        b.onclick = function () { ask(c); };
        chips.appendChild(b);
      });
    }
  }

  function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    chips.innerHTML = '';
    history.push({ role: 'user', content: text.slice(0, 1500) });
    save();
    bubble('user', text);
    var typing = document.createElement('div');
    typing.className = 'mgh-typing';
    typing.textContent = 'Margenos Help is typing\u2026';
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'web', messages: history.slice(-24) }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
      .then(function (x) {
        var reply = x.j && x.j.success && x.j.reply
          ? x.j.reply
          : (x.j && x.j.message) || 'Sorry, I can\u2019t answer right now. Email support@margenos.com and we\u2019ll help.';
        if (x.j && x.j.success) { history.push({ role: 'assistant', content: reply }); save(); }
        typing.remove();
        bubble('assistant', reply);
      })
      .catch(function () {
        typing.remove();
        bubble('assistant', 'I couldn\u2019t connect. Check your internet, or email support@margenos.com.');
      })
      .then(function () { busy = false; send.disabled = false; input.focus(); });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value; input.value = ''; ask(t); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });
  btn.addEventListener('click', function () {
    var open = !box.classList.contains('open');
    box.classList.toggle('open', open);
    if (open) { render(); setTimeout(function () { input.focus(); }, 50); }
  });
  box.querySelector('.mgh-x').addEventListener('click', function () { box.classList.remove('open'); });
  if (/[?&#]help\b/.test(location.search + location.hash)) btn.click();
})();
