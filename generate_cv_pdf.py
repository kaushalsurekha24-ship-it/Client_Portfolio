"""
Generate a luxury graphic designer editorial CV for Sakina Murtaza Saifee.
Exact 2-page specification with deep plum, espresso, burgundy, antique gold, and restrained lavender accents.
Preserves 100% of the factual content.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
import fitz
import os

# Exact Color Palette from website design system
COLOR_PLUM = colors.HexColor('#321447')       # Deep Plum
COLOR_PLUM_LIGHT = colors.HexColor('#49245F') # Rich Plum
COLOR_ESPRESSO = colors.HexColor('#35272A')   # Espresso
COLOR_BURGUNDY = colors.HexColor('#7A2838')   # Burgundy Section Headings
COLOR_GOLD = colors.HexColor('#C5A268')        # Antique Gold
COLOR_GOLD_LIGHT = colors.HexColor('#EAD9B8')  # Soft Gold
COLOR_LAVENDER = colors.HexColor('#C9B8D9')    # Restrained Lavender
COLOR_CREAM = colors.HexColor('#FBF9F5')       # Soft Ivory / Linen
COLOR_WHITE = colors.HexColor('#FFFFFF')
COLOR_TEXT_DARK = colors.HexColor('#2A1E22')   # Readable Dark Body
COLOR_TEXT_MUTED = colors.HexColor('#5A4E52')  # Muted Editorial Body
COLOR_BORDER = colors.HexColor('#E5DCCE')

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages dynamically and adds editorial frame."""
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
        # Outer hairline antique gold frame
        self.saveState()
        self.setStrokeColor(COLOR_GOLD)
        self.setLineWidth(0.6)
        self.rect(20, 20, w - 40, h - 40)
        
        # Inner subtle hairline
        self.setStrokeColor(COLOR_GOLD_LIGHT)
        self.setLineWidth(0.3)
        self.rect(23, 23, w - 46, h - 46)

        # Footer running text
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(COLOR_BURGUNDY)
        self.drawString(30, 28, "SAKINA MURTAZA SAIFEE  •  PROFESSIONAL CURRICULUM VITAE")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        self.drawRightString(w - 30, 28, f"VERIFIED DOSSIER  •  PAGE {self._pageNumber} OF {num_pages}")
        
        # Gold divider line at footer
        self.setStrokeColor(COLOR_GOLD)
        self.setLineWidth(0.5)
        self.line(30, 36, w - 30, 36)
        self.restoreState()


def create_cv_pdf(filename="Sakina_Murtaza_Saifee_Professional_CV.pdf"):
    # Target 2-page document with exact page margins
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Define typography styles
    style_candidate_name = ParagraphStyle(
        'CandidateName',
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        textColor=COLOR_WHITE,
        spaceAfter=3
    )

    style_candidate_role = ParagraphStyle(
        'CandidateRole',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_LAVENDER,
        textTransform='uppercase',
        spaceAfter=5
    )

    style_header_contact = ParagraphStyle(
        'HeaderContact',
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=COLOR_GOLD_LIGHT
    )

    style_sidebar_h = ParagraphStyle(
        'SidebarHeading',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_GOLD,
        textTransform='uppercase',
        spaceBefore=8,
        spaceAfter=5
    )

    style_sidebar_body = ParagraphStyle(
        'SidebarBody',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=COLOR_WHITE,
        spaceAfter=3
    )

    style_sidebar_body_muted = ParagraphStyle(
        'SidebarBodyMuted',
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=COLOR_LAVENDER,
        spaceAfter=4
    )

    style_section_title = ParagraphStyle(
        'SectionTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=COLOR_PLUM,
        spaceBefore=4,
        spaceAfter=4
    )

    style_exp_role = ParagraphStyle(
        'ExpRole',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=COLOR_BURGUNDY,
        spaceAfter=1
    )

    style_exp_sub = ParagraphStyle(
        'ExpSub',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=COLOR_GOLD,
        spaceAfter=3
    )

    style_exp_bullet = ParagraphStyle(
        'ExpBullet',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=COLOR_TEXT_DARK,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=2
    )

    style_summary_text = ParagraphStyle(
        'SummaryText',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=COLOR_TEXT_DARK,
        spaceAfter=4
    )

    style_honor_title = ParagraphStyle(
        'HonorTitle',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=10.5,
        textColor=COLOR_BURGUNDY,
        spaceAfter=1
    )

    style_honor_desc = ParagraphStyle(
        'HonorDesc',
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.8,
        textColor=COLOR_TEXT_DARK,
        spaceAfter=3
    )

    style_skill_cat = ParagraphStyle(
        'SkillCat',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_BURGUNDY,
        spaceAfter=2
    )

    style_skill_tags = ParagraphStyle(
        'SkillTags',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=COLOR_TEXT_DARK,
        spaceAfter=4
    )

    # ── HEADER BANNER TABLE (Full Width across Top of Page 1) ──
    header_content_left = [
        Paragraph("SAKINA MURTAZA SAIFEE", style_candidate_name),
        Paragraph("DIGITAL MARKETING EXPERT &bull; CREATIVE CONSULTANT &bull; PUBLISHED AUTHOR", style_candidate_role),
        Paragraph("Location: Jalgaon, Maharashtra, India &nbsp;|&nbsp; Direct Contact: +91 93711 15252", style_header_contact)
    ]
    header_content_right = [
        Paragraph("<font color='#C5A268'><b>CURRICULUM VITAE</b></font>", ParagraphStyle('HRight1', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=COLOR_GOLD)),
        Paragraph("<font color='#FFFFFF'>Professional Dossier</font>", ParagraphStyle('HRight2', fontName='Helvetica-Bold', fontSize=8, leading=10, alignment=2, textColor=COLOR_WHITE)),
        Paragraph("<font color='#C9B8D9'>Verified Engagements &bull; 2026</font>", ParagraphStyle('HRight3', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=2, textColor=COLOR_LAVENDER))
    ]

    header_table = Table(
        [[header_content_left, header_content_right]],
        colWidths=[385, 150]
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PLUM),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 1.5, COLOR_GOLD)
    ]))

    # ── PAGE 1 CONTENT LAYOUT ──
    # Left Sidebar Column (170pt width)
    sidebar_p1 = [
        Paragraph("PROFESSIONAL FOCUS", style_sidebar_h),
        Paragraph("&bull; Social Media Management", style_sidebar_body),
        Paragraph("&bull; Graphic Design &amp; Visuals", style_sidebar_body),
        Paragraph("&bull; Performance Marketing", style_sidebar_body),
        Paragraph("&bull; Short-Form Video &amp; Reels", style_sidebar_body),
        Paragraph("&bull; Digital Brand Positioning", style_sidebar_body),
        Paragraph("&bull; Content Strategy &amp; Copywriting", style_sidebar_body),
        Paragraph("&bull; Corporate Training &amp; Seminars", style_sidebar_body),
        Spacer(1, 4),
        Paragraph("ACADEMIC FOUNDATIONS", style_sidebar_h),
        Paragraph("<b>Undergraduate &amp; Secondary</b>", style_sidebar_body),
        Paragraph("Jalgaon, Maharashtra<br/>Analytical thinking, communication &amp; creative expression.", style_sidebar_body_muted),
        Paragraph("<b>Digital Marketing Certifications</b>", style_sidebar_body),
        Paragraph("Performance, Design &amp; Social Architecture", style_sidebar_body_muted),
        Spacer(1, 4),
        Paragraph("LANGUAGES", style_sidebar_h),
        Paragraph("<b>English:</b> Professional Working", style_sidebar_body),
        Paragraph("<b>Hindi:</b> Full Professional Fluency", style_sidebar_body),
        Spacer(1, 4),
        Paragraph("CORE PURSUITS", style_sidebar_h),
        Paragraph("&bull; Author &amp; Creative Writing", style_sidebar_body),
        Paragraph("&bull; Teaching &amp; Student Training", style_sidebar_body),
        Paragraph("&bull; Youth Counselling &amp; Mentorship", style_sidebar_body),
        Paragraph("&bull; Audience Psychology Clarity", style_sidebar_body),
    ]

    # Right Main Column (355pt width)
    main_p1 = [
        # Block 01: Executive Summary
        Paragraph("<font color='#C5A268'><b>[ 01 ]</b></font> <b>EXECUTIVE SUMMARY</b>", style_section_title),
        Paragraph(
            "Dynamic, results-driven Digital Marketing Expert, Social Media Manager, Graphic Designer, Performance Marketer, and published Author. "
            "Combines strategic audience segmentation, creative visual communication, and video reel production to elevate brand positioning "
            "for healthcare institutions, wellness practices, and personal brands. A passionate communicator with active involvement in training, "
            "counselling, writing, and youth empowerment.",
            style_summary_text
        ),
        Spacer(1, 4),

        # Block 02: Experience & Client Engagements (First 2 Roles)
        Paragraph("<font color='#C5A268'><b>[ 02 ]</b></font> <b>EXPERIENCE &amp; CLIENT ENGAGEMENTS</b>", style_section_title),
        
        # Role 1: Digital Marketing Expert & Creative Consultant
        Paragraph("Digital Marketing Expert &amp; Creative Consultant", style_exp_role),
        Paragraph("Independent Practice &bull; Client Engagements &bull; Ongoing (Healthcare &amp; Wellness)", style_exp_sub),
        Paragraph("&bull; <b>Healthcare &amp; Wellness Campaigns:</b> Architected end-to-end digital marketing and social media strategies for healthcare institutions (<b>Khushi Hospital</b>), Ayurvedic wellness leaders (<b>Ojus Ayurved</b>), and motivational creators (<b>Jeewan Ke Dhai Pal</b>).", style_exp_bullet),
        Paragraph("&bull; <b>High-Impact Visual Communications:</b> Designed high-engagement social media post packs, medical awareness advisories, educational carousels, and seasonal promotional banners tailored to audience retention.", style_exp_bullet),
        Paragraph("&bull; <b>Doctor-Led Video Production:</b> Developed short-form video concepts, scripted doctor-focused reels, and structured content calendars to maximize brand credibility and audience interaction.", style_exp_bullet),
        Paragraph("&bull; <b>Performance Frameworks:</b> Implemented demographic targeting, audience segmentation, and lead-generation campaign frameworks resulting in enhanced inbound inquiries and digital trust.", style_exp_bullet),
        Spacer(1, 6),

        # Role 2: Published Author & Keynote Speaker
        Paragraph("Published Author &amp; Keynote Speaker", style_exp_role),
        Paragraph("Book Publication: <i>“10 Secret Steps Towards Success”</i> &bull; Keynotes &amp; Forums", style_exp_sub),
        Paragraph("&bull; <b>Authorship:</b> Penned the acclaimed motivational book <i>“10 Secret Steps Towards Success,”</i> providing actionable blueprints for youth empowerment, focus, mental clarity, and personal development.", style_exp_bullet),
        Paragraph("&bull; <b>Civic Inauguration:</b> Officially launched by former Collector of Jalgaon, <b>Abhijeet Raut</b>, and felicitated by former Mayor <b>Jayshree Mahajan</b>.", style_exp_bullet),
        Paragraph("&bull; <b>Keynote Address:</b> Delivered featured keynote on the <i>“Success Blueprint”</i> at <b>Rotary Club of Bhusawal</b>; served as invited judge and mentor at <b>St. Teressa School</b>.", style_exp_bullet),
    ]

    # Combine into 2-column table for Page 1
    page1_body_table = Table(
        [[sidebar_p1, main_p1]],
        colWidths=[165, 370]
    )
    page1_body_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_PLUM),
        ('BACKGROUND', (1, 0), (1, 0), COLOR_CREAM),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (0, 0), 12),
        ('RIGHTPADDING', (0, 0), (0, 0), 12),
        ('LEFTPADDING', (1, 0), (1, 0), 14),
        ('RIGHTPADDING', (1, 0), (1, 0), 14),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEAFTER', (0, 0), (0, 0), 1, COLOR_GOLD),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
    ]))

    # ── PAGE 2 CONTENT LAYOUT ──
    # Top Running Header for Page 2
    header_p2_left = [
        Paragraph("<b>SAKINA MURTAZA SAIFEE</b> &nbsp;|&nbsp; <font color='#C5A268'>Curriculum Vitae Continued</font>", ParagraphStyle('H2L', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_WHITE)),
        Paragraph("Digital Marketing Expert &bull; Graphic Designer &bull; Published Author", ParagraphStyle('H2LSub', fontName='Helvetica', fontSize=7.5, textColor=COLOR_LAVENDER))
    ]
    header_p2_right = [
        Paragraph("<font color='#C5A268'><b>Part II: Experience &bull; Honors &bull; Toolsets</b></font>", ParagraphStyle('H2R', fontName='Helvetica-Bold', fontSize=8, alignment=2, textColor=COLOR_GOLD)),
        Paragraph("Verified Strategic Portfolio Dossier", ParagraphStyle('H2RSub', fontName='Helvetica', fontSize=7.5, alignment=2, textColor=COLOR_WHITE))
    ]
    header_p2_table = Table(
        [[header_p2_left, header_p2_right]],
        colWidths=[335, 200]
    )
    header_p2_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_PLUM),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 1, COLOR_GOLD)
    ]))

    # Left Sidebar Column on Page 2
    sidebar_p2 = [
        Paragraph("STRATEGIC APPROACH", style_sidebar_h),
        Paragraph(
            "<i>“Elevating brands through strategic audience segmentation, authentic visual storytelling, and high-impact digital execution.”</i>",
            ParagraphStyle('Quote', fontName='Helvetica-Oblique', fontSize=7.6, leading=10.5, textColor=COLOR_GOLD_LIGHT, spaceAfter=8)
        ),
        Paragraph("KEY METRICS &amp; IMPACT", style_sidebar_h),
        Paragraph("&bull; <b>Multi-Sector Expertise:</b> Healthcare, Ayurvedic wellness, personal brands, educational forums.", style_sidebar_body),
        Paragraph("&bull; <b>End-to-End Delivery:</b> Strategy, graphics, video reels, ad copywriting, launch staging.", style_sidebar_body),
        Paragraph("&bull; <b>Audience Alignment:</b> Deep patient/consumer empathy paired with medical ethics.", style_sidebar_body),
        Spacer(1, 8),
        Paragraph("CONSULTING AVAILABILITY", style_sidebar_h),
        Paragraph("Available for select retainers, digital transformations, and keynote workshops.", style_sidebar_body),
        Spacer(1, 4),
        Paragraph("<b>Direct Phone:</b><br/>+91 93711 15252", style_sidebar_body),
        Spacer(1, 2),
        Paragraph("<b>Location:</b><br/>Jalgaon, Maharashtra, India", style_sidebar_body),
        Spacer(1, 6),
        Paragraph("VERIFIED CREDENTIALS", style_sidebar_h),
        Paragraph("&bull; Published Author", style_sidebar_body),
        Paragraph("&bull; Rotary Invited Keynote", style_sidebar_body),
        Paragraph("&bull; St. Teressa School Judge", style_sidebar_body),
    ]

    # Right Main Column on Page 2
    main_p2 = [
        # Role 3: Trainer & Seminar Facilitator
        Paragraph("<font color='#C5A268'><b>[ 02 Continued ]</b></font> <b>FACILITATION &amp; WORKSHOPS</b>", style_section_title),
        Paragraph("Trainer &amp; Seminar Facilitator", style_exp_role),
        Paragraph("Educational &amp; Professional Forums &bull; Seminars &amp; Workshops", style_exp_sub),
        Paragraph("&bull; <b>Youth &amp; Student Empowerment:</b> Conducted specialized seminars on personality development, dynamic memory enhancement, life skills, and effective communication for emerging students and young professionals.", style_exp_bullet),
        Paragraph("&bull; <b>Clarity &amp; Mindset Frameworks:</b> Integrated motivational counselling and behavioral clarity into corporate and student workshops, driving measurable improvements in focus and presentation skills.", style_exp_bullet),
        Spacer(1, 8),

        # Block 03: Key Honors & Verified Recognitions
        Paragraph("<font color='#C5A268'><b>[ 03 ]</b></font> <b>KEY HONORS &amp; VERIFIED RECOGNITIONS</b>", style_section_title),
        Paragraph("<b>Official Book Launch — Collector &amp; Mayor Inauguration</b>", style_honor_title),
        Paragraph("Motivational publication <i>“10 Secret Steps Towards Success”</i> inaugurated by former Jalgaon Collector <b>Abhijeet Raut</b> and felicitated by former Mayor <b>Jayshree Mahajan</b>.", style_honor_desc),
        
        Paragraph("<b>Keynote Speaker — Rotary Club of Bhusawal</b>", style_honor_title),
        Paragraph("Delivered invited keynote address on the <i>“Success Blueprint”</i> for leadership, goal clarity, and personal development before distinguished community leaders.", style_honor_desc),
        
        Paragraph("<b>Invited Adjudicator — St. Teressa High School</b>", style_honor_title),
        Paragraph("Served as official judge for annual student competitions, creative presentations, speech evaluations, and talent mentorship programs.", style_honor_desc),
        Spacer(1, 8),

        # Block 04: Core Competencies & Creative Toolsets
        Paragraph("<font color='#C5A268'><b>[ 04 ]</b></font> <b>CORE COMPETENCIES &amp; CREATIVE TOOLSETS</b>", style_section_title),
        Paragraph("<b>Marketing Strategy &amp; Performance:</b>", style_skill_cat),
        Paragraph("Social Media Marketing &bull; Content Strategy &bull; Audience Targeting &bull; Performance Ads &bull; Campaign Structuring &bull; Content Calendars", style_skill_tags),
        
        Paragraph("<b>Creative Direction &amp; Content Production:</b>", style_skill_cat),
        Paragraph("Graphic Design &bull; Carousel Storytelling &bull; Reel Concept &amp; Scripting &bull; Visual Brand Identity &bull; Copywriting &bull; Layout Design", style_skill_tags),
        
        Paragraph("<b>Leadership, Speaking &amp; Mentorship:</b>", style_skill_cat),
        Paragraph("Public Speaking &bull; Seminar Facilitation &bull; Youth Counselling &bull; Dynamic Memory Training &bull; Book Authorship &bull; Brand Consulting", style_skill_tags),
    ]

    page2_body_table = Table(
        [[sidebar_p2, main_p2]],
        colWidths=[165, 370]
    )
    page2_body_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_PLUM),
        ('BACKGROUND', (1, 0), (1, 0), COLOR_CREAM),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (0, 0), 12),
        ('RIGHTPADDING', (0, 0), (0, 0), 12),
        ('LEFTPADDING', (1, 0), (1, 0), 14),
        ('RIGHTPADDING', (1, 0), (1, 0), 14),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEAFTER', (0, 0), (0, 0), 1, COLOR_GOLD),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
    ]))

    # Assemble Document
    story = [
        header_table,
        Spacer(1, 6),
        page1_body_table,
        PageBreak(),
        header_p2_table,
        Spacer(1, 6),
        page2_body_table
    ]

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    create_cv_pdf("Sakina_Murtaza_Saifee_Professional_CV.pdf")
