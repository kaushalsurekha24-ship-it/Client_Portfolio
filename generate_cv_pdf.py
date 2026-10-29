"""
Luxury Graphic Designer Editorial CV Generator for Sakina Murtaza Saifee.
Exact 2-page A4 specification matching the website's design system:
Deep Plum, Espresso, Burgundy, Antique Gold, Soft Ivory, and Restrained Lavender.

- NO unwanted generated headings ('CURRICULUM VITAE', 'Professional Dossier', 'Verified Engagements • 2026').
- NO decorative fake titles or invented credentials.
- 100% authentic content strictly from the website resume.
- Full, balanced A4 page layout with zero excessive empty spaces.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
import pymupdf
import os
import shutil

# Color Palette strictly matching website design tokens
COLOR_PLUM = colors.HexColor('#231032')        # Deep Plum (Website Primary Dark)
COLOR_PLUM_BANNER = colors.HexColor('#2D1540') # Rich Header Plum
COLOR_PLUM_CARD = colors.HexColor('#2F1644')   # Plum Accent Card
COLOR_ESPRESSO = colors.HexColor('#2A1E22')    # Espresso Dark Body Text
COLOR_BURGUNDY = colors.HexColor('#7A2838')    # Burgundy Section Headings
COLOR_GOLD = colors.HexColor('#C5A268')        # Antique Gold
COLOR_GOLD_LIGHT = colors.HexColor('#EAD9B8')  # Soft Gold
COLOR_LAVENDER = colors.HexColor('#C9B8D9')    # Restrained Lavender
COLOR_CREAM = colors.HexColor('#FBF9F5')       # Soft Ivory / Linen
COLOR_WHITE = colors.HexColor('#FFFFFF')
COLOR_TEXT_MUTED = colors.HexColor('#5A4E52')  # Muted Editorial Body
COLOR_BORDER = colors.HexColor('#E5DCCE')      # Warm Card Border

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages dynamically and adds an authentic editorial frame."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, num_pages):
        w, h = A4
        self.saveState()
        
        # Outer hairline antique gold frame
        self.setStrokeColor(COLOR_GOLD)
        self.setLineWidth(0.6)
        self.rect(20, 20, w - 40, h - 40)
        
        # Inner subtle hairline
        self.setStrokeColor(COLOR_GOLD_LIGHT)
        self.setLineWidth(0.3)
        self.rect(23, 23, w - 46, h - 46)

        # Footer running text (Clean, authentic, zero decorative fake titles)
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(COLOR_BURGUNDY)
        self.drawString(30, 28, "SAKINA MURTAZA SAIFEE  —  PROFESSIONAL RESUME")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        self.drawRightString(w - 30, 28, f"PAGE {self._pageNumber} OF {num_pages}")
        
        # Gold divider line at footer
        self.setStrokeColor(COLOR_GOLD)
        self.setLineWidth(0.5)
        self.line(30, 36, w - 30, 36)
        self.restoreState()


def generate_cv(output_path="Sakina_Murtaza_Saifee_Professional_CV.pdf"):
    # Page setup: A4 with 28pt margins left/right, 28pt top, 42pt bottom
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=28,
        rightMargin=28,
        topMargin=28,
        bottomMargin=42
    )

    usable_width = 595.27 - 56  # 539.27 pt

    # Typography Styles
    name_style = ParagraphStyle(
        'HeaderName',
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=23,
        textColor=COLOR_WHITE,
        spaceAfter=3
    )
    role_style = ParagraphStyle(
        'HeaderRole',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=COLOR_LAVENDER,
        textTransform='uppercase',
        spaceAfter=4
    )
    contact_style = ParagraphStyle(
        'HeaderContact',
        fontName='Helvetica',
        fontSize=8.2,
        leading=10.5,
        textColor=COLOR_GOLD_LIGHT
    )
    status_style = ParagraphStyle(
        'HeaderStatus',
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10.5,
        alignment=2,
        textColor=COLOR_LAVENDER
    )
    header_right_contact = ParagraphStyle(
        'HRightContact',
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=11.5,
        alignment=2,
        textColor=COLOR_GOLD_LIGHT
    )
    header_right_sub = ParagraphStyle(
        'HRightSub',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        alignment=2,
        textColor=COLOR_WHITE
    )

    # Sidebar Styles (Plum column)
    monogram_style = ParagraphStyle(
        'Monogram',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=15,
        textColor=COLOR_GOLD,
        alignment=1
    )
    monogram_sub = ParagraphStyle(
        'MonogramSub',
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=COLOR_LAVENDER,
        alignment=1,
        spaceAfter=8
    )
    side_heading = ParagraphStyle(
        'SideHeading',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_GOLD,
        textTransform='uppercase',
        spaceBefore=8,
        spaceAfter=5
    )
    side_item = ParagraphStyle(
        'SideItem',
        fontName='Helvetica',
        fontSize=8.3,
        leading=12,
        textColor=COLOR_WHITE,
        spaceAfter=3.2
    )
    side_subhead = ParagraphStyle(
        'SideSubhead',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11,
        textColor=COLOR_WHITE,
        spaceBefore=4,
        spaceAfter=2
    )
    side_muted = ParagraphStyle(
        'SideMuted',
        fontName='Helvetica',
        fontSize=7.6,
        leading=10.5,
        textColor=COLOR_LAVENDER,
        spaceAfter=4
    )

    # Main Body Styles (Ivory column)
    section_title = ParagraphStyle(
        'SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14,
        textColor=COLOR_PLUM,
        spaceBefore=2,
        spaceAfter=6
    )
    summary_p = ParagraphStyle(
        'SummaryP',
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=COLOR_ESPRESSO,
        spaceAfter=8
    )
    role_title = ParagraphStyle(
        'RoleTitle',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=COLOR_BURGUNDY,
        spaceAfter=2
    )
    role_meta = ParagraphStyle(
        'RoleMeta',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_GOLD,
        spaceAfter=2
    )
    role_org = ParagraphStyle(
        'RoleOrg',
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=COLOR_TEXT_MUTED,
        spaceAfter=6
    )
    bullet_p = ParagraphStyle(
        'BulletP',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.4,
        textColor=COLOR_ESPRESSO,
        leftIndent=11,
        firstLineIndent=-11,
        spaceAfter=4.5
    )

    # ══════════════════════════════════════════════════════════════
    # PAGE 1: HEADER BANNER (Full Width)
    # ══════════════════════════════════════════════════════════════
    header_left = [
        Paragraph("SAKINA MURTAZA SAIFEE", name_style),
        Paragraph("Digital Marketing Expert &bull; Creative Consultant &bull; Published Author", role_style),
        Paragraph("Location: Jalgaon, Maharashtra, India &nbsp;|&nbsp; Direct Contact: +91 93711 15252", contact_style)
    ]
    header_right = [
        Paragraph("+91 93711 15252", header_right_contact),
        Paragraph("Jalgaon, Maharashtra, India", header_right_sub),
        Spacer(1, 3),
        Paragraph("&bull; Available for Select Engagements", status_style)
    ]
    header_table = Table(
        [[header_left, header_right]],
        colWidths=[370, usable_width - 370]
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PLUM_BANNER),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, COLOR_GOLD)
    ]))

    # ══════════════════════════════════════════════════════════════
    # PAGE 1: BODY (Plum Sidebar Left + Ivory Main Content Right)
    # ══════════════════════════════════════════════════════════════
    sidebar_col = [
        Paragraph("<b>[ SS ]</b>", monogram_style),
        Paragraph("Sakina Saifee &bull; Folio Profile", monogram_sub),
        Paragraph("PROFESSIONAL FOCUS", side_heading),
        Paragraph("&bull; Social Media Management", side_item),
        Paragraph("&bull; Graphic Design &amp; Visuals", side_item),
        Paragraph("&bull; Performance Marketing", side_item),
        Paragraph("&bull; Short-Form Video &amp; Reels", side_item),
        Paragraph("&bull; Digital Brand Positioning", side_item),
        Paragraph("&bull; Content Strategy &amp; Copywriting", side_item),
        Paragraph("&bull; Corporate Training &amp; Seminars", side_item),
        Spacer(1, 10),
        Paragraph("ACADEMIC FOUNDATIONS", side_heading),
        Paragraph("Undergraduate &amp; Secondary Studies", side_subhead),
        Paragraph("Jalgaon, Maharashtra<br/>Foundation in communication, analytical thinking, and creative expression.", side_muted),
        Paragraph("Digital Marketing Certifications", side_subhead),
        Paragraph("Performance, Design &amp; Social Architecture", side_muted),
        Spacer(1, 10),
        Paragraph("LANGUAGES", side_heading),
        Paragraph("<b>English:</b> Professional Working", side_item),
        Paragraph("<b>Hindi:</b> Full Professional Fluency", side_item),
        Spacer(1, 10),
        Paragraph("CORE PURSUITS &amp; INTERESTS", side_heading),
        Paragraph("&bull; Author &amp; Creative Writing", side_item),
        Paragraph("&bull; Teaching &amp; Student Training", side_item),
        Paragraph("&bull; Youth Counselling &amp; Mentorship", side_item),
        Paragraph("&bull; Personal Development", side_item),
        Paragraph("&bull; Audience Psychology Clarity", side_item),
    ]

    main_p1_col = [
        Paragraph("<font color='#C5A268'><b>[ 01 ]</b></font> <b>EXECUTIVE SUMMARY</b>", section_title),
        Paragraph(
            "Dynamic, results-driven Digital Marketing Expert, Social Media Manager, Graphic Designer, Performance Marketer, "
            "and published Author. Combines strategic audience segmentation, creative visual communication, and video reel production "
            "to elevate brand positioning for healthcare institutions, wellness practices, and personal brands. A passionate "
            "communicator with active involvement in training, counselling, writing, and youth empowerment.",
            summary_p
        ),
        Spacer(1, 10),
        Paragraph("<font color='#C5A268'><b>[ 02 ]</b></font> <b>EXPERIENCE &amp; CLIENT ENGAGEMENTS</b>", section_title),
        
        # Role 1: Digital Marketing Expert & Creative Consultant
        Paragraph("Digital Marketing Expert &amp; Creative Consultant", role_title),
        Paragraph("Independent Practice &bull; Ongoing", role_meta),
        Paragraph("Client Portfolio Engagements &bull; Healthcare &amp; Wellness &bull; Jalgaon &amp; Regional", role_org),
        Paragraph("&bull; <b>Healthcare &amp; Wellness Campaigns:</b> Architected end-to-end digital marketing and social media campaigns for healthcare institutions (<b>Khushi Hospital</b>), Ayurvedic wellness leaders (<b>Ojus Ayurved</b>), and motivational creators (<b>Jeewan Ke Dhai Pal</b>).", bullet_p),
        Paragraph("&bull; <b>High-Impact Visual Communications:</b> Designed high-engagement social media post packs, medical awareness advisories, educational carousels, and seasonal promotional banners tailored to audience retention.", bullet_p),
        Paragraph("&bull; <b>Doctor-Led Video Production:</b> Developed short-form video concepts, scripted doctor-focused reels, and structured content calendars to maximize brand credibility and audience interaction.", bullet_p),
        Paragraph("&bull; <b>Performance Frameworks:</b> Implemented demographic targeting, audience segmentation, and lead-generation campaign frameworks resulting in enhanced inbound inquiries and digital trust.", bullet_p),
        Spacer(1, 12),

        # Role 2: Published Author & Keynote Speaker
        Paragraph("Published Author &amp; Keynote Speaker", role_title),
        Paragraph("Authorship &amp; Keynotes", role_meta),
        Paragraph("Book Publication: <i>“10 Secret Steps Towards Success”</i>", role_org),
        Paragraph("&bull; <b>Authorship:</b> Penned the motivational book <i>“10 Secret Steps Towards Success,”</i> providing actionable blueprints for youth empowerment, focus, mental clarity, and personal development.", bullet_p),
        Paragraph("&bull; <b>Civic Inauguration:</b> Officially launched by former Collector of Jalgaon, <b>Abhijeet Raut</b>, and felicitated by former Mayor <b>Jayshree Mahajan</b>.", bullet_p),
        Paragraph("&bull; <b>Keynote Address:</b> Delivered featured keynote address on the <i>“Success Blueprint”</i> at <b>Rotary Club of Bhusawal</b>; served as invited judge and mentor at <b>St. Teressa School</b>.", bullet_p),
    ]

    p1_body_table = Table(
        [[sidebar_col, main_p1_col]],
        colWidths=[165, usable_width - 165]
    )
    p1_body_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_PLUM),
        ('BACKGROUND', (1, 0), (1, 0), COLOR_CREAM),
        ('TOPPADDING', (0, 0), (-1, -1), 20),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 22),
        ('LEFTPADDING', (0, 0), (0, 0), 12),
        ('RIGHTPADDING', (0, 0), (0, 0), 12),
        ('LEFTPADDING', (1, 0), (1, 0), 16),
        ('RIGHTPADDING', (1, 0), (1, 0), 16),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEAFTER', (0, 0), (0, 0), 1, COLOR_GOLD),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
    ]))

    # ══════════════════════════════════════════════════════════════
    # PAGE 2: RUNNING HEADER BANNER (Full Width)
    # ══════════════════════════════════════════════════════════════
    p2_head_left = [
        Paragraph("<b>SAKINA MURTAZA SAIFEE</b> &nbsp;|&nbsp; <font color='#C5A268'>Professional Resume</font>", ParagraphStyle('P2HL', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=COLOR_WHITE)),
        Paragraph("Digital Marketing Expert &bull; Creative Consultant &bull; Published Author", ParagraphStyle('P2HLSub', fontName='Helvetica', fontSize=8, leading=10.5, textColor=COLOR_LAVENDER))
    ]
    p2_head_right = [
        Paragraph("Direct Contact: +91 93711 15252 &nbsp;|&nbsp; Jalgaon, Maharashtra", ParagraphStyle('P2HR', fontName='Helvetica-Bold', fontSize=8.2, leading=11, alignment=2, textColor=COLOR_GOLD_LIGHT)),
        Paragraph("&bull; Available for Select Engagements", ParagraphStyle('P2HRSub', fontName='Helvetica-Oblique', fontSize=7.6, leading=10, alignment=2, textColor=COLOR_WHITE))
    ]
    p2_header_table = Table(
        [[p2_head_left, p2_head_right]],
        colWidths=[310, usable_width - 310]
    )
    p2_header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PLUM_BANNER),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 1, COLOR_GOLD)
    ]))

    # ══════════════════════════════════════════════════════════════
    # PAGE 2: CONTENT SECTIONS (Editorial Balanced Grid)
    # ══════════════════════════════════════════════════════════════
    # Card 1: Experience Role 3 (Facilitation & Workshops)
    p2_role3_content = [
        Paragraph("<font color='#C5A268'><b>[ 02 Continued ]</b></font> <b>EXPERIENCE &amp; CLIENT ENGAGEMENTS</b>", section_title),
        Paragraph("Trainer &amp; Seminar Facilitator", role_title),
        Paragraph("Workshops &amp; Seminars", role_meta),
        Paragraph("Educational &amp; Professional Forums", role_org),
        Paragraph("&bull; <b>Youth &amp; Student Empowerment:</b> Conducted specialized seminars on personality development, dynamic memory enhancement, life skills, and effective communication for emerging students and young professionals.", bullet_p),
        Paragraph("&bull; <b>Clarity &amp; Mindset Frameworks:</b> Integrated motivational counselling and behavioral clarity into corporate and student workshops, driving measurable improvements in focus and presentation skills.", bullet_p),
    ]
    p2_role3_table = Table([[p2_role3_content]], colWidths=[usable_width])
    p2_role3_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CREAM),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
        ('LINELEFT', (0, 0), (-1, -1), 3.5, COLOR_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
    ]))

    # Section 03: Key Honors & Verified Recognitions (Stacked Editorial Cards)
    honor_badge_style = ParagraphStyle(
        'HonorBadge',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=COLOR_GOLD,
        textTransform='uppercase',
        spaceAfter=2
    )
    honor_title_style = ParagraphStyle(
        'HonorT',
        fontName='Helvetica-Bold',
        fontSize=9.8,
        leading=12.5,
        textColor=COLOR_BURGUNDY,
        spaceAfter=3
    )
    honor_desc_style = ParagraphStyle(
        'HonorD',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.2,
        textColor=COLOR_ESPRESSO
    )

    h1_card = [
        Paragraph("Official Book Launch", honor_badge_style),
        Paragraph("Collector &amp; Mayor Inauguration", honor_title_style),
        Paragraph("Motivational publication <i>“10 Secret Steps Towards Success”</i> inaugurated by former Jalgaon Collector <b>Abhijeet Raut</b> and felicitated by former Mayor <b>Jayshree Mahajan</b>.", honor_desc_style)
    ]
    h2_card = [
        Paragraph("Keynote Speaker", honor_badge_style),
        Paragraph("Rotary Club of Bhusawal", honor_title_style),
        Paragraph("Delivered invited keynote address on the <i>“Success Blueprint”</i> for leadership, goal clarity, and personal growth before distinguished community leaders.", honor_desc_style)
    ]
    h3_card = [
        Paragraph("Invited Adjudicator", honor_badge_style),
        Paragraph("St. Teressa High School", honor_title_style),
        Paragraph("Served as official judge for annual student competitions, creative presentations, speech evaluations, and talent mentorship programs.", honor_desc_style)
    ]

    honors_table = Table(
        [[h1_card], [h2_card], [h3_card]],
        colWidths=[usable_width]
    )
    honors_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CREAM),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LINELEFT', (0, 0), (-1, -1), 3.5, COLOR_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 11),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    # Section 04: Core Competencies & Creative Toolsets (3 Distinct Category Cards)
    cat_title_style = ParagraphStyle(
        'CatTitle',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=COLOR_BURGUNDY,
        spaceAfter=3
    )
    cat_tags_style = ParagraphStyle(
        'CatTags',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=COLOR_ESPRESSO
    )

    c1_card = [
        Paragraph("<b>Marketing Strategy &amp; Performance</b>", cat_title_style),
        Paragraph("Social Media Marketing &bull; Content Strategy &bull; Audience Targeting &bull; Performance Ads &bull; Campaign Structuring &bull; Content Calendars", cat_tags_style)
    ]
    c2_card = [
        Paragraph("<b>Creative Direction &amp; Content Production</b>", cat_title_style),
        Paragraph("Graphic Design &bull; Carousel Storytelling &bull; Reel Concept &amp; Scripting &bull; Visual Brand Identity &bull; Copywriting &bull; Layout Design", cat_tags_style)
    ]
    c3_card = [
        Paragraph("<b>Leadership, Speaking &amp; Mentorship</b>", cat_title_style),
        Paragraph("Public Speaking &bull; Seminar Facilitation &bull; Youth Counselling &bull; Dynamic Memory Training &bull; Book Authorship &bull; Brand Consulting", cat_tags_style)
    ]

    skills_table = Table(
        [[c1_card], [c2_card], [c3_card]],
        colWidths=[usable_width]
    )
    skills_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CREAM),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LINELEFT', (0, 0), (-1, -1), 3.5, COLOR_GOLD),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    # Bottom Contact & Engagement Card on Page 2
    contact_card_left = [
        Paragraph("<b>Sakina Murtaza Saifee</b> &nbsp;|&nbsp; <font color='#C5A268'>Digital Marketing &amp; Creative Consultant</font>", ParagraphStyle('CC1', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=COLOR_WHITE)),
        Paragraph("Comprehensive digital marketing, social storytelling, visual branding, and seminar facilitation.", ParagraphStyle('CC2', fontName='Helvetica', fontSize=7.8, leading=10.2, textColor=COLOR_LAVENDER))
    ]
    contact_card_right = [
        Paragraph("Direct Contact: <b>+91 93711 15252</b>", ParagraphStyle('CC3', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=COLOR_GOLD_LIGHT)),
        Paragraph("Location: Jalgaon, Maharashtra, India", ParagraphStyle('CC4', fontName='Helvetica', fontSize=7.8, leading=10.2, alignment=2, textColor=COLOR_WHITE)),
        Paragraph("&bull; Available for Select Engagements", ParagraphStyle('CC5', fontName='Helvetica-Oblique', fontSize=7.5, leading=9.5, alignment=2, textColor=COLOR_LAVENDER))
    ]
    contact_card_table = Table(
        [[contact_card_left, contact_card_right]],
        colWidths=[330, usable_width - 330]
    )
    contact_card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PLUM),
        ('TOPPADDING', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 11),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_GOLD),
    ]))

    # Assemble Document
    story = [
        header_table,
        Spacer(1, 8),
        p1_body_table,
        PageBreak(),
        p2_header_table,
        Spacer(1, 10),
        p2_role3_table,
        Spacer(1, 12),
        Paragraph("<font color='#C5A268'><b>[ 03 ]</b></font> <b>KEY HONORS &amp; VERIFIED RECOGNITIONS</b>", section_title),
        Spacer(1, 4),
        honors_table,
        Spacer(1, 12),
        Paragraph("<font color='#C5A268'><b>[ 04 ]</b></font> <b>CORE COMPETENCIES &amp; CREATIVE TOOLSETS</b>", section_title),
        Spacer(1, 4),
        skills_table,
        Spacer(1, 14),
        contact_card_table
    ]

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {output_path} successfully.")

if __name__ == "__main__":
    generate_cv("Sakina_Murtaza_Saifee_Professional_CV.pdf")
    # Also mirror to images/ directory
    if os.path.exists("images"):
        shutil.copyfile("Sakina_Murtaza_Saifee_Professional_CV.pdf", os.path.join("images", "Sakina_Murtaza_Saifee_Professional_CV.pdf"))
        print("Mirrored to images/Sakina_Murtaza_Saifee_Professional_CV.pdf")
