(function () {
  var BASE = (function () {
    var s = document.currentScript;
    return s ? s.src.replace(/chatbot\.js.*$/, '') : './chatbot/';
  })();

  var state = {
    kb: null,
    open: false,
    messages: [],
    stage: 'chat', // 'chat' -> 'ask_name' -> 'ask_contact' -> back to 'chat' (com lead capturado)
    firstAnswerGiven: false,
    answeredFaqIds: {},
    lastBotIntent: null,
    missCount: 0,
    nameAttempts: 0,
    contactAttempts: 0,
    name: null,
    contact: null
  };

  var HUMAN_TRIGGERS = ['falar com alguém', 'falar com alguem', 'atendente', 'humano', 'pessoa real', 'suporte humano'];

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function buildUI() {
    var root = document.getElementById('wk-chatbot-root');
    if (!root) return;

    var launcher = el('button', { id: 'wk-chat-launcher', type: 'button', 'aria-label': 'Abrir chat' },
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#eef1e6" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>');

    var panel = el('div', { id: 'wk-chat-panel' });
    panel.innerHTML =
      '<div id="wk-chat-header">' +
      '  <div><strong>WebKeeper</strong><span>Assistente virtual</span></div>' +
      '  <button id="wk-chat-close" type="button" aria-label="Fechar">&times;</button>' +
      '</div>' +
      '<div id="wk-chat-messages"></div>' +
      '<form id="wk-chat-form">' +
      '  <input id="wk-chat-input" type="text" autocomplete="off" placeholder="Digite sua pergunta..." />' +
      '  <button id="wk-chat-send" type="submit">Enviar</button>' +
      '</form>';

    root.appendChild(launcher);
    root.appendChild(panel);

    launcher.addEventListener('click', togglePanel);
    panel.querySelector('#wk-chat-close').addEventListener('click', togglePanel);
    panel.querySelector('#wk-chat-form').addEventListener('submit', onSubmit);
  }

  function togglePanel() {
    state.open = !state.open;
    var panel = document.getElementById('wk-chat-panel');
    panel.classList.toggle('wk-open', state.open);
    if (state.open && state.messages.length === 0 && state.kb) {
      addBotMessage(state.kb.saudacao);
    }
    if (state.open) document.getElementById('wk-chat-input').focus();
  }

  function addMessage(text, who) {
    state.messages.push({ who: who, text: text, at: new Date().toISOString() });
    var box = document.getElementById('wk-chat-messages');
    var bubble = el('div', { class: 'wk-msg ' + (who === 'user' ? 'wk-msg-user' : 'wk-msg-bot') }, escapeHtml(text));
    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
  }

  function addBotMessage(text) { addMessage(text, 'bot'); }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function firstName(full) {
    return (full || '').trim().split(/\s+/)[0];
  }

  function matchFaq(question) {
    if (!state.kb) return null;
    var q = question.toLowerCase();
    var best = null, bestScore = 0;
    state.kb.faq.forEach(function (item) {
      var score = 0;
      item.keywords.forEach(function (kw) {
        if (q.indexOf(kw.toLowerCase()) !== -1) score++;
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return bestScore > 0 ? best : null;
  }

  function wantsHuman(question) {
    var q = question.toLowerCase();
    return HUMAN_TRIGGERS.some(function (t) { return q.indexOf(t) !== -1; });
  }

  // Heurística leve: texto parece pergunta/assunto novo (não uma resposta de nome/contato)
  function looksLikeQuestion(text) {
    if (/\?/.test(text)) return true;
    return !!matchFaq(text);
  }

  function looksLikeContact(text) {
    var digits = text.replace(/\D/g, '');
    return digits.length >= 8 || /@/.test(text);
  }

  // Responde de passagem uma pergunta feita fora de hora (durante coleta de nome/contato),
  // sem perder o fio da coleta e sem repetir uma FAQ já respondida antes.
  function answerAsideQuestion(text) {
    var match = matchFaq(text);
    if (match) {
      if (state.answeredFaqIds[match.id]) {
        addBotMessage('Isso eu já te expliquei aqui em cima — se quiser posso detalhar melhor depois.');
      } else {
        state.answeredFaqIds[match.id] = true;
        addBotMessage(match.resposta);
      }
    } else {
      addBotMessage('Já anoto isso e te retorno em seguida.');
    }
  }

  function startLeadCapture() {
    if (state.name && state.contact) return;
    state.stage = 'ask_name';
    state.lastBotIntent = 'ask_name';
    addBotMessage('Antes de continuar, me diz seu nome? Assim já deixo registrado pro André entrar em contato se precisar.');
  }

  function handleAskName(text) {
    if (looksLikeQuestion(text)) {
      state.nameAttempts++;
      answerAsideQuestion(text);
      if (state.nameAttempts <= 2) {
        addBotMessage('Sem problemas! E me diz, qual seu nome?');
      } else {
        state.stage = 'ask_contact';
        state.nameAttempts = 0;
        state.lastBotIntent = 'ask_contact';
        addBotMessage('Tudo bem, sem pressa com isso. Me passa então um WhatsApp ou e-mail pra o André te chamar se precisar?');
      }
      return;
    }
    state.name = text;
    state.stage = 'ask_contact';
    state.nameAttempts = 0;
    state.lastBotIntent = 'ask_contact';
    addBotMessage('Prazer, ' + firstName(text) + '! Me passa um WhatsApp ou e-mail pra o André te chamar se precisar.');
  }

  function handleAskContact(text) {
    if (looksLikeQuestion(text) && !looksLikeContact(text)) {
      state.contactAttempts++;
      answerAsideQuestion(text);
      if (state.contactAttempts <= 2) {
        addBotMessage('Consegue me passar um WhatsApp ou e-mail? Assim garanto que o André te retorna.');
      } else {
        finalizeLead(text);
      }
      return;
    }
    finalizeLead(text);
  }

  function finalizeLead(contactText) {
    state.contact = looksLikeContact(contactText) ? contactText : (contactText || '(não informado)');
    state.stage = 'chat';
    state.contactAttempts = 0;
    sendLeadSilently();
    var name = state.name ? firstName(state.name) + ', ' : '';
    addBotMessage('Show, ' + name + 'já registrei aqui! O André entra em contato. Posso ajudar em mais alguma coisa? 🙂');
  }

  function handleChatTurn(text) {
    if (wantsHuman(text)) {
      state.missCount = 0;
      addBotMessage('Claro! Posso te colocar em contato direto com o André.');
      startLeadCapture();
      return;
    }

    var match = matchFaq(text);
    if (match) {
      state.missCount = 0;
      if (state.answeredFaqIds[match.id]) {
        addBotMessage('Já falei sobre isso agora há pouco — quer que eu detalhe algum ponto específico ou tem outra dúvida?');
      } else {
        state.answeredFaqIds[match.id] = true;
        addBotMessage(match.resposta);
      }
      state.lastBotIntent = 'faq:' + match.id;

      if (!state.firstAnswerGiven && !state.name) {
        state.firstAnswerGiven = true;
        startLeadCapture();
      }
      return;
    }

    state.missCount++;
    if (state.missCount >= 2) {
      addBotMessage(state.kb.fallback);
      startLeadCapture();
    } else {
      addBotMessage('Hmm, não tenho certeza sobre isso. Pode reformular ou me contar um pouco mais do que você precisa?');
    }
  }

  function onSubmit(ev) {
    ev.preventDefault();
    var input = document.getElementById('wk-chat-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage(text, 'user');

    if (state.stage === 'ask_name') {
      handleAskName(text);
      return;
    }
    if (state.stage === 'ask_contact') {
      handleAskContact(text);
      return;
    }

    handleChatTurn(text);
  }

  function sendLeadSilently() {
    try {
      var payload = {
        name: state.name || '',
        contact_raw: state.contact || '',
        conversation: state.messages,
        page: location.href,
        sentAt: new Date().toISOString()
      };
      fetch(BASE + '../send-chat-lead.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (!data || !data.ok) {
          console.error('WebKeeper chatbot: o servidor não confirmou o envio do lead.');
        }
      }).catch(function (e) {
        console.error('WebKeeper chatbot: falha ao enviar lead.', e);
      });
    } catch (e) {}
  }

  function init() {
    buildUI();
    fetch(BASE + 'knowledge-base.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { state.kb = data; })
      .catch(function () {
        state.kb = { saudacao: 'Olá! Como posso ajudar?', fallback: 'Já anotei sua pergunta. Pode me passar um contato?', faq: [] };
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
