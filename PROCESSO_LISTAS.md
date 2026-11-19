# Listas em PDF por aula — processo em lotes

Meta: **3 listas em PDF para cada uma das 215 aulas** (e, quando pedido, 1 caderno de gravação).
Cada aula tem o código do livro **V.M.a** (volume, módulo, aula), como `2.3.2` = Volume 2, módulo 3, aula 2. Módulos extras, que não estão no livro, usam `x1`, `x2` (ex.: `1.x1.2`). O endereço da aula é `/2/3/2/` e o do módulo, `/2/3/` (o QR code do livro aponta para ele).

- `pdfs/fixacao-V.M.a.pdf`: **lista 1, fixação**. 20 questões com espaço para resolver, do fácil ao difícil, + gabarito resolvido.
- `pdfs/vestibular-V.M.a.pdf`: **lista 2, vestibular**. 20 questões objetivas (A–E) e somatórias + gabarito resolvido.
- `pdfs/aprofundamento-V.M.a.pdf`: **lista 3, aprofundamento**. 10 questões mais puxadas, para o aluno mais avançado, com espaço para resolver + gabarito resolvido.
- `gravacao/V.M.a.pdf`: caderno de gravação em 16:9 para o professor abrir no GoodNotes. Fica fora do site (a pasta está no `.gitignore`).

O modelo de referência é a aula **2.3.2** (`materiais-fonte/2.3.2.yaml`, `padrao: 3`), e o primeiro lote no padrão é 1.1.1–1.1.6.

## Visual dos PDFs (padrão 3)
- Fundo branco, leve para imprimir em P&B; cor só em detalhes. A logo **MAT com JOÃO!** (`assets/logo-mat.png`) vai no topo da capa e, pequena, no cabeçalho das outras páginas. Para trocar a logo, troque esse arquivo.
- Capa: assunto e “aula N de M” (da página do assunto no site), título, etiqueta da lista (fixação em lima, vestibular em azul, aprofundamento em laranja), “lista N de 3”, a referência ao livro e as linhas de nome, turma e data.
- Rodapé: Prof. João Capri · @joa.capri · matmatmat.com e “página N de M”.
- Fixação e aprofundamento: duas colunas, cada questão com uma caixa pontilhada para resolver (o gerador calcula a altura; `espaco: 30` força em mm, `espaco: 0` tira).

## Quando o pedido for "faça o próximo lote"
1. `git pull` no `main` e rode `python3 scripts/gerar_listas.py --proximo`. O comando mostra as próximas aulas sem lista no padrão atual: até 6 por lote, na ordem do livro, sem atravessar o fim de um módulo. Aulas marcadas **[revisar lista antiga]** já têm uma fonte antiga (`padrao` menor que 3): aproveite as questões boas, reescreva no padrão abaixo, acrescente a lista de aprofundamento e mude para `padrao: 3`.
2. Para cada aula do lote, leia `data/aulas.json` (título e resumo) e `conteudos/V.M.a.json` (teoria). Em seguida, escreva `materiais-fonte/V.M.a.yaml` (as três listas, com `padrao: 3`), no mesmo formato da 2.3.2 e do lote 1.1.1–1.1.6. O caderno de gravação (`materiais-fonte/aulas/V.M.a.yaml`) só quando o professor pedir.
3. **Confira toda resposta por cálculo independente**, com sympy ou script próprio, antes de gerar. Se uma conta não fechar, reescreva a questão.
4. Se o caderno foi pedido, gere com `python3 scripts/gerar_aula.py 1.1.1 1.1.2 ...`. Gere e publique as listas com `python3 scripts/gerar_listas.py 1.1.1 1.1.2 ... --publicar`. O validador recusa a fonte se faltar algo ou se o gabarito estiver desequilibrado. O mesmo comando exporta as questões para a página da aula (`data/listas/V.M.a.json`) e as capas dos PDFs (`pdfs/capas/*.webp`). Esses arquivos também entram no commit.
5. Renderize as páginas (`pdftoppm -r 70 -png`) e olhe todas elas. Procure alternativas quebradas, fórmulas estouradas, título de nível sozinho no pé da coluna e páginas vazias.
6. Rode `node tests/catalogo.cjs`. Antes, instale o jsdom com `npm install --no-save --package-lock=false jsdom@26.1.0` e apague `node_modules` depois.
7. Faça o commit no `main`, com a mensagem "Listas em PDF: aulas 1.1.1–1.1.6". Antes do push, rode `git fetch origin main && git rebase origin/main`: o robô do GitHub Actions às vezes publica commits de PDFs antigos. O site publica sozinho.
8. Envie os PDFs do lote ao professor e informe o progresso (`--proximo` mostra "Aulas com listas no padrão atual: N/215").

## Padrão das questões (padrão 3)
- **Selos de nível**: **Fácil**, **Médio** e **Difícil**. Aparecem no PDF, na página da aula e no modo prova.
- Fique no conteúdo da aula e no nível dela. Não use assuntos de aulas posteriores (ex.: potências antes da aula de potenciação), exceto na lista de aprofundamento, com dica.
- **Toda resposta é conferida por cálculo independente** (sympy, `fractions`, `decimal` ou script) antes de gerar.

### Lista 1: fixação (20 questões, `fixacao.secoes`)
- Seções `Fácil` (cerca de 7), `Médio` (cerca de 8) e `Difícil` (cerca de 5), conduzindo o aluno: do reconhecimento ao uso, do guiado ao autônomo.
- **Formatos variados** (o validador exige pelo menos 3 formatos e 5 questões fora do formato aberto):
  - **aberta**: `enunciado` (+ `itens`). Itens lado a lado, cada um com sua caixa: `colunas: 2` e `espaco_item: 14`.
  - **completar**: `{{resposta}}` em qualquer texto vira um traço do tamanho da resposta. Dentro de fração, com espaço: `\dfrac{ {{3}} }{ {{8}} }`.
  - **tabela para completar**: `tabela` com `{{…}}` nas células (sem `cabecalho`, vira uma grade, como num quadrado mágico).
  - **passo a passo guiado**: `itens` com lacunas, um passo por item.
  - **V ou F**: `afirmacoes: [...]` (+ `justificar: true` para ganhar espaço).
  - **associar**: `esquerda: [...]` (numerados) e `direita: [...]` (com quadrinho).
  - **encontre o erro**: `texto` com a resolução errada de um aluno + `enunciado` pedindo o erro e a conta certa.
  - `figura` (TikZ) e `tabela` também valem aqui; sem `texto`, a figura vem depois do enunciado.
- Cada questão tem `resolucao` (passo a passo curto) e `resposta`.

### Lista 2: vestibular (20 questões, `vestibular.questoes`)
- **Autorais no estilo vestibular e Enem**. Nunca atribua a uma prova real (`PADRAO_EDITORIAL.md`).
- Mistura de perfis (o validador confere):
  - **3 a 6 somatórias** (`proposicoes` com 4 a 7 itens e `corretas: [1, 3, 4]`, as posições corretas; os códigos 01, 02, 04… e a soma saem sozinhos).
  - **pelo menos 8 contextualizadas** (texto de apoio com 120+ caracteres, tabela ou figura), algumas com bastante leitura;
  - **pelo menos 3 com tabela ou figura**;
  - **pelo menos 4 curtas e diretas**, sem texto de apoio.
- Objetivas com 5 alternativas distintas; cada letra correta aparece de 2 a 5 vezes. Distratores ligados a erros comuns; números em ordem crescente quando possível.
- `nivel: facil | medio | dificil` em cada questão; sem o campo, vale a posição (1–7, 8–14, 15–20). Ordem: alterne direta e longa, com as mais trabalhosas no fim.

### Lista 3: aprofundamento (10 questões, `aprofundamento.questoes`)
- Questões mais puxadas, para o aluno mais avançado: estilo segunda fase (Unicamp, Fuvest, UFPR) e olimpíada (OBMEP). Provas curtas (“mostre que…”), generalizações, truques de cálculo, problemas com mais de uma etapa.
- Mesmos campos da fixação (sem seções e sem selo). Espaço maior para resolver.

### Escrita
- Matemática em LaTeX (`$...$`). Decimal com vírgula: `$0{,}5$`. Fração no texto: `\tfrac`; fração grande: `\dfrac` ou `\[ ... \]`.
- Na fonte YAML, use aspas simples nas linhas com LaTeX; textos longos em bloco `|`.
- Português do Brasil, frases diretas, sem gírias. Aspas tipográficas “ ”.

## Arquivos
- `materiais-fonte/V.M.a.yaml`: fonte das três listas (`padrao: 3`, `fixacao`, `vestibular`, `aprofundamento`), a única coisa a escrever por aula.
- `scripts/gerar_listas.py`: diagramação em XeLaTeX (fontes Inter + Latin Modern Math), validação e publicação em `data/materiais.json`.
- `scripts/exportar_listas.py`: gera `data/listas/V.M.a.json` (exercícios do Pratique e questões do Modo prova na página da aula) e as capas `pdfs/capas/{fixacao,vestibular}-V.M.a.webp`. Roda sozinho no fim do `gerar_listas.py`; para reexportar à mão, `python3 scripts/exportar_listas.py 2.3.2`.
- `scripts/gerar_pdfs.py`: gerador antigo, que faz as listas curtas a partir do campo `lista` de `conteudos/*.json`. Não é usado para estas listas; não preencha esse campo.
- `scripts/gerar_paginas.py`: recria as páginas `/V/`, `/V/M/` e `/V/M/a/` a partir de `data/aulas.json`. Rode quando mudar aulas ou módulos.

## Caderno de gravação (GoodNotes)
PDF 16:9 (254 × 142,9 mm), uma ideia por página, com quadro pontilhado para escrever durante a gravação. O roteiro fica em `materiais-fonte/aulas/V.M.a.yaml`:
- `objetivos`: 3 ou 4 frases curtas (aparecem na capa).
- `abertura`: uma situação ou pergunta que a aula vai responder (`titulo`, `texto`, `pergunta`).
- `blocos`, na ordem da gravação:
  - `teoria`: `titulo`, `texto`, `formulas`, `dica` (macete) e `atencao` (armadilha de prova). Texto à esquerda, quadro à direita.
  - `exemplo`: `enunciado` e `resposta`. Enunciado no topo e a página inteira para resolver.
  - `exercicios`: 1 a 3 itens (`enunciado`, `resposta`) lado a lado, cada um com o seu quadro.
  - `retorno`: volta à pergunta da abertura, agora com a ferramenta da aula.
- `resumo`: 3 a 5 frases para completar.
- Lacunas: `{{resposta}}` em qualquer texto ou fórmula vira um traço para preencher ao vivo. As respostas, a dos exemplos e a dos exercícios vão para o **gabarito do professor**, nas últimas páginas.
- Roteiro típico: abertura, 3 a 4 blocos de teoria intercalados com exemplos, 2 páginas de “Sua vez”, retorno, resumo. De 14 a 20 páginas.
- A marca é um único comando (`\marca`, em `scripts/gerar_aula.py` e `\matlogo` em `scripts/gerar_listas.py`). Para trocar a logo, mude só esses comandos e gere de novo.
