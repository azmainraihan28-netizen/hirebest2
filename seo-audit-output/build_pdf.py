"""Convert FULL-AUDIT-REPORT.md to a professional A4 PDF using reportlab."""
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

INPUT = r"E:\Ai claude\Hirebest\seo-audit-output\FULL-AUDIT-REPORT.md"
OUTPUT = r"E:\Ai claude\Hirebest\seo-audit-output\HireBest-SEO-Audit-Report.pdf"

# --- Styles -----------------------------------------------------------------
BRAND = colors.HexColor("#0F172A")      # slate-900
ACCENT = colors.HexColor("#2563EB")     # blue-600
MUTED = colors.HexColor("#64748B")      # slate-500
BG_LIGHT = colors.HexColor("#F1F5F9")   # slate-100
DANGER = colors.HexColor("#DC2626")
WARN = colors.HexColor("#D97706")
OK = colors.HexColor("#16A34A")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
                    fontSize=22, leading=28, textColor=BRAND, spaceBefore=14, spaceAfter=10)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                    fontSize=16, leading=20, textColor=BRAND, spaceBefore=14, spaceAfter=8,
                    borderPadding=4)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold",
                    fontSize=13, leading=17, textColor=ACCENT, spaceBefore=10, spaceAfter=6)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica",
                      fontSize=10, leading=14, textColor=BRAND, spaceAfter=6, alignment=TA_LEFT)
CODE = ParagraphStyle("Code", parent=styles["Code"], fontName="Courier",
                      fontSize=8.5, leading=11, textColor=BRAND, backColor=BG_LIGHT,
                      borderPadding=6, leftIndent=4, rightIndent=4, spaceAfter=8)
COVER_TITLE = ParagraphStyle("CoverTitle", fontName="Helvetica-Bold", fontSize=34, leading=40,
                             textColor=BRAND, alignment=TA_CENTER, spaceAfter=10)
COVER_SUB = ParagraphStyle("CoverSub", fontName="Helvetica", fontSize=14, leading=18,
                           textColor=MUTED, alignment=TA_CENTER, spaceAfter=20)
COVER_META = ParagraphStyle("CoverMeta", fontName="Helvetica", fontSize=11, leading=16,
                            textColor=BRAND, alignment=TA_CENTER, spaceAfter=4)
SCORE = ParagraphStyle("Score", fontName="Helvetica-Bold", fontSize=72, leading=80,
                       textColor=DANGER, alignment=TA_CENTER)
SCORE_LABEL = ParagraphStyle("ScoreLabel", fontName="Helvetica-Bold", fontSize=14,
                             textColor=MUTED, alignment=TA_CENTER, spaceAfter=24)


def inline_md(text):
    """Convert minimal inline markdown to reportlab markup."""
    # escape angle brackets
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # bold **x**
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # code `x`
    text = re.sub(r"`([^`]+?)`", r"<font name='Courier' backColor='#F1F5F9'>\1</font>", text)
    # links [t](u) -> t
    text = re.sub(r"\[([^\]]+?)\]\(([^)]+?)\)", r"<link href='\2' color='#2563EB'>\1</link>", text)
    return text


def build_table(lines):
    """lines: list of '|a|b|c|' strings; second is the divider."""
    rows = []
    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue
        if re.match(r"^\|[-:\s|]+\|$", ln):
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        cells = [Paragraph(inline_md(c), BODY) for c in cells]
        rows.append(cells)
    if not rows:
        return None
    ncols = max(len(r) for r in rows)
    # normalize
    rows = [r + [Paragraph("", BODY)] * (ncols - len(r)) for r in rows]
    col_w = (180 / ncols) * mm
    t = Table(rows, colWidths=[col_w] * ncols, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E2E8F0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    # Force the header text white by wrapping header cells in white paragraphs.
    return t


def parse_md(md):
    """Yield reportlab flowables from markdown."""
    flows = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        ln = lines[i]
        # code block
        if ln.strip().startswith("```"):
            j = i + 1
            block = []
            while j < len(lines) and not lines[j].strip().startswith("```"):
                block.append(lines[j])
                j += 1
            txt = "\n".join(block).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            txt = txt.replace(" ", "&nbsp;").replace("\n", "<br/>")
            flows.append(Paragraph(txt, CODE))
            i = j + 1
            continue
        # horizontal rule
        if re.match(r"^---+\s*$", ln):
            flows.append(Spacer(1, 6))
            t = Table([[""]], colWidths=[180 * mm], rowHeights=[0.4])
            t.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, 0), 0.6, colors.HexColor("#CBD5E1"))]))
            flows.append(t)
            flows.append(Spacer(1, 6))
            i += 1
            continue
        # headings
        if ln.startswith("# "):
            flows.append(Paragraph(inline_md(ln[2:].strip()), H1))
            i += 1; continue
        if ln.startswith("## "):
            flows.append(Paragraph(inline_md(ln[3:].strip()), H2))
            i += 1; continue
        if ln.startswith("### "):
            flows.append(Paragraph(inline_md(ln[4:].strip()), H3))
            i += 1; continue
        if ln.startswith("#### "):
            flows.append(Paragraph(inline_md(ln[5:].strip()), H3))
            i += 1; continue
        # table
        if ln.strip().startswith("|") and ln.strip().endswith("|"):
            block = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                block.append(lines[i])
                i += 1
            t = build_table(block)
            if t:
                flows.append(t)
                flows.append(Spacer(1, 6))
            continue
        # blockquote
        if ln.startswith("> "):
            flows.append(Paragraph("<i>" + inline_md(ln[2:].strip()) + "</i>", BODY))
            i += 1; continue
        # list
        if re.match(r"^\s*[-*]\s+", ln) or re.match(r"^\s*\d+\.\s+", ln):
            items = []
            while i < len(lines) and (re.match(r"^\s*[-*]\s+", lines[i]) or re.match(r"^\s*\d+\.\s+", lines[i])):
                txt = re.sub(r"^\s*[-*]\s+", "", lines[i])
                txt = re.sub(r"^\s*\d+\.\s+", "", txt)
                items.append(ListItem(Paragraph(inline_md(txt), BODY), leftIndent=12))
                i += 1
            flows.append(ListFlowable(items, bulletType="bullet", start="circle",
                                       leftIndent=14, bulletFontSize=8))
            flows.append(Spacer(1, 4))
            continue
        # blank
        if not ln.strip():
            i += 1; continue
        # paragraph
        flows.append(Paragraph(inline_md(ln), BODY))
        i += 1
    return flows


def header_footer(canvas, doc):
    canvas.saveState()
    # header bar
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 14 * mm, A4[0], 14 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(15 * mm, A4[1] - 9 * mm, "HireBest.online — SEO Audit Report")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 15 * mm, A4[1] - 9 * mm, "2026-05-31")
    # footer
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(15 * mm, 10 * mm, "Generated by Claude SEO Audit skill")
    canvas.drawRightString(A4[0] - 15 * mm, 10 * mm, f"Page {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
    canvas.line(15 * mm, 14 * mm, A4[0] - 15 * mm, 14 * mm)
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    # solid background panel near top
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 90 * mm, A4[0], 90 * mm, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, A4[1] - 92 * mm, A4[0], 2 * mm, fill=1, stroke=0)
    # title
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 30)
    canvas.drawCentredString(A4[0] / 2, A4[1] - 50 * mm, "HireBest.online")
    canvas.setFont("Helvetica", 16)
    canvas.drawCentredString(A4[0] / 2, A4[1] - 62 * mm, "Full SEO Audit Report")
    canvas.setFont("Helvetica", 11)
    canvas.setFillColor(colors.HexColor("#94A3B8"))
    canvas.drawCentredString(A4[0] / 2, A4[1] - 75 * mm, "B2B SaaS · AI Resume Screening")
    # score block
    canvas.setFillColor(BRAND)
    canvas.setFont("Helvetica", 12)
    canvas.drawCentredString(A4[0] / 2, A4[1] - 130 * mm, "Overall SEO Health Score")
    canvas.setFillColor(DANGER)
    canvas.setFont("Helvetica-Bold", 96)
    canvas.drawCentredString(A4[0] / 2, A4[1] - 175 * mm, "38")
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 12)
    canvas.drawCentredString(A4[0] / 2, A4[1] - 185 * mm, "out of 100  ·  Critical")
    # meta footer
    canvas.setFillColor(BRAND)
    canvas.setFont("Helvetica", 10)
    canvas.drawCentredString(A4[0] / 2, 40 * mm, "https://hirebest.online/")
    canvas.drawCentredString(A4[0] / 2, 33 * mm, "Audit date: 2026-05-31")
    canvas.drawCentredString(A4[0] / 2, 26 * mm, "Generated by Claude SEO Audit skill")
    canvas.restoreState()


def main():
    with open(INPUT, "r", encoding="utf-8") as f:
        md = f.read()

    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=15 * mm, rightMargin=15 * mm,
        topMargin=22 * mm, bottomMargin=18 * mm,
        title="HireBest.online — SEO Audit Report",
        author="Claude SEO Audit"
    )
    story = [PageBreak()]  # cover handled by onFirstPage
    story.extend(parse_md(md))

    doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
    print(f"PDF written to: {OUTPUT}")


if __name__ == "__main__":
    main()
