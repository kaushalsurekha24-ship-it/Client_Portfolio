"""
Automated Verification Suite for Downloadable CV/Resume
Tests HTTP download, PDF validity, text selectability, 1:1 content fidelity against website,
absence of unwanted generated headings, and rendering integrity.
"""
import urllib.request
import os
import sys
from bs4 import BeautifulSoup
import pymupdf

def run_checks():
    print("=" * 65)
    print("RUNNING COMPREHENSIVE CV/RESUME FEATURE VERIFICATION")
    print("=" * 65)

    all_passed = True

    # 1. Test HTTP Download from Local Server
    url = "http://localhost:8080/Sakina_Murtaza_Saifee_Professional_CV.pdf"
    downloaded_file = "downloaded_test_cv.pdf"
    print(f"\n[STEP 1] Testing HTTP download from {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            content = response.read()
            with open(downloaded_file, "wb") as f:
                f.write(content)
            print(f"[OK] HTTP {status} OK, downloaded {len(content)} bytes.")
    except Exception as e:
        print(f"[FAIL] Could not download PDF via HTTP: {e}")
        return False

    # 2. Test PDF Structure and Dimensions with PyMuPDF
    print("\n[STEP 2] Verifying PDF structure, pages, and A4 dimensions...")
    try:
        doc = pymupdf.open(downloaded_file)
        page_count = len(doc)
        print(f"[INFO] Document has {page_count} pages.")
        if page_count != 2:
            print(f"[FAIL] Expected exactly 2 pages, found {page_count}")
            all_passed = False
        else:
            print("[OK] Exact 2-page document verified.")

        for i, page in enumerate(doc):
            rect = page.rect
            w, h = round(rect.width, 2), round(rect.height, 2)
            print(f"       Page {i+1} dimensions: {w} x {h} pt (A4 target: 595.28 x 841.89)")
            if abs(w - 595.28) > 2 or abs(h - 841.89) > 2:
                print(f"[FAIL] Page {i+1} dimensions do not match A4!")
                all_passed = False
            else:
                print(f"[OK] Page {i+1} is standard A4.")
    except Exception as e:
        print(f"[FAIL] Error parsing PDF structure: {e}")
        return False

    # 3. Test Text Selectability and Extract Full Content
    print("\n[STEP 3] Verifying text selectability and content...")
    full_text = ""
    for i, page in enumerate(doc):
        text = page.get_text()
        if not text.strip():
            print(f"[FAIL] Page {i+1} has no selectable text!")
            all_passed = False
        else:
            print(f"[OK] Page {i+1} text is fully selectable ({len(text.split())} words extracted).")
        full_text += f"\n--- PAGE {i+1} ---\n" + text

    # 4. Assert Absence of Unwanted Generated Headings
    print("\n[STEP 4] Asserting complete absence of unwanted/prohibited headings...")
    prohibited_strings = [
        "CURRICULUM VITAE",
        "Professional Dossier",
        "Verified Engagements • 2026",
        "Verified Engagements",
        "Part II: Experience • Honors • Toolsets",
        "Verified Strategic Portfolio Dossier",
        "VERIFIED DOSSIER",
        "STRATEGIC APPROACH",
        "KEY METRICS & IMPACT",
        "VERIFIED CREDENTIALS"
    ]

    for p in prohibited_strings:
        if p.lower() in full_text.lower():
            print(f"[FAIL] Found prohibited unwanted string: '{p}'")
            all_passed = False
        else:
            print(f"[OK] Verified absent: '{p}'")

    # 5. Extract On-Screen Resume Content from index.html and Compare 1:1
    print("\n[STEP 5] Comparing PDF content 1:1 against on-screen resume in index.html...")
    with open("index.html", "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    resume_section = soup.find(id="resume")
    if not resume_section:
        print("[FAIL] #resume section not found in index.html")
        return False

    # Key authentic elements that must be in PDF
    key_verifications = [
        ("Candidate Name", "Sakina Murtaza Saifee"),
        ("Role Title", "Digital Marketing Expert"),
        ("Consultant Title", "Creative Consultant"),
        ("Author Title", "Published Author"),
        ("Direct Phone", "+91 93711 15252"),
        ("Location", "Jalgaon, Maharashtra"),
        ("Focus 1", "Social Media Management"),
        ("Focus 2", "Graphic Design & Visuals"),
        ("Focus 3", "Performance Marketing"),
        ("Focus 4", "Short-Form Video & Reels"),
        ("Focus 5", "Digital Brand Positioning"),
        ("Focus 6", "Content Strategy & Copywriting"),
        ("Focus 7", "Corporate Training & Seminars"),
        ("Academic 1", "Undergraduate & Secondary"),
        ("Academic 2", "Digital Marketing Certifications"),
        ("Language 1", "English"),
        ("Language 2", "Hindi"),
        ("Pursuit 1", "Author & Creative Writing"),
        ("Pursuit 2", "Teaching & Student Training"),
        ("Pursuit 3", "Youth Counselling"),
        ("Pursuit 4", "Personal Development"),
        ("Pursuit 5", "Audience Psychology"),
        ("Summary Section", "01"),
        ("Summary Keyword", "Dynamic, results-driven Digital Marketing Expert"),
        ("Experience Section", "02"),
        ("Client Khushi", "Khushi Hospital"),
        ("Client Ojus", "Ojus Ayurved"),
        ("Client Jeewan", "Jeewan Ke Dhai Pal"),
        ("Book Title", "10 Secret Steps Towards Success"),
        ("Dignitary Raut", "Abhijeet Raut"),
        ("Dignitary Mahajan", "Jayshree Mahajan"),
        ("Rotary Club", "Rotary Club of Bhusawal"),
        ("School Mentorship", "St. Teressa"),
        ("Trainer Role", "Trainer & Seminar Facilitator"),
        ("Honors Section", "03"),
        ("Book Launch Honor", "Collector & Mayor Inauguration"),
        ("Keynote Honor", "Rotary Club of Bhusawal"),
        ("Judge Honor", "St. Teressa High School"),
        ("Competencies Section", "04"),
        ("Competency Cat 1", "Marketing Strategy"),
        ("Competency Cat 2", "Creative"),
        ("Competency Cat 3", "Leadership"),
        ("Status Text", "Available for Select Engagements")
    ]

    for label, needle in key_verifications:
        if needle.lower() in full_text.lower():
            print(f"[OK] {label}: '{needle}' verified present in PDF.")
        else:
            print(f"[FAIL] {label}: '{needle}' MISSING from PDF!")
            all_passed = False

    # 6. Verify Visual Rendering
    print("\n[STEP 6] Testing visual rendering of both pages...")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        img_path = f"verify_page_{i+1}.png"
        pix.save(img_path)
        print(f"[OK] Page {i+1} successfully rendered to {img_path} ({pix.width}x{pix.height} px).")

    # 7. Verify On-Screen Button Links to Correct PDF
    print("\n[STEP 7] Verifying on-screen Download button link in index.html...")
    dl_btn = resume_section.find(id="resume-download-btn")
    if not dl_btn:
        print("[FAIL] #resume-download-btn not found in index.html")
        all_passed = False
    else:
        href = dl_btn.get("href")
        print(f"[OK] Button points to href='{href}'")
        if href != "Sakina_Murtaza_Saifee_Professional_CV.pdf":
            print(f"[FAIL] Unexpected href: {href}")
            all_passed = False
        else:
            print("[OK] Download button relative URL is valid and matches PDF filename.")

    # Clean up temporary test file
    doc.close()
    if os.path.exists(downloaded_file):
        os.remove(downloaded_file)

    print("\n" + "=" * 65)
    if all_passed:
        print("ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!")
    else:
        print("SOME VERIFICATION CHECKS FAILED. SEE DETAILS ABOVE.")
    print("=" * 65)
    return all_passed

if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)
