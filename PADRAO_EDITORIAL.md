
# Padrão de publicação · Capri Matemática

## Objetivo
Publicar conteúdos didáticos consistentes pelo chat, incluindo teoria rigorosa com linguagem jovem, vídeos reais verificados, quiz interativo e lista de múltipla escolha para impressão em A4.

## Formato de cada aula
Crie ou atualize \`conteudos/A17.json\` (substitua o código) com:
- \`teoria\`: array de seções, cada uma com \`titulo\`, \`paragrafos\`, \`formulas\` (expressões LaTeX), \`exemplo\` {enunciado, passos[]}, \`dica\`, \`erroComum\`.
- \`videos\`: lista de links reais verificados com \`titulo\`, \`canal\`, \`descricao\`, \`url\`. Jamais inventar IDs do YouTube.
- \`quiz\`: perguntas de alternativas \`opcoes\`, índice correto \`correta\` (0 a 3/4), \`explicacao\`, \`nivel\`.
- \`lista\`: 10–15 questões autorais \`enunciado\`, \`opcoes\`, \`correta\`, \`comentario\`, \`nivel\`.
- \`exercicios\`: perguntas curtas com \`enunciado\` e \`resposta\`.
- \`arquivos\`: PDFs externos já hospedados, se houver, cada um com \`titulo\`, \`tipo\`, \`url\`.

## Regra editorial
1. Rigor matemático: definições e hipóteses corretas, revisão de toda resposta, exemplos conferidos por método independente.
2. Tom jovem sem gírias forçadas. Frases diretas, analogias úteis, macetes de cursinho, alerta sobre erros clássicos. Evitar humor que comprometa precisão.
3. Sequência didática: objetivo → conceito → método → exemplo → erro comum → treino → questões de prova.
4. Quiz com feedback explicativo por alternativa correta; uma questão de cada vez.
5. Lista com 5 alternativas, uma única resposta, distratores plausíveis e progressão de nível. Questões **autorais estilo vestibular** (não atribuir a vestibulares reais sem fonte e licença).
6. Selecionar vídeos reais com link e tema confirmados. Se não houver boa indicação, deixar vídeos vazios até a curadoria.
7. Conteúdos devem manter definições precisas, quizzes consistentes e fórmulas legíveis.

## PDF
A aba **Listas e PDFs** cria links para \`/imprimir/?aula=A17&tipo=lista\` e \`tipo=gabarito\`. O navegador gera a versão impressa padronizada e permite **Salvar como PDF**. Isso ainda não é um arquivo PDF pré-renderizado hospedado; para distribuição imediata como anexo, gere PDFs finais e salve no GitHub ou em armazenamento externo e adicione aos \`arquivos\`.

## Exemplo de comando para o chat
"Gere a aula A18 com teoria jovem e rigorosa, 5 questões de quiz, 12 originais estilo UEL/FUVEST/ENEM, 2 vídeos reais verificados e gabarito comentado. Confira cálculos e publique em meu repositório capri-matematica, mantendo o padrão editorial."

## Links
- Aula: \`/aulas/A17/\`
- Lista imprimível: \`/imprimir/?aula=A17&tipo=lista\`
- Gabarito: \`/imprimir/?aula=A17&tipo=gabarito\`

## Regra de navegação — listas e PDFs
- **Não criar aba Exercícios.** A tabulação agora é Listas e PDFs, Visão geral, Teoria, Quiz e Vídeos.
- A biblioteca da home é abastecida pelo índice `data/materiais.json`; atualize-o ao publicar PDFs.
- Atividades curtas antigas aparecem no interior de Listas e PDFs, sem aba separada.
- Se o pedido excluir listas e PDFs, não gere arquivos nem novas entradas no índice.


## Recursos em vídeo
Aba de vídeos pode usar pesquisa temática claramente identificada. Não apresentar buscas como vídeos específicos já selecionados.
