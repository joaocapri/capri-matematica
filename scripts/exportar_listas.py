#!/usr/bin/env python3
"""Exporta as listas de cada aula para a página interativa do site.

Para cada materiais-fonte/XNN.yaml gera:
  - data/listas/XNN.json      questões de fixação e de vestibular, com resoluções
  - pdfs/capas/fixacao-XNN.webp e pdfs/capas/vestibular-XNN.webp   capa (página 1) dos PDFs

A matemática sai no formato do MathJax do site: \\( ... \\) em linha e \\[ ... \\] em destaque.

Uso:  python3 scripts/exportar_listas.py [A17 ...]   (sem argumentos, exporta todas)
É chamado automaticamente por scripts/gerar_listas.py.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
FONTE = ROOT / "materiais-fonte"
DEST = ROOT / "data" / "listas"
CAPAS = ROOT / "pdfs" / "capas"

TEXTO = [("\\quad", " "), ("\\,", " "), ("\\ ", " "), ("{,}", ",")]


def tex_web(s):
    """Converte o LaTeX das fontes ($...$, \\$, espaçamentos de texto) para o MathJax do site."""
    s = str(s)
    out, i, n = [], 0, len(s)
    texto = []

    def flush():
        t = "".join(texto)
        for a, b in TEXTO:
            t = t.replace(a, b)
        out.append(t)
        texto.clear()

    while i < n:
        if s.startswith("\\$", i):
            texto.append("$")
            i += 2
        elif s.startswith("\\[", i):
            j = s.find("\\]", i + 2)
            j = n if j < 0 else j
            flush()
            out.append(s[i:j + 2])
            i = j + 2
        elif s[i] == "$":
            j = i + 1
            while j < n and not (s[j] == "$" and s[j - 1] != "\\"):
                j += 1
            flush()
            out.append("\\(" + s[i + 1:j] + "\\)")
            i = j + 1
        else:
            texto.append(s[i])
            i += 1
    flush()
    return "".join(out).strip()


def linhas(texto):
    return [tex_web(l.strip()) for l in str(texto or "").strip().splitlines() if l.strip()]


def paginas(pdf):
    try:
        r = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True)
        m = re.search(r"Pages:\s+(\d+)", r.stdout)
        return int(m.group(1)) if m else None
    except FileNotFoundError:
        return None


def capa(pdf, destino, largura=520):
    """Página 1 do PDF em WebP, para a vitrine de downloads."""
    from PIL import Image
    destino.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / "p"
        subprocess.run(["pdftoppm", "-r", "110", "-f", "1", "-l", "1", "-png", str(pdf), str(base)], check=True)
        png = next(Path(tmp).glob("p*.png"))
        im = Image.open(png).convert("RGB")
        alt = round(im.height * largura / im.width)
        im.resize((largura, alt), Image.LANCZOS).save(destino, "WEBP", quality=78, method=6)


def exportar(codigo):
    fonte = yaml.safe_load((FONTE / f"{codigo}.yaml").read_text(encoding="utf-8"))
    dados = {"aula": codigo, "versao": 1}
    n = 0
    if "fixacao" in fonte:
        secoes = []
        for sec in fonte["fixacao"]["secoes"]:
            qs = []
            for q in sec["questoes"]:
                n += 1
                qs.append({
                    "n": n,
                    "enunciado": tex_web(" ".join(str(q["enunciado"]).split("\n"))),
                    "itens": [tex_web(i) for i in q.get("itens", [])],
                    "resolucao": linhas(q.get("resolucao")),
                    "resposta": tex_web(q.get("resposta", "")),
                })
            secoes.append({"nome": sec["nome"], "questoes": qs})
        dados["fixacao"] = {"intro": tex_web(fonte["fixacao"].get("intro", "")), "secoes": secoes}
    if "vestibular" in fonte:
        dados["vestibular"] = {
            "intro": tex_web(fonte["vestibular"].get("intro", "")),
            "questoes": [{
                "n": k,
                "enunciado": tex_web(" ".join(str(q["enunciado"]).split("\n"))),
                "opcoes": [tex_web(o) for o in q["opcoes"]],
                "correta": "ABCDE".index(q["correta"]),
                "resolucao": linhas(q.get("resolucao")),
            } for k, q in enumerate(fonte["vestibular"]["questoes"], 1)],
        }
    pdfs = {}
    for tipo in ("fixacao", "vestibular"):
        pdf = ROOT / "pdfs" / f"{tipo}-{codigo}.pdf"
        if pdf.exists():
            webp = CAPAS / f"{tipo}-{codigo}.webp"
            capa(pdf, webp)
            pdfs[tipo] = {"url": f"/pdfs/{pdf.name}", "capa": f"/pdfs/capas/{webp.name}", "paginas": paginas(pdf)}
    dados["pdfs"] = pdfs
    DEST.mkdir(parents=True, exist_ok=True)
    saida = DEST / f"{codigo}.json"
    saida.write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return saida


if __name__ == "__main__":
    codigos = [c.upper() for c in sys.argv[1:]] or sorted(p.stem for p in FONTE.glob("[ABC][0-9][0-9].yaml"))
    for c in codigos:
        print("exportado:", exportar(c).relative_to(ROOT))
