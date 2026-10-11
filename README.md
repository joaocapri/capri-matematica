# MAT MAT MAT ✳

Portal gratuito de matemática MAT MAT MAT, por Prof. João Capri. Uma página por aula, com códigos estáveis A01–A48, B01–B48 e C01–C48.

## Estrutura
- **144 páginas** em \`aulas/A01/index.html\` até \`aulas/C48/index.html\`.
- **Currículo** em \`data/aulas.json\`, a partir da divisão do professor em Google Docs.
- **CSS e JavaScript** em \`assets/\`.
- **Materiais de cada aula** em \`conteudos/A01.json\`, \`conteudos/A02.json\` etc. O arquivo é opcional até haver conteúdo.
- **PDFs** em \`pdfs/\`, depois referenciados nos arquivos de conteúdo.

## Publicação no Cloudflare Pages
1. Vincule este repositório a Pages com produção na branch \`main\`.
2. Selecione nenhum framework (site estático), sem comando de build, diretório de saída \`.\`.
3. O site passará a ter atualização automática em cada commit.

## Como adicionar conteúdo a uma aula
Crie \`conteudos/A17.json\` com o formato:

\`\`\`json
{
  "teoria": [
    {
      "titulo": "O que são raízes?",
      "paragrafos": ["Uma raiz é um valor de x que zera a função."],
      "formulas": ["ax^2+bx+c=0"]
    }
  ],
  "exercicios": [
    {"enunciado": "Resolva x²−5x+6=0.", "resposta": "x=2 ou x=3."}
  ],
  "arquivos": [
    {"titulo": "Lista de exercícios — Aula A17", "tipo": "lista", "url": "/pdfs/lista-a17.pdf"},
    {"titulo": "Gabarito — Aula A17", "tipo": "gabarito", "url": "/pdfs/gabarito-a17.pdf"}
  ]
}
\`\`\`

Suba os arquivos PDF para a pasta \`pdfs/\` e adicione as referências acima. O site identifica o material pela URL da aula.

## Funcionalidades
- Busca instantânea por título, assunto, descrição, código, bloco e frente.
- Filtros pelas três frentes; favoritos.
- Marcação de aulas estudadas e favoritos: **armazenados apenas no navegador do aluno**, sem login, sem sincronização entre aparelhos.
- Roteiro, teoria, exercícios e PDFs em abas separadas.
- Próxima aula, aula anterior, navegação do bloco e links individuais.

## Importante
O currículo é a ementa, **não teoria final**. Algumas fórmulas matemáticas desapareceram na exportação textual do Google Docs. Revise essas partes antes de transformar o roteiro em explicação definitiva. O site não inventa listas, gabaritos ou materiais que não existam.

## Produção semi-automatizada de conteúdo
Consulte `PADRAO_EDITORIAL.md`. A aula A17 é um exemplo publicado, com teoria, sugestões de vídeos verificadas, quiz e uma lista A4 imprimível com gabarito separado.


## Área central de listas e PDFs
O destaque da home é a biblioteca, com pesquisa em tempo real e índice `data/materiais.json`. Atualize esse índice sempre que publicar ou retirar PDFs. `Listas e PDFs` é a primeira aba de todas as aulas e abre por padrão quando há arquivos. A antiga aba `Exercícios` foi retirada; atividades curtas existentes agora aparecem na área de materiais.


## Descoberta de aulas por assuntos
Abaixo da área **Listas e PDFs**, o catálogo foi reorganizado em 9 áreas com ícones e navegação progressiva: área → assunto → aula. As 144 aulas permanecem em suas URLs originais. Busca geral (com sugestões), favoritos, lista completa sob demanda e URLs compartilháveis com `?area=...&assunto=...` continuam disponíveis. Os dados curriculares originais não foram alterados; o agrupamento amigável do aluno fica em `assets/site.js`, em `SUBJECT_AREAS`.


### Assuntos refinados
As nove áreas agora se dividem em 38 assuntos específicos, incluindo Estatística (leitura de dados ou dispersão), Trigonometria (ciclo, identidades ou equações), Geometria espacial (prismas, pirâmides, corpos redondos etc.) e Combinatória (contagem, combinações ou probabilidade). A classificação é definida em `SUBJECT_TOPICS` e validada para garantir que cada aula esteja em exatamente um assunto.


## Home unificada — navegação v3
A página inicial possui **um único campo de busca** (`#hero-search`) que encontra aulas, assuntos e PDFs. A busca filtra instantaneamente os três tipos e permite focar somente em cada um sem uma nova caixa de texto. Sem busca, mostra materiais de fato publicados e explora 9 áreas → 38 assuntos → 144 aulas. O índice dos PDFs continua em `data/materiais.json`. Não invente arquivos: o painel de downloads lista apenas os existentes. Os links das aulas e URLs de filtros foram preservados.


## Materiais gerais e ponte Exatoo
Veja `GUIA_MATERIAIS_EXATOO.md` para cadastrar PDFs por aula, assunto ou área e para entender a integração contextual com Exatoo.


## Identidade e abas (2026)
O nome público do portal agora é **MAT MAT MAT**, com logotipo tipográfico empilhado em `assets/site.js` e favicon em `assets/favicon.svg`. Há **quatro abas por aula**: Listas e PDFs, Teoria, Quiz e Vídeos. A antiga Visão geral foi removida; links antigos `?tab=resumo` levam à Teoria. Na abertura padrão, a página seleciona **Listas e PDFs somente quando há materiais publicados ou lista gerada**, caso contrário seleciona **Teoria**. A home usa um único campo de busca, sem os textos de apoio e botões de exemplos anteriores.


## Experiência do estudante — navegação 2026
A home usa uma única busca e mostra as 9 áreas como atalhos. Os menus não se aprofundam na home: a exploração ocorre em `/explorar/`, com URLs específicas para cada área (`?area=funcoes`) e assunto (`?area=funcoes&assunto=fu-quadratica`) e breadcrumbs clicáveis. A partir do assunto, o aluno abre a página individual da aula. Links históricos da home com `?area=` ou `?assunto=` continuam sendo redirecionados para `/explorar/`. O botão superior **Teste seu nível** leva a `/teste-seu-nivel/`.

## Diagnóstico matemático gratuito
O banco editável fica em `data/diagnostico.json`: 15 questões de quatro alternativas, distribuídas igualmente entre 5 habilidades. A página `/teste-seu-nivel/` apresenta uma questão por vez, permite retornar e modificar a escolha, calcula acertos gerais e por habilidade e recomenda aulas das áreas de maior dificuldade. Mostra a correção explicada ao final. Não exige conta, não transmite escolhas ao Exatoo e **não** pretende medir proficiência com validade psicométrica ou fornecer nota escolar. Para mudar perguntas, manter `correta` como índice numérico de base zero (0 a 3), e cada campo `aula` deve apontar a uma das 144 aulas existentes. Links para Exatoo enviam apenas parâmetros de origem, sem respostas do aluno.


## Mini-tour da home (2026)
O antigo desenho da parábola foi substituído por um painel com exemplos **reais** da biblioteca: aula A17, lista PDF da A17 e quiz C20. O visitante pode alternar pelos controles Aula / PDF / Quiz. Sem interação, a prévia gira a cada 5,6 segundos, respeita `prefers-reduced-motion` e pausa na interação ou quando a aba não está visível. Ao começar uma pesquisa, o painel se oculta para priorizar os resultados. Os links abrem diretamente o conteúdo existente.


## Home minimalista + MAT MAT MAT!
Atualização visual: nenhuma ilustração, carousel ou mini-tour abaixo do campo de busca. A home mantém o título "O que você quer estudar hoje?" e o subtítulo exato **"Listas de Exercícios e Teoria grátis. Simples assim"**. Marca oficial **MAT MAT MAT!** com exclamação coral destacada na terceira linha da logo e presença uniforme nos metadados das 144 aulas, diagnóstico, exploração, impressão e favicon. As 144 URLs e o funcionamento da busca foram preservados.


## Exploração enxuta (atualização da home)
A seção **Toda a matemática, organizada / Encontre seu material.** apresenta imediatamente os 9 cartões de áreas, sem flecha decorativa, parágrafo introdutório, título extra de seleção, Favoritas ou Todas as 144 na home. As rotas `/explorar/?favoritos=1` e `/explorar/?todas=1` seguem disponíveis no catálogo dedicado, e os cartões das áreas mantêm seus destinos.


## Compartilhamento de aulas e catálogo limpo
Removido o botão redundante **Pesquisar** das páginas de áreas e assuntos (`/explorar/`). Na aula, **Compartilhe essa aula** abre o menu nativo do celular (`navigator.share`), com nome da aula, mensagem curta e URL pública. O compartilhamento é disparado no próprio toque, sem etapas intermediárias. Em navegadores sem Web Share API ou que a bloqueiem, aparecem opções de WhatsApp e de cópia integral da mensagem. Cancelar o compartilhamento nativo não abre o fallback.
