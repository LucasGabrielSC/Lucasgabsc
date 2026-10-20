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

  // ===== State =====
  let contracts = [];
  let contractCounter = 0;

  // ===== DOM references =====
  const clientNameInput = document.getElementById('client-name');
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

  // ===== Monetary helpers (centavo-safe) =====
  function parseMoney(raw) {
    if (raw === undefined || raw === null) return NaN;
    let s = String(raw).trim();
    // Remove R$ prefix and spaces
    s = s.replace(/^R\$\s*/i, '').trim();
    if (s === '') return NaN;
    // Brazilian format: dots are thousands, comma is decimal
    if (s.includes(',')) {
      s = s.replace(/\./g, '');   // remove thousands dots
      s = s.replace(',', '.');    // comma -> decimal point
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

  function parseInteger(raw) {
    if (raw === undefined || raw === null) return NaN;
    const s = String(raw).trim();
    if (s === '') return NaN;
    const n = parseInt(s, 10);
    if (isNaN(n) || n < 0 || String(n) !== s) return NaN;
    return n;
  }

  // ===== Money mask formatting (Ajuste #2) =====
  // Formats a monetary input on blur. On input, just stores the raw value.
  // The mask only applies on blur to avoid fighting with cursor position.
  function formatMoneyDisplay(value) {
    // Given a numeric value, return R$ formatted string
    if (isNaN(value) || value === null || value === undefined) return '';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function setupMoneyMask(inputEl, onValueChange) {
    // On blur: parse, format, set back. On input: pass raw through.
    let isFormatting = false;

    inputEl.addEventListener('blur', () => {
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

    inputEl.addEventListener('input', () => {
      if (isFormatting) return;
      onValueChange(inputEl.value);
    });

    // On focus: if formatted, convert back to plain number for easy editing
    inputEl.addEventListener('focus', () => {
      const raw = inputEl.value;
      if (!raw) return;
      const parsed = parseMoney(raw);
      if (!isNaN(parsed) && raw.includes('R$')) {
        // Convert to simple comma format for editing
        isFormatting = true;
        // Use a clean comma-decimal representation without thousands separators
        const parts = parsed.toFixed(2).split('.');
        inputEl.value = parts[0] + ',' + parts[1];
        isFormatting = false;
        // Select all for easy replacement
        requestAnimationFrame(() => inputEl.select());
      }
    });
  }

  // ===== Reduction logic =====
  function calcReduction(valorAtualCents, opcaoReducao) {
    const valor = fromCents(valorAtualCents);
    let reducaoCents;

    if (valor < 500) {
      reducaoCents = opcaoReducao === 60 ? 6000 : 8000;
    } else if (valor < 1000) {
      reducaoCents = 10000; // R$ 100.00
    } else {
      reducaoCents = Math.round(valorAtualCents * 0.10);
    }

    const parcelaReduzidaCents = Math.max(0, valorAtualCents - reducaoCents);
    const economiaCents = valorAtualCents - parcelaReduzidaCents;

    return {
      reducaoAplicadaCents: reducaoCents,
      parcelaReduzidaCents,
      economiaPorParcelaCents: economiaCents
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

  // ===== Bank autocomplete (Ajuste #1 — improved close on select) =====
  function setupBankAutocomplete(inputEl, listEl) {
    let justSelected = false; // flag to prevent re-opening after selection

    function filterBanks(query) {
      if (!query) return [];
      const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return BANKS.filter(b => {
        const bn = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return bn.includes(q);
      }).slice(0, 6);
    }

    function showSuggestions() {
      if (justSelected) {
        justSelected = false;
        return;
      }
      const query = inputEl.value.trim();
      const matches = filterBanks(query);
      listEl.innerHTML = '';
      if (matches.length === 0) {
        listEl.classList.add('hidden');
        return;
      }
      matches.forEach(bank => {
        const li = document.createElement('li');
        li.textContent = bank;
        li.className = 'px-3 py-2 cursor-pointer text-sm text-ice hover:bg-royal/30 hover:text-white transition-colors rounded-lg';
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          inputEl.value = bank;
          listEl.innerHTML = '';
          listEl.classList.add('hidden');
          justSelected = true;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          // Move focus to next input after brief delay
          inputEl.blur();
        });
        listEl.appendChild(li);
      });
      listEl.classList.remove('hidden');
    }

    inputEl.addEventListener('input', showSuggestions);
    inputEl.addEventListener('focus', () => {
      if (!justSelected) showSuggestions();
    });
    inputEl.addEventListener('blur', () => {
      setTimeout(() => {
        listEl.innerHTML = '';
        listEl.classList.add('hidden');
      }, 150);
    });
  }

  // ===== Contract rendering =====
  function createContractElement(contract) {
    const div = document.createElement('div');
    div.className = 'prop-card contract-enter rounded-2xl border border-royal/30 bg-[#0C2644]/50 p-5 backdrop-blur-xl relative overflow-hidden';
    div.dataset.contractId = contract.id;

    const bankLabel = contract.bank ? ` — ${contract.bank}` : '';

    div.innerHTML = `
      <div class="contract-header flex items-center justify-between gap-3 mb-4">
        <button type="button" class="btn-toggle-contract flex items-center gap-2 text-left group flex-1 min-w-0" aria-expanded="true" aria-label="Recolher ou expandir Contrato ${contract.number}">
          <h3 class="text-sm font-semibold text-ice flex items-center gap-1.5 flex-wrap">
            <span class="text-sky font-sans text-sm font-semibold uppercase tracking-wider">Contrato ${contract.number}</span>
            <span class="contract-bank-label text-steel font-normal text-xs sm:text-sm">${bankLabel}</span>
          </h3>
          <svg class="contract-chevron h-4 w-4 text-steel transition-transform duration-300 group-hover:text-sky shrink-0" style="transform: rotate(180deg)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button type="button" class="btn-remove-contract flex items-center gap-1 text-xs text-steel/60 hover:text-red-400 transition shrink-0" title="Remover contrato" aria-label="Remover Contrato ${contract.number}">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Remover
        </button>
      </div>

      <div class="contract-collapsible collapsible-wrapper">
        <div class="collapsible-inner">
          <div class="contract-body pt-1">
            <div class="grid gap-3 sm:grid-cols-2">
              <!-- Bank -->
              <div class="relative sm:col-span-2">
                <label class="block text-xs font-medium text-ice mb-1">Banco</label>
                <input type="text" class="contract-bank form-field w-full px-3 py-2 text-sm outline-none" placeholder="Digite o nome do banco" value="${contract.bank || ''}" autocomplete="off" />
                <ul class="bank-suggestions hidden absolute z-20 left-0 right-0 mt-1 rounded-xl border border-royal/40 bg-night/95 p-1.5 backdrop-blur-xl shadow-xl max-h-48 overflow-y-auto"></ul>
              </div>

              <!-- Valor da parcela -->
              <div>
                <label class="block text-xs font-medium text-ice mb-1">Valor da parcela</label>
                <input type="text" class="contract-valor form-field w-full px-3 py-2 text-sm outline-none" placeholder="R$ 0,00" value="${contract.valorRaw || ''}" autocomplete="off" inputmode="decimal" />
                <p class="contract-valor-error form-error text-xs mt-0.5" aria-live="polite"></p>
              </div>

              <!-- Parcelas restantes -->
              <div>
                <label class="block text-xs font-medium text-ice mb-1">Parcelas restantes</label>
                <input type="text" class="contract-parcelas form-field w-full px-3 py-2 text-sm outline-none" placeholder="Ex.: 36" value="${contract.parcelasRaw || ''}" autocomplete="off" inputmode="numeric" />
                <p class="contract-parcelas-error form-error text-xs mt-0.5" aria-live="polite"></p>
              </div>

              <!-- Redução choice (only visible when < 500) -->
              <div class="contract-reducao-wrapper sm:col-span-2 ${contract.showReducaoChoice ? '' : 'hidden'}">
                <label class="block text-xs font-medium text-ice mb-1.5">Redução</label>
                <div class="flex gap-2">
                  <label class="flex-1 cursor-pointer">
                    <input type="radio" name="reducao-${contract.id}" value="80" class="contract-reducao sr-only" ${contract.opcaoReducao === 80 ? 'checked' : ''} />
                    <span class="reducao-option block text-center rounded-lg border border-royal/40 bg-night/30 py-2 text-sm font-medium text-steel transition-all hover:border-sky/40 ${contract.opcaoReducao === 80 ? 'border-sky bg-sky/15 text-sky' : ''}">R$ 80,00</span>
                  </label>
                  <label class="flex-1 cursor-pointer">
                    <input type="radio" name="reducao-${contract.id}" value="60" class="contract-reducao sr-only" ${contract.opcaoReducao === 60 ? 'checked' : ''} />
                    <span class="reducao-option block text-center rounded-lg border border-royal/40 bg-night/30 py-2 text-sm font-medium text-steel transition-all hover:border-sky/40 ${contract.opcaoReducao === 60 ? 'border-sky bg-sky/15 text-sky' : ''}">R$ 60,00</span>
                  </label>
                </div>
              </div>

              <!-- Ressarcimento -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-medium text-ice mb-1">Valor do ressarcimento</label>
                <input type="text" class="contract-ressarcimento form-field w-full px-3 py-2 text-sm outline-none" placeholder="R$ 0,00" value="${contract.ressarcimentoRaw || ''}" autocomplete="off" inputmode="decimal" />
              </div>
            </div>

            <!-- Per-contract results (shown when there's valid data) -->
            <div class="contract-results mt-4 pt-4 border-t border-royal/20 ${contract.hasValidData ? '' : 'hidden'}">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
                <div class="rounded-lg bg-night/40 p-2">
                  <p class="text-[10px] text-steel uppercase">Redução</p>
                  <p class="contract-result-reducao text-sm font-semibold text-ice">-</p>
                </div>
                <div class="rounded-lg bg-night/40 p-2">
                  <p class="text-[10px] text-steel uppercase">Nova parcela</p>
                  <p class="contract-result-nova text-sm font-semibold text-sky">-</p>
                </div>
                <div class="rounded-lg bg-night/40 p-2">
                  <p class="text-[10px] text-steel uppercase">Economia/mês</p>
                  <p class="contract-result-economia text-sm font-semibold text-ice">-</p>
                </div>
                <div class="rounded-lg bg-night/40 p-2">
                  <p class="text-[10px] text-steel uppercase">Economia total</p>
                  <p class="contract-result-projecao text-sm font-semibold text-ice">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup toggle collapse event
    const toggleBtn = div.querySelector('.btn-toggle-contract');
    const contractCollapsible = div.querySelector('.contract-collapsible');
    const contractChevron = div.querySelector('.contract-chevron');
    const contractHeader = div.querySelector('.contract-header');

    let isExpanded = true;
    toggleBtn.addEventListener('click', () => {
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

    // Setup events
    const bankInput = div.querySelector('.contract-bank');
    const bankSuggestions = div.querySelector('.bank-suggestions');
    setupBankAutocomplete(bankInput, bankSuggestions);

    bankInput.addEventListener('input', () => {
      contract.bank = bankInput.value.trim();
      const labelEl = div.querySelector('.contract-bank-label');
      labelEl.textContent = contract.bank ? ` — ${contract.bank}` : '';
      recalcAll();
    });

    // Valor with money mask (Ajuste #2)
    const valorInput = div.querySelector('.contract-valor');
    setupMoneyMask(valorInput, (val) => {
      contract.valorRaw = val;
      recalcAll();
    });

    const parcelasInput = div.querySelector('.contract-parcelas');
    parcelasInput.addEventListener('input', () => {
      contract.parcelasRaw = parcelasInput.value;
      recalcAll();
    });

    const reducaoRadios = div.querySelectorAll('.contract-reducao');
    reducaoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        contract.opcaoReducao = parseInt(radio.value, 10);
        div.querySelectorAll('.reducao-option').forEach(opt => {
          opt.classList.remove('border-sky', 'bg-sky/15', 'text-sky');
          opt.classList.add('border-royal/40', 'text-steel');
        });
        radio.parentElement.querySelector('.reducao-option').classList.remove('border-royal/40', 'text-steel');
        radio.parentElement.querySelector('.reducao-option').classList.add('border-sky', 'bg-sky/15', 'text-sky');
        recalcAll();
      });
    });

    // Ressarcimento with money mask (Ajuste #2)
    const ressarcimentoInput = div.querySelector('.contract-ressarcimento');
    setupMoneyMask(ressarcimentoInput, (val) => {
      contract.ressarcimentoRaw = val;
      recalcAll();
    });

    div.querySelector('.btn-remove-contract').addEventListener('click', () => {
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
      valorRaw: '',
      parcelasRaw: '',
      opcaoReducao: 80,
      ressarcimentoRaw: '',
      showReducaoChoice: false,
      hasValidData: false
    };
    contracts.push(contract);
    const el = createContractElement(contract);
    contractsArea.appendChild(el);
    el.querySelector('.contract-bank').focus();
    updateContractsCount();
    recalcAll();
  }

  function removeContract(id) {
    const el = contractsArea.querySelector(`[data-contract-id="${id}"]`);
    if (!el) return;

    el.classList.add('contract-exit');
    setTimeout(() => {
      const idx = contracts.findIndex(c => c.id === id);
      if (idx !== -1) contracts.splice(idx, 1);
      el.remove();
      contracts.forEach((c, i) => {
        c.number = i + 1;
      });
      const cards = contractsArea.querySelectorAll('[data-contract-id]');
      cards.forEach((card, i) => {
        const titleSpan = card.querySelector('h3 .text-sky');
        if (titleSpan) titleSpan.textContent = `Contrato ${i + 1}`;
        const toggleBtn = card.querySelector('.btn-toggle-contract');
        if (toggleBtn) toggleBtn.setAttribute('aria-label', `Recolher ou expandir Contrato ${i + 1}`);
        const removeBtn = card.querySelector('.btn-remove-contract');
        if (removeBtn) removeBtn.setAttribute('aria-label', `Remover Contrato ${i + 1}`);
      });
      updateContractsCount();
      recalcAll();
    }, 190);
  }

  function updateContractsCount() {
    if (contractsCount) {
      contractsCount.textContent = contracts.length > 0 ? `(${contracts.length})` : '';
    }
  }

  // ===== Core recalculation =====
  function recalcAll() {
    let totalEconomiaMensalCents = 0;
    let totalEconomiaProjetadaCents = 0;
    let totalRessarcimentosCents = 0;
    let hasAnyValidContract = false;

    contracts.forEach(contract => {
      const el = contractsArea.querySelector(`[data-contract-id="${contract.id}"]`);
      if (!el) return;

      const valorParsed = parseMoney(contract.valorRaw);
      const parcelasParsed = parseInteger(contract.parcelasRaw);
      const ressarcimentoParsed = parseMoney(contract.ressarcimentoRaw);

      // Validate valor
      const valorError = el.querySelector('.contract-valor-error');
      if (contract.valorRaw && contract.valorRaw.trim() !== '') {
        if (isNaN(valorParsed)) {
          valorError.textContent = 'Valor inválido.';
          valorError.classList.add('is-shown');
        } else {
          valorError.textContent = '';
          valorError.classList.remove('is-shown');
        }
      } else {
        valorError.textContent = '';
        valorError.classList.remove('is-shown');
      }

      // Validate parcelas
      const parcelasError = el.querySelector('.contract-parcelas-error');
      if (contract.parcelasRaw && contract.parcelasRaw.trim() !== '') {
        if (isNaN(parcelasParsed)) {
          parcelasError.textContent = 'Número inteiro >= 0.';
          parcelasError.classList.add('is-shown');
        } else {
          parcelasError.textContent = '';
          parcelasError.classList.remove('is-shown');
        }
      } else {
        parcelasError.textContent = '';
        parcelasError.classList.remove('is-shown');
      }

      // Show/hide reducao choice
      const reducaoWrapper = el.querySelector('.contract-reducao-wrapper');
      if (!isNaN(valorParsed) && valorParsed < 500) {
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

        const parcelas = isNaN(parcelasParsed) ? 0 : parcelasParsed;
        contract.economiaProjetadaCents = result.economiaPorParcelaCents * parcelas;
        contract.parcelasRestantes = parcelas;

        el.querySelector('.contract-result-reducao').textContent = formatMoney(fromCents(result.reducaoAplicadaCents));
        el.querySelector('.contract-result-nova').textContent = formatMoney(fromCents(result.parcelaReduzidaCents));
        el.querySelector('.contract-result-economia').textContent = formatMoney(fromCents(result.economiaPorParcelaCents));
        el.querySelector('.contract-result-projecao').textContent = formatMoney(fromCents(contract.economiaProjetadaCents));

        resultsEl.classList.remove('hidden');
        contract.hasValidData = true;
        hasAnyValidContract = true;

        totalEconomiaMensalCents += result.economiaPorParcelaCents;
        totalEconomiaProjetadaCents += contract.economiaProjetadaCents;
      } else {
        resultsEl.classList.add('hidden');
        contract.hasValidData = false;
        contract.reducaoAplicadaCents = 0;
        contract.parcelaReduzidaCents = 0;
        contract.economiaPorParcelaCents = 0;
        contract.economiaProjetadaCents = 0;
        contract.parcelasRestantes = 0;
      }

      // Ressarcimento
      if (!isNaN(ressarcimentoParsed)) {
        contract.ressarcimentoCents = toCents(ressarcimentoParsed);
        totalRessarcimentosCents += contract.ressarcimentoCents;
      } else {
        contract.ressarcimentoCents = 0;
      }
    });

    totalEconomiaMensal.textContent = formatMoney(fromCents(totalEconomiaMensalCents));
    totalEconomiaProjetada.textContent = formatMoney(fromCents(totalEconomiaProjetadaCents));
    totalRessarcimentos.textContent = formatMoney(fromCents(totalRessarcimentosCents));

    updateProposal(hasAnyValidContract, totalEconomiaMensalCents, totalEconomiaProjetadaCents, totalRessarcimentosCents);
    updateButtonStates(hasAnyValidContract);
  }

  // ===== Proposal text generation =====
  function getReductionLabel(valorCents, opcao) {
    const valor = fromCents(valorCents);
    if (valor < 500) {
      return `R$ ${opcao === 60 ? '60' : '80'},00`;
    } else if (valor < 1000) {
      return 'R$ 100,00';
    } else {
      return `10% (${formatMoney(fromCents(Math.round(valorCents * 0.10)))})`;
    }
  }

  function buildProposalText(totalEconomiaMensalCents, totalEconomiaProjetadaCents, totalRessarcimentosCents) {
    const clientName = clientNameInput ? clientNameInput.value.trim() : '';

    let greeting;
    if (clientName) {
      greeting = `Olá, ${clientName}! Tudo bem? 😊`;
    } else {
      greeting = `Olá! Tudo bem? 😊`;
    }

    const validContracts = contracts.filter(c => c.hasValidData);
    if (validContracts.length === 0) return '';

    let text = `${greeting}\nÉ o Lucas que conversou com você em ligação 📞\n\n`;
    text += `Conforme combinamos, seguem as condições que consegui para você:\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📌 *OPÇÃO 1 — REDUÇÃO DE PARCELA*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    validContracts.forEach(c => {
      const bankLabel = c.bank ? ` — ${c.bank}` : '';
      const valorAtualCents = toCents(parseMoney(c.valorRaw));
      text += `📋 *Contrato ${c.number}${bankLabel}*\n`;
      text += `• Parcela atual: ${formatMoney(fromCents(valorAtualCents))}\n`;
      text += `• Nova parcela: ${formatMoney(fromCents(c.parcelaReduzidaCents))}\n`;
      text += `• Economia por parcela: ${formatMoney(fromCents(c.economiaPorParcelaCents))}\n`;
      if (c.parcelasRestantes > 0) {
        text += `• Parcelas restantes: ${c.parcelasRestantes}\n`;
        text += `• Economia estimada: ${formatMoney(fromCents(c.economiaProjetadaCents))}\n`;
      }
      text += `\n`;
    });

    text += `💰 *Economia mensal total: ${formatMoney(fromCents(totalEconomiaMensalCents))}*\n`;
    if (totalEconomiaProjetadaCents > 0) {
      text += `💰 *Economia estimada até o fim dos contratos: ${formatMoney(fromCents(totalEconomiaProjetadaCents))}*\n`;
    }
    text += `\n`;
    text += `✅ Não tem alteração de prazo.\n`;
    text += `✅ 1 mês de carência.\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📌 *OPÇÃO 2 — RESSARCIMENTO*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const contractsWithRessarcimento = validContracts.filter(c => c.ressarcimentoCents > 0);
    if (contractsWithRessarcimento.length > 0) {
      contractsWithRessarcimento.forEach(c => {
        const bankLabel = c.bank ? ` — ${c.bank}` : '';
        text += `📋 *Contrato ${c.number}${bankLabel}*\n`;
        text += `• Valor do ressarcimento: ${formatMoney(fromCents(c.ressarcimentoCents))}\n\n`;
      });
      text += `💰 *Total liberado em ressarcimentos: ${formatMoney(fromCents(totalRessarcimentosCents))}*\n\n`;
    } else {
      text += `_Valores de ressarcimento não informados._\n\n`;
    }

    text += `✅ Até 3 meses de carência antes do primeiro desconto.\n`;
    text += `✅ Redução imediata da taxa de juros.\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Como você gostaria de prosseguir?\n\n`;
    text += `1️⃣ Opção 1 — Redução de parcela\n`;
    text += `2️⃣ Opção 2 — Ressarcimento\n`;
    text += `3️⃣ Tirar dúvidas\n\n`;
    text += `Fico à disposição! 🤝`;

    return text;
  }

  function updateProposal(hasAnyValidContract, totalEconomiaMensalCents, totalEconomiaProjetadaCents, totalRessarcimentosCents) {
    if (!hasAnyValidContract) {
      proposalPreview.innerHTML = '<p class="proposal-empty italic text-xs">Adicione contratos para visualizar a proposta...</p>';
      return;
    }

    const text = buildProposalText(totalEconomiaMensalCents, totalEconomiaProjetadaCents, totalRessarcimentosCents);
    let html = escapeHtml(text);
    html = html.replace(/\*([^*]+)\*/g, '<strong class="proposal-strong">$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    proposalPreview.innerHTML = html;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ===== Button state management =====
  function updateButtonStates(hasAnyValidContract) {
    const canCopy = hasAnyValidContract;
    const phoneResult = normalizePhone(clientPhoneInput ? clientPhoneInput.value : '');
    const canWhatsApp = hasAnyValidContract && phoneResult.valid;

    btnCopyProposal.disabled = !canCopy;
    btnOpenWhatsapp.disabled = !canWhatsApp;

    if (clientPhoneInput && clientPhoneInput.value.trim() !== '' && !phoneResult.valid) {
      phoneError.textContent = phoneResult.error;
      phoneError.classList.add('is-shown');
    } else {
      phoneError.textContent = '';
      phoneError.classList.remove('is-shown');
    }

    if (hasAnyValidContract && !canWhatsApp) {
      whatsappHint.classList.remove('hidden');
    } else {
      whatsappHint.classList.add('hidden');
    }
  }

  // ===== Event listeners =====

  // Toggle client data (smooth collapsible)
  const clientCollapsible = document.getElementById('client-collapsible');
  if (toggleClientData) {
    let clientOpen = false;
    toggleClientData.addEventListener('click', () => {
      clientOpen = !clientOpen;
      if (clientCollapsible) {
        clientCollapsible.classList.toggle('is-collapsed', !clientOpen);
      } else if (clientFields) {
        clientFields.style.display = clientOpen ? '' : 'none';
      }
      toggleClientData.setAttribute('aria-expanded', String(clientOpen));
      chevronClient.style.transform = clientOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Toggle contracts section (smooth collapsible)
  if (toggleContracts) {
    let contractsOpen = true; // starts expanded
    toggleContracts.addEventListener('click', () => {
      contractsOpen = !contractsOpen;
      if (contractsCollapsible) {
        contractsCollapsible.classList.toggle('is-collapsed', !contractsOpen);
      }
      toggleContracts.setAttribute('aria-expanded', String(contractsOpen));
      chevronContracts.style.transform = contractsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Client inputs
  if (clientNameInput) clientNameInput.addEventListener('input', () => recalcAll());
  if (clientPhoneInput) clientPhoneInput.addEventListener('input', () => recalcAll());

  // Add contract
  if (btnAddContract) btnAddContract.addEventListener('click', addContract);

  // Copy proposal
  if (btnCopyProposal) {
    btnCopyProposal.addEventListener('click', () => {
      const validContracts = contracts.filter(c => c.hasValidData);
      if (validContracts.length === 0) return;

      let totalEM = 0, totalEP = 0, totalR = 0;
      validContracts.forEach(c => {
        totalEM += c.economiaPorParcelaCents;
        totalEP += c.economiaProjetadaCents;
        totalR += c.ressarcimentoCents;
      });

      const text = buildProposalText(totalEM, totalEP, totalR);
      const plainText = text.replace(/\*/g, '').replace(/_/g, '');

      navigator.clipboard.writeText(plainText).then(() => {
        copyFeedback.textContent = '✓ Proposta copiada!';
        copyFeedback.classList.add('is-shown');
        setTimeout(() => {
          copyFeedback.classList.remove('is-shown');
          copyFeedback.textContent = '';
        }, 3000);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = plainText;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
        copyFeedback.textContent = '✓ Proposta copiada!';
        copyFeedback.classList.add('is-shown');
        setTimeout(() => {
          copyFeedback.classList.remove('is-shown');
          copyFeedback.textContent = '';
        }, 3000);
      });
    });
  }

  // Open WhatsApp
  if (btnOpenWhatsapp) {
    btnOpenWhatsapp.addEventListener('click', () => {
      const phoneResult = normalizePhone(clientPhoneInput ? clientPhoneInput.value : '');
      if (!phoneResult.valid) return;

      const validContracts = contracts.filter(c => c.hasValidData);
      if (validContracts.length === 0) return;

      let totalEM = 0, totalEP = 0, totalR = 0;
      validContracts.forEach(c => {
        totalEM += c.economiaPorParcelaCents;
        totalEP += c.economiaProjetadaCents;
        totalR += c.ressarcimentoCents;
      });

      const text = buildProposalText(totalEM, totalEP, totalR);
      const url = `https://wa.me/${phoneResult.digits}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }

  // Nova simulação
  function resetSimulation() {
    contracts = [];
    contractCounter = 0;
    contractsArea.innerHTML = '';
    if (clientNameInput) clientNameInput.value = '';
    if (clientPhoneInput) clientPhoneInput.value = '';
    if (phoneError) {
      phoneError.textContent = '';
      phoneError.classList.remove('is-shown');
    }
    updateContractsCount();
    recalcAll();
  }

  if (btnNovaSimHeader) {
    btnNovaSimHeader.addEventListener('click', () => {
      if (contracts.length === 0) return;
      if (confirm('Tem certeza que deseja limpar todos os dados e começar uma nova simulação?')) {
        resetSimulation();
      }
    });
  }

  // ===== Theme toggle (Ajuste #3) =====
  const navLogo = document.getElementById('nav-logo');
  const footerLogo = document.getElementById('footer-logo');

  // Preload light logo for instantaneous switch
  const preloadLightLogo = new Image();
  preloadLightLogo.src = 'assets/images/logonav2.png';

  if (btnToggleTheme) {
    let isLight = false;
    btnToggleTheme.addEventListener('click', () => {
      isLight = !isLight;
      document.body.classList.toggle('light-theme', isLight);

      // Update button visuals
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
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ===== Initialize with one contract =====
  addContract();

})();
