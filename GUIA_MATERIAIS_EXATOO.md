# Materiais gerais e ponte Capri → Exatoo

O Capri mantém uma única busca, seguida da exploração por 9 áreas, 51 assuntos e 215 aulas. O antigo destaque promocional dos dois PDFs foi retirado. Os materiais continuam disponíveis na busca e na aba de cada aula.

## Como cadastrar PDFs

Fonte de verdade: data/materiais.json. Use uma das chaves abaixo (e apenas uma):

- Aula: tipo=aula, aula=A17, arquivos=[{titulo, tipo, url}].
- Assunto: tipo=assunto, assunto=fu-quadratica, arquivos=[{titulo, tipo, url}].
- Grande área: tipo=area, area=funcoes, arquivos=[{titulo, tipo, url}].

O exemplo em JSON de uma lista geral de função quadrática seria:

    {
      "tipo": "assunto",
      "assunto": "fu-quadratica",
      "arquivos": [
        {"titulo": "Revisão geral de função quadrática", "tipo": "lista", "url": "/pdfs/revisao-quadratica.pdf"}
      ]
    }

Esta é SOMENTE uma instrução de configuração, NÃO uma entrada publicada e NÃO um arquivo real. Primeiro faça upload do PDF, depois cadastre sua URL real no index.

Na home, a busca mostra PDFs associados à aula, ao assunto e à grande área. Ao escolher um assunto, PDFs gerais dele aparecem antes das aulas. Ao abrir a aula, a aba Listas e PDFs agrega seus próprios arquivos mais os do assunto e os da área, removendo URLs duplicadas.

## Integração de saída para o Exatoo

- Errou questão do quiz → Detector de Erros.
- Terminou quiz com erros → sugestão de treino personalizado.
- Abriu aba de PDFs de uma aula sem nenhum material publicado → Gerador de Listas.
- Nenhum resultado na busca → convite discreto para ajuda personalizada.

Links de origem genéricos: exatoo.com. Links de ferramenta: app.exatoo.com.
Parâmetros enviados: utm_source=capri-matematica, utm_medium=referral, utm_campaign (intenção), capri_aula (código A17 etc.) e capri_assunto (código como fu-quadratica). Não enviamos respostas do quiz ou informações pessoais.

IMPORTANTE: o Exatoo ainda precisa implementar um receptor para ler e traduzir esses parâmetros. Por enquanto os links levam ao site/app, sem pré-selecionar automaticamente a ferramenta nem a aula.

## Navegação

Home: área → assunto → aula. Dentro da aula, o breadcrumb, a barra lateral e os links de anterior/próxima utilizam os mesmos 51 assuntos da home. É possível retornar diretamente ao assunto pelo link com parâmetros de URL.
