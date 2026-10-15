# Listas em PDF por aula — processo em lotes

Meta: **2 PDFs para cada uma das 152 aulas**
- `pdfs/fixacao-XNN.pdf`: lista de fixação com 20 questões discursivas e gabarito resolvido.
- `pdfs/vestibular-XNN.pdf`: lista de vestibular com 20 questões de múltipla escolha (A–E) e gabarito resolvido.

O modelo de referência aprovado pelo professor é a aula **A20** (`materiais-fonte/A20.yaml`).

## Quando o pedido for "faça o próximo lote"
1. `git pull` no `main` e rode `python3 scripts/gerar_listas.py --proximo`. O comando mostra as próximas aulas pendentes: até 6 por lote, sem atravessar o fim de um bloco.
2. Para cada aula do lote, leia `data/aulas.json` (título e resumo) e `conteudos/XNN.json` (teoria). Em seguida, escreva `materiais-fonte/XNN.yaml` no mesmo formato da A20.
3. **Confira toda resposta por cálculo independente**, com sympy ou script próprio, antes de gerar. Se uma conta não fechar, reescreva a questão.
4. Gere e publique com `python3 scripts/gerar_listas.py XNN YNN ... --publicar`. O validador recusa a fonte se faltar algo ou se o gabarito estiver desequilibrado. O mesmo comando exporta as questões para a página da aula (`data/listas/XNN.json`) e as capas dos PDFs (`pdfs/capas/*.webp`). Esses arquivos também entram no commit.
5. Renderize as páginas (`pdftoppm -r 70 -png`) e olhe todas elas. Procure alternativas quebradas, fórmulas estouradas, título de nível sozinho no pé da coluna e páginas vazias.
6. Rode `node tests/catalogo.cjs`. Antes, instale o jsdom com `npm install --no-save --package-lock=false jsdom@26.1.0` e apague `node_modules` depois.
7. Faça o commit no `main`, com a mensagem "Listas em PDF: aulas XNN–YNN". Antes do push, rode `git fetch origin main && git rebase origin/main`: o robô do GitHub Actions às vezes publica commits de PDFs antigos. O site publica sozinho.
8. Envie os PDFs do lote ao professor e informe o progresso (`--proximo` mostra "Aulas com listas: N/152").

## Padrão das questões
- **Fixação**: 20 questões em três níveis.
  - **Aquecimento**: cerca de 7 questões, de aplicação direta.
  - **Treino**: cerca de 8 questões.
  - **Desafio**: cerca de 5 questões, com contexto ou raciocínio.
  - Use itens (a)(b)(c) quando fizer sentido. Cada questão tem `resolucao` (passo a passo curto) e `resposta` (resultado final).
- **Vestibular**: 20 questões **autorais no estilo vestibular** (UEL, UEM, Fuvest, Unicamp, Enem…), com progressão de nível e contexto em parte delas. Siga a regra do `PADRAO_EDITORIAL.md`: nunca atribua a uma prova real.
  - Distratores plausíveis, ligados a erros comuns.
  - Cada letra correta aparece de 3 a 5 vezes.
  - Valores numéricos em ordem crescente quando possível.
- Fique no conteúdo da aula e no nível dela. Não use assuntos de aulas posteriores, exceto em revisão óbvia.
- Matemática em LaTeX (`$...$`). Para equações com fração grande, use `\[ ... \]` no fim do enunciado.
- Na fonte YAML, use aspas simples em `resposta` e nas `opcoes` (o LaTeX vai sem escape). Textos longos ficam em bloco `|`.
- Linguagem: português do Brasil, frases diretas, sem gírias.

## Arquivos
- `materiais-fonte/XNN.yaml`: fonte das questões, a única coisa a escrever por aula.
- `scripts/gerar_listas.py`: diagramação em XeLaTeX (fontes Inter + Latin Modern Math), validação e publicação em `data/materiais.json`.
- `scripts/exportar_listas.py`: gera `data/listas/XNN.json` (exercícios do Pratique e questões do Modo prova na página da aula) e as capas `pdfs/capas/{fixacao,vestibular}-XNN.webp`. Roda sozinho no fim do `gerar_listas.py`; para reexportar à mão, `python3 scripts/exportar_listas.py XNN`.
- `scripts/gerar_pdfs.py`: gerador antigo, que faz as listas curtas a partir de `conteudos/*.json`. Não é usado para estas listas.
