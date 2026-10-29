# Listas em PDF por aula — processo em lotes

Meta: **2 listas em PDF e 1 caderno de gravação para cada uma das 215 aulas**
Cada aula tem o código do livro **V.M.a** (volume, módulo, aula), como `2.3.2` = Volume 2, módulo 3, aula 2. Módulos extras, que não estão no livro, usam `x1`, `x2` (ex.: `1.x1.2`). O endereço da aula é `/2/3/2/` e o do módulo, `/2/3/` (o QR code do livro aponta para ele).

- `pdfs/fixacao-V.M.a.pdf`: lista de fixação com 20 questões discursivas e gabarito resolvido.
- `pdfs/vestibular-V.M.a.pdf`: lista de vestibular com 20 questões de múltipla escolha (A–E) e gabarito resolvido.
- `gravacao/V.M.a.pdf`: caderno de gravação em 16:9 para o professor abrir no GoodNotes e gravar a aula por cima. Fica fora do site (a pasta está no `.gitignore`) e é enviado ao professor junto com o lote.

O modelo de referência aprovado pelo professor é a aula **2.3.2** (`materiais-fonte/2.3.2.yaml`, `padrao: 2`).

## Quando o pedido for "faça o próximo lote"
1. `git pull` no `main` e rode `python3 scripts/gerar_listas.py --proximo`. O comando mostra as próximas aulas sem lista no padrão atual: até 6 por lote, na ordem do livro, sem atravessar o fim de um módulo. Aulas marcadas **[revisar lista antiga]** já têm uma fonte antiga (sem `padrao: 2`): aproveite as questões boas, reescreva no padrão abaixo e acrescente `padrao: 2`.
2. Para cada aula do lote, leia `data/aulas.json` (título e resumo) e `conteudos/V.M.a.json` (teoria). Em seguida, escreva `materiais-fonte/V.M.a.yaml` (listas, com `padrao: 2`) e `materiais-fonte/aulas/V.M.a.yaml` (roteiro do caderno de gravação), no mesmo formato da 2.3.2.
3. **Confira toda resposta por cálculo independente**, com sympy ou script próprio, antes de gerar. Se uma conta não fechar, reescreva a questão.
4. Gere o caderno com `python3 scripts/gerar_aula.py 1.1.1 1.1.2 ...`. Gere e publique as listas com `python3 scripts/gerar_listas.py 1.1.1 1.1.2 ... --publicar`. O validador recusa a fonte se faltar algo ou se o gabarito estiver desequilibrado. O mesmo comando exporta as questões para a página da aula (`data/listas/V.M.a.json`) e as capas dos PDFs (`pdfs/capas/*.webp`). Esses arquivos também entram no commit.
5. Renderize as páginas (`pdftoppm -r 70 -png`) e olhe todas elas. Procure alternativas quebradas, fórmulas estouradas, título de nível sozinho no pé da coluna e páginas vazias.
6. Rode `node tests/catalogo.cjs`. Antes, instale o jsdom com `npm install --no-save --package-lock=false jsdom@26.1.0` e apague `node_modules` depois.
7. Faça o commit no `main`, com a mensagem "Listas em PDF: aulas 1.1.1–1.1.6". Antes do push, rode `git fetch origin main && git rebase origin/main`: o robô do GitHub Actions às vezes publica commits de PDFs antigos. O site publica sozinho.
8. Envie os PDFs do lote ao professor e informe o progresso (`--proximo` mostra "Aulas com listas no padrão atual: N/215").

## Padrão das questões
- **Selos de nível**: **Fácil**, **Médio** e **Difícil** (escolha do professor; substituem Aquecimento, Treino e Desafio). Aparecem no PDF, na página da aula e no modo prova.
- **Fixação**: 20 questões em três seções, `nome: Fácil`, `Médio` e `Difícil`.
  - **Fácil**: cerca de 7 questões, de aplicação direta.
  - **Médio**: cerca de 8 questões.
  - **Difícil**: cerca de 5 questões, com contexto ou raciocínio.
  - Use itens (a)(b)(c) quando fizer sentido. Cada questão tem `resolucao` (passo a passo curto) e `resposta` (resultado final).
- **Vestibular** (padrão v2): 20 questões **autorais no estilo vestibular e Enem**, misturando os dois perfis de prova. Siga a regra do `PADRAO_EDITORIAL.md`: nunca atribua a uma prova real.
  - **Pelo menos 10 contextualizadas**: situação real com texto de apoio de 3 a 6 linhas (campo `texto`), como no Enem e nos vestibulares com mais leitura. O comando fica no `enunciado`.
  - **Pelo menos 3 com tabela ou figura** (campos `tabela` e `figura`). A figura é TikZ/pgfplots com até 6 cm de largura; o site recebe a mesma figura em SVG (`pdfs/figuras/`).
  - **As demais são diretas**, de enunciado curto, como nas provas mais técnicas. A lista mistura os dois perfis.
  - Ordem: comece direto e vá alternando, com as mais trabalhosas no fim.
  - Cada questão tem `nivel: facil`, `medio` ou `dificil`. Sem o campo, vale a posição: 1–7 Fácil, 8–14 Médio, 15–20 Difícil.
  - O validador recusa a fonte que não cumprir as quantidades.
  - Distratores plausíveis, ligados a erros comuns.
  - Cada letra correta aparece de 3 a 5 vezes.
  - Valores numéricos em ordem crescente quando possível.
- Fique no conteúdo da aula e no nível dela. Não use assuntos de aulas posteriores, exceto em revisão óbvia.
- Matemática em LaTeX (`$...$`). Fração dentro do texto usa `\tfrac`; fração grande vai em `\[ ... \]` no fim do enunciado.
- Na fonte YAML, use aspas simples em `resposta` e nas `opcoes` (o LaTeX vai sem escape). Textos longos ficam em bloco `|`.
- Linguagem: português do Brasil, frases diretas, sem gírias.

## Arquivos
- `materiais-fonte/V.M.a.yaml`: fonte das questões, a única coisa a escrever por aula.
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
