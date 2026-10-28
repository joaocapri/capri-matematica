# Listas em PDF por aula — processo em lotes

Meta: **2 listas em PDF e 1 caderno de gravação para cada uma das 215 aulas**
- `pdfs/fixacao-XNN.pdf`: lista de fixação com 20 questões discursivas e gabarito resolvido.
- `pdfs/vestibular-XNN.pdf`: lista de vestibular com 20 questões de múltipla escolha (A–E) e gabarito resolvido.
- `gravacao/XNN.pdf`: caderno de gravação em 16:9 para o professor abrir no GoodNotes e gravar a aula por cima. Fica fora do site (a pasta está no `.gitignore`) e é enviado ao professor junto com o lote.

O modelo de referência aprovado pelo professor é a aula **A17** (`materiais-fonte/A17.yaml`).

## Quando o pedido for "faça o próximo lote"
1. `git pull` no `main` e rode `python3 scripts/gerar_listas.py --proximo`. O comando mostra as próximas aulas pendentes: até 6 por lote, sem atravessar o fim de um bloco.
2. Para cada aula do lote, leia `data/aulas.json` (título e resumo) e `conteudos/XNN.json` (teoria). Em seguida, escreva `materiais-fonte/XNN.yaml` (listas) e `materiais-fonte/aulas/XNN.yaml` (roteiro do caderno de gravação), no mesmo formato da A17.
3. **Confira toda resposta por cálculo independente**, com sympy ou script próprio, antes de gerar. Se uma conta não fechar, reescreva a questão.
4. Gere o caderno com `python3 scripts/gerar_aula.py XNN YNN ...`. Gere e publique as listas com `python3 scripts/gerar_listas.py XNN YNN ... --publicar`. O validador recusa a fonte se faltar algo ou se o gabarito estiver desequilibrado. O mesmo comando exporta as questões para a página da aula (`data/listas/XNN.json`) e as capas dos PDFs (`pdfs/capas/*.webp`). Esses arquivos também entram no commit.
5. Renderize as páginas (`pdftoppm -r 70 -png`) e olhe todas elas. Procure alternativas quebradas, fórmulas estouradas, título de nível sozinho no pé da coluna e páginas vazias.
6. Rode `node tests/catalogo.cjs`. Antes, instale o jsdom com `npm install --no-save --package-lock=false jsdom@26.1.0` e apague `node_modules` depois.
7. Faça o commit no `main`, com a mensagem "Listas em PDF: aulas XNN–YNN". Antes do push, rode `git fetch origin main && git rebase origin/main`: o robô do GitHub Actions às vezes publica commits de PDFs antigos. O site publica sozinho.
8. Envie os PDFs do lote ao professor e informe o progresso (`--proximo` mostra "Aulas com listas: N/215").

## Padrão das questões
- **Fixação**: 20 questões em três níveis.
  - **Aquecimento**: cerca de 7 questões, de aplicação direta.
  - **Treino**: cerca de 8 questões.
  - **Desafio**: cerca de 5 questões, com contexto ou raciocínio.
  - Use itens (a)(b)(c) quando fizer sentido. Cada questão tem `resolucao` (passo a passo curto) e `resposta` (resultado final).
- **Vestibular** (padrão v2): 20 questões **autorais no estilo vestibular e Enem**, misturando os dois perfis de prova. Siga a regra do `PADRAO_EDITORIAL.md`: nunca atribua a uma prova real.
  - **Pelo menos 10 contextualizadas**: situação real com texto de apoio de 3 a 6 linhas (campo `texto`), como no Enem e nos vestibulares com mais leitura. O comando fica no `enunciado`.
  - **Pelo menos 3 com tabela ou figura** (campos `tabela` e `figura`). A figura é TikZ/pgfplots com até 6 cm de largura; o site recebe a mesma figura em SVG (`pdfs/figuras/`).
  - **As demais são técnicas**, de enunciado curto, como nas primeiras fases mais técnicas.
  - Ordem: comece direto e vá alternando, com as mais trabalhosas no fim.
  - O validador recusa a fonte que não cumprir as quantidades.
  - Distratores plausíveis, ligados a erros comuns.
  - Cada letra correta aparece de 3 a 5 vezes.
  - Valores numéricos em ordem crescente quando possível.
- Fique no conteúdo da aula e no nível dela. Não use assuntos de aulas posteriores, exceto em revisão óbvia.
- Matemática em LaTeX (`$...$`). Fração dentro do texto usa `\tfrac`; fração grande vai em `\[ ... \]` no fim do enunciado.
- Na fonte YAML, use aspas simples em `resposta` e nas `opcoes` (o LaTeX vai sem escape). Textos longos ficam em bloco `|`.
- Linguagem: português do Brasil, frases diretas, sem gírias.

## Arquivos
- `materiais-fonte/XNN.yaml`: fonte das questões, a única coisa a escrever por aula.
- `scripts/gerar_listas.py`: diagramação em XeLaTeX (fontes Inter + Latin Modern Math), validação e publicação em `data/materiais.json`.
- `scripts/exportar_listas.py`: gera `data/listas/XNN.json` (exercícios do Pratique e questões do Modo prova na página da aula) e as capas `pdfs/capas/{fixacao,vestibular}-XNN.webp`. Roda sozinho no fim do `gerar_listas.py`; para reexportar à mão, `python3 scripts/exportar_listas.py XNN`.
- `scripts/gerar_pdfs.py`: gerador antigo, que faz as listas curtas a partir de `conteudos/*.json`. Não é usado para estas listas.

## Caderno de gravação (GoodNotes)
PDF 16:9 (254 × 142,9 mm), uma ideia por página, com quadro pontilhado para escrever durante a gravação. O roteiro fica em `materiais-fonte/aulas/XNN.yaml`:
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
