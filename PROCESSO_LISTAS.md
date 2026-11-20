# Listas em PDF por aula — processo em lotes

Meta: **3 listas em PDF para cada uma das 215 aulas** (e, quando pedido, 1 caderno de gravação).
Cada aula tem o código do livro **V.M.a** (volume, módulo, aula), como `2.3.2` = Volume 2, módulo 3, aula 2. Módulos extras, que não estão no livro, usam `x1`, `x2` (ex.: `1.x1.2`). O endereço da aula é `/2/3/2/` e o do módulo, `/2/3/` (o QR code do livro aponta para ele).

- `pdfs/fixacao-V.M.a.pdf`: **lista 1, fixação**. 20 questões com espaço para resolver, do fácil ao difícil, + gabarito resolvido.
- `pdfs/vestibular-V.M.a.pdf`: **lista 2, vestibular**. 20 questões no formato das provas reais (Enem, Fuvest, Unicamp, UEM, UEL…) + gabarito resolvido.
- `pdfs/aprofundamento-V.M.a.pdf`: **lista 3, aprofundamento**. 10 questões mais puxadas (discursivas de 2ª fase e objetivas difíceis), com espaço para resolver + gabarito resolvido.
- `gravacao/V.M.a.pdf`: caderno de gravação em 16:9 para o professor abrir no GoodNotes. Fica fora do site (a pasta está no `.gitignore`).

**Padrão atual: 4** (aprovado pelo professor em 19/11/2026). Modelos de referência:
- vestibular e aprofundamento: aula **1.21.3** (`materiais-fonte/1.21.3.yaml`), o modelo do formato de prova real;
- fixação: aulas **2.3.2** e **1.1.1–1.1.6** (a fixação não mudou do padrão 3 para o 4).

As aulas que estão no padrão 3 (1.1.1–1.1.6 e 2.3.2) aparecem como **[revisar lista antiga]**: mantenha a fixação e reescreva vestibular e aprofundamento no padrão 4.

## Visual dos PDFs
- Fundo branco, leve para imprimir em P&B; cor só em detalhes. A logo **MAT com JOÃO!** (`assets/logo-mat-pdf.png`, versão leve de `assets/logo-mat.png`) vai no topo da capa e, pequena, no cabeçalho das outras páginas. Para trocar a logo, troque esse arquivo.
- Capa enxuta: logo, assunto e “aula N de M” (da página do assunto no site), título e a etiqueta da lista (fixação em lima, vestibular em azul, aprofundamento em laranja). Sem nome/turma/data, sem contagem de questões e sem texto de introdução.
- Faixa do material impresso logo abaixo, centralizada (aprovada pelo professor em 20/11/2026): desenho de livro aberto, “Este assunto está no **Volume V** do material impresso”, embaixo “Módulo M · aula V.M.a”, e à direita o botão roxo “Adquira já em matcomjoao.com” (a faixa inteira é link para matcomjoao.com/livros). Módulos extras, que não estão no livro, ficam sem faixa.
- Rodapé: Prof. João Capri · matcomjoao.com (sem Instagram) e “página N de M”. O site do rodapé é a constante `SITE` em `scripts/gerar_listas.py`.
- Fixação e aprofundamento: duas colunas, cada questão com uma caixa pontilhada para resolver (o gerador calcula a altura; `espaco: 30` força em mm, `espaco: 0` tira).
- Vestibular (padrão 4): duas colunas, como numa prova. Faixas “Nível 1 · questões 1 a 7” separam os níveis (sem selo em cada questão). As alternativas ficam **uma embaixo da outra** (decisão do professor) e nunca se separam do enunciado; uma questão longa pode continuar na outra coluna. **Não há rótulo de banca impresso** (o professor não quer “estilo Enem” nas questões): o campo `estilo` é só controle interno.

## Quando o pedido for "faça o próximo lote"
1. `git pull` no `main` e rode `python3 scripts/gerar_listas.py --proximo`. O comando mostra as próximas aulas sem lista no padrão atual: até 6 por lote, na ordem do livro, sem atravessar o fim de um módulo. Aulas marcadas **[revisar lista antiga]** já têm uma fonte antiga (`padrao` menor que 4): aproveite as questões boas, reescreva no padrão abaixo (as três listas) e mude para `padrao: 4`.
2. Para cada aula do lote, leia `data/aulas.json` (título e resumo) e `conteudos/V.M.a.json` (teoria). Em seguida, escreva `materiais-fonte/V.M.a.yaml` (as três listas, com `padrao: 4`): fixação no formato da 2.3.2; vestibular e aprofundamento no formato da 1.21.3. Só publique com as três listas (o `--publicar` recusa menos que isso). O caderno de gravação (`materiais-fonte/aulas/V.M.a.yaml`) só quando o professor pedir.
3. **Confira toda resposta por cálculo independente**, com sympy ou script próprio, antes de gerar. Se uma conta não fechar, reescreva a questão.
4. Se o caderno foi pedido, gere com `python3 scripts/gerar_aula.py 1.1.1 1.1.2 ...`. Gere e publique as listas com `python3 scripts/gerar_listas.py 1.1.1 1.1.2 ... --publicar`. O validador recusa a fonte se faltar algo ou se o gabarito estiver desequilibrado. O mesmo comando exporta as questões para a página da aula (`data/listas/V.M.a.json`) e as capas dos PDFs (`pdfs/capas/*.webp`). Esses arquivos também entram no commit.
5. Renderize as páginas (`pdftoppm -r 70 -png`) e olhe todas elas. Procure alternativas quebradas, fórmulas estouradas, título de nível sozinho no pé da coluna e páginas vazias.
6. Rode `node tests/catalogo.cjs`. Antes, instale o jsdom com `npm install --no-save --package-lock=false jsdom@26.1.0` e apague `node_modules` depois.
7. Faça o commit no `main`, com a mensagem "Listas em PDF: aulas 1.1.1–1.1.6". Antes do push, rode `git fetch origin main && git rebase origin/main`: o robô do GitHub Actions às vezes publica commits de PDFs antigos. O site publica sozinho.
8. Envie os PDFs do lote ao professor e informe o progresso (`--proximo` mostra "Aulas com listas no padrão atual: N/215").

## Padrão das questões (padrão 4)
- **Níveis**: **Nível 1**, **Nível 2** e **Nível 3** (decisão do professor; não use Fácil/Médio/Difícil). Aparecem no PDF, na página da aula e no modo prova.
- Fique no conteúdo da aula e no nível dela. Não use assuntos de aulas posteriores (ex.: potências antes da aula de potenciação), exceto na lista de aprofundamento, com dica.
- **Toda resposta é conferida por cálculo independente** (sympy, `fractions`, `decimal` ou script) antes de gerar.

### Lista 1: fixação (20 questões, `fixacao.secoes`)
- Seções `nome: Nível 1` (cerca de 7), `Nível 2` (cerca de 8) e `Nível 3` (cerca de 5), conduzindo o aluno: do reconhecimento ao uso, do guiado ao autônomo.
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
O objetivo é que a lista pareça uma prova de verdade, e não exercícios com alternativas. **Autorais**, nunca atribuídas a uma prova real (`PADRAO_EDITORIAL.md`).
- Cada questão segue o formato de uma banca, registrado em `estilo: Enem` (não impresso). Use pelo menos 5 bancas por lista. Como cada uma escreve:
  - **Enem**: texto-base longo com situação real (pesquisa, reportagem, empresa, saúde, esporte), quadro ou gráfico, e o comando no fim, em parágrafo próprio (“A probabilidade de … é”, “Qual é …?”). Os distratores saem dos erros típicos (dividir pelo total em vez do grupo certo, inverter a condição, esquecer um caso).
  - **Fuvest**: enunciado enxuto, com a armadilha no conceito; 5 alternativas.
  - **Unicamp**: curta e técnica, **4 alternativas** (A–D) terminadas em ponto.
  - **Unesp**: contexto médio, com figura ou tabela.
  - **UEM e UFSC (somatória)**: frase de contexto e “Assinale o que for correto.”; proposições 01, 02, 04, 08, 16 (até 64 na UFSC), com afirmações elaboradas e não triviais.
  - **UEL e UFPR**: afirmativas I, II, III e IV (`afirmativas`), depois `comando` (“Assinale a alternativa correta.” ou “É correto o que se afirma em”) e alternativas como “Somente as afirmativas I e IV são corretas.” ou “I e II, apenas.”; ou a sequência V ou F (`afirmacoes` + `comando` + alternativas “V – F – V – F.”).
- **Texto comum a duas questões**: na primeira, `texto_comum: {questoes: 2, texto: ..., tabela: ...}`. O PDF imprime “Texto para as questões 17 e 18”, e o site repete o texto nas duas.
- Mistura (o validador confere): 3 a 5 somatórias; pelo menos 2 de afirmativas ou sequência V-F; pelo menos 5 com texto longo (200+ caracteres) ou texto comum; pelo menos 4 com tabela, gráfico ou figura; pelo menos 4 curtas e diretas; vestibular só tem objetivas e somatórias.
- Cada letra correta aparece de 2 a 5 vezes. Números das alternativas em ordem crescente quando possível.
- Níveis pela posição (1–7, 8–14, 15–20) ou `nivel: facil | medio | dificil`.

### Lista 3: aprofundamento (10 questões, `aprofundamento.questoes`)
- **Pelo menos 5 discursivas** no estilo 2ª fase (Fuvest, Unicamp, Unesp): contexto curto e `itens` a), b), c). O a) é direto; o b) encadeia passos; o c) generaliza, pede “mostre que…” ou “determine o valor de … para que …”.
- **Pelo menos 2 objetivas ou somatórias difíceis** (estilo ITA, Fuvest ou UFSC), com `espaco: 22` para rascunho e `resposta` (“C” ou “Soma 89 (01 + 08 + 16 + 64)”).
- Todas com `estilo`, `resolucao` e `resposta`. Espaço maior para resolver nas discursivas (`espaco: 62` com 3 itens).

### Escrita
- Matemática em LaTeX (`$...$`). Decimal com vírgula: `$0{,}5$`. Fração no texto: `\tfrac`; fração grande: `\dfrac` ou `\[ ... \]`.
- Na fonte YAML, use aspas simples nas linhas com LaTeX; textos longos em bloco `|`.
- Português do Brasil, frases diretas, sem gírias. Aspas tipográficas “ ”.

## Arquivos
- `materiais-fonte/V.M.a.yaml`: fonte das três listas (`padrao: 4`, `fixacao`, `vestibular`, `aprofundamento`), a única coisa a escrever por aula.
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
