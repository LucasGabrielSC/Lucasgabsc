/* ========================================
   ENVIO DE PROPOSTAS — Main Script
   All processing runs in the browser.
   No localStorage/sessionStorage/cookies.
   ======================================== */

(function () {
  'use strict';

  // ===== Bank list for autocomplete =====
  const BANKS = [
    'Itaú', 'Itaú Unibanco', 'Bradesco', 'Banco do Brasil', 'Caixa Econômica Federal',
    'Santander', 'Nubank', 'Inter', 'Banco Inter', 'BTG Pactual', 'Safra',
    'Sicoob', 'Sicredi', 'Banrisul', 'BRB', 'BMG', 'Pan', 'Banco Pan',
    'C6 Bank', 'Original', 'Banco Original', 'Neon', 'Next', 'Agibank',
    'Daycoval', 'Votorantim', 'BV', 'Banco BV', 'Tribanco', 'Mercantil',
    'Banco Mercantil', 'Banestes', 'Banese', 'ABC Brasil', 'Sofisa',
    'Modal', 'Pine', 'Banco Pine', 'Industrial do Brasil', 'Rendimento',
    'Cetelem', 'Losango', 'Omni', 'Banco Omni', 'Paraná Banco',
    'Banco Fibra', 'Banco Alfa', 'Banco Master', 'Banco Digimais',
    'Banco Paulista', 'Rodobens', 'Banco Rodobens', 'Banco de Brasília',
    'Porto Seguro', 'Midway', 'Will Bank', 'PicPay', 'Pagbank', 'PagSeguro',
    'Banco Topázio', 'Banco Crefisa', 'Crefisa', 'XP', 'Rico', 'Oi Paggo',
    'Banco RCI', 'Volkswagen Financial Services', 'Toyota Bank', 'Honda Bank',
    'GM Financial', 'Mercedes-Benz Bank', 'Hyundai Capital', 'Banco BMW',
    'Banco Carrefour', 'Realize', 'Midway Financeira', 'Banco Olé',
    'Banco Cifra', 'Banco MUFG', 'Banco Sumitomo', 'Banco Mizuho',
    'JP Morgan', 'Citibank', 'Deutsche Bank', 'HSBC', 'BNP Paribas',
    'Banco Luso Brasileiro', 'Banco Bocom BBM'
  ];

  // ===== Application State =====
  let contracts = [];
  let contractCounter = 0;
  let messageMode = 'all'; // 'all' | 'reduction' | 'restitution'
  let messageVersion = 'v1'; // 'v1' | 'v2'

  // Operator state — session-only, never persisted
  let operatorName = '';
  let operatorConfirmed = false;

  // ===== DOM references =====
  const clientNameInput = document.getElementById('client-name');
  const clientCpfInput = document.getElementById('client-cpf');
  const clientPhoneInput = document.getElementById('client-phone');
  const phoneError = document.getElementById('phone-error');
  const contractsArea = document.getElementById('contracts-area');
  const btnAddContract = document.getElementById('btn-add-contract');
  const btnCopyProposal = document.getElementById('btn-copy-proposal');
  const btnOpenWhatsapp = document.getElementById('btn-open-whatsapp');
  const whatsappHint = document.getElementById('whatsapp-hint');
  const copyFeedback = document.getElementById('copy-feedback');
  const proposalPreview = document.getElementById('proposal-preview');
  const totalEconomiaMensal = document.getElementById('total-economia-mensal');
  const totalEconomiaProjetada = document.getElementById('total-economia-projetada');
  const totalRessarcimentos = document.getElementById('total-ressarcimentos');
  const indicatorsParcelasList = document.getElementById('indicators-parcelas-list');
  const messageModeRadios = document.querySelectorAll('input[name="message-mode"]');
  const messageVersionRadios = document.querySelectorAll('input[name="message-version"]');
  const toggleClientData = document.getElementById('toggle-client-data');
  const clientFields = document.getElementById('client-fields');
  const chevronClient = document.getElementById('chevron-client');
  const btnNovaSimHeader = document.getElementById('btn-nova-simulacao-header');
  const toggleContracts = document.getElementById('toggle-contracts');
  const contractsCollapsible = document.getElementById('contracts-collapsible');
  const chevronContracts = document.getElementById('chevron-contracts');
  const contractsCount = document.getElementById('contracts-count');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const themeLabel = document.getElementById('theme-label');

  // Operator DOM
  const toggleOperatorSettings = document.getElementById('toggle-operator-settings');
  const operatorCollapsible = document.getElementById('operator-collapsible');
  const chevronOperator = document.getElementById('chevron-operator');
  const operatorNameInput = document.getElementById('operator-name');
  const operatorNameError = document.getElementById('operator-name-error');
  const btnConfirmOperator = document.getElementById('btn-confirm-operator');
  const operatorConfirmArea = document.getElementById('operator-confirm-area');
  const operatorConfirmedMsg = document.getElementById('operator-confirmed-msg');
  const operatorStatusBadge = document.getElementById('operator-status-badge');

  // V1/V2 panel refs
  const indicatorsV1Panel     = document.getElementById('indicators-v1-panel');
  const indicatorsV2Panel     = document.getElementById('indicators-v2-panel');
  const messageModeSelectorEl = document.getElementById('message-mode-selector');
  const v2ParcelasList        = document.getElementById('v2-parcelas-list');
  const v2TotalRessarcimentos = document.getElementById('v2-total-ressarcimentos');

  // ===== CPF Formatter =====
  function formatCPF(raw) {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.slice(0, 3) + '.' + digits.slice(3);
    if (digits.length <= 9) return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
    return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
  }

  // ===== Monetary helpers (centavo-safe) =====
  function parseMoney(raw) {
    if (raw === undefined || raw === null) return NaN;
    let s = String(raw).trim();
    s = s.replace(/^R\$\s*/i, '').trim();
    if (s === '') return NaN;
    if (s.includes(',')) {
      s = s.replace(/\./g, '');
      s = s.replace(',', '.');
    }
    const n = parseFloat(s);
    if (isNaN(n) || n < 0) return NaN;
    return n;
  }

  function toCents(value) {
    return Math.round(value * 100);
  }

  function fromCents(cents) {
    return cents / 100;
  }

  function formatMoney(value) {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ===== Pagas/Total ratio parser =====
  function parsePagasTotal(raw) {
    if (!raw || String(raw).trim() === '') {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: '' };
    }
    const s = String(raw).trim();
    const slashIdx = s.indexOf('/');
    if (slashIdx === -1) {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: 'Use o formato pagas/total. Ex.: 15/96' };
    }
    const rawPagas = s.substring(0, slashIdx).trim();
    const rawTotal = s.substring(slashIdx + 1).trim();

    const pagas = parseInt(rawPagas, 10);
    const total = parseInt(rawTotal, 10);

    if (isNaN(pagas) || isNaN(total) || rawPagas === '' || rawTotal === '') {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: 'Insira números inteiros. Ex.: 15/96' };
    }
    if (pagas < 0 || total < 0) {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: 'Os valores devem ser não negativos.' };
    }
    if (String(pagas) !== rawPagas || String(total) !== rawTotal) {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: 'Use apenas números inteiros positivos.' };
    }
    if (pagas > total) {
      return { valid: false, pagas: 0, total: 0, restantes: 0, error: 'Parcelas pagas (' + pagas + ') não podem ser maiores que o total (' + total + ').' };
    }
    const restantes = total - pagas;
    return { valid: true, pagas: pagas, total: total, restantes: restantes, error: '' };
  }

  // ===== Money mask formatting =====
  function formatMoneyDisplay(value) {
    if (isNaN(value) || value === null || value === undefined) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function setupMoneyMask(inputEl, onValueChange) {
    let isFormatting = false;

    inputEl.addEventListener('blur', function () {
      const raw = inputEl.value;
      if (!raw || raw.trim() === '') return;
      const parsed = parseMoney(raw);
      if (!isNaN(parsed)) {
        isFormatting = true;
        inputEl.value = formatMoneyDisplay(parsed);
        isFormatting = false;
        onValueChange(inputEl.value);
      }
    });

    inputEl.addEventListener('input', function () {
      if (isFormatting) return;
      onValueChange(inputEl.value);
    });

    inputEl.addEventListener('focus', function () {
      const raw = inputEl.value;
      if (!raw) return;
      const parsed = parseMoney(raw);
      if (!isNaN(parsed) && raw.includes('R$')) {
        isFormatting = true;
        const parts = parsed.toFixed(2).split('.');
        inputEl.value = parts[0] + ',' + parts[1];
        isFormatting = false;
        requestAnimationFrame(function () { inputEl.select(); });
      }
    });
  }

  // ===== Reduction logic =====
  function calcReduction(valorAtualCents, opcaoReducao) {
    const valor = fromCents(valorAtualCents);
    let reducaoCents = 0;
    let elegivelReducao = false;

    if (valor < 150) {
      reducaoCents = 0;
      elegivelReducao = false;
    } else if (valor < 500) {
      reducaoCents = opcaoReducao === 60 ? 6000 : 8000;
      elegivelReducao = true;
    } else if (valor < 1000) {
      reducaoCents = 10000;
      elegivelReducao = true;
    } else {
      reducaoCents = Math.round(valorAtualCents * 0.10);
      elegivelReducao = true;
    }

    const parcelaReduzidaCents = Math.max(0, valorAtualCents - reducaoCents);
    const economiaCents = valorAtualCents - parcelaReduzidaCents;

    return {
      reducaoAplicadaCents: reducaoCents,
      parcelaReduzidaCents: parcelaReduzidaCents,
      economiaPorParcelaCents: economiaCents,
      elegivelReducao: elegivelReducao
    };
  }

  // ===== Phone validation =====
  function normalizePhone(raw) {
    if (!raw) return { valid: false, digits: '', error: 'Informe um telefone.' };
    let digits = raw.replace(/\D/g, '');
    if (digits === '') return { valid: false, digits: '', error: 'Informe um telefone válido.' };

    if (digits.startsWith('55') && digits.length >= 12) {
      digits = digits.substring(2);
    }

    if (digits.length < 10 || digits.length > 11) {
      return { valid: false, digits: '', error: 'Número incompleto ou inválido. Use DDD + número.' };
    }

    const ddd = parseInt(digits.substring(0, 2), 10);
    if (ddd < 11 || ddd > 99) {
      return { valid: false, digits: '', error: 'DDD inválido.' };
    }

    return { valid: true, digits: '55' + digits, error: '' };
  }

  // ===== Bank autocomplete =====
  function setupBankAutocomplete(inputEl, listEl) {
    let justSelected = false;

    function filterBanks(query) {
      if (!query) return [];
      const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return BANKS.filter(function (b) {
        const bn = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return bn.includes(q);
      }).slice(0, 6);
    }

    function showSuggestions() {
      if (justSelected) { justSelected = false; return; }
      const query = inputEl.value.trim();
      const matches = filterBanks(query);
      listEl.innerHTML = '';
      if (matches.length === 0) { listEl.classList.add('hidden'); return; }
      matches.forEach(function (bank) {
        const li = document.createElement('li');
        li.textContent = bank;
        li.className = 'px-3 py-2 cursor-pointer text-sm text-ice hover:bg-royal/30 hover:text-white transition-colors rounded-lg';
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          inputEl.value = bank;
          listEl.innerHTML = '';
          listEl.classList.add('hidden');
          justSelected = true;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.blur();
        });
        listEl.appendChild(li);
      });
      listEl.classList.remove('hidden');
    }

    inputEl.addEventListener('input', showSuggestions);
    inputEl.addEventListener('focus', function () { if (!justSelected) showSuggestions(); });
    inputEl.addEventListener('blur', function () {
      setTimeout(function () { listEl.innerHTML = ''; listEl.classList.add('hidden'); }, 150);
    });
  }

  // ===== Contract Dynamic Helpers =====
  function getBancoNContrato(contract) {
    const banco = (contract.bank || '').trim();
    const ncontrato = 'Contrato ' + contract.number;
    if (banco) {
      return banco + ' - ' + ncontrato;
    }
    return ncontrato;
  }

  function getFormattedJuroAtual(contract) {
    let val = (contract.juroAtual !== undefined && contract.juroAtual !== null ? String(contract.juroAtual) : '1.84%').trim();
    if (!val) val = '1.84%';
    if (!val.includes('%')) {
      val = val + '%';
    }
    return val;
  }

  function getFormattedNovoJuros(contract) {
    let val = (contract.novoJuros !== undefined && contract.novoJuros !== null ? String(contract.novoJuros) : '1,19').trim();
    if (!val) val = '1,19';
    val = val.replace(/%$/, '').trim();
    return val;
  }

  // ===== Contract rendering =====
  function createContractElement(contract) {
    const div = document.createElement('div');
    div.className = 'prop-card contract-enter rounded-2xl border border-royal/30 bg-[#0C2644]/50 p-5 backdrop-blur-xl relative overflow-hidden';
    div.dataset.contractId = contract.id;

    const bankLabel = contract.bank ? ' \u2014 ' + contract.bank : '';

    div.innerHTML =
      '<div class="contract-header flex items-center justify-between gap-3 mb-4">' +
      '<button type="button" class="btn-toggle-contract flex items-center gap-2 text-left group flex-1 min-w-0" aria-expanded="true" aria-label="Recolher ou expandir Contrato ' + contract.number + '">' +
      '<h3 class="text-sm font-semibold text-ice flex items-center gap-1.5 flex-wrap">' +
      '<span class="text-sky font-sans text-sm font-semibold uppercase tracking-wider">Contrato ' + contract.number + '</span>' +
      '<span class="contract-bank-label text-steel font-normal text-xs sm:text-sm">' + bankLabel + '</span>' +
      '</h3>' +
      '<svg class="contract-chevron h-4 w-4 text-steel transition-transform duration-300 group-hover:text-sky shrink-0" style="transform: rotate(180deg)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />' +
      '</svg>' +
      '</button>' +
      '<button type="button" class="btn-remove-contract flex items-center gap-1 text-xs text-steel/60 hover:text-red-400 transition shrink-0" title="Remover contrato" aria-label="Remover Contrato ' + contract.number + '">' +
      '<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>' +
      'Remover' +
      '</button>' +
      '</div>' +
      '<div class="contract-collapsible collapsible-wrapper">' +
      '<div class="collapsible-inner">' +
      '<div class="contract-body pt-1">' +
      '<div class="contract-fields-grid grid gap-3 sm:grid-cols-2">' +

      '<div class="relative contract-field-banco">' +
      '<label class="block text-xs font-medium text-ice mb-1">Banco</label>' +
      '<input type="text" class="contract-bank form-field w-full px-3 py-2 text-sm outline-none" placeholder="Digite o nome do banco" value="' + (contract.bank || '') + '" autocomplete="off" />' +
      '<ul class="bank-suggestions hidden absolute z-20 left-0 right-0 mt-1 rounded-xl border border-royal/40 bg-night/95 p-1.5 backdrop-blur-xl shadow-xl max-h-48 overflow-y-auto"></ul>' +
      '</div>' +

      '<div class="contract-field-valor">' +
      '<label class="block text-xs font-medium text-ice mb-1">Valor da parcela</label>' +
      '<input type="text" class="contract-valor form-field w-full px-3 py-2 text-sm outline-none" placeholder="R$ 0,00" value="' + (contract.valorRaw || '') + '" autocomplete="off" inputmode="decimal" />' +
      '<p class="contract-valor-error form-error text-xs mt-0.5" aria-live="polite"></p>' +
      '</div>' +

      '<div class="contract-field-juro-atual">' +
      '<label class="block text-xs font-medium text-ice mb-1">Taxa de juros atual <span class="text-steel/50 font-normal font-sans text-[11px]">(opcional)</span></label>' +
      '<input type="text" class="contract-juro-atual form-field w-full px-3 py-2 text-sm outline-none" placeholder="1.84%" value="' + (contract.juroAtual || '1.84%') + '" autocomplete="off" />' +
      '</div>' +

      '<div class="contract-field-novo-juros">' +
      '<label class="block text-xs font-medium text-ice mb-1">Nova taxa de juros <span class="text-steel/50 font-normal font-sans text-[11px]">(opcional)</span></label>' +
      '<input type="text" class="contract-novo-juros form-field w-full px-3 py-2 text-sm outline-none" placeholder="1,19" value="' + (contract.novoJuros || '1,19') + '" autocomplete="off" />' +
      '</div>' +

      '<div class="contract-reducao-wrapper sm:col-span-2 hidden">' +
      '<label class="block text-xs font-medium text-ice mb-1.5">Redução</label>' +
      '<div class="flex gap-2">' +
      '<label class="flex-1 cursor-pointer">' +
      '<input type="radio" name="reducao-' + contract.id + '" value="80" class="contract-reducao sr-only" checked />' +
      '<span class="reducao-option block text-center rounded-lg border border-sky bg-sky/15 py-2 text-sm font-medium text-sky transition-all hover:border-sky/40">R$ 80,00</span>' +
      '</label>' +
      '<label class="flex-1 cursor-pointer">' +
      '<input type="radio" name="reducao-' + contract.id + '" value="60" class="contract-reducao sr-only" />' +
      '<span class="reducao-option block text-center rounded-lg border border-royal/40 bg-night/30 py-2 text-sm font-medium text-steel transition-all hover:border-sky/40">R$ 60,00</span>' +
      '</label>' +
      '</div>' +
      '</div>' +

      '<div class="contract-field-ressarcimento sm:col-span-2">' +
      '<label class="block text-xs font-medium text-ice mb-1">Valor do ressarcimento</label>' +
      '<input type="text" class="contract-ressarcimento form-field w-full px-3 py-2 text-sm outline-none" placeholder="R$ 0,00" value="' + (contract.ressarcimentoRaw || '') + '" autocomplete="off" inputmode="decimal" />' +
      '</div>' +
      '</div>' +

      '<div class="contract-results mt-4 pt-4 border-t border-royal/20 hidden">' +
      '<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">' +
      '<div class="rounded-lg bg-night/40 p-2">' +
      '<p class="text-[10px] text-steel uppercase">Redução</p>' +
      '<p class="contract-result-reducao text-sm font-semibold text-ice">-</p>' +
      '</div>' +
      '<div class="rounded-lg bg-night/40 p-2">' +
      '<p class="text-[10px] text-steel uppercase">Nova parcela</p>' +
      '<p class="contract-result-nova text-sm font-semibold text-sky">-</p>' +
      '</div>' +
      '<div class="rounded-lg bg-night/40 p-2">' +
      '<p class="text-[10px] text-steel uppercase">Economia/mês</p>' +
      '<p class="contract-result-economia text-sm font-semibold text-ice">-</p>' +
      '</div>' +
      '<div class="rounded-lg bg-night/40 p-2">' +
      '<p class="text-[10px] text-steel uppercase">Economia total</p>' +
      '<p class="contract-result-projecao text-sm font-semibold text-ice">-</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // Toggle collapse
    const toggleBtn = div.querySelector('.btn-toggle-contract');
    const contractCollapsible = div.querySelector('.contract-collapsible');
    const contractChevron = div.querySelector('.contract-chevron');
    const contractHeader = div.querySelector('.contract-header');

    let isExpanded = true;
    toggleBtn.addEventListener('click', function () {
      isExpanded = !isExpanded;
      contractCollapsible.classList.toggle('is-collapsed', !isExpanded);
      contractChevron.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
      toggleBtn.setAttribute('aria-expanded', String(isExpanded));
      if (isExpanded) {
        contractHeader.classList.add('mb-4');
      } else {
        contractHeader.classList.remove('mb-4');
      }
    });

    // Bank autocomplete
    const bankInput = div.querySelector('.contract-bank');
    const bankSuggestions = div.querySelector('.bank-suggestions');
    setupBankAutocomplete(bankInput, bankSuggestions);
    bankInput.addEventListener('input', function () {
      contract.bank = bankInput.value.trim();
      const labelEl = div.querySelector('.contract-bank-label');
      labelEl.textContent = contract.bank ? ' \u2014 ' + contract.bank : '';
      recalcAll();
    });

    // Juro Atual
    const juroAtualInput = div.querySelector('.contract-juro-atual');
    juroAtualInput.addEventListener('input', function () {
      contract.juroAtual = juroAtualInput.value.trim();
      recalcAll();
    });

    // Novo Juros
    const novoJurosInput = div.querySelector('.contract-novo-juros');
    novoJurosInput.addEventListener('input', function () {
      contract.novoJuros = novoJurosInput.value.trim();
      recalcAll();
    });

    // Valor with money mask
    const valorInput = div.querySelector('.contract-valor');
    setupMoneyMask(valorInput, function (val) {
      contract.valorRaw = val;
      recalcAll();
    });

    // Reducao radios
    const reducaoRadios = div.querySelectorAll('.contract-reducao');
    reducaoRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        contract.opcaoReducao = parseInt(radio.value, 10);
        div.querySelectorAll('.reducao-option').forEach(function (opt) {
          opt.classList.remove('border-sky', 'bg-sky/15', 'text-sky');
          opt.classList.add('border-royal/40', 'bg-night/30', 'text-steel');
        });
        radio.parentElement.querySelector('.reducao-option').classList.remove('border-royal/40', 'bg-night/30', 'text-steel');
        radio.parentElement.querySelector('.reducao-option').classList.add('border-sky', 'bg-sky/15', 'text-sky');
        recalcAll();
      });
    });

    // Ressarcimento with money mask
    const ressarcimentoInput = div.querySelector('.contract-ressarcimento');
    setupMoneyMask(ressarcimentoInput, function (val) {
      contract.ressarcimentoRaw = val;
      recalcAll();
    });

    div.querySelector('.btn-remove-contract').addEventListener('click', function () {
      removeContract(contract.id);
    });

    return div;
  }

  // ===== Add / Remove contracts =====
  function addContract() {
    contractCounter++;
    const contract = {
      id: 'c' + Date.now() + '_' + contractCounter,
      number: contractCounter,
      bank: '',
      juroAtual: '1.84%',
      novoJuros: '1,19',
      valorRaw: '',
      opcaoReducao: 80,
      ressarcimentoRaw: '',
      showReducaoChoice: false,
      hasValidData: false,
      elegivelReducao: false,
      elegivelRessarcimento: false,
      reducaoAplicadaCents: 0,
      parcelaReduzidaCents: 0,
      economiaPorParcelaCents: 0,
      economiaProjetadaCents: 0,
      parcelasRestantes: 0,
      ressarcimentoCents: 0
    };
    contracts.push(contract);
    const el = createContractElement(contract);
    contractsArea.appendChild(el);
    el.querySelector('.contract-bank').focus();
    updateContractsCount();
    recalcAll();
  }

  function removeContract(id) {
    const el = contractsArea.querySelector('[data-contract-id="' + id + '"]');
    if (!el) return;

    el.classList.add('contract-exit');
    setTimeout(function () {
      const idx = contracts.findIndex(function (c) { return c.id === id; });
      if (idx !== -1) contracts.splice(idx, 1);
      el.remove();
      contracts.forEach(function (c, i) { c.number = i + 1; });
      const cards = contractsArea.querySelectorAll('[data-contract-id]');
      cards.forEach(function (card, i) {
        const titleSpan = card.querySelector('h3 .text-sky');
        if (titleSpan) titleSpan.textContent = 'Contrato ' + (i + 1);
        const tBtn = card.querySelector('.btn-toggle-contract');
        if (tBtn) tBtn.setAttribute('aria-label', 'Recolher ou expandir Contrato ' + (i + 1));
        const rBtn = card.querySelector('.btn-remove-contract');
        if (rBtn) rBtn.setAttribute('aria-label', 'Remover Contrato ' + (i + 1));
      });
      updateContractsCount();
      recalcAll();
    }, 190);
  }

  function updateContractsCount() {
    if (contractsCount) {
      contractsCount.textContent = contracts.length > 0 ? '(' + contracts.length + ')' : '';
    }
  }

  // ===== Core recalculation =====
  function recalcAll() {
    let totalEconomiaMensalCents = 0;
    let totalEconomiaProjetadaCents = 0;
    let totalRessarcimentosCents = 0;

    contracts.forEach(function (contract) {
      const el = contractsArea.querySelector('[data-contract-id="' + contract.id + '"]');
      if (!el) return;

      const valorParsed = parseMoney(contract.valorRaw);
      const ressarcimentoParsed = parseMoney(contract.ressarcimentoRaw);

      // Validate valor
      const valorError = el.querySelector('.contract-valor-error');
      if (contract.valorRaw && contract.valorRaw.trim() !== '') {
        if (isNaN(valorParsed)) {
          if (valorError) {
            valorError.textContent = 'Valor inválido.';
            valorError.classList.add('is-shown');
          }
        } else {
          if (valorError) {
            valorError.textContent = '';
            valorError.classList.remove('is-shown');
          }
        }
      } else {
        if (valorError) {
          valorError.textContent = '';
          valorError.classList.remove('is-shown');
        }
      }

      // Show/hide reducao choice (only for 150 <= valor < 500)
      const reducaoWrapper = el.querySelector('.contract-reducao-wrapper');
      if (!isNaN(valorParsed) && valorParsed >= 150 && valorParsed < 500) {
        reducaoWrapper.classList.remove('hidden');
        contract.showReducaoChoice = true;
      } else {
        reducaoWrapper.classList.add('hidden');
        contract.showReducaoChoice = false;
      }

      // Calculate results
      const resultsEl = el.querySelector('.contract-results');
      if (!isNaN(valorParsed) && valorParsed > 0) {
        const valorCents = toCents(valorParsed);
        const result = calcReduction(valorCents, contract.opcaoReducao);

        contract.reducaoAplicadaCents = result.reducaoAplicadaCents;
        contract.parcelaReduzidaCents = result.parcelaReduzidaCents;
        contract.economiaPorParcelaCents = result.economiaPorParcelaCents;
        contract.elegivelReducao = result.elegivelReducao;
        contract.parcelasRestantes = 0;
        contract.economiaProjetadaCents = 0;

        if (result.elegivelReducao) {
          el.querySelector('.contract-result-reducao').textContent = formatMoney(fromCents(result.reducaoAplicadaCents));
          el.querySelector('.contract-result-nova').textContent = formatMoney(fromCents(result.parcelaReduzidaCents));
          el.querySelector('.contract-result-economia').textContent = formatMoney(fromCents(result.economiaPorParcelaCents));
          el.querySelector('.contract-result-projecao').textContent = '—';

          totalEconomiaMensalCents += result.economiaPorParcelaCents;
        } else {
          el.querySelector('.contract-result-reducao').textContent = 'R$ 0,00';
          el.querySelector('.contract-result-nova').textContent = formatMoney(fromCents(valorCents));
          el.querySelector('.contract-result-economia').textContent = 'R$ 0,00';
          el.querySelector('.contract-result-projecao').textContent = '—';
        }

        resultsEl.classList.remove('hidden');
      } else {
        resultsEl.classList.add('hidden');
        contract.elegivelReducao = false;
        contract.reducaoAplicadaCents = 0;
        contract.parcelaReduzidaCents = 0;
        contract.economiaPorParcelaCents = 0;
        contract.economiaProjetadaCents = 0;
        contract.parcelasRestantes = 0;
      }

      // Ressarcimento: strictly only eligible if informed AND > 0
      if (contract.ressarcimentoRaw && contract.ressarcimentoRaw.trim() !== '' && !isNaN(ressarcimentoParsed) && ressarcimentoParsed > 0) {
        contract.ressarcimentoCents = toCents(ressarcimentoParsed);
        contract.elegivelRessarcimento = true;
        totalRessarcimentosCents += contract.ressarcimentoCents;
      } else {
        contract.ressarcimentoCents = 0;
        contract.elegivelRessarcimento = false;
      }

      contract.hasValidData = contract.elegivelReducao || contract.elegivelRessarcimento;
    });

    totalEconomiaMensal.textContent = formatMoney(fromCents(totalEconomiaMensalCents));
    totalEconomiaProjetada.textContent = formatMoney(fromCents(totalEconomiaProjetadaCents));
    totalRessarcimentos.textContent = formatMoney(fromCents(totalRessarcimentosCents));

    updateIndicatorsParcelasList();
    applyVersionUI();
    if (messageVersion === 'v2') updateIndicatorsV2();

    const reductionContracts = contracts.filter(function (c) { return c.elegivelReducao; });
    const restitutionContracts = contracts.filter(function (c) { return c.elegivelRessarcimento; });

    let isEligibleForCurrentMode = false;
    if (messageVersion === 'v2') {
      isEligibleForCurrentMode = contracts.some(function (c) {
        const v = parseMoney(c.valorRaw);
        const r = parseMoney(c.ressarcimentoRaw);
        return (!isNaN(v) && v > 0) || (!isNaN(r) && r > 0) || (c.bank && c.bank.trim() !== '');
      });
    } else if (messageMode === 'reduction') {
      isEligibleForCurrentMode = reductionContracts.length > 0;
    } else if (messageMode === 'restitution') {
      isEligibleForCurrentMode = restitutionContracts.length > 0;
    } else {
      isEligibleForCurrentMode = (reductionContracts.length > 0 || restitutionContracts.length > 0);
    }

    // Always allow proposal generation if at least one contract has been added with valid data or parcel
    const hasAnyContract = contracts.length > 0;

    updateProposal();
    updateButtonStates(hasAnyContract && isEligibleForCurrentMode);
  }

  // ===== Update parcelas indicators in right column =====
  function updateIndicatorsParcelasList() {
    if (!indicatorsParcelasList) return;
    if (contracts.length === 0) {
      indicatorsParcelasList.innerHTML = '<p class="text-xs text-steel/60 italic">Nenhum contrato cadastrado.</p>';
      return;
    }
    let listHtml = '';
    contracts.forEach(function (c) {
      const label = getContractLabel(c);
      const ratioResult = parsePagasTotal(c.parcelasRatioRaw);

      if (c.parcelasRatioRaw && c.parcelasRatioRaw.trim() !== '') {
        if (ratioResult.valid) {
          const info = ratioResult.pagas + ' pagas de ' + ratioResult.total + ' parcelas \u00b7 ' + ratioResult.restantes + ' restantes';
          listHtml +=
            '<div class="rounded-lg bg-night/40 border border-royal/20 p-2.5">' +
            '<div class="flex items-center justify-between gap-2 mb-0.5 flex-wrap">' +
            '<span class="text-[11px] font-semibold text-sky uppercase tracking-wide">' + label + '</span>' +
            '<span class="text-[10px] text-ice font-semibold bg-sky/15 border border-sky/30 rounded px-1.5 py-0.5">' + ratioResult.restantes + ' restantes</span>' +
            '</div>' +
            '<p class="text-xs text-ice font-medium">' + info + '</p>' +
            '</div>';
        } else {
          listHtml +=
            '<div class="rounded-lg bg-night/40 border border-red-500/30 p-2.5">' +
            '<p class="text-[11px] font-semibold text-sky uppercase tracking-wide mb-0.5">' + label + '</p>' +
            '<p class="text-xs text-red-400 font-medium">' + (ratioResult.error || 'Dados inválidos.') + '</p>' +
            '</div>';
        }
      } else {
        listHtml +=
          '<div class="rounded-lg bg-night/40 border border-royal/15 p-2.5">' +
          '<p class="text-[11px] font-semibold text-steel uppercase tracking-wide mb-0.5">' + label + '</p>' +
          '<p class="text-xs text-steel/60 italic">Informação de parcelas não disponível.</p>' +
          '</div>';
      }
    });
    indicatorsParcelasList.innerHTML = listHtml;
  }

  // ===== Apply V1/V2 UI switching =====
  function applyVersionUI() {
    var isV2 = messageVersion === 'v2';
    if (indicatorsV1Panel) indicatorsV1Panel.classList.toggle('hidden', isV2);
    if (indicatorsV2Panel) indicatorsV2Panel.classList.toggle('hidden', !isV2);
    if (messageModeSelectorEl) messageModeSelectorEl.classList.toggle('hidden', isV2);
  }

  // ===== Update V2 indicators panel =====
  function updateIndicatorsV2() {
    if (!v2ParcelasList || !v2TotalRessarcimentos) return;

    // Total ressarcimentos
    var totalResCents = 0;
    contracts.forEach(function (c) {
      if (c.ressarcimentoCents && c.ressarcimentoCents > 0) totalResCents += c.ressarcimentoCents;
    });
    v2TotalRessarcimentos.textContent = formatMoney(fromCents(totalResCents));

    // Parcelas list
    if (contracts.length === 0) {
      v2ParcelasList.innerHTML = '<p class="text-xs text-steel/60 italic">Nenhum contrato cadastrado.</p>';
      return;
    }
    var listHtml = '';
    contracts.forEach(function (c) {
      var label = getContractLabel(c);
      var ratioResult = parsePagasTotal(c.parcelasRatioRaw);
      if (c.parcelasRatioRaw && c.parcelasRatioRaw.trim() !== '') {
        if (ratioResult.valid) {
          var pct = ratioResult.total > 0 ? Math.round((ratioResult.pagas / ratioResult.total) * 100) : 0;
          listHtml +=
            '<div class="rounded-lg bg-night/40 border border-royal/20 p-2.5">' +
              '<div class="flex items-center justify-between gap-2 mb-1 flex-wrap">' +
                '<span class="text-[11px] font-semibold text-sky uppercase tracking-wide">' + label + '</span>' +
                '<span class="text-[10px] text-ice font-semibold bg-sky/15 border border-sky/30 rounded px-1.5 py-0.5">' + ratioResult.restantes + ' restantes</span>' +
              '</div>' +
              '<p class="text-xs text-ice font-medium mb-1.5">' + ratioResult.pagas + ' pagas de ' + ratioResult.total + ' parcelas</p>' +
              '<div class="w-full bg-night/60 rounded-full h-1.5 border border-royal/20">' +
                '<div class="bg-sky h-1.5 rounded-full transition-all duration-300" style="width:' + pct + '%"></div>' +
              '</div>' +
            '</div>';
        } else {
          listHtml +=
            '<div class="rounded-lg bg-night/40 border border-red-500/30 p-2.5">' +
            '<p class="text-[11px] font-semibold text-sky uppercase tracking-wide mb-0.5">' + label + '</p>' +
            '<p class="text-xs text-red-400 font-medium">' + (ratioResult.error || 'Dados inválidos.') + '</p>' +
            '</div>';
        }
      } else {
        listHtml +=
          '<div class="rounded-lg bg-night/40 border border-royal/15 p-2.5">' +
          '<p class="text-[11px] font-semibold text-steel uppercase tracking-wide mb-0.5">' + label + '</p>' +
          '<p class="text-xs text-steel/60 italic">Informação de parcelas não disponível.</p>' +
          '</div>';
      }
    });
    v2ParcelasList.innerHTML = listHtml;
  }

  // ===== Contract sequential label for indicators =====
  function getContractLabel(contract) {
    const bankLabel = contract.bank && contract.bank.trim() ? ' \u2014 ' + contract.bank.trim() : '';
    return 'Contrato ' + contract.number + bankLabel;
  }

  // ===== V1 PROPOSAL BUILDER =====
  function buildProposalTextV1(targetContracts, nomeCliente, nomeOp) {
    let text = '';
    const greetingName = nomeCliente ? '*' + nomeCliente + '*' : 'Cliente';
    const operatorBold = nomeOp ? '*' + nomeOp + '*' : '*Operador*';

    text += '✨ Olá, ' + greetingName + '! Tudo bem? 😊\n\n';
    text += 'Aqui é o ' + operatorBold + ', consultor Qualibank! \n';
    text += 'confira as condições disponíveis para você 👇\n\n';
    text += '🔵 OPÇÃO 1 — REDUÇÃO DE PARCELA \n\n';

    const validContracts = targetContracts.length > 0 ? targetContracts : contracts;

    validContracts.forEach(function (c) {
      const valorParsed = parseMoney(c.valorRaw);
      const valorAtualCents = !isNaN(valorParsed) ? toCents(valorParsed) : 0;
      const valorParcela = formatMoney(fromCents(valorAtualCents));
      const parcelaAtualizada = formatMoney(fromCents(c.elegivelReducao ? c.parcelaReduzidaCents : valorAtualCents));
      const bancoNContrato = getBancoNContrato(c);
      const juroAtual = getFormattedJuroAtual(c);
      const novoJuros = getFormattedNovoJuros(c);

      text += 'Situação Atual ' + bancoNContrato + '\n';
      text += 'Parcela: ' + valorParcela + '\n';
      text += ' Taxa: ' + juroAtual + ' a.m\n\n';
      text += 'Nova Condição\n';
      text += 'Nova taxa: *' + novoJuros + '*% a.m\n';
      text += 'Valor que você recebe: ' + parcelaAtualizada + '\n\n';
    });

    text += '✅ Sem alteração no prazo & 1 mês de carência\n';
    text += '________\n';
    text += '🟢 OPÇÃO 2 — RESSARCIMENTO \n\n';
    text += '💳 Situação Atual\n';
    text += 'Parcela: R$  283,00\n';
    text += ' Taxa: 1.84% a.m\n';
    text += '.\n';
    text += '✅️ Nova Condição\n';
    text += 'Nova taxa: 1,19% a.m\n';
    text += 'Valor que você recebe: R$ 3.920,00\n\n';
    text += '🗓️ O valor estará disponível em sua conta na próxima  SEMANA NA MESMA CONTA DO SEU BENEFICIO & Até 3 meses de carência\n';
    text += '📉 Redução imediata dos juros\n\n\n';
    text += '💬 Qual opção você prefere? 👇\n\n';
    text += '🔵 1 — Reduzir a parcela\n';
    text += '🟢 2 — Receber o ressarcimento\n';
    text += '🟡 3 — Tirar dúvidas';

    return text;
  }

  // ===== V2 PROPOSAL BUILDER =====
  function buildProposalTextV2(targetContracts, nomeCliente, cpfCliente) {
    let text = '';
    text += '🧾 PROPOSTA DE ATUALIZAÇÃO DO SEU CONTRATO\n\n';

    if (nomeCliente && cpfCliente) {
      text += 'NOME:  *' + nomeCliente + '*\n';
      text += 'CPF: *' + cpfCliente + '*\n\n';
    } else if (nomeCliente) {
      text += 'NOME:  *' + nomeCliente + '*\n\n';
    } else if (cpfCliente) {
      text += 'CPF: *' + cpfCliente + '*\n\n';
    }

    const validContracts = targetContracts.length > 0 ? targetContracts : contracts;

    validContracts.forEach(function (c) {
      const valorParsed = parseMoney(c.valorRaw);
      const valorAtualCents = !isNaN(valorParsed) ? toCents(valorParsed) : 0;
      const valorParcela = formatMoney(fromCents(valorAtualCents));
      const ressarcimento = formatMoney(fromCents(c.ressarcimentoCents || 0));
      const bancoNContrato = getBancoNContrato(c);
      const juroAtual = getFormattedJuroAtual(c);
      const novoJuros = getFormattedNovoJuros(c);

      text += '💳 Situação Atual ' + bancoNContrato + '\n';
      text += 'Parcela: ' + valorParcela + '\n';
      text += ' Taxa: ' + juroAtual + ' a.m\n';
      text += '.\n';
      text += ' Nova Condição\n';
      text += 'Nova taxa: *' + novoJuros + '*% a.m\n';
      text += 'Valor que você recebe: *' + ressarcimento + '*\n\n';
    });

    text += '💳 Situação Atual\n';
    text += 'Parcela: R$  283,00\n';
    text += ' Taxa: 1.84% a.m\n';
    text += '.\n';
    text += '✅️ Nova Condição\n';
    text += 'Nova taxa: 1,19% a.m\n';
    text += 'Valor que você recebe: R$ 3.920,00\n\n\n';
    text += '📅 Previsão de Pagamento\n';
    text += 'O valor estará disponível em sua conta na próxima  SEMANA NA MESMA CONTA DO SEU BENEFICIO\n\n';
    text += 'RESPONDA:\n';
    text += '1- Para Prosseguir\n';
    text += '2- Para Dúvidas';

    return text;
  }

  // ===== General proposal builder according to selected version =====
  function buildProposalText() {
    const clientName = clientNameInput ? clientNameInput.value.trim() : '';
    const clientCpf = clientCpfInput ? clientCpfInput.value.trim() : '';
    const nomeOp = operatorName || 'Operador';

    let targetContracts = contracts;
    if (messageMode === 'reduction') {
      const red = contracts.filter(function (c) { return c.elegivelReducao; });
      if (red.length > 0) targetContracts = red;
    } else if (messageMode === 'restitution') {
      const res = contracts.filter(function (c) { return c.elegivelRessarcimento; });
      if (res.length > 0) targetContracts = res;
    }

    if (messageVersion === 'v2') {
      return buildProposalTextV2(targetContracts, clientName, clientCpf);
    } else {
      return buildProposalTextV1(targetContracts, clientName, nomeOp);
    }
  }

  // ===== Emoji Stripping for WhatsApp =====
  function stripEmojis(text) {
    if (!text) return '';
    return text
      // Remove emojis optionally with space directly attached
      .replace(/ ?[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}][\uFE0E\uFE0F\u200D]? ?/gu, '')
      .replace(/[\uFE0E\uFE0F\u200D]/g, '');
  }

  // ===== Proposal preview rendering =====
  function renderProposalPreview(rawText) {
    if (!proposalPreview) return;
    // Escape HTML
    let safeHtml = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Visually highlight WhatsApp bold syntax *texto*
    safeHtml = safeHtml.replace(/\*([^*\n\r]+)\*/g, '<strong class="font-bold text-white bg-sky/20 px-1 py-0.5 rounded">*$1*</strong>');

    proposalPreview.innerHTML = safeHtml;
  }

  function updateProposal() {
    if (contracts.length === 0) {
      proposalPreview.innerHTML = '<p class="proposal-empty italic text-xs">Adicione contratos para visualizar a proposta...</p>';
      return;
    }

    if (!operatorConfirmed) {
      proposalPreview.innerHTML = '<p class="proposal-empty italic text-xs" style="color: #fbbf24cc;">\u26a0\ufe0f Configure e confirme o nome do operador para gerar a proposta.</p>';
      return;
    }

    const reductionContracts = contracts.filter(function (c) { return c.elegivelReducao; });
    const restitutionContracts = contracts.filter(function (c) { return c.elegivelRessarcimento; });

    if (messageVersion !== 'v2') {
      if (messageMode === 'reduction' && reductionContracts.length === 0) {
        proposalPreview.innerHTML = '<p class="proposal-empty italic text-xs" style="color: #fbbf24cc;">\u26a0\ufe0f Não existem contratos elegíveis para redução de parcelas (parcela mínima de R$ 150,00).</p>';
        return;
      }

      if (messageMode === 'restitution' && restitutionContracts.length === 0) {
        proposalPreview.innerHTML = '<p class="proposal-empty italic text-xs" style="color: #fbbf24cc;">\u26a0\ufe0f Não existem contratos com valor de ressarcimento informado (maior que R$ 0,00).</p>';
        return;
      }
    }

    const text = buildProposalText();
    renderProposalPreview(text);
  }

  // ===== Button state management =====
  function updateButtonStates(isEligibleForCurrentMode) {
    const canCopy = isEligibleForCurrentMode && operatorConfirmed;
    const phoneResult = normalizePhone(clientPhoneInput ? clientPhoneInput.value : '');
    const canWhatsApp = canCopy && phoneResult.valid;

    btnCopyProposal.disabled = !canCopy;
    btnOpenWhatsapp.disabled = !canWhatsApp;

    if (clientPhoneInput && clientPhoneInput.value.trim() !== '' && !phoneResult.valid) {
      phoneError.textContent = phoneResult.error;
      phoneError.classList.add('is-shown');
    } else {
      phoneError.textContent = '';
      phoneError.classList.remove('is-shown');
    }

    if (isEligibleForCurrentMode && !canWhatsApp) {
      whatsappHint.classList.remove('hidden');
    } else {
      whatsappHint.classList.add('hidden');
    }
  }

  // ===== Operator settings =====
  function confirmOperator() {
    const name = operatorNameInput ? operatorNameInput.value.trim() : '';
    if (!name) {
      if (operatorNameError) {
        operatorNameError.textContent = 'Informe o nome do operador antes de confirmar.';
        operatorNameError.classList.add('is-shown');
      }
      return;
    }

    // Lock in state — session memory only, no storage
    operatorName = name;
    operatorConfirmed = true;

    // Update DOM
    if (operatorNameInput) {
      operatorNameInput.disabled = true;
      operatorNameInput.style.opacity = '0.6';
      operatorNameInput.style.cursor = 'not-allowed';
    }
    if (operatorNameError) {
      operatorNameError.textContent = '';
      operatorNameError.classList.remove('is-shown');
    }
    if (operatorConfirmArea) operatorConfirmArea.classList.add('hidden');
    if (operatorConfirmedMsg) operatorConfirmedMsg.classList.remove('hidden');
    if (operatorStatusBadge) operatorStatusBadge.classList.remove('hidden');

    recalcAll();
  }

  // Collapsible: operator settings
  if (toggleOperatorSettings) {
    let operatorOpen = false;
    toggleOperatorSettings.addEventListener('click', function () {
      operatorOpen = !operatorOpen;
      if (operatorCollapsible) {
        operatorCollapsible.classList.toggle('is-collapsed', !operatorOpen);
      }
      toggleOperatorSettings.setAttribute('aria-expanded', String(operatorOpen));
      if (chevronOperator) {
        chevronOperator.style.transform = operatorOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  if (btnConfirmOperator) {
    btnConfirmOperator.addEventListener('click', confirmOperator);
  }

  if (operatorNameInput) {
    operatorNameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !operatorConfirmed) {
        e.preventDefault();
        confirmOperator();
      }
    });
  }

  // ===== Version selector logic =====
  function updateVersionRadiosVisual() {
    messageVersionRadios.forEach(function (radio) {
      const opt = radio.parentElement.querySelector('.message-version-option');
      if (!opt) return;
      if (radio.checked) {
        opt.classList.add('border-sky', 'bg-sky/15', 'text-sky');
        opt.classList.remove('border-royal/40', 'bg-night/30', 'text-steel');
      } else {
        opt.classList.remove('border-sky', 'bg-sky/15', 'text-sky');
        opt.classList.add('border-royal/40', 'bg-night/30', 'text-steel');
      }
    });
  }

  if (messageVersionRadios) {
    messageVersionRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) {
          messageVersion = radio.value;
          updateVersionRadiosVisual();
          recalcAll();
        }
      });
    });
    updateVersionRadiosVisual();
    applyVersionUI();
  }

  // ===== Event listeners =====

  // Collapsible: client data
  const clientCollapsible = document.getElementById('client-collapsible');
  if (toggleClientData) {
    let clientOpen = false;
    toggleClientData.addEventListener('click', function () {
      clientOpen = !clientOpen;
      if (clientCollapsible) {
        clientCollapsible.classList.toggle('is-collapsed', !clientOpen);
      } else if (clientFields) {
        clientFields.style.display = clientOpen ? '' : 'none';
      }
      toggleClientData.setAttribute('aria-expanded', String(clientOpen));
      if (chevronClient) chevronClient.style.transform = clientOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Collapsible: contracts section
  if (toggleContracts) {
    let contractsOpen = true;
    toggleContracts.addEventListener('click', function () {
      contractsOpen = !contractsOpen;
      if (contractsCollapsible) {
        contractsCollapsible.classList.toggle('is-collapsed', !contractsOpen);
      }
      toggleContracts.setAttribute('aria-expanded', String(contractsOpen));
      if (chevronContracts) chevronContracts.style.transform = contractsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Client inputs
  if (clientNameInput) {
    clientNameInput.addEventListener('input', function () { recalcAll(); });
  }

  if (clientCpfInput) {
    clientCpfInput.addEventListener('input', function () {
      const cursor = clientCpfInput.selectionStart;
      const prevLen = clientCpfInput.value.length;
      clientCpfInput.value = formatCPF(clientCpfInput.value);
      recalcAll();
    });
  }

  if (clientPhoneInput) {
    clientPhoneInput.addEventListener('input', function () { recalcAll(); });
  }

  // Message mode selector radios
  if (messageModeRadios) {
    messageModeRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) {
          messageMode = radio.value;
          recalcAll();
        }
      });
    });
  }

  // Add contract
  if (btnAddContract) btnAddContract.addEventListener('click', addContract);

  // Copy proposal (preserves emojis, newlines, *bold*)
  if (btnCopyProposal) {
    btnCopyProposal.addEventListener('click', function () {
      if (!operatorConfirmed || contracts.length === 0) return;

      const text = buildProposalText();
      if (!text) return;

      navigator.clipboard.writeText(text).then(function () {
        copyFeedback.textContent = '\u2713 Proposta copiada!';
        copyFeedback.classList.add('is-shown');
        setTimeout(function () {
          copyFeedback.classList.remove('is-shown');
          copyFeedback.textContent = '';
        }, 3000);
      }).catch(function () {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
        copyFeedback.textContent = '\u2713 Proposta copiada!';
        copyFeedback.classList.add('is-shown');
        setTimeout(function () {
          copyFeedback.classList.remove('is-shown');
          copyFeedback.textContent = '';
        }, 3000);
      });
    });
  }

  // Open WhatsApp (strips emojis, preserves *bold* and newlines)
  if (btnOpenWhatsapp) {
    btnOpenWhatsapp.addEventListener('click', function () {
      const phoneResult = normalizePhone(clientPhoneInput ? clientPhoneInput.value : '');
      if (!phoneResult.valid) return;
      if (!operatorConfirmed || contracts.length === 0) return;

      const rawText = buildProposalText();
      if (!rawText) return;

      const textToSend = stripEmojis(rawText);
      const url = 'https://wa.me/' + phoneResult.digits + '?text=' + encodeURIComponent(textToSend);
      window.open(url, '_blank');
    });
  }

  // ===== Nova simulação (preserves operator, version, theme) =====
  function resetSimulation() {
    contracts = [];
    contractCounter = 0;
    contractsArea.innerHTML = '';

    if (clientNameInput) clientNameInput.value = '';
    if (clientCpfInput) clientCpfInput.value = '';
    if (clientPhoneInput) clientPhoneInput.value = '';
    if (phoneError) {
      phoneError.textContent = '';
      phoneError.classList.remove('is-shown');
    }
    if (copyFeedback) {
      copyFeedback.textContent = '';
      copyFeedback.classList.remove('is-shown');
    }

    // Reset message mode selector to "all"
    messageMode = 'all';
    if (messageModeRadios) {
      messageModeRadios.forEach(function (radio) {
        radio.checked = (radio.value === 'all');
      });
    }

    // operatorName, operatorConfirmed, messageVersion and theme are preserved!
    updateContractsCount();
    addContract();
    applyVersionUI();
  }

  if (btnNovaSimHeader) {
    btnNovaSimHeader.addEventListener('click', function () {
      const hasData = contracts.length > 0
        || (clientNameInput && clientNameInput.value.trim() !== '')
        || (clientCpfInput && clientCpfInput.value.trim() !== '')
        || (clientPhoneInput && clientPhoneInput.value.trim() !== '');

      if (!hasData) return;

      if (confirm('Tem certeza que deseja limpar os dados do atendimento atual e iniciar uma nova simulação?\n\nOs dados do operador e a versão selecionada serão mantidos.')) {
        resetSimulation();
      }
    });
  }

  // ===== Theme toggle =====
  const navLogo = document.getElementById('nav-logo');
  const footerLogo = document.getElementById('footer-logo');

  const preloadLightLogo = new Image();
  preloadLightLogo.src = 'assets/images/logonav2.png';

  if (btnToggleTheme) {
    let isLight = false;
    btnToggleTheme.addEventListener('click', function () {
      isLight = !isLight;
      document.body.classList.toggle('light-theme', isLight);

      if (isLight) {
        themeIconSun.classList.add('hidden');
        themeIconMoon.classList.remove('hidden');
        if (themeLabel) themeLabel.textContent = 'Modo escuro';
        btnToggleTheme.title = 'Alternar para modo escuro';
        if (navLogo) navLogo.src = 'assets/images/logonav2.png';
        if (footerLogo) footerLogo.src = 'assets/images/logonav2.png';
      } else {
        themeIconSun.classList.remove('hidden');
        themeIconMoon.classList.add('hidden');
        if (themeLabel) themeLabel.textContent = 'Modo claro';
        btnToggleTheme.title = 'Alternar para modo claro';
        if (navLogo) navLogo.src = 'assets/images/logonav.png';
        if (footerLogo) footerLogo.src = 'assets/images/logonav.png';
      }
    });
  }

  // Mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Initialize with one contract =====
  addContract();

})();
