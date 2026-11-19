#!/usr/bin/env python3
"""Gera as listas em PDF (fixação e vestibular) de cada aula do MAT MAT MAT!.

Fonte: materiais-fonte/2.3.2.yaml (uma por aula, código do livro), com a matemática em LaTeX.
Saída: pdfs/fixacao-2.3.2.pdf e pdfs/vestibular-2.3.2.pdf

Uso:  python3 scripts/gerar_listas.py 2.3.2 [4.1.1 ...] [--publicar]
      --publicar registra os PDFs na biblioteca (data/materiais.json).
      python3 scripts/gerar_listas.py --proximo   mostra o próximo lote pendente.
Requer XeLaTeX (TeX Live), as fontes Inter e PyYAML.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
FONTE = ROOT / "materiais-fonte"
DEST = ROOT / "pdfs"

PREAMBULO = r"""
\documentclass[10pt]{article}
\usepackage[a4paper,top=20mm,bottom=18mm,left=15mm,right=15mm,headsep=5mm,footskip=9mm]{geometry}
\usepackage{fontspec}
\usepackage{amsmath,amssymb,mathtools}
\usepackage{unicode-math}
\setmainfont{Inter}
\setmathfont{Latin Modern Math}[Scale=MatchLowercase]
\setmathfont[range={up/num},Scale=MatchLowercase]{Inter}
\AtBeginDocument{\thickmuskip=5mu\medmuskip=4mu\relpenalty=900\binoppenalty=10000\lineskiplimit=3pt\lineskip=5pt}
\newfontfamily\displayfont{Inter Display}[UprightFont=* ExtraBold, BoldFont=* Black]
\usepackage{ragged2e}
\hyphenpenalty=10000\exhyphenpenalty=10000
\usepackage{graphicx}
\usepackage{xcolor}
\definecolor{ink}{HTML}{211946}
\definecolor{roxo}{HTML}{4A27B7}
\definecolor{lilas}{HTML}{C9B6F7}
\definecolor{lima}{HTML}{D3FC61}
\definecolor{laranja}{HTML}{FF7956}
\definecolor{suave}{HTML}{F4F1FC}
\definecolor{mudo}{HTML}{6E6680}
\definecolor{nfacil}{HTML}{DDF99A}
\definecolor{nmedio}{HTML}{FFE08A}
\definecolor{ndificil}{HTML}{FFB49C}
\definecolor{ceu}{HTML}{B7E5FF}
\color{ink}
\usepackage{tikz}
\usetikzlibrary{calc}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18,every axis/.append style={font=\scriptsize,axis lines=middle,axis line style={-latex,ink!70},tick style={ink!50},grid style={roxo!10}}}
\usepackage{colortbl}
\usepackage{array}
\usepackage{adjustbox}
\newcommand{\apoio}[1]{\leavevmode{\color{ink!88}#1}\par\vspace{2pt}}
\newenvironment{figurinha}{\par\vspace{3pt}\centering}{\par\vspace{3pt}}
\usepackage{multicol}
\setlength{\columnsep}{8mm}
\setlength{\columnseprule}{0.4pt}
\renewcommand{\columnseprulecolor}{\color{roxo!14}}
\usepackage{enumitem}
\usepackage{fancyhdr}
\setlength{\headheight}{16pt}
\usepackage{lastpage}
\usepackage{needspace}
\usepackage{calc}
\setlength{\parindent}{0pt}
\AtBeginDocument{\RaggedRight\setlength{\RaggedRightParindent}{0pt}}
\linespread{1.13}
\frenchspacing
\raggedbottom

% ---------- marca: a logo é um único arquivo (assets/logo-mat.png) ----------
\newcommand{\marca}[1]{\includegraphics[height=#1]{<<LOGO>>}}

% ---------- cabeçalho / rodapé ----------
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyhead[L]{\raisebox{-1.6mm}{\marca{6.2mm}}\hspace{2.5mm}{\footnotesize\color{mudo}<<CABECALHO>>}}
\fancyhead[R]{\footnotesize\bfseries\color{roxo}<<TIPOCURTO>>}
\fancyfoot[L]{\footnotesize\color{mudo}Prof. João Capri \,·\, \textcolor{roxo}{@joa.capri} \,·\, matmatmat.com}
\fancyfoot[R]{\footnotesize\color{mudo}página \textbf{\textcolor{ink}{\thepage}} de \pageref*{LastPage}}
\fancypagestyle{capa}{\fancyhead{}}

% ---------- peças das questões ----------
\newlength{\badgew}\setlength{\badgew}{9mm}
\newcommand{\qnum}[1]{\tikz[baseline=(n.base)]\node[draw=roxo,line width=.8pt,text=roxo,rounded corners=3pt,inner xsep=0pt,inner ysep=2.4pt,minimum width=6.6mm,font=\small\bfseries](n){#1};}
\newcommand{\corsel}[1]{\ifcase#1\or nfacil\or nmedio\or ndificil\fi}
\newcommand{\selo}[2]{\tikz[baseline=(s.base)]\node[fill=\corsel{#1},text=ink,rounded corners=5pt,inner xsep=4.5pt,inner ysep=1.5pt,font=\fontsize{6.6}{7.5}\selectfont\bfseries](s){#2};}
\newcommand{\nivel}[3]{%
  \par\penalty-300\vspace{2mm}\noindent
  \begin{tikzpicture}
    \node[fill=\corsel{#3},text=ink,rounded corners=6pt,inner xsep=7pt,inner ysep=3pt,font=\small\bfseries,anchor=west](t) at (0,0){#1};
    \node[font=\footnotesize,text=mudo,anchor=west](r) at ($(t.east)+(5pt,0)$) {#2};
    \draw[roxo!16,line width=.6pt] ($(r.east)+(5pt,0)$) -- (\linewidth-1pt,0);
  \end{tikzpicture}\par\nopagebreak\vspace{3.5mm}}
% espaço para resolver: moldura clara com pontos a cada 5 mm (some na xerox, ajuda a alinhar a conta)
\newcommand{\caixa}[1]{\par\vspace{2mm}\noindent\begin{tikzpicture}
  \draw[roxo!30,line width=.4pt,dash pattern=on 0pt off 5mm,line cap=round,line width=.9pt] (2.5mm,-2.5mm) grid[step=5mm] ($(\linewidth-2.5mm,-#1+2.5mm)$);
  \draw[roxo!22,line width=.5pt,rounded corners=3pt] (0,0) rectangle (\linewidth,-#1);
  \end{tikzpicture}\par}
\newcommand{\lacuna}[1]{\leavevmode\raisebox{-.5ex}{\textcolor{roxo!55}{\rule{#1}{.6pt}}}}
\newcommand{\lacunam}[1]{\mathord{\raisebox{-.25ex}{\textcolor{roxo!55}{\rule{#1}{.6pt}}}}}
\newcommand{\vfbox}{\tikz[baseline=-.6ex]\node[draw=roxo!70,line width=.6pt,rounded corners=2pt,minimum width=6.5mm,minimum height=4.4mm,inner sep=0]{};}
\newcommand{\vf}[1]{\par\vspace{2.6pt}\noindent\hangindent=10mm\hangafter=1\makebox[10mm][l]{\vfbox}#1}
\newcommand{\rotulo}[1]{{\color{roxo}\bfseries(#1)}\hspace{1.5mm}}
\newcommand{\codigo}[1]{\tikz[baseline=(c.base)]\node[draw=roxo,line width=.6pt,text=roxo,rounded corners=2pt,inner xsep=2.5pt,inner ysep=1.6pt,font=\scriptsize\bfseries](c){#1};}
\newcommand{\prop}[2]{\par\vspace{2.4pt}\noindent\hangindent=8.5mm\hangafter=1\makebox[8.5mm][l]{\codigo{#1}}#2}
\newcommand{\somacampo}{\par\vspace{4pt}\hfill{\footnotesize\bfseries\color{roxo}Soma:}\hspace{2mm}\tikz[baseline=-.7ex]\node[draw=roxo,line width=.7pt,rounded corners=3pt,minimum width=14mm,minimum height=6mm]{};\par}
\newcommand{\letra}[1]{\tikz[baseline=(l.base)]\node[circle,draw=roxo,line width=.7pt,inner sep=0pt,minimum size=4.6mm,font=\scriptsize\bfseries,text=roxo](l){#1};}
\newlist{itens}{enumerate}{1}
\setlist[itens]{label={\color{roxo}\bfseries(\alph*)},leftmargin=7mm,labelsep=2mm,topsep=3pt,itemsep=3.5pt,parsep=0pt}
\newcommand{\questao}[2]{% número, corpo (inquebrável: questão e espaço ficam juntos)
  \par\noindent\begin{minipage}[t]{\linewidth}\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\RaggedRight\setlength{\parskip}{3pt}#2}\end{minipage}\par\vspace{5.5mm}}
\newcommand{\questaosel}[4]{% número, nível (1-3), nome do nível, texto
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\RaggedRight\setlength{\parskip}{3pt}\selo{#2}{#3}\par\vspace{1.2mm}#4}\par\vspace{6mm}}

% alternativas: o LaTeX mede a maior e escolhe 5, 3, 2 ou 1 coluna
\newlength{\altw}\newlength{\altmax}\newlength{\altcel}
\newcommand{\medir}[1]{\settowidth{\altw}{#1}\ifdim\altw>\altmax\global\altmax=\altw\fi}
\newcommand{\cel}[2]{\makebox[\altcel][l]{\letra{#1}\hspace{1.8mm}#2}\hspace{0pt}}
\newcommand{\umacol}[2]{\par\noindent\hangindent=7mm\hangafter=1\makebox[7mm][l]{\letra{#1}}#2}
\newcommand{\alternativas}[5]{%
  \global\altmax=0pt\medir{#1}\medir{#2}\medir{#3}\medir{#4}\medir{#5}%
  \addtolength{\altmax}{8mm}%
  \par\vspace{4pt}\setlength{\parskip}{3.5pt}\lineskiplimit=4pt\lineskip=7pt%
  \ifdim\dimexpr5\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/5-0.2pt\relax}%
  \else\ifdim\dimexpr3\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/3-0.2pt\relax}%
  \else\ifdim\dimexpr2\altmax\relax<\linewidth \setlength{\altcel}{\dimexpr\linewidth/2-0.2pt\relax}%
  \else\setlength{\altcel}{0pt}\fi\fi\fi
  \ifdim\altcel>0pt \noindent\cel{A}{#1}\cel{B}{#2}\cel{C}{#3}\cel{D}{#4}\cel{E}{#5}\par
  \else\umacol{A}{#1}\umacol{B}{#2}\umacol{C}{#3}\umacol{D}{#4}\umacol{E}{#5}\par\fi}

% ---------- gabarito ----------
\newcommand{\resolucao}[3]{%
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}#2%
   \par\vspace{2pt}\tikz[baseline=(r.base)]\node[fill=suave,text=ink,rounded corners=3pt,inner xsep=5pt,inner ysep=3pt,font=\small,text width=\linewidth-10pt](r){{\color{roxo}\scriptsize\bfseries Resposta}\quad\textbf{#3}};}\par\vspace{4.5mm}}
\newcommand{\resolucaovest}[3]{%
  \par\noindent\makebox[\badgew][l]{\qnum{#1}}%
  \parbox[t]{\linewidth-\badgew}{\small\RaggedRight\setlength{\parskip}{2.5pt}%
   \tikz[baseline=(r.base)]\node[fill=lima,text=ink,rounded corners=3pt,inner xsep=6pt,inner ysep=2.5pt,font=\small\bfseries](r){#2};\par #3}\par\vspace{4.5mm}}
\newcommand{\faixagabarito}[1]{%
  \noindent{\displayfont\fontsize{20}{23}\selectfont Gabarito resolvido}\par\vspace{1.5mm}
  \noindent\begin{tikzpicture}\fill[ink] (0,0) rectangle (\linewidth,.9pt);\fill[lima] (0,-.9pt) rectangle (34mm,-3.6pt);\end{tikzpicture}\par\vspace{5mm}}
"""

CAPA = r"""
\thispagestyle{capa}
\noindent\begin{minipage}[t]{40mm}\vspace{0pt}\marca{24mm}\end{minipage}%
\hfill\begin{minipage}[t]{\linewidth-48mm}\vspace{0pt}\raggedleft
  {\small\bfseries\color{roxo}<<KICKER>>}\par\vspace{2mm}
  {\displayfont\fontsize{22}{25}\selectfont <<TITULO>>\par}\vspace{3mm}
  \tikz[baseline=(t.base)]\node[fill=<<TIPOCOR>>,text=ink,rounded corners=5pt,inner xsep=6pt,inner ysep=2.6pt,font=\footnotesize\bfseries](t){<<TIPO>>};%
  \hspace{2mm}{\footnotesize\color{mudo}<<SUBTITULO>>}
\end{minipage}
\par\vspace{5mm}
\noindent\begin{tikzpicture}\fill[ink] (0,0) rectangle (\linewidth,.9pt);\fill[lima] (0,-.9pt) rectangle (34mm,-3.6pt);
  \node[anchor=north east,font=\scriptsize,text=mudo,inner sep=0] at (\linewidth,-2.4mm) {<<LIVRO>>};\end{tikzpicture}
\par\vspace{5mm}
{\small\bfseries\color{mudo}Nome}\enspace\textcolor{roxo!35}{\rule[-.6ex]{.52\linewidth}{.5pt}}\hfill
{\small\bfseries\color{mudo}Turma}\enspace\textcolor{roxo!35}{\rule[-.6ex]{.12\linewidth}{.5pt}}\hfill
{\small\bfseries\color{mudo}Data}\enspace\textcolor{roxo!35}{\rule[-.6ex]{.13\linewidth}{.5pt}}
\par\vspace{4.5mm}
{\small\color{mudo}<<INTRO>>}
\par\vspace{5mm}
"""

def letras_visiveis(s):
    """Aproxima o tamanho impresso de um trecho LaTeX."""
    s = re.sub(r"\\(tfrac|dfrac|frac)\{([^}]*)\}\{([^}]*)\}", r"\2\3", s)
    s = re.sub(r"\\[a-zA-Z]+", "x", s)
    s = re.sub(r"[{}$\\,^_]", "", s)
    return len(s)


def bloco(texto):
    """Quebras de linha da fonte viram parágrafos."""
    linhas = [l.strip() for l in str(texto).strip().splitlines() if l.strip()]
    return r"\par ".join(linhas)


PADRAO_ATUAL = 3
NIVEIS = {"facil": (1, "Fácil"), "medio": (2, "Médio"), "dificil": (3, "Difícil")}
LEGADO = {"aquecimento": "facil", "treino": "medio", "desafio": "dificil"}


def chave_nivel(nome):
    import unicodedata
    k = unicodedata.normalize("NFKD", str(nome)).encode("ascii", "ignore").decode().lower().strip()
    return LEGADO.get(k, k)


def nivel_vest(q, i):
    """Nível da questão de vestibular: o campo `nivel` ou, sem ele, pela posição (1–7, 8–14, 15–20)."""
    if q.get("nivel"):
        return chave_nivel(q["nivel"])
    return "facil" if i <= 7 else "medio" if i <= 14 else "dificil"


def tabela_tex(t):
    """Tabela de apoio: {cabecalho: [...], linhas: [[...], ...], legenda?}."""
    n = len(t["cabecalho"]) if t.get("cabecalho") else len(t["linhas"][0])
    cols = "|".join(["c"] * n)
    cab = " & ".join(r"\textbf{%s}" % c for c in t["cabecalho"]) if t.get("cabecalho") else ""
    linhas = r" \\ ".join(" & ".join(lacunas(c) for c in l) for l in t["linhas"])
    leg = r"\par\vspace{1pt}{\scriptsize\color{mudo}%s}" % t["legenda"] if t.get("legenda") else ""
    alto = "1.7" if any("{{" in str(c) for l in t["linhas"] for c in l) else "1.25"
    return (r"\begin{figurinha}\small\renewcommand{\arraystretch}{" + alto + r"}\arrayrulecolor{roxo!25}"
            r"\begin{adjustbox}{max width=\linewidth}\begin{tabular}{%s}%s%s\end{tabular}\end{adjustbox}%s\end{figurinha}" % (
                cols, (r"\rowcolor{suave}%s \\ \hline " % cab) if cab else r"\hline ", linhas + ("" if cab else r" \\ \hline"), leg))


def figura_tex(f):
    """Figura de apoio em TikZ/pgfplots: {tikz: '...', legenda?} ou o código direto."""
    cod = f["tikz"] if isinstance(f, dict) else f
    leg = r"\par\vspace{1pt}{\scriptsize\color{mudo}%s}" % f["legenda"] if isinstance(f, dict) and f.get("legenda") else ""
    return r"\begin{figurinha}\begin{adjustbox}{max width=\linewidth}\begin{tikzpicture}%s\end{tikzpicture}\end{adjustbox}%s\end{figurinha}" % (cod, leg)


def lacunas(s):
    """{{resposta}} vira um traço para o aluno completar, do tamanho da resposta (dentro ou fora de $...$)."""
    s = str(s)
    out, i = [], 0
    while True:
        k = s.find("{{", i)
        if k < 0:
            out.append(s[i:])
            break
        fim, prof, j = None, 0, k + 2
        while j < len(s):  # chaves balanceadas: {{\tfrac{1}{2}}}
            if s.startswith("}}", j) and prof == 0:
                fim = j
                break
            prof += {"{": 1, "}": -1}.get(s[j], 0)
            j += 1
        if fim is None:
            out.append(s[i:])
            break
        resp = s[k + 2:fim]
        largura = max(9, min(50, 2.2 * letras_visiveis(resp) + 5))
        em_math = (len(re.findall(r"(?<!\\)\$", s[:k])) % 2) == 1
        out.append(s[i:k] + (r"\lacunam{%dmm}" % largura if em_math else r"\lacuna{%dmm}" % largura))
        i = fim + 2
    return "".join(out)


def sem_lacunas(s):
    """Texto da questão para o gabarito/site: {{x}} vira a própria resposta."""
    return re.sub(r"\{\{(.*?)\}\}(?!\})", r"\1", str(s))


def tem_lacuna(q):
    celulas = [c for l in (q.get("tabela") or {}).get("linhas", []) for c in l]
    return any("{{" in str(v) for v in [q.get("enunciado", "")] + list(q.get("itens", [])) + list(q.get("afirmacoes", [])) + celulas)


def formato(q):
    """aberta (padrão), vf, associar, completar, somatoria ou objetiva."""
    if q.get("formato"):
        return q["formato"]
    if q.get("proposicoes"):
        return "somatoria"
    if q.get("opcoes"):
        return "objetiva"
    if q.get("afirmacoes"):
        return "vf"
    if q.get("esquerda"):
        return "associar"
    if tem_lacuna(q):
        return "completar"
    return "aberta"


def espaco_mm(q):
    """Altura do espaço para resolver (mm). O campo `espaco` manda; senão, depende do formato."""
    if "espaco" in q:
        return int(q["espaco"])
    f = formato(q)
    if f in ("vf",):
        return 22 if q.get("justificar") else 0
    if f in ("associar", "completar"):
        return 0
    if q.get("itens") and q.get("colunas"):
        return 0  # cada item ganha a própria caixa
    return 26 + 8 * len(q.get("itens", []))


SOMA = [1, 2, 4, 8, 16, 32, 64]


def soma_correta(q):
    return sum(SOMA[i - 1] for i in q["corretas"])


def enunciado_tex(q, fixa=False, aprof=False):
    tex = ""
    if q.get("texto"):
        tex += r"\apoio{%s}" % lacunas(bloco(q["texto"]))
    completar_tab = q.get("tabela") and any("{{" in str(c) for l in q["tabela"]["linhas"] for c in l)
    if q.get("tabela") and not completar_tab:
        tex += tabela_tex(q["tabela"])
    fig_depois = fixa and not q.get("texto")  # na fixação, sem texto de apoio, a pergunta vem antes da figura
    if q.get("figura") and not fig_depois:
        tex += figura_tex(q["figura"])
    tex += lacunas(bloco(q["enunciado"]))
    if q.get("figura") and fig_depois:
        tex += figura_tex(q["figura"])
    if completar_tab:
        tex += tabela_tex(q["tabela"])
    f = formato(q)
    if f == "vf":
        tex += r"\par\vspace{1mm}" + "".join(r"\vf{%s}" % lacunas(a) for a in q["afirmacoes"])
    if f == "associar":
        esq = "".join(r"\par\vspace{2.5pt}\noindent\hangindent=7mm\hangafter=1\makebox[7mm][l]{\rotulo{%d}}%s" % (k, x)
                      for k, x in enumerate(q["esquerda"], 1))
        dir_ = "".join(r"\vf{%s}" % x for x in q["direita"])
        tex += r"\par\vspace{1mm}%s\par\vspace{2.5mm}{\footnotesize\color{mudo}Escreva o número no quadrinho:}%s" % (esq, dir_)
    if q.get("itens"):
        n = min(2, int(q.get("colunas") or 0))
        if n >= 2:
            alt = int(q.get("espaco_item", 20))
            cel = r"\dimexpr(\linewidth-%dmm)/%d\relax" % (5 * (n - 1), n)
            linhas_ = []
            for k0 in range(0, len(q["itens"]), n):
                grupo = q["itens"][k0:k0 + n]
                cels = [r"\begin{minipage}[t]{%s}\relpenalty=10000\binoppenalty=10000\rotulo{%s}%s%s\end{minipage}" % (
                    cel, "abcdefghij"[k0 + k], lacunas(it), r"\caixa{%dmm}" % alt if alt else "")
                    for k, it in enumerate(grupo)]
                linhas_.append(r"\par\vspace{2mm}\noindent" + r"\hfill".join(cels) + (r"\hfill" if len(cels) < n else ""))
            tex += "".join(linhas_)
        else:
            tex += r"\begin{itens}" + "".join(r"\item " + lacunas(i) for i in q["itens"]) + r"\end{itens}"
    if f == "objetiva":
        tex += r"\alternativas" + "".join("{%s}" % o for o in q["opcoes"])
    if f == "somatoria":
        tex += r"\par\vspace{1mm}" + "".join(r"\prop{%02d}{%s}" % (SOMA[k], p) for k, p in enumerate(q["proposicoes"]))
        tex += r"\somacampo"
    if fixa:
        e = espaco_mm(q) + (8 if aprof and "espaco" not in q and espaco_mm(q) else 0)
        if e:
            tex += r"\caixa{%dmm}" % e
    return tex


def assunto_da_aula(aula):
    dados = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))
    for s in dados.get("assuntos", []):
        if aula["id"] in s.get("aulas", []) or (not s.get("aulas") and aula["block"] in s["modulos"]):
            ls = [l for l in dados["lessons"] if (l["id"] in s["aulas"] if s.get("aulas") else l["block"] in s["modulos"])]
            return s["nome"], [l["id"] for l in ls].index(aula["id"]) + 1, len(ls)
    return None, None, None


NOMES = {"fixacao": "Lista de fixação", "vestibular": "Lista de vestibular", "aprofundamento": "Lista de aprofundamento"}
CORES = {"fixacao": "lima", "vestibular": "ceu", "aprofundamento": "ndificil"}


def documento(aula, tipo, dados, n_listas=2):
    fixa = tipo in ("fixacao", "aprofundamento")
    nome_tipo = NOMES[tipo]
    qs_all = [q for s in dados["secoes"] for q in s["questoes"]] if tipo == "fixacao" else dados["questoes"]
    total = len(qs_all)
    titulo = re.sub(r"\s+-\s+", " — ", aula["title"])
    assunto, k, n_aulas = assunto_da_aula(aula)
    tex = PREAMBULO.replace("<<LOGO>>", str(ROOT / "assets" / "logo-mat.png"))
    tex = tex.replace("<<CABECALHO>>", (assunto + r" \,·\, " if assunto else "") + titulo)
    tex = tex.replace("<<TIPOCURTO>>", nome_tipo)
    corpo = CAPA
    vol, mod = aula["block"].split(".")
    corpo = corpo.replace("<<KICKER>>", f"{assunto} \\,·\\, aula {k} de {n_aulas}" if assunto else "")
    corpo = corpo.replace("<<TITULO>>", titulo)
    corpo = corpo.replace("<<TIPO>>", nome_tipo).replace("<<TIPOCOR>>", CORES[tipo])
    extra = " \\,·\\, com espaço para resolver" if fixa else ""
    ordem = (f"lista {list(NOMES).index(tipo) + 1} de {n_listas} \\,·\\, ") if n_listas == 3 else ""
    corpo = corpo.replace("<<SUBTITULO>>", f"{ordem}{total} questões{extra} \\,·\\, gabarito resolvido no final")
    livro = (f"Extra do site \\,·\\, aula {aula['id']}" if "x" in mod else
             f"No livro MAT MAT MAT!: Volume {vol}, módulo {mod} \\,·\\, aula {aula['id']}")
    corpo = corpo.replace("<<LIVRO>>", livro)
    corpo = corpo.replace("<<INTRO>>", dados.get("intro", ""))

    questoes, n = [], 0
    if tipo == "aprofundamento":
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for q in dados["questoes"]:
            questoes.append(q)
            corpo += r"\questao{%d}{%s}" % (len(questoes), enunciado_tex(q, fixa=True, aprof=True)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    elif fixa:
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for s in dados["secoes"]:
            ini = n + 1
            n += len(s["questoes"])
            num, nome = NIVEIS[chave_nivel(s["nome"])]
            corpo += r"\nivel{%s}{questões %d a %d}{%d}" % (nome, ini, n, num) + "\n"
            for q in s["questoes"]:
                questoes.append(q)
                corpo += r"\questao{%d}{%s}" % (len(questoes), enunciado_tex(q, fixa=True)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    else:
        corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
        for q in dados["questoes"]:
            questoes.append(q)
            num, nome = NIVEIS[nivel_vest(q, len(questoes))]
            if formato(q) == "somatoria":
                nome += r" \,·\, somatória"
            corpo += r"\questaosel{%d}{%d}{%s}{%s}" % (len(questoes), num, nome, enunciado_tex(q)) + "\n"
        corpo += r"\end{multicols}" + "\n"
    corpo += "\\clearpage\n"

    # Gabarito
    corpo += r"\faixagabarito{%s}" % nome_tipo + "\n"
    if not fixa:
        cel = []
        for i, q in enumerate(questoes):
            x, y = i % 10, i // 10
            resp = str(soma_correta(q)) if formato(q) == "somatoria" else q["correta"]
            cel.append(r"\node[draw=roxo!25,rounded corners=2pt,minimum width=15mm,minimum height=10mm] at (%.2f,%.2f) {};"
                       r"\node[font=\scriptsize\bfseries,text=mudo] at (%.2f,%.2f) {%d};"
                       r"\node[font=\bfseries,text=roxo] at (%.2f,%.2f) {%s};" % (
                           x * 1.78, -y * 1.2, x * 1.78, -y * 1.2 + 0.24, i + 1, x * 1.78, -y * 1.2 - 0.17, resp))
        corpo += (r"\noindent\resizebox{\linewidth}{!}{\begin{tikzpicture}" + "".join(cel) + r"\end{tikzpicture}}" +
                  "\n\\vspace{5mm}\n")
    corpo += r"\begin{multicols}{2}\raggedcolumns" + "\n"
    for i, q in enumerate(questoes, 1):
        if fixa:
            corpo += r"\resolucao{%d}{%s}{%s}" % (i, bloco(q["resolucao"]), q["resposta"]) + "\n"
        elif formato(q) == "somatoria":
            partes = " + ".join("%02d" % SOMA[c - 1] for c in sorted(q["corretas"]))
            corpo += r"\resolucaovest{%d}{Soma %d \,(%s)}{%s}" % (i, soma_correta(q), partes, bloco(q["resolucao"])) + "\n"
        else:
            corpo += r"\resolucaovest{%d}{Alternativa %s}{%s}" % (i, q["correta"], bloco(q["resolucao"])) + "\n"
    corpo += r"\end{multicols}" + "\n"
    return tex + "\\begin{document}\n" + corpo + "\\end{document}\n"


def validar(codigo, fonte):
    """Checagens estruturais antes de diagramar."""
    erros = []
    padrao = fonte.get("padrao", 1)
    fix = fonte.get("fixacao", {})
    qf = [q for sec in fix.get("secoes", []) for q in sec["questoes"]]
    if len(qf) != 20:
        erros.append(f"fixação tem {len(qf)} questões (esperado 20)")
    for i, q in enumerate(qf, 1):
        for campo in ("enunciado", "resolucao", "resposta"):
            if not q.get(campo):
                erros.append(f"fixação {i}: falta {campo}")
        f = formato(q)
        if f == "vf" and len(q.get("afirmacoes", [])) < 3:
            erros.append(f"fixação {i}: V ou F precisa de pelo menos 3 afirmações")
        if f == "associar" and (len(q.get("esquerda", [])) < 3 or len(q.get("direita", [])) < 3):
            erros.append(f"fixação {i}: associar precisa de pelo menos 3 itens em cada coluna")
    for sec in fix.get("secoes", []):
        if chave_nivel(sec.get("nome", "")) not in NIVEIS:
            erros.append(f"fixação: nível desconhecido '{sec.get('nome')}' (use Fácil, Médio ou Difícil)")
    qv = fonte.get("vestibular", {}).get("questoes", [])
    if len(qv) != 20:
        erros.append(f"vestibular tem {len(qv)} questões (esperado 20)")
    cont = {}
    for i, q in enumerate(qv, 1):
        if not q.get("resolucao"):
            erros.append(f"vestibular {i}: falta resolucao")
        if q.get("nivel") and chave_nivel(q["nivel"]) not in NIVEIS:
            erros.append(f"vestibular {i}: nível desconhecido '{q['nivel']}'")
        if formato(q) == "somatoria":
            ps, cs = q.get("proposicoes", []), q.get("corretas", [])
            if not 4 <= len(ps) <= 7:
                erros.append(f"vestibular {i}: somatória precisa de 4 a 7 proposições")
            if not cs or len(cs) == len(ps) or any(not 1 <= c <= len(ps) for c in cs) or len(set(cs)) != len(cs):
                erros.append(f"vestibular {i}: corretas da somatória inválidas (lista de posições, nem vazia nem todas)")
            continue
        ops = q.get("opcoes", [])
        if len(ops) != 5 or len(set(map(str, ops))) != 5:
            erros.append(f"vestibular {i}: precisa de 5 alternativas distintas")
        if q.get("correta") not in list("ABCDE"):
            erros.append(f"vestibular {i}: correta inválida")
        cont[q.get("correta")] = cont.get(q.get("correta"), 0) + 1
    objetivas = sum(cont.values())
    if padrao >= 3:
        if "{{{" in json.dumps(fonte, ensure_ascii=False):
            erros.append("lacuna colada em chave: escreva \\dfrac{ {{x}} }{ {{y}} }, com espaço")
        qa = fonte.get("aprofundamento", {}).get("questoes", [])
        if not 8 <= len(qa) <= 12:
            erros.append(f"aprofundamento tem {len(qa)} questões (esperado de 8 a 12, o padrão é 10)")
        for i, q in enumerate(qa, 1):
            for campo in ("enunciado", "resolucao", "resposta"):
                if not q.get(campo):
                    erros.append(f"aprofundamento {i}: falta {campo}")
        formatos = [formato(q) for q in qf]
        criativas = sum(1 for f, q in zip(formatos, qf) if f in ("vf", "associar", "completar") or q.get("colunas"))
        if len(set(formatos)) < 3 or criativas < 5:
            erros.append(f"fixação pouco variada: formatos {sorted(set(formatos))}, {criativas} questões em formato não aberto (mínimo 3 formatos e 5 questões)")
        som = sum(1 for q in qv if formato(q) == "somatoria")
        if not 3 <= som <= 6:
            erros.append(f"vestibular tem {som} somatórias (esperado de 3 a 6)")
        ctx = [q for q in qv if q.get("tabela") or q.get("figura") or len(str(q.get("texto", ""))) >= 120]
        curtas = [q for q in qv if not (q.get("texto") or q.get("tabela") or q.get("figura")) and len(str(q["enunciado"])) <= 200]
        if len(ctx) < 8:
            erros.append(f"vestibular tem {len(ctx)} questões contextualizadas (mínimo 8: texto de apoio, tabela ou figura)")
        if sum(1 for q in qv if q.get("tabela") or q.get("figura")) < 3:
            erros.append("vestibular precisa de pelo menos 3 questões com tabela ou figura")
        if len(curtas) < 4:
            erros.append(f"vestibular tem {len(curtas)} questões curtas e diretas (mínimo 4)")
        if objetivas and any(not 2 <= cont.get(l, 0) <= 5 for l in "ABCDE"):
            erros.append(f"gabarito desequilibrado: {cont} (cada letra de 2 a 5 vezes)")
    elif padrao == 2:
        contexto = [q for q in qv if q.get("tabela") or q.get("figura") or len(str(q.get("texto", ""))) >= 120]
        if len(contexto) < 10:
            erros.append(f"vestibular tem {len(contexto)} questões com contexto (mínimo 10)")
        if sum(1 for q in qv if q.get("tabela") or q.get("figura")) < 3:
            erros.append("vestibular precisa de pelo menos 3 questões com tabela ou figura")
    if padrao < 3 and qv and any(not 3 <= cont.get(l, 0) <= 5 for l in "ABCDE"):
        erros.append(f"gabarito desequilibrado: {cont} (cada letra deve aparecer de 3 a 5 vezes)")
    if erros:
        sys.exit(f"{codigo}: fonte inválida\n  - " + "\n  - ".join(erros))


def padrao_fonte(codigo):
    """0 = sem fonte; 1 = lista antiga (aproveitar e revisar); 2 = padrão atual."""
    f = FONTE / f"{codigo}.yaml"
    if not f.exists():
        return 0
    return (yaml.safe_load(f.read_text(encoding="utf-8")) or {}).get("padrao", 1)


def proximo_lote(tamanho=6):
    """Próximas aulas sem lista no padrão atual (sem fonte, ou fonte antiga a revisar),
    na ordem do livro, sem atravessar a fronteira de um módulo."""
    aulas = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]
    pendentes = [a for a in aulas if padrao_fonte(a["id"]) < PADRAO_ATUAL]
    if not pendentes:
        return []
    bloco = pendentes[0]["block"]
    return [a for a in pendentes if a["block"] == bloco][:tamanho]


def ajustar(x):
    """Ajustes tipográficos: intervalos como ]-3, 5[ ganham espaçamento de delimitador."""
    if isinstance(x, str):
        # colchete "]" que abre intervalo e "[" que fecha: espaçamento de delimitador
        x = re.sub(r"(?<!\\)\](?=-|\d|\\infty)",
                   lambda m: "]" if re.search(r"\\sqrt\[[^\]]*$", x[:m.start()]) else r"\mathopen{]}", x)
        x = re.sub(r"(?<!\\)(?<!\\left)(?<!\\right)\[(?=\$|\s|\\,|\\cup|\\cap|\\quad|\\ |\)|,|\.|;|$)", r"\\mathclose{[}", x)
        return x
    if isinstance(x, list):
        return [ajustar(i) for i in x]
    if isinstance(x, dict):
        return {k: (v if k == "figura" else ajustar(v)) for k, v in x.items()}
    return x


def gerar(codigo):
    aulas = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]
    aula = next(a for a in aulas if a["id"] == codigo)
    fonte = yaml.safe_load((FONTE / f"{codigo}.yaml").read_text(encoding="utf-8"))
    validar(codigo, fonte)
    fonte = ajustar(fonte)
    DEST.mkdir(exist_ok=True)
    saidas = []
    n_listas = sum(1 for t in NOMES if t in fonte)
    for tipo in NOMES:
        if tipo not in fonte:
            continue
        tex = documento(aula, tipo, fonte[tipo], n_listas)
        with tempfile.TemporaryDirectory() as tmp:
            arq = Path(tmp) / "lista.tex"
            arq.write_text(tex, encoding="utf-8")
            for _ in range(2):  # 2 passadas: capa (overlay) e número total de páginas
                r = subprocess.run(["xelatex", "-interaction=nonstopmode", "-halt-on-error", arq.name],
                                   cwd=tmp, capture_output=True, text=True)
                if r.returncode:
                    debug = Path(tempfile.gettempdir()) / f"erro-{tipo}-{codigo}.tex"
                    debug.write_text(tex, encoding="utf-8")
                    sys.exit(f"Erro no XeLaTeX ({codigo} {tipo}); fonte em {debug}:\n" + r.stdout[-2500:])
            destino = DEST / f"{tipo}-{codigo}.pdf"
            shutil.copy(Path(tmp) / "lista.pdf", destino)
            saidas.append(destino)
    return saidas


TITULOS = {
    "fixacao": "Lista de fixação {id} — 20 questões com espaço para resolver + gabarito resolvido",
    "vestibular": "Lista de vestibular {id} — 20 questões + gabarito resolvido",
    "aprofundamento": "Lista de aprofundamento {id} — questões mais puxadas + gabarito resolvido",
}


def publicar(codigo, pdfs):
    """Registra os PDFs da aula em data/materiais.json (fonte de verdade da biblioteca)."""
    idx_path = ROOT / "data" / "materiais.json"
    idx = json.loads(idx_path.read_text(encoding="utf-8"))
    entrada = next((e for e in idx if e.get("tipo") == "aula" and e.get("aula") == codigo), None)
    if entrada is None:
        entrada = {"aula": codigo, "arquivos": [], "tipo": "aula"}
        idx.append(entrada)
        idx.sort(key=lambda e: (e.get("tipo") != "aula", e.get("aula") or e.get("assunto") or e.get("area") or ""))
    por_url = {a["url"]: a for a in entrada["arquivos"]}
    for pdf in pdfs:
        tipo = pdf.stem.split("-")[0]
        url = f"/pdfs/{pdf.name}"
        if url in por_url:
            por_url[url]["titulo"] = TITULOS[tipo].format(id=codigo)
        else:
            entrada["arquivos"].append({"titulo": TITULOS[tipo].format(id=codigo), "tipo": "lista", "url": url})
    idx_path.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    if "--proximo" in sys.argv:
        lote = proximo_lote()
        ids = [a["id"] for a in json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))["lessons"]]
        nivel = {c: padrao_fonte(c) for c in ids}
        novas = sum(1 for v in nivel.values() if v >= PADRAO_ATUAL)
        antigas = sum(1 for v in nivel.values() if 0 < v < PADRAO_ATUAL)
        print(f"Aulas com listas no padrão atual: {novas}/{len(ids)} (mais {antigas} antigas a revisar)")
        print("Próximo lote:" if lote else "Todas as aulas têm listas no padrão atual.")
        for a in lote:
            marca = "  [revisar lista antiga]" if 0 < nivel[a["id"]] < PADRAO_ATUAL else ""
            print(f"  {a['id']} (módulo {a['block']}) {a['title']} — {a['summary']}{marca}")
        sys.exit(0)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    for c in args or ["2.3.2"]:
        pdfs = gerar(c)
        for s in pdfs:
            print("gerado:", s.relative_to(ROOT))
        from exportar_listas import exportar  # questões interativas e capas para a página da aula
        print("exportado:", exportar(c).relative_to(ROOT))
        if "--publicar" in sys.argv:
            publicar(c, pdfs)
            print("publicado em data/materiais.json:", c)
