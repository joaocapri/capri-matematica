#!/usr/bin/env python3
"""Gera as páginas estáticas do catálogo a partir de data/aulas.json.

  /V/        volume do livro        (body data-view="explorar" data-volume)
  /V/M/      módulo do livro        (o QR code do livro aponta para cá)
  /V/M/a/    aula do site           (body data-lesson="V.M.a")

As páginas só carregam o esqueleto; o conteúdo é montado por assets/site.js.
Rode depois de mudar aulas, módulos ou volumes:  python3 scripts/gerar_paginas.py
"""
import html
import json
import shutil
from pathlib import Path

R = Path(__file__).resolve().parent.parent
A = json.loads((R / 'data/aulas.json').read_text())

HEAD = ('<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<meta name="theme-color" content="#2d195a"><meta name="description" content="{desc}">'
        '<title>{titulo} | MAT MAT MAT!</title>'
        '<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><meta property="og:site_name" content="MAT MAT MAT!">'
        '<link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/ofertas.css">'
        "<script>window.MathJax={{tex:{{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]}},"
        "options:{{skipHtmlTags:['script','noscript','style','textarea','pre','code']}}}};</script>"
        '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>'
        '<script defer src="/assets/ofertas.js"></script><script defer src="/assets/site.js"></script>'
        '</head><body {attrs}><div id="app"></div></body></html>\n')


def esc(s):
    return html.escape(str(s), quote=True)


def pagina(dest, titulo, desc, attrs):
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'index.html').write_text(HEAD.format(titulo=esc(titulo), desc=esc(desc), attrs=attrs))


def main():
    for v in '1234':
        if (R / v).exists():
            shutil.rmtree(R / v)
    for f in A['fronts']:
        pagina(R / f['id'], f'Volume {f["id"]}: {f["name"]}',
               f'Listas gratuitas do Volume {f["id"]} ({f["name"]}) da coleção MAT MAT MAT!.',
               f'data-view="explorar" data-volume="{f["id"]}"')
    for b in A['blocks']:
        v, n = b['id'].split('.')
        onde = f'Volume {v}, extra' if b.get('extra') else f'Volume {v}, módulo {n}'
        pagina(R / v / n, b['title'], f'Listas gratuitas de {b["title"]} ({onde}) no MAT MAT MAT!.',
               f'data-view="explorar" data-volume="{v}" data-modulo="{b["id"]}"')
    for l in A['lessons']:
        resumo = (l.get('summary') or '').rstrip('.')
        desc = (resumo + '. ' if resumo else '') + 'Resumo e listas de fixação e vestibular grátis no MAT MAT MAT!.'
        pagina(R / Path(*l['id'].split('.')), l['title'], desc, f'data-lesson="{l["id"]}"')
    print(len(A['fronts']), 'volumes,', len(A['blocks']), 'módulos,', len(A['lessons']), 'aulas')


if __name__ == '__main__':
    main()
