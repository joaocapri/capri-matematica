# MAT MAT MAT ✳

Portal gratuito de matemática MAT MAT MAT!, do Prof. João Capri. O site segue a numeração da coleção física em 4 volumes: **Volume → Módulo → Aula**, com códigos `V.M.a` (ex.: `2.3.2` = Volume 2, módulo 3, aula 2).

## Estrutura
- **Volumes** em `/1/` a `/4/`; **módulos** em `/V/M/` (é para onde aponta o QR code de cada módulo do livro); **aulas** em `/V/M/a/`. Módulos extras, fora do livro, usam `x1`, `x2` (ex.: `/1/x1/`, matemática financeira).
- **Catálogo** em `data/aulas.json`: `fronts` = volumes, `blocks` = módulos (com parte, página e tipos de questão do livro), `lessons` = 215 aulas.
- As páginas estáticas são geradas por `python3 scripts/gerar_paginas.py`. O conteúdo é montado por `assets/site.js`.
- **Listas**: `materiais-fonte/V.M.a.yaml` → PDFs em `pdfs/` e questões da página em `data/listas/`. Processo em `PROCESSO_LISTAS.md`.
- Endereços antigos (`/aulas/A17/` etc.) redirecionam para os novos por `_redirects`.

## Coleção física e ofertas
- **Loja** em `/livros/` (`assets/loja.js`, `assets/loja.css`, dados em `data/livros.json`): capas, páginas reais em `livros/amostras/`, coleção completa e volumes avulsos no carrinho, pedido pronto pelo WhatsApp. Nada é cobrado no site. `?volume=2` destaca o volume de quem veio de uma aula.
- **Ofertas no site** (`assets/ofertas.js`, `assets/ofertas.css`): avisos (toasts), um modal de cupom e um selo fixo do cupom. Disparam por contexto: 20 s numa aula ou módulo, 5 questões marcadas, fim do modo prova, download de PDF, 90 s de estudo com rolagem, intenção de saída (computador) e visitante que volta pela 3ª vez.
  - Limites: até 3 avisos por sessão, 60 s entre eles, param se a pessoa fechar 2; 1 modal por sessão; "Agora não" silencia modais por 3 dias, clicar na oferta por 7 dias.
  - Nada aparece na loja, nas turmas, na impressão ou enquanto a pessoa digita. Sem prova social inventada e sem contagem regressiva.
  - **Cupom**: `data/livros.json` → `oferta` (`ativo`, `cupom`, `desconto`, `texto`, `observacao`). Com `"ativo": false`, o modal e as menções ao cupom somem.
  - Revisão manual: `?ofertas=on` (tempos curtos) e `?ofertas=reset` (zera o histórico). Testes automatizados não veem ofertas.

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

## Histórico
As seções abaixo registram versões anteriores do site (códigos A/B/C, áreas e assuntos). A organização atual é a descrita acima.

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
Abaixo da área **Listas e PDFs**, o catálogo foi reorganizado em 9 áreas com ícones e navegação progressiva: área → assunto → aula. Desde o currículo v2 os códigos seguem a ordem de estudo. Busca geral (com sugestões), favoritos, lista completa sob demanda e URLs compartilháveis com `?area=...&assunto=...` continuam disponíveis. Os dados curriculares originais não foram alterados; o agrupamento amigável do aluno fica em `assets/site.js`, em `SUBJECT_AREAS`.


### Assuntos refinados
As nove áreas agora se dividem em 51 assuntos específicos, incluindo Estatística (leitura de dados ou dispersão), Trigonometria (ciclo, identidades ou equações), Geometria espacial (prismas, pirâmides, corpos redondos etc.) e Combinatória (contagem, combinações ou probabilidade). A classificação é definida em `SUBJECT_TOPICS` e validada para garantir que cada aula esteja em exatamente um assunto.


## Home unificada — navegação v3
A página inicial possui **um único campo de busca** (`#hero-search`) que encontra aulas, assuntos e PDFs. A busca filtra instantaneamente os três tipos e permite focar somente em cada um sem uma nova caixa de texto. Sem busca, mostra materiais de fato publicados e explora 9 áreas → 51 assuntos → 215 aulas. O índice dos PDFs continua em `data/materiais.json`. Não invente arquivos: o painel de downloads lista apenas os existentes. Os links das aulas e URLs de filtros foram preservados.


## Materiais gerais e ponte Exatoo
Veja `GUIA_MATERIAIS_EXATOO.md` para cadastrar PDFs por aula, assunto ou área e para entender a integração contextual com Exatoo.


## Identidade e abas (2026)
O nome público do portal agora é **MAT MAT MAT**, com logotipo tipográfico empilhado em `assets/site.js` e favicon em `assets/favicon.svg`. Há **quatro abas por aula**: Listas e PDFs, Teoria, Quiz e Vídeos. A antiga Visão geral foi removida; links antigos `?tab=resumo` levam à Teoria. Na abertura padrão, a página seleciona **Listas e PDFs somente quando há materiais publicados ou lista gerada**, caso contrário seleciona **Teoria**. A home usa um único campo de busca, sem os textos de apoio e botões de exemplos anteriores.


## Experiência do estudante — navegação 2026
A home usa uma única busca e mostra as 9 áreas como atalhos. Os menus não se aprofundam na home: a exploração ocorre em `/explorar/`, com URLs específicas para cada área (`?area=funcoes`) e assunto (`?area=funcoes&assunto=fu-quadratica`) e breadcrumbs clicáveis. A partir do assunto, o aluno abre a página individual da aula. Links históricos da home com `?area=` ou `?assunto=` continuam sendo redirecionados para `/explorar/`. O botão superior **Teste seu nível** leva a `/teste-seu-nivel/`.

## Diagnóstico matemático gratuito
O banco editável fica em `data/diagnostico.json`: 15 questões de quatro alternativas, distribuídas igualmente entre 5 habilidades. A página `/teste-seu-nivel/` apresenta uma questão por vez, permite retornar e modificar a escolha, calcula acertos gerais e por habilidade e recomenda aulas das áreas de maior dificuldade. Mostra a correção explicada ao final. Não exige conta, não transmite escolhas ao Exatoo e **não** pretende medir proficiência com validade psicométrica ou fornecer nota escolar. Para mudar perguntas, manter `correta` como índice numérico de base zero (0 a 3), e cada campo `aula` deve apontar a uma das 215 aulas existentes. Links para Exatoo enviam apenas parâmetros de origem, sem respostas do aluno.


## Mini-tour da home (2026)
O antigo desenho da parábola foi substituído por um painel com exemplos **reais** da biblioteca: aula A17, lista PDF da A17 e quiz C20. O visitante pode alternar pelos controles Aula / PDF / Quiz. Sem interação, a prévia gira a cada 5,6 segundos, respeita `prefers-reduced-motion` e pausa na interação ou quando a aba não está visível. Ao começar uma pesquisa, o painel se oculta para priorizar os resultados. Os links abrem diretamente o conteúdo existente.


## Home minimalista + MAT MAT MAT!
Atualização visual: nenhuma ilustração, carousel ou mini-tour abaixo do campo de busca. A home mantém o título "O que você quer estudar hoje?" e o subtítulo exato **"Listas de Exercícios e Teoria grátis. Simples assim"**. Marca oficial **MAT MAT MAT!** com exclamação coral destacada na terceira linha da logo e presença uniforme nos metadados das 215 aulas, diagnóstico, exploração, impressão e favicon. As 215 URLs e o funcionamento da busca foram preservados.


## Exploração enxuta (atualização da home)
A seção **Toda a matemática, organizada / Encontre seu material.** apresenta imediatamente os 9 cartões de áreas, sem flecha decorativa, parágrafo introdutório, título extra de seleção, Favoritas ou Todas as 215 na home. As rotas `/explorar/?favoritos=1` e `/explorar/?todas=1` seguem disponíveis no catálogo dedicado, e os cartões das áreas mantêm seus destinos.


## Compartilhamento de aulas e catálogo limpo
Removido o botão redundante **Pesquisar** das páginas de áreas e assuntos (`/explorar/`). Na aula, **Compartilhe essa aula** abre o menu nativo do celular (`navigator.share`), com nome da aula, mensagem curta e URL pública. O compartilhamento é disparado no próprio toque, sem etapas intermediárias. Em navegadores sem Web Share API ou que a bloqueiem, aparecem opções de WhatsApp e de cópia integral da mensagem. Cancelar o compartilhamento nativo não abre o fallback.


## Ações na página de aula — barra compacta
As ações **Já estudei / Favoritar / Compartilhar** aparecem em uma única barra horizontal, com ícones SVG de linha, contorno suave e estados ativos discretos. Em celular, os três botões permanecem alinhados numa linha com ícones acima do texto. Os controles de estudo e favorito guardam os mesmos dados no navegador e atualizam `aria-pressed`; o compartilhamento continua usando o menu nativo, com WhatsApp/cópia como alternativa.


## Avaliação diagnóstica v2 — cinco percursos
O botão **Teste seu nível** apresenta cinco avaliações separadas: 1ª, 2ª e 3ª séries do Ensino Médio, ENEM e vestibulares tradicionais. Cada percurso tem **12 questões autorais** (60 questões diferentes no arquivo `data/diagnostico.json`), divididas entre quatro áreas e três dificuldades por área: Base, Aplicação e Desafio. A ordem de assuntos varia a cada tentativa, preservando a progressão de dificuldade. O aluno pode voltar, mudar respostas e consultar a correção comentada no final. O relatório traz desempenho por área e grau de complexidade e prioriza aulas relacionadas aos erros. Um resumo da última tentativa é guardado localmente por percurso; respostas e dados pessoais não são enviados a terceiros. Não é uma avaliação psicometricamente validada nem reproduz provas oficiais.

O cabeçalho mostra **Matemática para Ensino Médio e Vestibulares** no centro do desktop e numa segunda linha centralizada quando a largura é menor.

## Currículo v3 (outubro de 2026)

Todos os assuntos foram divididos com mais calma (215 aulas, 51 assuntos). Cada frente segue a ordem da trilha:

- **Frente A (Funções e Álgebra, A01–A79):** conjuntos, introdução a funções, função afim, quadrática, tipos de função, módulo, exponencial e logaritmos (A01–A42); sequências, matrizes, determinantes, sistemas lineares (começando pelo 2×2), complexos e polinômios (A43–A79).
- **Frente B (Geometria, B01–B59):** plana (B01–B21), espacial (B22–B40) e analítica (B41–B59, sem vetores).
- **Frente C (Matemática Básica, Contagem, Estatística e Trigonometria, C01–C77):** Fundamentos, isto é, números, frações e decimais, potências e raízes, expressões algébricas, equações, proporções, unidades, porcentagem e financeira (C01–C35); combinatória, binômio e probabilidade (C36–C52); estatística (C53–C60); trigonometria (C61–C77).

Nos dados, cada assunto é um bloco de `data/aulas.json`. Os conteúdos das aulas retiradas ou divididas ficaram em `conteudos/arquivo/*-curriculo-v2.json`. Quando uma aula com listas foi dividida, as listas ficaram na última parte, quando o aluno já viu todo o conteúdo. O progresso salvo no navegador é migrado uma vez (chave `matmat-curriculo` = `3` em `assets/site.js`).

## Currículo v2 (outubro de 2026)

A frente A foi reordenada: fundamentos → produtos notáveis (A07) e fatoração (A08) → equações do 1º grau (A09), do 2º grau (A10) e problemas (A11) → introdução a funções (A12–A14) → função afim (A15–A18) → quadrática (A19–A24) → função par e ímpar (A25), injetora/sobrejetora/bijetora (A26), composta (A27), inversa (A28) → modular, exponencial e logaritmos, sequências, complexos e polinômios. Na frente C, Unidades de Medida virou C07, Binômio de Newton virou C20 (entre combinatória e probabilidade) e sistemas 2x2 virou C48, depois de matrizes e determinantes (discussão de sistemas é C49). A antiga aula A10 (classificação de funções numa aula só) foi arquivada em `conteudos/arquivo/` e `materiais-fonte/arquivo/`. O progresso salvo no navegador é migrado uma vez pelo bloco `matmat-curriculo` em `assets/site.js`.


## Diretório de turmas (acesso por link direto)
Acesse `/turmas/` para escolher uma das **12 turmas** Maxi ou Integral. Este índice é para o professor e para revisão visual, não está no menu público e tem diretiva noindex. As páginas individuais permanecem compartilháveis diretamente com os alunos. A turma Maxi **2P2** foi confirmada como distinta de 2P1 e tem seus próprios dados em `data/turmas/maxi-2p2.json`. *Links não listados não são privados*: nunca publicar dados pessoais ou materiais confidenciais sem autenticação.
