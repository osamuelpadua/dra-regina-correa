/* Avaliação Inicial de Funcionalidade — Atrium Rehab
   Questionário 100% client-side. Nenhuma resposta sai do dispositivo até a
   pessoa tocar em "Enviar no WhatsApp": aí montamos uma URL wa.me com o
   resumo em ?text=. Não há backend, storage nem rastreamento. */
(function () {
  'use strict';

  var WHATSAPP = '5591993804185';

  /* Enunciados com {chave} são resolvidos em runtime conforme a P1:
     "Para mim" → 2ª pessoa; "Para um familiar" → 3ª pessoa.
     Cada chave guarda a frase inteira porque em português o possessivo
     de 3ª pessoa é posposto ("a idade dele(a)", não "a dele(a) idade"). */
  var QUESTIONS = [
    {
      id: 'para_quem',
      label: 'Para quem',
      text: 'Para quem é esta avaliação?',
      type: 'single',
      options: ['Para mim', 'Para um familiar']
    },
    {
      id: 'idade',
      label: 'Idade',
      text: 'Qual {a_idade}?',
      type: 'single',
      options: ['Menos de 60 anos', '60–69 anos', '70–79 anos', '80 anos ou mais']
    },
    {
      id: 'mudancas',
      label: 'Mudanças percebidas',
      text: 'Nos últimos meses, {voce} percebeu alguma destas mudanças?',
      hint: 'Pode marcar mais de uma.',
      type: 'multi',
      hasOther: 'Outras',
      options: [
        'Cansaço ao caminhar pequenas distâncias',
        'Dificuldade para levantar da cadeira',
        'Menor disposição física',
        'Perda de força',
        'Outras'
      ]
    },
    {
      id: 'queda',
      label: 'Queda no último ano',
      text: 'Houve alguma queda no último ano?',
      type: 'single',
      options: ['Sim', 'Não']
    },
    {
      id: 'dificuldade',
      label: 'Dificuldade nas atividades',
      text: 'Atualmente existe dificuldade para realizar alguma atividade do dia a dia?',
      type: 'single',
      options: ['Não', 'Sim, pequena dificuldade', 'Sim, bastante dificuldade']
    },
    {
      id: 'diagnosticos',
      label: 'Diagnósticos',
      text: 'Existe algum destes diagnósticos?',
      hint: 'Pode marcar mais de uma.',
      type: 'multi',
      exclusive: 'Nenhum',
      options: ['AVC', 'Parkinson', 'Doença cardíaca', 'Doença pulmonar', 'Artrose', 'Osteoporose', 'Alzheimer', 'Nenhum']
    },
    {
      id: 'acredita',
      label: 'Acredita que ajudaria',
      text: '{Voce} acredita que uma avaliação fisioterapêutica poderia ajudar a preservar a autonomia?',
      type: 'single',
      options: ['Sim', 'Não sei', 'Talvez']
    },
    {
      id: 'orientacao',
      label: 'Quer orientação inicial',
      text: 'Gostaria de receber gratuitamente uma orientação inicial da equipe Atrium Rehab?',
      type: 'single',
      options: ['Sim', 'Não']
    },
    {
      id: 'nome',
      label: 'Nome',
      text: 'Por fim, como podemos {te} chamar?',
      type: 'text'
    }
  ];

  var state = { step: 0, answers: {}, other: '' };

  var stage = document.getElementById('quiz-stage');
  var btnBack = document.getElementById('btn-back');
  var progressWrap = document.getElementById('progress-wrap');
  var progressFill = document.getElementById('progress-fill');
  var progressLabel = document.getElementById('progress-label');

  /* ---------- helpers ---------- */

  function isSelf() {
    return state.answers.para_quem === 'Para mim';
  }

  // Resolve os pronomes do enunciado conforme a P1.
  function phrase(text) {
    var self = isSelf();
    return text
      .replace(/\{a_idade\}/g, self ? 'a sua idade' : 'a idade dele(a)')
      .replace(/\{voce\}/g, self ? 'você' : 'ele(a)')
      .replace(/\{Voce\}/g, self ? 'Você' : 'Ele(a)')
      .replace(/\{te\}/g, 'te');
  }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function isAnswered(q) {
    var a = state.answers[q.id];
    if (q.type === 'multi') return Array.isArray(a) && a.length > 0;
    if (q.type === 'text') return typeof a === 'string' && a.trim() !== '';
    return a != null;
  }

  /* ---------- progresso ---------- */

  function updateProgress() {
    var total = QUESTIONS.length;
    var onSummary = state.step >= total;
    progressWrap.hidden = false;

    var current = onSummary ? total : state.step + 1;
    progressFill.style.width = (current / total * 100) + '%';
    progressLabel.textContent = onSummary
      ? 'Tudo pronto'
      : 'Pergunta ' + current + ' de ' + total;

    btnBack.hidden = state.step === 0;
  }

  /* ---------- render ---------- */

  function render() {
    stage.innerHTML = '';
    updateProgress();

    var screen = state.step >= QUESTIONS.length
      ? renderSummary()
      : renderQuestion(QUESTIONS[state.step]);

    screen.classList.add('av-screen');
    stage.appendChild(screen);

    // Foco no enunciado: leitores de tela anunciam a nova pergunta.
    var heading = screen.querySelector('h1, h2');
    if (heading) heading.focus();
  }

  function renderQuestion(q) {
    var wrap = el('div');

    var h = el('h1', 'av-question', phrase(q.text));
    h.id = 'q-' + q.id;
    h.tabIndex = -1;
    wrap.appendChild(h);

    if (q.hint) wrap.appendChild(el('p', 'av-hint', q.hint));

    if (q.type === 'text') {
      wrap.appendChild(renderTextInput(q));
    } else {
      wrap.appendChild(renderOptions(q));
    }

    return wrap;
  }

  function renderOptions(q) {
    var group = el('div', 'av-options');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', 'q-' + q.id);

    var selected = state.answers[q.id];

    q.options.forEach(function (opt) {
      var isOn = q.type === 'multi'
        ? Array.isArray(selected) && selected.indexOf(opt) !== -1
        : selected === opt;

      var b = el('button', 'av-option' + (isOn ? ' is-on' : ''));
      b.type = 'button';
      b.appendChild(el('span', 'av-option-text', opt));

      if (q.type === 'multi') {
        b.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        b.insertBefore(el('span', 'av-check'), b.firstChild);
      }

      b.addEventListener('click', function () {
        q.type === 'multi' ? toggleMulti(q, opt) : pickSingle(q, opt);
      });

      group.appendChild(b);
    });

    if (q.type === 'multi') {
      // "Outras" marcada → campo livre para o detalhe.
      if (q.hasOther && Array.isArray(selected) && selected.indexOf(q.hasOther) !== -1) {
        var otherWrap = el('div', 'av-other');
        var lbl = el('label', 'av-label', 'O que mais foi percebido?');
        lbl.setAttribute('for', 'other-input');
        var inp = el('input', 'av-input');
        inp.id = 'other-input';
        inp.type = 'text';
        inp.value = state.other;
        inp.maxLength = 90;
        inp.addEventListener('input', function () { state.other = inp.value; });
        otherWrap.appendChild(lbl);
        otherWrap.appendChild(inp);
        group.appendChild(otherWrap);
      }

      var next = el('button', 'av-btn av-btn--primary', 'Continuar');
      next.type = 'button';
      next.disabled = !isAnswered(q);
      next.addEventListener('click', function () { go(state.step + 1); });
      group.appendChild(next);
    }

    return group;
  }

  function renderTextInput(q) {
    var wrap = el('div', 'av-field');

    var lbl = el('label', 'av-label', 'Seu nome');
    lbl.setAttribute('for', 'name-input');

    var inp = el('input', 'av-input');
    inp.id = 'name-input';
    inp.type = 'text';
    inp.autocomplete = 'name';
    inp.maxLength = 60;
    inp.value = state.answers[q.id] || '';

    var btn = el('button', 'av-btn av-btn--primary', 'Ver minhas respostas');
    btn.type = 'button';
    btn.disabled = inp.value.trim() === '';

    inp.addEventListener('input', function () {
      state.answers[q.id] = inp.value;
      btn.disabled = inp.value.trim() === '';
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && inp.value.trim() !== '') go(state.step + 1);
    });
    btn.addEventListener('click', function () { go(state.step + 1); });

    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    wrap.appendChild(el('p', 'av-note', 'Ao abrir o WhatsApp, é só tocar em enviar para que a equipe receba suas respostas.'));
    wrap.appendChild(btn);
    return wrap;
  }

  function renderSummary() {
    var wrap = el('div');

    var h = el('h1', 'av-question', 'Confira suas respostas');
    h.tabIndex = -1;
    wrap.appendChild(h);

    var list = el('dl', 'av-summary');
    QUESTIONS.forEach(function (q) {
      var val = formatAnswer(q);
      if (!val) return;
      list.appendChild(el('dt', 'av-summary-key', q.label));
      list.appendChild(el('dd', 'av-summary-val', val));
    });
    wrap.appendChild(list);

    wrap.appendChild(el('p', 'av-lead',
      'Estas informações ajudam a equipe a entender o caso antes da primeira conversa. ' +
      'Toque no botão abaixo para enviá-las pelo WhatsApp.'));

    var send = el('a', 'av-btn av-btn--primary av-btn--send');
    send.href = waUrl();
    send.target = '_blank';
    send.rel = 'noopener';
    send.id = 'btn-send';
    send.appendChild(waIcon());
    send.appendChild(el('span', null, 'Enviar no WhatsApp'));
    wrap.appendChild(send);

    wrap.appendChild(el('p', 'av-note',
      'Importante: ao abrir o WhatsApp, toque em enviar para que a equipe receba suas respostas.'));

    var restart = el('button', 'av-btn av-btn--ghost', 'Recomeçar');
    restart.type = 'button';
    restart.addEventListener('click', function () {
      state = { step: 0, answers: {}, other: '' };
      render();
    });
    wrap.appendChild(restart);

    wrap.appendChild(el('p', 'av-disclaimer',
      'Este questionário não é um diagnóstico. Serve para orientar a conversa com a equipe.'));

    return wrap;
  }

  function waIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('fill', 'currentColor');
    p.setAttribute('d', 'M19.11 17.36c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7.87-.86 1.05-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.65 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.52-.08 1.59-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.03 4.8A11.08 11.08 0 0 0 6.5 21.52L5 27l5.61-1.47A11.05 11.05 0 1 0 16.03 4.8zm0 20.15c-1.73 0-3.42-.47-4.89-1.36l-.35-.21-3.33.87.89-3.24-.23-.36a9.07 9.07 0 1 1 7.91 4.3z');
    svg.appendChild(p);
    return svg;
  }

  /* ---------- respostas ---------- */

  function pickSingle(q, opt) {
    state.answers[q.id] = opt;
    // Escolha única não precisa de confirmação: avança sozinha.
    setTimeout(function () { go(state.step + 1); }, 140);
    render();
  }

  function toggleMulti(q, opt) {
    var cur = Array.isArray(state.answers[q.id]) ? state.answers[q.id].slice() : [];
    var at = cur.indexOf(opt);

    if (at !== -1) {
      cur.splice(at, 1);
    } else if (q.exclusive && opt === q.exclusive) {
      cur = [opt];                                   // "Nenhum" zera o resto
    } else {
      cur.push(opt);
      if (q.exclusive) {
        var ex = cur.indexOf(q.exclusive);           // qualquer outra tira "Nenhum"
        if (ex !== -1) cur.splice(ex, 1);
      }
    }

    if (q.hasOther && cur.indexOf(q.hasOther) === -1) state.other = '';
    state.answers[q.id] = cur;
    render();
  }

  function go(step) {
    state.step = Math.max(0, Math.min(step, QUESTIONS.length));
    render();
    window.scrollTo(0, 0);
  }

  btnBack.addEventListener('click', function () { go(state.step - 1); });

  /* ---------- mensagem ---------- */

  function formatAnswer(q) {
    var a = state.answers[q.id];
    if (a == null) return '';

    if (q.type === 'multi') {
      if (!Array.isArray(a) || !a.length) return '';
      return a.map(function (opt) {
        // Anexa o texto livre ao item "Outras".
        if (q.hasOther && opt === q.hasOther && state.other.trim()) {
          return opt + ' (' + state.other.trim() + ')';
        }
        return opt;
      }).join(', ');
    }

    return typeof a === 'string' ? a.trim() : String(a);
  }

  function buildMessage() {
    var lines = ['Olá! Fiz a Avaliação Inicial de Funcionalidade no site.', ''];

    QUESTIONS.forEach(function (q) {
      if (q.id === 'nome') return;
      var v = formatAnswer(q);
      if (v) lines.push('*' + q.label + ':* ' + v);
    });

    var nome = formatAnswer(QUESTIONS[QUESTIONS.length - 1]);
    if (nome) lines.push('', '*Nome:* ' + nome);

    return lines.join('\n');
  }

  function waUrl() {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(buildMessage());
  }

  render();
})();
