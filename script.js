// ── DADO MAP ────────────────────────────────────────────
const dadoMap = [
  [5,        'd4'],
  [10,       'd6'],
  [15,       'd8'],
  [20,       'd10'],
  [25,       'd12'],
  [Infinity, 'd20'],
];

// Retorna o índice do dado (0=d4, 1=d6, ... 5=d20)
function calcDadoIndex(v) {
  for (let i = 0; i < dadoMap.length; i++) {
    if (v < dadoMap[i][0]) return i;
  }
  return dadoMap.length - 1;
}

function calcDado(v) {
  return dadoMap[calcDadoIndex(v)][1];
}

// ── SLOTS DE PERÍCIA ─────────────────────────────────────
const MAX_PERICIAS = 5;
let slotsDisponiveis = 0;

const dadoAnterior = {};

const attrPairs = [
  ['strScore',          'strDado'],
  ['aglScore',          'aglDado'],
  ['conScore',          'conDado'],
  ['persuasionScore',   'persuasionDado'],
  ['sanityScore',       'sanityDado'],
  ['vigiliaScore',      'vigiliaDado'],
  ['engineeringScore',  'engineeringDado'],
  ['intelligenceScore', 'intelligenceDado'],
  ['faithScore',        'faithDado'],
];

attrPairs.forEach(([inputId, badgeId]) => {
  dadoAnterior[inputId] = 0;

  const inp   = document.getElementById(inputId);
  const badge = document.getElementById(badgeId);

  if (!inp || !badge) return;

  inp.addEventListener('input', () => {
    const novoIdx   = calcDadoIndex(Number(inp.value));
    const antigoIdx = dadoAnterior[inputId];
    const delta     = novoIdx - antigoIdx;

    if (delta !== 0) {
      dadoAnterior[inputId] = novoIdx;
      ajustarSlots(delta);
    }

    badge.textContent = dadoMap[novoIdx][1];
    atualizarPontos();
  });
});

function ajustarSlots(delta) {
  slotsDisponiveis = Math.max(0, Math.min(MAX_PERICIAS, slotsDisponiveis + delta));

  while (selected.size > slotsDisponiveis) {
    const ultima = [...selected].pop();
    removerPericia(ultima);
  }

  atualizarSlotUI();
}

function atualizarSlotUI() {
  const el = document.getElementById('slotInfo');
  if (!el) return;
  const usados = selected.size;
  el.textContent = `Slots: ${usados} / ${slotsDisponiveis}`;
  el.style.color = usados >= slotsDisponiveis && slotsDisponiveis > 0
    ? 'var(--accent2)'
    : 'var(--muted)';
}

// ── NÍVEL ───────────────────────────────────────────────
function updateLevel(v) {
  const n = Math.max(1, Math.min(20, Number(v) || 1));
  document.getElementById('playerLevel').value        = n;
  document.getElementById('levelDisplay').textContent = n;
  document.getElementById('xpBar').style.width        = (n / 20 * 100) + '%';
  atualizarPontos();
}

function changeLevel(d) {
  const cur = Number(document.getElementById('playerLevel').value) || 1;
  updateLevel(cur + d);
}

document.getElementById('playerLevel').addEventListener('input', e => updateLevel(e.target.value));

// ── PERÍCIAS ────────────────────────────────────────────
const PERICIAS = [
  'Atletismo', 'Combate corpo-a-corpo', 'Combate à distancia', 'Precisão',
  'Liturgia', 'Pressagio', 'Intimidação', 'Resiliência', 'Diplomacia',
  'Disfarse', 'Ocultismo', 'Caçada', 'Lucidez', 'Convicção', 'Comunhão',
  'Raizeiro', 'Tambor Ancestral', 'Folclore', 'Ímpeto', 'Rastreamento',
  'Tecnologia', 'Ignorancia', 'Persuasão', 'Audição', 'Ritos', 'Herbologia',
  'Navegação', 'Alquimia', 'Anatomia', 'Profanação', 'Purificação', 'Doutrinas',
];

const selected = new Set();
const menu     = document.getElementById('periciaMenu');

PERICIAS.forEach(p => {
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.className   = 'dropdown-item';
  a.textContent = p;
  a.href        = '#';
  a.addEventListener('click', e => {
    e.preventDefault();
    togglePericia(p, a);
  });
  li.appendChild(a);
  menu.appendChild(li);
});

function togglePericia(nome, el) {
  if (selected.has(nome)) {
    removerPericia(nome);
  } else {
    if (selected.size >= slotsDisponiveis) {
      mostrarAviso(
        slotsDisponiveis === 0
          ? 'Melhore um atributo para ganhar slots de perícia!'
          : `Limite de ${slotsDisponiveis} perícia${slotsDisponiveis > 1 ? 's' : ''} atingido!`
      );
      return;
    }
    selected.add(nome);
    el.classList.add('selected');
  }
  renderPericiasTags();
  atualizarSlotUI();
  atualizarBotaoDropdown();
}

function removerPericia(nome) {
  selected.delete(nome);
  menu.querySelectorAll('.dropdown-item').forEach(a => {
    if (a.textContent === nome) a.classList.remove('selected');
  });
}

function renderPericiasTags() {
  const cont = document.getElementById('pericias');
  cont.innerHTML = '';
  selected.forEach(nome => {
    const tag       = document.createElement('span');
    tag.className   = 'pericia-tag';
    tag.textContent = nome + ' ✕';
    tag.title       = 'Remover ' + nome;
    tag.onclick     = () => {
      removerPericia(nome);
      renderPericiasTags();
      atualizarSlotUI();
      atualizarBotaoDropdown();
    };
    cont.appendChild(tag);
  });
}

function atualizarBotaoDropdown() {
  const count = selected.size;
  document.getElementById('periciaBtn').childNodes[0].textContent =
    count
      ? `${count} / ${slotsDisponiveis} perícia${count > 1 ? 's' : ''} `
      : 'Selecionar perícia… ';
}

document.getElementById('periciaDropdown').addEventListener('hide.bs.dropdown', atualizarBotaoDropdown);

// ── AVISO TEMPORÁRIO ────────────────────────────────────
function mostrarAviso(msg) {
  let aviso = document.getElementById('periciaAviso');
  if (!aviso) {
    aviso = document.createElement('p');
    aviso.id = 'periciaAviso';
    aviso.style.cssText = 'font-size:.75rem;color:var(--accent2);margin:.5rem 0 0;transition:opacity .4s;';
    document.getElementById('pericias').insertAdjacentElement('beforebegin', aviso);
  }
  aviso.textContent = msg;
  aviso.style.opacity = '1';
  clearTimeout(aviso._timer);
  aviso._timer = setTimeout(() => aviso.style.opacity = '0', 2500);
}

// ── LISTAS (inventário / encantamento / equipamento) ────
function addItem(tipo) {
  const inp  = document.getElementById(tipo + 'Input');
  const list = document.getElementById(tipo + 'List');
  const val  = inp.value.trim();
  if (!val) return;
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:.2rem 0;border-bottom:1px solid #1f1414;';
  row.innerHTML = `<span>${val}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem;">✕</button>`;
  list.appendChild(row);
  inp.value = '';
  inp.focus();
}

['inventario', 'encantamento', 'equipamento'].forEach(t => {
  document.getElementById(t + 'Input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem(t);
  });
});

// ── INIT ────────────────────────────────────────────────
atualizarSlotUI();

// ── CLASSES ─────────────────────────────────────────────
const CLASSES = {
  'Clérigo': {
    hp: 20, st: 20, mp: 45,
    hpPorNivel: 3, stPorNivel: 2, mpPorNivel: 5,
    habilidades: [
      'Encantamentos simples: +1d4 nos próximos 3 testes do alvo',
      '+1d6 em testes de cura ou suporte',
      'Item querido: purifica armas',
      '+4 de mente; +2 dados para purificar efeitos negativos',
      'Começa com 2 encantamentos iniciais',
    ],
  },
  'Caçador': {
    hp: 35, st: 25, mp: 20,
    hpPorNivel: 4, stPorNivel: 3, mpPorNivel: 2,
    habilidades: [
      '+1d4 de dano com armas de longo alcance',
      'Sacrifica 1 de mente para rolagem adicional de mira',
      'Inicia com -5 de vida',
      'Vantagem em testes de destreza; +1d4 em testes de estamina',
      'Item querido: +4 dano longo alcance / -2 dano curto alcance',
      'Começa com 1 encantamento inicial',
    ],
  },
  'Guerreiro': {
    hp: 50, st: 20, mp: 10,
    hpPorNivel: 6, stPorNivel: 2, mpPorNivel: 1,
    habilidades: [
      '+1d4/2 de bônus corpo a corpo (4 no dado = dano inteiro)',
      'Começa com +5 de vida',
      'Vantagem em testes de força e constituição',
      'Pode carregar até 10 itens (acima = carga pesada)',
      'Item querido: +5 vida base; +4 dano colossal; -1d4 furtividade/estamina',
    ],
  },
  'Andarilho': {
    hp: 35, st: 35, mp: 10,
    hpPorNivel: 4, stPorNivel: 4, mpPorNivel: 1,
    habilidades: [
      '+1d4 com armas leves',
      '+1 vantagem em testes de furtividade',
      'Começa com +10 de estamina inicial',
      'Item querido: +1d8 dano curto/médio alcance (sem colossal)',
      'Arma colossal = carga pesada + desvantagem em estamina',
      'Começa com 1 familiar inicial',
    ],
  },
  'Xamã': {
    hp: 35, st: 20, mp: 25,
    hpPorNivel: 4, stPorNivel: 2, mpPorNivel: 3,
    habilidades: [
      '+1d4 em encantamentos',
      'Pode incorporar poderes de Deuses e entidades',
      'Pacto exige sacrifício familiar como preço',
      'Item querido: +1d8 dano; locomoção silenciosa na mata',
      'Começa com 1 encantamento inicial (pode já fazer sacrifício)',
    ],
  },
};

let classeAtual = null;

(function initClasseMenu() {
  const menu = document.getElementById('classeMenu');
  Object.keys(CLASSES).forEach(nome => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.className   = 'dropdown-item';
    a.href        = '#';
    a.textContent = nome;
    a.addEventListener('click', e => {
      e.preventDefault();
      selecionarClasse(nome);
      bootstrap.Dropdown.getInstance(document.getElementById('classeBtn'))?.hide();
    });
    li.appendChild(a);
    menu.appendChild(li);
  });
})();

function selecionarClasse(nome) {
  classeAtual = nome;
  const c   = CLASSES[nome];
  const lvl = Number(document.getElementById('playerLevel').value) || 1;

  const hp = c.hp + (lvl - 1) * c.hpPorNivel + (nome === 'Caçador' ? -5 : 0) + (nome === 'Guerreiro' ? 5 : 0);
  const st = c.st + (lvl - 1) * c.stPorNivel  + (nome === 'Andarilho' ? 10 : 0);
  const mp = c.mp + (lvl - 1) * c.mpPorNivel;

  document.getElementById('hp').value = hp;
  document.getElementById('sp').value = st;
  document.getElementById('mp').value = mp;

  document.getElementById('hpBase').textContent = `base ${c.hp} +${c.hpPorNivel}/nível`;
  document.getElementById('spBase').textContent = `base ${c.st} +${c.stPorNivel}/nível`;
  document.getElementById('mpBase').textContent = `base ${c.mp} +${c.mpPorNivel}/nível`;

  document.getElementById('classeNome').textContent = nome;
  document.getElementById('classeBtn').childNodes[0].textContent = nome + ' ';

  document.querySelectorAll('#classeMenu .dropdown-item').forEach(a => {
    a.classList.toggle('selected', a.textContent === nome);
  });

  const infoEl = document.getElementById('classeInfo');
  infoEl.innerHTML = c.habilidades.map(h => `<div style="margin-bottom:.3rem;">${h}</div>`).join('');
  document.getElementById('classeInfoBtn').style.display = 'block';

  const itemDesc = c.habilidades.find(h => h.includes('Item querido') || h.includes('item querido'));
  const descEl = document.getElementById('itemQueridoDesc');
  if (descEl) descEl.textContent = itemDesc ? itemDesc : '';

  // ── CORREÇÃO: atualiza turnos e peso imediatamente ao selecionar classe
  atualizarTurnos();
  atualizarPeso();
}

function toggleClasseInfo() {
  const el  = document.getElementById('classeInfo');
  const btn = document.getElementById('classeInfoBtn');
  const vis = el.style.display === 'block';
  el.style.display = vis ? 'none' : 'block';
  btn.textContent  = vis ? 'ver habilidades ▾' : 'ocultar habilidades ▴';
}

document.getElementById('playerLevel').addEventListener('change', () => {
  if (classeAtual) selecionarClasse(classeAtual);
});

// ── SALVAR / CARREGAR / RESETAR ─────────────────────────

function coletarFicha() {
  const atributos = {};
  attrPairs.forEach(([id]) => {
    const el = document.getElementById(id);
    if (el) atributos[id] = el.value;
  });

  function coletarLista(tipo) {
    const rows = document.querySelectorAll(`#${tipo}List span`);
    return [...rows].map(s => s.textContent);
  }

  return {
    versao:      '1.0',
    nome:        document.getElementById('nomeJogador').value,
    itemQuerido: document.getElementById('itemQuerido').value,
    hp:          document.getElementById('hp').value,
    sp:          document.getElementById('sp').value,
    mp:          document.getElementById('mp').value,
    nivel:       document.getElementById('playerLevel').value,
    classe:      classeAtual,
    atributos,
    pericias:     [...selected],
    historia:     document.getElementById('history').value,
    inventario:   coletarLista('inventario'),
    encantamento: coletarLista('encantamento'),
    equipamento:  coletarLista('equipamento'),
    dadoAnteriorSnapshot: { ...dadoAnterior },
    slotsDisponiveis,
    pesoAtual:   document.getElementById('pesoAtual').value,
    trauma:      document.getElementById('trauma').value,
    motivacao:   document.getElementById('motivacao').value,
  };
}

function aplicarFicha(dados) {
  document.getElementById('nomeJogador').value = dados.nome        || '';
  document.getElementById('itemQuerido').value = dados.itemQuerido || '';
  document.getElementById('hp').value          = dados.hp          || '';
  document.getElementById('sp').value          = dados.sp          || '';
  document.getElementById('mp').value          = dados.mp          || '';
  document.getElementById('pesoAtual').value   = dados.pesoAtual   || '';
  document.getElementById('trauma').value      = dados.trauma      || '';
  document.getElementById('motivacao').value   = dados.motivacao   || '';

  updateLevel(dados.nivel || 1);

  if (dados.atributos) {
    attrPairs.forEach(([inputId, badgeId]) => {
      const el = document.getElementById(inputId);
      const bd = document.getElementById(badgeId);
      if (!el || !bd) return;
      el.value = dados.atributos[inputId] || '';
      bd.textContent = calcDado(Number(el.value));
    });
  }

  if (dados.dadoAnteriorSnapshot) Object.assign(dadoAnterior, dados.dadoAnteriorSnapshot);
  slotsDisponiveis = dados.slotsDisponiveis || 0;

  selected.clear();
  document.querySelectorAll('#periciaMenu .dropdown-item').forEach(a => a.classList.remove('selected'));
  (dados.pericias || []).forEach(nome => {
    selected.add(nome);
    document.querySelectorAll('#periciaMenu .dropdown-item').forEach(a => {
      if (a.textContent === nome) a.classList.add('selected');
    });
  });
  renderPericiasTags();
  atualizarSlotUI();
  atualizarBotaoDropdown();

  if (dados.classe) {
    classeAtual = dados.classe;
    const c = CLASSES[dados.classe];
    document.getElementById('classeNome').textContent = dados.classe;
    document.getElementById('classeBtn').childNodes[0].textContent = dados.classe + ' ';
    document.querySelectorAll('#classeMenu .dropdown-item').forEach(a => {
      a.classList.toggle('selected', a.textContent === dados.classe);
    });
    if (c) {
      document.getElementById('hpBase').textContent = `base ${c.hp} +${c.hpPorNivel}/nível`;
      document.getElementById('spBase').textContent = `base ${c.st} +${c.stPorNivel}/nível`;
      document.getElementById('mpBase').textContent = `base ${c.mp} +${c.mpPorNivel}/nível`;
      document.getElementById('classeInfo').innerHTML =
        c.habilidades.map(h => `<div style="margin-bottom:.3rem;">${h}</div>`).join('');
      document.getElementById('classeInfoBtn').style.display = 'block';
    }
  }

  document.getElementById('history').value = dados.historia || '';

  function restaurarLista(tipo, itens) {
    const list = document.getElementById(tipo + 'List');
    list.innerHTML = '';
    (itens || []).forEach(val => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:.2rem 0;border-bottom:1px solid #1f1414;';
      row.innerHTML = `<span>${val}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem;">✕</button>`;
      list.appendChild(row);
    });
  }
  restaurarLista('inventario',   dados.inventario);
  restaurarLista('encantamento', dados.encantamento);
  restaurarLista('equipamento',  dados.equipamento);

  atualizarPeso();
  atualizarTurnos();
}

function salvarFicha() {
  const dados = coletarFicha();
  const blob  = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `ficha_${(classeAtual || 'personagem').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast('✔ Ficha salva com sucesso!');
}

function carregarFicha() {
  const input  = document.createElement('input');
  input.type   = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        aplicarFicha(JSON.parse(e.target.result));
        mostrarToast('✔ Ficha carregada!');
      } catch {
        mostrarToast('✖ Arquivo inválido.', true);
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function confirmarReset() {
  document.getElementById('resetModal').style.display = 'flex';
}

function fecharModal(e) {
  if (e.target.id === 'resetModal')
    document.getElementById('resetModal').style.display = 'none';
}

function resetarFicha() {
  document.getElementById('resetModal').style.display = 'none';

  ['nomeJogador','itemQuerido','hp','sp','mp','history','pesoAtual','trauma','motivacao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const descEl = document.getElementById('itemQueridoDesc');
  if (descEl) descEl.textContent = '';

  updateLevel(1);

  attrPairs.forEach(([inputId, badgeId]) => {
    const el = document.getElementById(inputId);
    const bd = document.getElementById(badgeId);
    if (el) el.value = '';
    if (bd) bd.textContent = 'd4';
    dadoAnterior[inputId] = 0;
  });

  slotsDisponiveis = 0;
  selected.clear();
  document.querySelectorAll('#periciaMenu .dropdown-item').forEach(a => a.classList.remove('selected'));
  renderPericiasTags();
  atualizarSlotUI();
  atualizarBotaoDropdown();

  classeAtual = null;
  document.getElementById('classeNome').textContent = '';
  document.getElementById('classeBtn').childNodes[0].textContent = 'Escolher classe… ';
  document.getElementById('classeInfo').style.display = 'none';
  document.getElementById('classeInfoBtn').style.display = 'none';
  document.querySelectorAll('#classeMenu .dropdown-item').forEach(a => a.classList.remove('selected'));
  ['hpBase','spBase','mpBase'].forEach(id => document.getElementById(id).textContent = '');
  ['inventarioList','encantamentoList','equipamentoList'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });

  atualizarPeso();
  atualizarTurnos();
  mostrarToast('↺ Ficha resetada.');
}

function mostrarToast(msg, erro = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = erro ? 'var(--accent)' : 'var(--border)';
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── PESO ─────────────────────────────────────────────────
const PESO_MAX_GUERREIRO = 10;
const PESO_MAX_PADRAO    = 7;

function pesoMaxAtual() {
  return classeAtual === 'Guerreiro' ? PESO_MAX_GUERREIRO : PESO_MAX_PADRAO;
}

function atualizarPeso() {
  const max   = pesoMaxAtual();
  const atual = Number(document.getElementById('pesoAtual').value) || 0;
  const pct   = Math.min(100, (atual / max) * 100);
  const aviso = document.getElementById('pesoAviso');
  const bar   = document.getElementById('pesoBar');

  document.getElementById('pesoMax').textContent = max;
  bar.style.width = pct + '%';

  if (atual > max) {
    aviso.textContent = '⚠ Carga pesada! Desvantagem em estamina.';
    aviso.style.color = 'var(--accent2)';
    bar.style.background = '#a82020';
  } else if (atual === max) {
    aviso.textContent = '⚠ Carga máxima atingida.';
    aviso.style.color = 'var(--accent2)';
    bar.style.background = '#a82020';
  } else if (pct >= 70) {
    aviso.textContent = 'Carga moderada.';
    aviso.style.color = '#c8a030';
    bar.style.background = 'linear-gradient(90deg,#2e7d32,#c8a030)';
  } else {
    aviso.textContent = '';
    bar.style.background = 'linear-gradient(90deg,#2e7d32,#a82020)';
  }
}

document.getElementById('pesoAtual').addEventListener('input', atualizarPeso);

// ── TURNOS ───────────────────────────────────────────────
function atualizarTurnos() {
  const st     = Number(document.getElementById('sp').value) || 0;
  const turnos = Math.min(4, Math.floor(st / 15));

  for (let i = 1; i <= 4; i++) {
    document.getElementById('turno' + i).classList.toggle('ativo', i <= turnos);
  }

  const info = document.getElementById('turnosInfo');
  if (turnos === 0) {
    info.textContent = '0 turnos — precisa de 15 de ST';
    info.style.color = 'var(--muted)';
  } else if (turnos === 4) {
    info.textContent = '4 turnos — máximo atingido!';
    info.style.color = 'var(--accent2)';
  } else {
    const falta = (turnos + 1) * 15 - st;
    info.textContent = `${turnos} turno${turnos > 1 ? 's' : ''} — faltam ${falta} ST para o próximo`;
    info.style.color = 'var(--muted)';
  }
}

document.getElementById('sp').addEventListener('input', atualizarTurnos);

// ── INIT FINAL ───────────────────────────────────────────
atualizarPeso();
atualizarTurnos();

// ── PONTOS DE ATRIBUTO ────────────────────────────────────
// Nível 1 = 60 pts, +10 por nível
function pontosTotal() {
  const lvl = Number(document.getElementById('playerLevel').value) || 1;
  return 60 + (lvl - 1) * 10;
}

function pontosGastos() {
  return attrPairs.reduce((soma, [inputId]) => {
    const el = document.getElementById(inputId);
    return soma + (el ? Number(el.value) || 0 : 0);
  }, 0);
}

function atualizarPontos() {
  const total     = pontosTotal();
  const gastos    = pontosGastos();
  const restantes = total - gastos;
  const pct       = Math.max(0, Math.min(100, (restantes / total) * 100));

  const elRestantes = document.getElementById('pontosRestantes');
  const elTotal     = document.getElementById('pontosTotal');
  const elBar       = document.getElementById('pontosBar');
  const elAviso     = document.getElementById('pontosAviso');
  if (!elRestantes) return;

  elTotal.textContent     = total;
  elRestantes.textContent = restantes;
  elBar.style.width       = pct + '%';

  // cor do número e da barra
  elRestantes.className = 'pontos-valor';
  if (restantes < 0) {
    elRestantes.classList.add('negativo');
    elBar.style.background = '#ff4444';
    elAviso.textContent    = `⚠ ${Math.abs(restantes)} pontos acima do limite!`;
    elAviso.style.color    = '#ff4444';
  } else if (restantes === 0) {
    elRestantes.classList.add('cheio');
    elBar.style.background = 'var(--accent2)';
    elAviso.textContent    = 'Todos os pontos distribuídos.';
    elAviso.style.color    = 'var(--muted)';
  } else if (pct <= 25) {
    elRestantes.classList.add('aviso');
    elBar.style.background = '#c8a030';
    elAviso.textContent    = '';
  } else {
    elRestantes.classList.add('ok');
    elBar.style.background = '#7ecfa0';
    elAviso.textContent    = '';
  }
}

// Chama no init para mostrar 60 pontos já no carregamento
atualizarPontos();