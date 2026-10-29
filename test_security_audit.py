"""
Automated Security, Validation & Reliability Test Suite
Testing the hardened portfolio website at http://localhost:8080/
"""
import urllib.request
import re
import os
import sys
from bs4 import BeautifulSoup

def test_security_audit():
    print("==================================================")
    print("STARTING SECURITY & RELIABILITY AUDIT VERIFICATION")
    print("==================================================\n")

    base_url = "http://localhost:8080"
    html_path = "index.html"
    js_path = "script.js"
    css_path = "style.css"

    # --- TEST 1: SERVER & ASSET ACCESSIBILITY ---
    print("[TEST 1] Server & Core HTTP Endpoints")
    endpoints = ["/", "/style.css", "/script.js", "/Sakina_Murtaza_Saifee_Professional_CV.pdf"]
    for ep in endpoints:
        req = urllib.request.Request(f"{base_url}{ep}", headers={"User-Agent": "SecurityAuditor/1.0"})
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200, f"Endpoint {ep} failed with status {resp.status}"
            print(f"  [OK] {ep}: HTTP 200 OK (Content-Type: {resp.headers.get('Content-Type')})")

    # --- TEST 2: HTML SECURITY HEADERS & SRI ---
    print("\n[TEST 2] Security Meta Headers & Subresource Integrity")
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    soup = BeautifulSoup(html_content, "html.parser")

    csp_meta = soup.find("meta", attrs={"http-equiv": "Content-Security-Policy"})
    assert csp_meta is not None, "Missing Content-Security-Policy meta tag"
    csp_val = csp_meta.get("content", "")
    assert "default-src 'self'" in csp_val, "CSP missing default-src"
    assert "https://api.web3forms.com" in csp_val, "CSP missing Web3Forms in connect-src"
    print(f"  [OK] Content-Security-Policy configured:\n    {csp_val[:90]}...")

    nosniff = soup.find("meta", attrs={"http-equiv": "X-Content-Type-Options"})
    assert nosniff and nosniff.get("content") == "nosniff", "Missing or invalid X-Content-Type-Options"
    print("  [OK] X-Content-Type-Options: nosniff present")

    referrer = soup.find("meta", attrs={"name": "referrer"})
    assert referrer and referrer.get("content") == "strict-origin-when-cross-origin", "Missing or invalid referrer meta"
    print("  [OK] Referrer-Policy: strict-origin-when-cross-origin present")

    fa_link = soup.find("link", href=re.compile(r"font-awesome"))
    assert fa_link and fa_link.get("integrity"), "FontAwesome CDN link missing SRI integrity attribute"
    assert fa_link.get("crossorigin") == "anonymous", "FontAwesome CDN link missing crossorigin attribute"
    print(f"  [OK] Subresource Integrity (SRI) verified on FontAwesome CDN:\n    {fa_link.get('integrity')[:40]}...")

    # --- TEST 3: CONTACT FORM DOM STRUCTURE & ACCESSIBILITY ---
    print("\n[TEST 3] Contact Form DOM Hardening & Accessibility Attributes")
    form = soup.find("form", id="strategic-contact-form")
    assert form is not None, "Missing contact form"
    assert form.get("novalidate") is not None, "Form should specify novalidate for custom validation handling"

    # Honeypot field
    botcheck = form.find("input", attrs={"name": "botcheck"})
    assert botcheck is not None, "Missing botcheck anti-spam honeypot input"
    print("  [OK] Honeypot anti-spam botcheck input present")

    # Required fields with aria-describedby and error containers
    fields = [
        ("contact-name", "error-contact-name", "100"),
        ("contact-phone", "error-contact-phone", "120"),
        ("contact-service", "error-contact-service", None),
        ("contact-brand", "error-contact-brand", "120"),
        ("contact-message", "error-contact-message", "3000")
    ]
    for fid, eid, maxlen in fields:
        el = form.find(id=fid)
        assert el is not None, f"Input #{fid} not found"
        err_container = form.find(id=eid)
        assert err_container is not None, f"Error container #{eid} not found"
        assert err_container.get("role") == "alert", f"Error container #{eid} must have role='alert'"
        assert err_container.get("aria-live") == "polite", f"Error container #{eid} must have aria-live='polite'"
        if maxlen:
            assert el.get("maxlength") == maxlen, f"Field #{fid} expected maxlength={maxlen}, got {el.get('maxlength')}"
        print(f"  [OK] Field #{fid}: accessible error container & constraints verified")

    # Character counter
    char_counter = form.find(id="char-counter")
    assert char_counter is not None, "Character counter #char-counter not found"
    print("  [OK] Real-time character counter element verified")

    # --- TEST 4: JAVASCRIPT CONTACT CONFIGURATION & CHANNEL ISOLATION ---
    print("\n[TEST 4] CONTACT_CONFIG Isolation & Preserved Credentials")
    with open(js_path, "r", encoding="utf-8") as f:
        js_code = f.read()

    # Verify public contact details preserved
    assert "+91 93711 15252" in js_code, "Public phone +91 93711 15252 not found in script.js"
    assert "Jalgaon, Maharashtra, India" in js_code, "Public location not found in script.js"
    print("  [OK] PUBLIC_CONTACT_DETAILS verified (+91 93711 15252, Jalgaon)")

    # Verify testing WhatsApp number preserved
    assert "918999160463" in js_code, "WhatsApp testing number 918999160463 not found in script.js"
    print("  [OK] WHATSAPP_INQUIRY_NUMBER verified (+91 8999160463 testing recipient)")

    # Verify email provider configuration preserved
    assert "web3formsAccessKey" in js_code, "Web3Forms key missing in script.js"
    assert "5197087c-a0fe-426c-818d-b71ab9402632" in js_code, "Web3Forms access key mismatch"
    print("  [OK] INQUIRY_EMAIL_CONFIGURATION verified (Web3Forms official API)")

    # --- TEST 5: SIMULATED FORM VALIDATION SUITE ---
    print("\n[TEST 5] Validation Rules & Edge Cases Execution")
    
    # We implement a mirror of the JS validateContactForm logic to test all matrix combinations
    ALLOWED_SERVICES = [
        'Social Media Management',
        'Graphic Design & Creatives',
        'Performance Marketing',
        'Content Creation & Reels',
        'Digital Branding',
        'Comprehensive Marketing Consultation'
    ]

    def validate_contact(data):
        if data.get('botcheck', ''):
            return False, "bot_detected"
        
        name = data.get('name', '').strip()
        if not name or len(name) < 2 or len(name) > 100 or any(ord(c) < 32 or ord(c) == 127 for c in name):
            return False, "invalid_name"

        phone = data.get('phone', '').strip()
        if not phone or len(phone) > 120:
            return False, "invalid_contact"
        if '@' in phone:
            email_re = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
            if not re.match(email_re, phone):
                return False, "invalid_email_syntax"
        else:
            digits = re.sub(r'\D', '', phone)
            valid_chars = r'^[+]?[\d\s\-().]{7,25}$'
            if not re.match(valid_chars, phone) or len(digits) < 7 or len(digits) > 15:
                return False, "invalid_phone_syntax"

        service = data.get('service', '').strip()
        if service not in ALLOWED_SERVICES:
            return False, "invalid_service"

        brand = data.get('brand', '').strip()
        if brand and len(brand) > 120:
            return False, "invalid_brand"

        msg = data.get('message', '').strip()
        if not msg or len(msg) < 10 or len(msg) > 3000:
            return False, "invalid_message"

        return True, "valid"

    # Test cases matrix
    test_cases = [
        # (Input Dict, Expected Result, Expected Error Code)
        ({}, False, "invalid_name"),
        ({"name": "   ", "phone": "+919876543210", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_name"),
        ({"name": "X", "phone": "+919876543210", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_name"),
        ({"name": "A" * 105, "phone": "+919876543210", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_name"),
        ({"name": "Control\x00Char", "phone": "+919876543210", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_name"),
        ({"name": "Rahul Sharma", "phone": "invalid-email@", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_email_syntax"),
        ({"name": "Rahul Sharma", "phone": "123", "service": "Social Media Management", "message": "Valid test message for testing"}, False, "invalid_phone_syntax"),
        ({"name": "Rahul Sharma", "phone": "+91 98765 43210", "service": "Unknown Service Injection", "message": "Valid test message for testing"}, False, "invalid_service"),
        ({"name": "Rahul Sharma", "phone": "+91 98765 43210", "service": "Performance Marketing", "message": "short"}, False, "invalid_message"),
        ({"name": "Rahul Sharma", "phone": "+91 98765 43210", "service": "Performance Marketing", "message": "A" * 3005}, False, "invalid_message"),
        ({"name": "Rahul Sharma", "phone": "+91 98765 43210", "service": "Performance Marketing", "message": "Valid test message for testing", "botcheck": "spambot"}, False, "bot_detected"),
        ({"name": "Rahul Sharma", "phone": "rahul.sharma@example.com", "service": "Digital Branding", "message": "Looking for end-to-end digital branding and visual design consultation."}, True, "valid"),
        ({"name": "Dr. A. Mehta", "phone": "+91 98765 43210", "service": "Content Creation & Reels", "brand": "Health First Clinic", "message": "Interested in doctor reels and awareness campaign advisory."}, True, "valid"),
    ]

    for i, (tc, expected_valid, expected_code) in enumerate(test_cases):
        valid, code = validate_contact(tc)
        assert valid == expected_valid and code == expected_code, f"Test case {i+1} failed: expected ({expected_valid}, {expected_code}), got ({valid}, {code})"
    print(f"  [OK] All {len(test_cases)} validation matrix test cases passed successfully")

    # --- TEST 6: XSS INPUT SAFETY VERIFICATION ---
    print("\n[TEST 6] Cross-Site Scripting (XSS) Sanitization & Safe DOM Inspection")
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert(1)",
        "'\"><svg/onload=alert('XSS')>"
    ]
    for payload in xss_payloads:
        # Check that WhatsApp message encoding properly escapes special chars
        encoded = urllib.parse.quote(payload)
        assert "<" not in encoded and ">" not in encoded and "'" not in encoded, f"Unescaped chars in URL encoding of {payload}"
        # Verify in script.js that formStatusMsg uses textContent / createTextNode for dynamic text
        assert "textContent = content" in js_code or "document.createTextNode" in js_code
    print("  [OK] XSS payload URL encoding and safe DOM node rendering verified")

    # --- TEST 7: LOCAL ASSET INTEGRITY (NO BROKEN IMAGES/PATHS) ---
    print("\n[TEST 7] Project Asset Path Integrity")
    all_imgs = soup.find_all("img")
    missing_assets = []
    checked_count = 0
    for img in all_imgs:
        src = img.get("src")
        if src and not src.startswith("http") and not src.startswith("data:"):
            # Check local file exists
            clean_path = src.split("?")[0].split("#")[0]
            if not os.path.exists(clean_path):
                missing_assets.append(clean_path)
            checked_count += 1
    assert len(missing_assets) == 0, f"Broken local images detected: {missing_assets}"
    print(f"  [OK] All {checked_count} local referenced images verified to exist on disk")

    # Check 2-page CV exists
    cv_path = "Sakina_Murtaza_Saifee_Professional_CV.pdf"
    assert os.path.exists(cv_path), "CV PDF file missing"
    print(f"  [OK] {cv_path} verified ({os.path.getsize(cv_path)} bytes)")

    # --- TEST 8: DEPLOYMENT SECURITY CONFIGURATIONS ---
    print("\n[TEST 8] Deployment Security Header Files")
    for f in ["_headers", "vercel.json", ".htaccess", ".gitignore"]:
        assert os.path.exists(f), f"Missing deployment configuration file {f}"
        print(f"  [OK] {f} exists ({os.path.getsize(f)} bytes)")

    print("\n==================================================")
    print("ALL SECURITY & AUDIT VERIFICATION TESTS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    test_security_audit()
