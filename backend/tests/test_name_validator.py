"""
Tests: Name Validator utility (F-005 — Visual Triage)
Memastikan klasifikasi nama peserta berjalan benar.
"""
import pytest
from app.utils.name_validator import validate_display_name


class TestNameValidator:
    # ── Valid names (prefix baku) ──────────────────────────
    def test_valid_jpu(self):
        assert validate_display_name("JPU - Andi Kusuma") == "valid"

    def test_valid_hakim(self):
        assert validate_display_name("HAKIM - Siti Rahayu") == "valid"

    def test_valid_panitera(self):
        assert validate_display_name("PANITERA - Budi Santoso") == "valid"

    def test_valid_terdakwa(self):
        assert validate_display_name("TERDAKWA - Ahmad Fauzi") == "valid"

    def test_valid_saksi(self):
        assert validate_display_name("SAKSI - Maria Ulfa") == "valid"

    def test_valid_penasihat_hukum(self):
        assert validate_display_name("PENASIHAT HUKUM - Rudi Hartono") == "valid"

    def test_valid_case_insensitive(self):
        """Prefix harus valid meskipun case berbeda."""
        assert validate_display_name("jpu - andi kusuma") == "valid"

    # ── Review names (kemungkinan orang, perlu verifikasi) ─
    def test_review_two_words(self):
        """Dua kata atau lebih tanpa prefix = perlu review."""
        result = validate_display_name("Budi Santoso")
        assert result == "review"

    def test_review_three_words(self):
        assert validate_display_name("Ahmad Budi Santoso") == "review"

    # ── Invalid names ──────────────────────────────────────
    def test_invalid_android_device(self):
        assert validate_display_name("Android") == "invalid"

    def test_invalid_samsung_device(self):
        assert validate_display_name("Samsung Galaxy S21") == "invalid"

    def test_invalid_iphone(self):
        assert validate_display_name("iPhone") == "invalid"

    def test_invalid_numbers_only(self):
        assert validate_display_name("12345") == "invalid"

    def test_invalid_too_short(self):
        assert validate_display_name("A") == "invalid"

    def test_invalid_empty(self):
        assert validate_display_name("") == "invalid"

    def test_invalid_whitespace_only(self):
        assert validate_display_name("   ") == "invalid"
