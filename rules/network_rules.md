# Regras de Rede (Unilevel) e Divisão de Taxas (PT-BR)

Este documento define as regras de ganhos do time (rede unilevel) e a divisão de valores em compras da loja e jogos PvP/Solo. Serve como referência para implementação e auditoria.

## 1) Moedas e premissas

- **Depósito do usuário:** em USD (USDT/USDC).
- **Moeda de uso interno:** **CHI**.
- **Compras e comissões:** **todas as compras são feitas em CHI** e **todas as comissões são pagas em CHI**.
- **Swap USD → CHI:** não gera comissão por si só. A comissão só é gerada quando há **compra dentro da loja** ou quando há **taxa de jogo** (PvP/Solo) conforme regras abaixo.

## 2) Rede Unilevel (Time / Sponsors)

### 2.1) Quando existe comissão de rede

A comissão de rede (time) é gerada quando um usuário **indicado pelo link do patrocinador** realiza **compra na loja** (galinhas, comida, itens etc.).

### 2.2) Percentuais por nível (5 níveis)

Em cada compra elegível na loja, o total distribuído para patrocinadores é **20%** do valor da compra (em CHI), dividido em 5 níveis:

- **Nível 1 (direto): 10%**
- **Nível 2: 5%**
- **Nível 3: 2%**
- **Nível 4: 2%**
- **Nível 5: 1%**

**Total do time (rede): 20%** do valor da compra.

### 2.3) Regras de elegibilidade

- A cadeia de pagamento segue a árvore de indicação do comprador, subindo até 5 gerações.
- Se algum nível não existir (ex.: sem patrocinador em determinado nível), o valor daquele nível fica **não distribuído ao time** e deve ser encaminhado para uma conta de “não distribuído” (ex.: **Fundo de Desenvolvimento** ou saldo corporativo), conforme decisão do produto/tesouraria.

## 3) Loja (Store): divisão das compras

Para cada compra na loja no valor **P (CHI)**:

- **Time (rede):** `P * 20%` (dividido por níveis conforme 2.2)
- **Empresa / demais destinos:** `P * 80%`

> Observação: o destino do **80%** não foi detalhado aqui; este documento apenas garante a regra do repasse de **20%** ao time em compras da loja.

### 3.1) Exemplo (compra na loja)

Compra de **P = 100 CHI**:

- Nível 1: 10 CHI
- Nível 2: 5 CHI
- Nível 3: 2 CHI
- Nível 4: 2 CHI
- Nível 5: 1 CHI
- Total time: 20 CHI
- Empresa/demais: 80 CHI

## 4) Taxas em jogos: visão geral

Há jogos em que existe uma **taxa** cobrada sobre a aposta (ou valor de entrada). Essa taxa é então dividida entre fundos e rede.

### Glossário de fundos

- **Fundo de Desenvolvimento:** manutenção/infra/expansão do produto.
- **Fundo de Marketing:** aquisição, campanhas e crescimento.
- **Fundo de Torneios (Harvest Treasury / Tournament Fund):** fundo dedicado a torneios/jackpots conforme regras do modo competitivo.

## 5) Harvest PvP (Coleta PvP): taxa e divisão

Quando um usuário joga **Harvest PvP**, ele paga uma taxa de **10% da aposta**.

Seja:
- **B** = aposta do jogador (CHI)
- **T** = taxa total = `B * 10%`

Divisão da taxa:

1) **50% da taxa (T) → Fundo de Desenvolvimento**  
   - `T * 50% = B * 5%`

2) **50% restante da taxa (T) → “pool distribuível”** (equivalente a **5% da aposta**)  
   - Pool = `T * 50% = B * 5%`  
   Esse pool (chamado aqui de **100% do pool**) é dividido assim:
   - **20% → Time (rede unilevel)**  
     - `B * 5% * 20% = B * 1%`  
     - Divisão por níveis dentro do time:
       - Nível 1: 10% do pool do time (equivale a `B * 0,5%`)
       - Nível 2: 5% do pool do time (equivale a `B * 0,25%`)
       - Nível 3: 2% do pool do time (equivale a `B * 0,10%`)
       - Nível 4: 2% do pool do time (equivale a `B * 0,10%`)
       - Nível 5: 1% do pool do time (equivale a `B * 0,05%`)
   - **50% → Fundo de Torneios (Harvest Treasury)**  
     - `B * 5% * 50% = B * 2,5%`
   - **30% → Fundo de Marketing**  
     - `B * 5% * 30% = B * 1,5%`

### 5.1) Exemplo (Harvest PvP)

Para **B = 100 CHI**:

- Taxa total T = 10 CHI
- Desenvolvimento = 5 CHI
- Pool distribuível = 5 CHI
  - Time (20% do pool) = 1 CHI
    - N1 = 0,50 CHI
    - N2 = 0,25 CHI
    - N3 = 0,10 CHI
    - N4 = 0,10 CHI
    - N5 = 0,05 CHI
  - Torneios (50% do pool) = 2,50 CHI
  - Marketing (30% do pool) = 1,50 CHI

## 6) Minigame SOLO: taxas e divisão

Em minigames **SOLO**, **100% das taxas** ficam para a empresa, divididas entre fundos:

- **70% → Fundo de Desenvolvimento**
- **30% → Fundo de Marketing**

> Não há distribuição para o time (rede) nem para fundo de torneios no SOLO, conforme regra informada.

## 7) Minigame PvP: taxa e divisão (mesma regra do Harvest PvP)

Em minigames **PvP**, cada apostador paga **10% da sua aposta** e a divisão segue o mesmo modelo do Harvest PvP:

- `B * 5%` → Desenvolvimento
- `B * 5%` → Pool distribuível
  - 20% do pool → Time (unilevel 10/5/2/2/1)
  - 50% do pool → Torneios (Harvest Treasury)
  - 30% do pool → Marketing

## 8) Harvest Treasury (Torneios / Competitive Harvest): diretrizes

Este documento estabelece **de onde vem** o Fundo de Torneios (50% do pool PvP).  
A política de distribuição do **Fundo de Torneios** deve ser detalhada no módulo “Tesouraria da Colheita / Competitive Harvest”, incluindo:

- regras de acumulação e transparência do saldo
- critérios de elegibilidade (ex.: top 10 semanal, ranking, tickets, etc.)
- data/hora do sorteio
- regra de payout (percentuais, limites, rollover, etc.)

## 9) Regras de arredondamento e auditoria

- Todas as entradas/saídas são em **CHI**.
- Recomenda-se trabalhar com unidade mínima (ex.: centésimos) para reduzir perdas por arredondamento.
- Caso haja arredondamento por nível, a diferença residual deve ir para um destino consistente e auditável (ex.: Desenvolvimento).
- Toda transação deve registrar:
  - origem (compra/jogo)
  - valor base (P ou B)
  - taxa aplicada (se existir)
  - splits calculados (time/fundos)
  - árvore de patrocinadores usada (até 5 níveis)

