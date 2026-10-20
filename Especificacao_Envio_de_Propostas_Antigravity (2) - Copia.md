# Especificação do projeto — Envio de Propostas

**Versão:** 1.1 — especificação definitiva com regras matemáticas detalhadas  
**Status:** requisitos e decisões finais consolidados; projeto ainda não deve ser modificado  
**Objetivo:** servir como especificação oficial do Envio de Propostas e como instrução de trabalho para o Antigravity. Na primeira etapa, o Antigravity deverá apenas inspecionar o projeto e apresentar seu plano de implementação, sem editar ou criar arquivos até receber autorização explícita.

## 1. Objetivo do produto

Criar uma ferramenta web pública chamada **Envio de Propostas**, integrada à seção **Serviços** do site existente. A ferramenta será usada durante ligações comerciais para simular, em tempo real, reduções de parcelas e valores de ressarcimento de vários contratos de um mesmo cliente. Ao fim da ligação, permitirá montar uma proposta com as duas alternativas, copiar a mensagem ou abrir o WhatsApp para revisão e envio manual.

A prioridade operacional é a **simulação ao vivo durante a ligação**; o preenchimento dos dados necessários para a proposta pode ocorrer antes ou depois da simulação.

## 2. Diretrizes obrigatórias de implementação

1. **Etapa inicial obrigatória e sem alterações:** analisar a estrutura real do projeto, incluindo `index.html`, `css/style.css`, `js/main.js` e quaisquer arquivos relevantes identificados no repositório. Depois, apresentar um resumo da arquitetura atual, os arquivos que provavelmente precisarão ser alterados e um plano de implementação. Aguardar autorização explícita antes de criar, editar, mover ou excluir qualquer arquivo.
2. O site usa **HTML, CSS e JavaScript puros**. Manter essa arquitetura e integrar a ferramenta ao padrão já existente do site.
3. Preservar a identidade visual, os estilos, a navegação e as animações já existentes. Não reescrever ou substituir partes não relacionadas ao projeto.
4. A ferramenta será de acesso público, sem conta ou autenticação.
5. Não introduzir bibliotecas, frameworks ou dependências novas sem necessidade comprovada; priorizar os recursos já utilizados pelo site.
6. Não alterar funcionalidades, páginas, estilos ou animações que não sejam necessários para integrar o Envio de Propostas.
7. O processamento será feito inteiramente no navegador. Não criar backend, API, banco de dados ou dependência de servidor para os cálculos.
8. Manter os dados apenas na memória JavaScript durante a sessão da página. **Não usar** `localStorage`, `sessionStorage`, cookies, IndexedDB ou query strings/GET para guardar dados.
9. Ao atualizar ou fechar a página, os dados da simulação devem ser perdidos. Não enviar valores de cliente/contratos a serviços externos durante o uso normal da ferramenta. Ao clicar para abrir o WhatsApp, o telefone e a mensagem serão incluídos no link de destino para preencher a conversa, conforme solicitado.
10. Todos os cálculos, totais, prévia da proposta e validações devem atualizar automaticamente quando os campos forem alterados.
11. Não realizar envio automático de mensagem. A pessoa usuária deverá revisar e enviar manualmente no WhatsApp.
12. Usar formatação monetária brasileira (`R$`, separador decimal por vírgula e milhares por ponto) e validar entradas numéricas. Evitar erros de arredondamento monetário usando centavos inteiros ou estratégia decimal segura.

## 3. Layout e experiência de uso

### Desktop

- Layout em duas áreas lado a lado:
  - **Área esquerda:** simulação e blocos dos contratos.
  - **Área direita:** resultados consolidados e prévia da mensagem de WhatsApp atualizada em tempo real.
- A simulação deve ter prioridade visual sobre os dados de identificação do cliente.
- Exibir os indicadores principais de modo fácil de consultar durante uma ligação.

### Celular

- Adaptar o layout para telas estreitas, mantendo todos os campos e ações utilizáveis.
- Reorganizar as áreas em coluna, evitando rolagem horizontal e preservando a fácil consulta dos totais e da prévia.

### Atualização

- Alterações nos valores, bancos, quantidades restantes, regras de redução, ressarcimentos, inclusão ou exclusão de contratos devem atualizar imediatamente os cálculos e a prévia.
- Não exigir um botão de “calcular” para atualizar os resultados.

## 4. Dados da simulação

### Dados do cliente

- **Nome:** opcional; pode ser informado a qualquer momento. Se preenchido, personaliza a saudação da proposta. Se estiver vazio, gerar uma saudação genérica, sem deixar marcador vazio.
- **Telefone/WhatsApp:** opcional durante a simulação. Se informado, será usado para construir o link de abertura da conversa com a mensagem preenchida. A falta de telefone não deve impedir a cópia da proposta.

### Contratos

- A simulação pode ter vários contratos.
- Cada contrato aparece em um bloco independente.
- Os contratos recebem identificação automática por número, por exemplo, **Contrato 1 — Itaú**, **Contrato 2 — Itaú**. Não haverá campo para apelido/descrição personalizada.
- Cada bloco terá:
  1. Banco, por meio de campo de texto livre com sugestões de autocomplete por proximidade do texto digitado. As sugestões devem vir de uma lista local em JavaScript com instituições financeiras brasileiras comuns, sem chamadas a APIs externas. O usuário também poderá manter um nome digitado que não esteja nas sugestões.
  2. Valor atual da parcela mensal.
  3. Quantidade de parcelas restantes (não solicitar total original do contrato nem número de parcelas já pagas).
  4. Escolha individual da redução de **R$ 60,00 ou R$ 80,00** quando a parcela for inferior a R$ 500,00. Em cada contrato novo, **R$ 80,00 deve vir pré-selecionado**, mas a pessoa usuária poderá trocar para R$ 60,00. A escolha deve continuar sendo individual por contrato.
  5. Valor aproximado do ressarcimento daquele contrato.
- Deve ser possível adicionar, editar e excluir contratos durante a simulação.
- Ao excluir ou corrigir um contrato, todos os cálculos dependentes devem ser recalculados na hora.

## 5. Regras para redução de parcela

Reproduzir a lógica `calcular_nova_parcela(valor)` do script Python de referência, adaptando apenas a escolha individual de R$ 60,00/R$ 80,00 definida para o SaaS.

Aplicar as regras abaixo individualmente a cada contrato:

1. Se o valor atual for **inferior a R$ 500,00**, aplicar a redução escolhida para esse contrato: **R$ 60,00 ou R$ 80,00**. Em contratos novos, R$ 80,00 vem pré-selecionado; a pessoa usuária pode selecionar R$ 60,00.
2. Se o valor atual for **maior ou igual a R$ 500,00 e inferior a R$ 1.000,00**, aplicar redução fixa de **R$ 100,00**.
3. Se o valor atual for **maior ou igual a R$ 1.000,00**, aplicar redução de **10% do valor atual**.
4. Calcular a parcela reduzida como `max(0, valor_atual - reducao_aplicada)`. A parcela reduzida nunca pode ficar negativa.
5. Calcular a economia efetiva por pagamento como `valor_atual - parcela_reduzida`. Por isso, se a parcela atual for menor do que a redução escolhida, a economia efetiva será limitada ao valor original da parcela.

### Fórmulas oficiais

Para cada contrato `i`:

- `reducao_aplicada_i` = redução definida pelas faixas acima.
- `parcela_reduzida_i` = `max(0, valor_atual_i - reducao_aplicada_i)`.
- `economia_por_parcela_i` = `valor_atual_i - parcela_reduzida_i`.
- `economia_projetada_i` = `economia_por_parcela_i × parcelas_restantes_i`.

Nos casos de redução percentual, `reducao_aplicada_i = valor_atual_i × 0,10`. Os cálculos devem utilizar precisão monetária segura, evitando erros de ponto flutuante. Valores de moeda devem ser tratados e exibidos com duas casas decimais, usando uma regra de arredondamento consistente.

### Casos de referência para validar a lógica

| Valor atual | Regra de redução | Redução nominal | Parcela reduzida esperada |
|---:|---|---:|---:|
| R$ 50,00 | Abaixo de R$ 500,00; opção R$ 80,00 | R$ 80,00 | R$ 0,00 |
| R$ 499,99 | Abaixo de R$ 500,00; opção R$ 60,00 | R$ 60,00 | R$ 439,99 |
| R$ 499,99 | Abaixo de R$ 500,00; opção R$ 80,00 | R$ 80,00 | R$ 419,99 |
| R$ 500,00 | De R$ 500,00 até menos de R$ 1.000,00 | R$ 100,00 | R$ 400,00 |
| R$ 999,99 | De R$ 500,00 até menos de R$ 1.000,00 | R$ 100,00 | R$ 899,99 |
| R$ 1.000,00 | A partir de R$ 1.000,00 | 10% = R$ 100,00 | R$ 900,00 |
| R$ 1.200,00 | A partir de R$ 1.000,00 | 10% = R$ 120,00 | R$ 1.080,00 |

Para a parcela de R$ 50,00 com redução escolhida de R$ 80,00, a economia efetiva é R$ 50,00, pois a parcela reduzida é limitada a zero; não deve ser contabilizada uma economia de R$ 80,00.

### Compatibilidade com o script original

O script original usa R$ 80,00 para valores abaixo de R$ 500,00, R$ 100,00 para valores de R$ 500,00 a menos de R$ 1.000,00 e 10% para valores a partir de R$ 1.000,00. A única alteração nessa regra-base é permitir que a pessoa usuária selecione R$ 60,00 ou R$ 80,00 individualmente para cada contrato abaixo de R$ 500,00, com R$ 80,00 pré-selecionado.

No script Python original, `economia_total` é calculada a partir da parcela principal, enquanto parcelas adicionais são exibidas no texto sem serem incorporadas a esse total. **O SaaS não deve reproduzir essa limitação:** todos os contratos válidos da simulação devem contribuir para os indicadores consolidados descritos na seção 6.

## 6. Indicadores em tempo real

### Por contrato

Mostrar, no mínimo:

- Banco e número do contrato.
- Valor atual da parcela.
- Redução aplicada.
- Novo valor da parcela.
- Economia por parcela.
- Quantidade de parcelas restantes.
- Economia estimada até o fim daquele contrato: economia por parcela × parcelas restantes.
- Valor de ressarcimento informado para aquele contrato.

### Consolidados

1. **Economia mensal total** = soma das economias por parcela de todos os contratos.
2. **Economia estimada até o fim dos contratos** = soma, para cada contrato, de (economia por parcela × parcelas restantes daquele contrato). Não multiplicar a economia mensal consolidada pela quantidade restante de apenas um contrato, pois os contratos podem ter prazos diferentes.
3. **Total liberado em ressarcimentos** = soma dos valores de ressarcimento informados para cada contrato.

Os três indicadores devem atualizar durante o preenchimento.

## 7. Proposta final para WhatsApp

A proposta deverá apresentar **sempre as duas alternativas**:

### Opção 1 — Redução de parcela

- Detalhar cada contrato individualmente: banco, número do contrato, parcela atual, parcela reduzida, economia por parcela e parcelas restantes/projeção daquele contrato.
- Mostrar a economia mensal total consolidada.
- Mostrar a economia estimada até o fim dos contratos.
- Manter as condições do texto original:
  - “Não tem alteração de prazo.”
  - “1 mês de carência.”

### Opção 2 — Ressarcimento

- Detalhar o valor de ressarcimento de cada contrato.
- Mostrar o total liberado, resultante da soma dos ressarcimentos individuais.
- Usar o texto genérico, sem mencionar um mês específico:
  - “Até 3 meses de carência antes do primeiro desconto.”
  - “Redução imediata da taxa de juros.”

### Tom e encerramento

- Preservar o tom e a estrutura comercial do script original, incluindo a identificação “É o Lucas que conversou com você em ligação 📞” quando aplicável.
- Encerrar perguntando como o cliente deseja prosseguir e oferecendo:
  1. Opção 1 — Redução de parcela
  2. Opção 2 — Ressarcimento
  3. Tirar dúvidas
- Substituir referências fixas a meses, como “janeiro”, pela frase genérica acordada.
- Gerar a prévia enquanto os dados são preenchidos.

## 8. Copiar e abrir o WhatsApp

Disponibilizar duas ações no encerramento:

1. **Copiar proposta:** copiar a mensagem completa para a área de transferência. Esse recurso deve continuar habilitado mesmo quando o telefone estiver vazio ou inválido, desde que a proposta possa ser gerada.
2. **Abrir WhatsApp:** criar um link `wa.me` com a mensagem codificada e direcionar para o telefone informado. **Se o telefone estiver vazio ou não passar na validação, desabilitar esta ação** e explicar que é necessário informar um telefone válido; a opção de copiar permanece disponível.
3. **Normalização do telefone brasileiro:** aceitar telefone brasileiro com DDD, com ou sem espaços, parênteses, hífen ou sinal de `+`. Remover símbolos antes de validar. Se forem informados DDD e número nacional sem código de país, acrescentar o código `55` uma única vez. Se o código `55` já estiver presente, não o duplicar. Para compor `wa.me`, usar somente dígitos no caminho do telefone, sem `+`, espaços ou pontuação. Validar o formato e apresentar uma mensagem clara se o número estiver incompleto ou inválido.

O telefone deve permanecer apenas em memória na página. Não o incluir na URL da página do próprio site nem armazená-lo de forma persistente. O telefone e o texto só devem ser passados ao WhatsApp quando a pessoa usuária acionar explicitamente o botão de abertura.

## 9. Nova simulação

- Incluir botão **“Nova simulação”**.
- Antes de apagar os dados, solicitar confirmação.
- Se confirmado, limpar nome, telefone, todos os contratos, valores, cálculos e prévia, sem precisar recarregar a página.
- Se cancelado, manter a simulação atual intacta.

## 10. Validação, leitura dos valores e prevenção de erros

### Entrada e interpretação de valores monetários

- Aceitar valores digitados em formato brasileiro, incluindo entradas como `611,32`, `1.234,56` e entradas com prefixo `R$` e espaços.
- Normalizar a entrada antes do cálculo: remover o prefixo `R$` e espaços; quando houver vírgula decimal, remover pontos de milhar e converter a vírgula para o separador decimal interno.
- Validar se o valor resultante é numérico e não negativo. Entradas vazias não devem ser tratadas como zero silenciosamente quando esse campo for necessário para concluir um cálculo ou gerar a proposta.
- Exibir todos os valores em formato brasileiro, por exemplo `R$ 1.234,56`, com duas casas decimais, ponto para milhares e vírgula decimal.
- Utilizar centavos inteiros ou outro método de precisão monetária segura para evitar erros de ponto flutuante em somas e multiplicações. Aplicar uma regra de arredondamento consistente a valores monetários exibidos.

### Quantidade de parcelas restantes

- Solicitar somente a **quantidade de parcelas restantes** de cada contrato. Não solicitar total original do contrato nem parcelas já pagas.
- A quantidade deve ser um número inteiro maior ou igual a zero. Rejeitar valores negativos, decimais ou texto inválido.
- Calcular `economia_projetada_i = economia_por_parcela_i × parcelas_restantes_i`.
- Se a quantidade restante for zero, a projeção daquele contrato será zero. A economia mensal consolidada continuará seguindo a regra explícita da seção 6: soma das economias por parcela dos contratos incluídos na simulação.

### Validações gerais

- Validar valores monetários e quantidades antes de gerar/abrir a proposta.
- Tratar campos vazios como não preenchidos, sem exibir `NaN`, `undefined` ou valores monetários incorretos.
- Não calcular totais finais a partir de campos inválidos. Identificar claramente o contrato/campo a corrigir.
- Permitir a simulação incremental sem exigir nome ou telefone no início.
- Dar mensagens claras para campos incorretos e evitar apagar os dados já preenchidos por engano.
- Garantir que contratos com prazo diferente sejam projetados individualmente.
- Aplicar a redução de R$ 60,00/R$ 80,00 somente para valores estritamente inferiores a R$ 500,00; em R$ 500,00 exatos, a redução será R$ 100,00.
- Aplicar a redução percentual de 10% em R$ 1.000,00 exatos e valores superiores.

## 11. Critérios de aceite

A implementação estará pronta para revisão quando:

- [ ] A ferramenta estiver integrada à seção Serviços e usar HTML/CSS/JS existentes.
- [ ] A identidade visual do site tiver sido preservada.
- [ ] A interface funcionar em desktop e celular.
- [ ] Todos os cálculos atualizarem ao vivo.
- [ ] A redução individual de R$ 60/R$ 80 puder ser escolhida para cada parcela abaixo de R$ 500, com R$ 80 pré-selecionado nos contratos novos e possibilidade de trocar para R$ 60.
- [ ] Os critérios de R$ 100 e 10% funcionarem nos intervalos definidos, incluindo os limites exatos de R$ 500,00 e R$ 1.000,00.
- [ ] Os casos matemáticos de referência da seção 5 passarem, incluindo valor de parcela inferior à redução escolhida.
- [ ] A leitura dos valores em formato brasileiro interpretar corretamente exemplos como `611,32`, `1.234,56` e `R$ 1.234,56`.
- [ ] Valores negativos, quantidades fracionárias e campos inválidos serem rejeitados com mensagens claras.
- [ ] A economia mensal total for a soma das economias individuais.
- [ ] A projeção final for a soma da economia individual vezes as parcelas restantes de cada contrato.
- [ ] O total liberado for a soma dos ressarcimentos individuais.
- [ ] Adicionar, editar e excluir contratos atualizar todos os resultados e a mensagem.
- [ ] A proposta incluir as duas alternativas e detalhar cada contrato.
- [ ] Copiar a proposta funcionar.
- [ ] Abrir o WhatsApp funcionar sem enviar mensagem automaticamente.
- [ ] O botão de abrir WhatsApp ficar desabilitado quando o telefone estiver ausente ou inválido, mantendo a cópia da proposta disponível.
- [ ] Telefones brasileiros serem normalizados corretamente: remover símbolos, validar DDD/número e acrescentar `55` quando o código do país não estiver presente, sem duplicá-lo.
- [ ] Não houver persistência de dados em banco, servidor, cookies ou armazenamento persistente do navegador.
- [ ] “Nova simulação” limpar os dados apenas após confirmação.
- [ ] As entradas vazias ou inválidas não quebrem a interface nem gerem totais incorretos.

## 12. Instrução definitiva para o Antigravity

Use este documento como fonte oficial dos requisitos. Não reabra decisões já definidas sem identificar um conflito técnico real.

### Fase 1 — análise sem modificar o projeto

Na primeira execução, faça somente o seguinte:

1. Inspecione a estrutura e os arquivos existentes.
2. Identifique como a navegação da seção **Serviços** é implementada e qual é o padrão visual e responsivo utilizado.
3. Explique onde e como a página/ferramenta poderá ser integrada, citando os arquivos específicos do projeto.
4. Informe riscos ou conflitos encontrados com esta especificação e proponha um plano de implementação em etapas.
5. **Pare e aguarde autorização explícita. Não edite, crie, mova ou exclua arquivos nesta fase.**

### Fase 2 — implementação, somente após autorização

Quando houver autorização explícita para implementar:

1. Implementar os requisitos deste documento, preservando os padrões existentes do site.
2. Fazer alterações pequenas e específicas; não refatorar partes não relacionadas.
3. Validar os cálculos com casos de teste nos limites de R$ 499,99, R$ 500,00, R$ 999,99 e R$ 1.000,00, bem como parcelas cujo valor seja menor que a redução escolhida.
4. Testar várias contas/contratos com quantidades diferentes de parcelas restantes; testar inclusão, edição e exclusão; e verificar se a prévia e todos os totais se atualizam corretamente.
5. Testar telefone ausente, telefone brasileiro com pontuação, número já iniciado por `55` e número inválido. A ação de abrir o WhatsApp deve permanecer indisponível sem telefone válido, sem afetar a cópia da proposta.
6. Verificar responsividade, console do navegador, links de navegação e possíveis regressões nas páginas existentes.
7. Ao concluir, relatar os arquivos alterados, o que foi implementado, os testes realizados e quaisquer limitações restantes. Não alegar que testes foram executados se não foram.

### Regras de precedência

- A privacidade e o processamento local são requisitos obrigatórios.
- A identidade visual existente deve ser preservada.
- A simulação ao vivo tem prioridade sobre o fluxo de geração da mensagem.
- Os cálculos consolidados devem ser derivados dos contratos individuais, nunca mantidos em valores paralelos que possam ficar desatualizados.
- Não enviar mensagens automaticamente nem salvar dados da simulação.
- Não executar a Fase 2 sem autorização explícita.

## 13. Decisões finais incorporadas

As seguintes decisões estão confirmadas e não estão pendentes:

- Para parcelas abaixo de R$ 500,00, cada contrato permite escolher R$ 60,00 ou R$ 80,00; **R$ 80,00 vem pré-selecionado** em cada contrato novo.
- Sem telefone preenchido ou válido, o botão de abrir o WhatsApp fica desabilitado; copiar a proposta continua disponível.
- O telefone será tratado como número brasileiro com DDD. A aplicação remove espaços e símbolos, acrescenta o código `55` quando necessário e evita duplicá-lo se já estiver presente. No link `wa.me`, o número é representado somente por dígitos.
- A pessoa usuária escolheu numeração automática de contratos, sem descrição personalizada.
- A proposta sempre exibirá as duas alternativas e o detalhamento por contrato.
- Nenhuma modificação ao projeto está autorizada nesta etapa.
