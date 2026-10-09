#!/usr/bin/env python3
"""Gera PDFs A4 padronizados a partir de conteudos/{A,B,C}NN.json.

Execução: python scripts/gerar_pdfs.py [A17 ...]
Sem argumentos, percorre todos os arquivos de conteudos.
Dependências: reportlab, fontes DejaVu Sans (Ubuntu).
"""
import sys
import json
import re
import html
from pathlib import Path

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, KeepTogether, Table, TableStyle, HRFlowable
)

ROOT = Path(__file__).resolve().parent.parent
CONT = ROOT / "conteudos"
DEST = ROOT / "pdfs"
P = colors.HexColor("#4A27B7")
DARK = colors.HexColor("#211946")
LIME = colors.HexColor("#D3FC61")
MUTED = colors.HexColor("#655D77")
W, H = A4


def load_fonts():
    paths = [
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        ("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
         "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"),
    ]
    for regular, bold in paths:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont("Capri", regular))
            pdfmetrics.registerFont(TTFont("CapriBold", bold))
            pdfmetrics.registerFontFamily("Capri", normal="Capri", bold="CapriBold")
            return
    raise RuntimeError("Instale fonts-dejavu-core antes de gerar os PDFs.")


def esc(s):
    return html.escape(str(s), quote=False)


def styles():
    return {
        "title": ParagraphStyle("TitleCapri", fontName="CapriBold", fontSize=18, leading=23, textColor=DARK, spaceAfter=7),
        "label": ParagraphStyle("LabelCapri", fontName="CapriBold", fontSize=8, leading=13, textColor=P, spaceAfter=5),
        "body": ParagraphStyle("BodyCapri", fontName="Capri", fontSize=9.4, leading=15, textColor=DARK, spaceAfter=7),
        "small": ParagraphStyle("SmallCapri", fontName="Capri", fontSize=8.3, leading=12.8, textColor=DARK),
        "answer": ParagraphStyle("AnswerCapri", fontName="CapriBold", fontSize=9.5, leading=14.5, textColor=DARK, spaceAfter=4),
        "comment": ParagraphStyle("CommentCapri", fontName="Capri", fontSize=9, leading=14.7, textColor=DARK),
        "note": ParagraphStyle("NoteCapri", fontName="Capri", fontSize=8.5, leading=13.2, textColor=MUTED, spaceAfter=17),
    }


def check_questions(questions, lesson_id):
    if not isinstance(questions, list):
        raise ValueError(f"{lesson_id}: lista precisa ser um array")
    for i, q in enumerate(questions, 1):
        if not q.get("enunciado"):
            raise ValueError(f"{lesson_id}, questão {i}: enunciado vazio")
        op = q.get("opcoes")
        if not isinstance(op, list) or len(op) != 5:
            raise ValueError(f"{lesson_id}, questão {i}: são obrigatórias 5 alternativas")
        if len(set(map(str, op))) != 5:
            raise ValueError(f"{lesson_id}, questão {i}: alternativas duplicadas")
        correct = q.get("correta")
        if not isinstance(correct, int) or isinstance(correct, bool) or not (0 <= correct < 5):
            raise ValueError(f"{lesson_id}, questão {i}: índice de resposta inválido")
        if not q.get("comentario"):
            raise ValueError(f"{lesson_id}, questão {i}: resolução não fornecida")


def page_decoration(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(P)
    canvas.rect(0, H-14, W*0.69, 14, fill=1, stroke=0)
    canvas.setFillColor(LIME)
    canvas.rect(W*0.69, H-14, W*0.17, 14, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#FF7956"))
    canvas.rect(W*0.86, H-14, W*0.14, 14, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#D4CBDF"))
    canvas.line(42, 46, W-42, 46)
    canvas.setFont("CapriBold", 8)
    canvas.setFillColor(P)
    canvas.drawString(42, 32, "CAPRI.MAT  /  PROF. JOÃO CAPRI")
    canvas.setFont("Capri", 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(W-42, 32, f"{doc.page}")
    canvas.restoreState()


def header(story, s, lesson, kind, num):
    story.append(Paragraph("✳  CAPRI.MAT  /  PROF. JOÃO CAPRI", s["label"]))
    story.append(Paragraph(esc(lesson.get("title") or lesson.get("id")), s["title"]))
    story.append(Paragraph(
        f"AULA {lesson['id']}  ·  {'LISTA DE EXERCÍCIOS' if kind=='lista' else 'GABARITO COMENTADO'}  ·  {num} QUESTÕES",
        s["label"]))
    story.append(HRFlowable(width="100%", thickness=1.3, color=DARK, spaceBefore=5, spaceAfter=12))
    if kind == "lista":
        story.append(Paragraph("<b>NOME:</b> __________________________________    <b>TURMA:</b> ______________    <b>DATA:</b> __________", s["small"]))
        story.append(Spacer(1, 17))
        story.append(Paragraph("Resolva com atenção e assinale apenas uma alternativa por questão. Questões autorais no estilo vestibular; não são reproduções de exames oficiais.", s["note"]))
    else:
        story.append(Paragraph("Compare sua resposta com a alternativa correta e leia a justificativa. Este é um material complementar de revisão.", s["note"]))


def questions_section(story, s, questions):
    for i, q in enumerate(questions, 1):
        elems = [
            Paragraph(f"<b>{i:02d}.</b> <font color='#4A27B7'>[{esc(q.get('nivel', 'Questão'))}]</font> {esc(q['enunciado'])}", s["body"])
        ]
        opts = q["opcoes"]
        rows = []
        for n in (0, 2, 4):
            left = f"<b>{chr(65+n)})</b> {esc(opts[n])}"
            right = f"<b>{chr(65+n+1)})</b> {esc(opts[n+1])}" if n+1 < len(opts) else ""
            rows.append([Paragraph(left, s["small"]), Paragraph(right, s["small"]) if right else ""])
        tab = Table(rows, colWidths=[236, 236], hAlign="LEFT")
        tab.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 1),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elems.extend([tab, Spacer(1, 14)])
        story.append(KeepTogether(elems))


def answers_section(story, s, questions):
    for i, q in enumerate(questions, 1):
        label = chr(65+q["correta"])
        story.append(KeepTogether([
            Paragraph(f"{i:02d}. <font color='#4A27B7'>Alternativa {label}</font>", s["answer"]),
            Paragraph(esc(q["comentario"]), s["comment"]),
            Spacer(1, 10)
        ]))


def build_pdf(lesson, questions, kind, dest):
    s = styles()
    doc = SimpleDocTemplate(
        str(dest), pagesize=A4,
        leftMargin=49, rightMargin=49,
        topMargin=37, bottomMargin=63,
        title=f"Capri Matemática | {lesson['id']} | {kind}",
        author="Prof. João Capri / material produzido com auxílio de IA",
        subject="Lista autoral estilo vestibular"
    )
    story = []
    header(story, s, lesson, kind, len(questions))
    if kind == "lista":
        questions_section(story, s, questions)
    else:
        answers_section(story, s, questions)
    story.append(Spacer(1, 18))
    story.append(Paragraph("Material piloto sujeito à revisão pedagógica do professor.", s["note"]))
    doc.build(story, onFirstPage=page_decoration, onLaterPages=page_decoration)


def main():
    load_fonts()
    catalog = json.loads((ROOT / "data" / "aulas.json").read_text(encoding="utf-8"))
    lessons = {l["id"]: l for l in catalog["lessons"]}
    target_ids = sys.argv[1:]
    candidates = [CONT / (code + ".json") for code in target_ids] if target_ids else sorted(CONT.glob("*.json"))
    DEST.mkdir(parents=True, exist_ok=True)
    total = 0
    for file in candidates:
        code = file.stem
        if not re.fullmatch(r"[ABC]\d{2}", code):
            continue
        if code not in lessons:
            raise ValueError(f"Aula desconhecida: {code}")
        content = json.loads(file.read_text(encoding="utf-8"))
        questions = content.get("lista")
        if not questions:
            continue
        check_questions(questions, code)
        for kind in ("lista", "gabarito"):
            dest = DEST / f"{kind}-{code}.pdf"
            build_pdf(lessons[code], questions, kind, dest)
            print(f"{dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
        total += 1
    print(f"Concluído: {total} aulas com PDFs.")


if __name__ == "__main__":
    main()
