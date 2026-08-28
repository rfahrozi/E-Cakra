import re
from app.database.models import ValidationStatus

# Prefix valid sesuai PRD FR018
VALID_PREFIXES = [
    "JPU",
    "PENASIHAT HUKUM",
    "SAKSI",
    "TERDAKWA",
    "HAKIM",
    "PANITERA",
]

# Pola nama generik / perangkat yang harus di-invalid-kan (FR020)
GENERIC_PATTERNS = [
    r"^user\d*$",
    r"^android\s",
    r"^samsung\s",
    r"^galaxy\s",
    r"^iphone\s",
    r"^xiaomi\s",
    r"^redmi\s",
    r"^oppo\s",
    r"^vivo\s",
    r"^realme\s",
    r"^huawei\s",
    r"^laptop\s",
    r"^pc\s",
    r"^desktop\s",
    r"^\d+$",           # hanya angka
    r"^zoom\s",
    r"^unknown$",
    r"^guest\s*\d*$",
    r"^user\s*\d*$",
]


def validate_participant_name(display_name: str) -> ValidationStatus:
    """
    Klasifikasi nama peserta menjadi valid / review / invalid.
    FR017, FR018, FR019, FR020
    """
    name_upper = display_name.strip().upper()

    # Cek pola generik/perangkat → invalid
    name_lower = display_name.strip().lower()
    for pattern in GENERIC_PATTERNS:
        if re.match(pattern, name_lower, re.IGNORECASE):
            return ValidationStatus.invalid

    # Nama terlalu pendek (< 3 karakter) → invalid
    if len(display_name.strip()) < 3:
        return ValidationStatus.invalid

    # Cek prefix valid → valid
    for prefix in VALID_PREFIXES:
        if name_upper.startswith(prefix + " - ") or name_upper.startswith(prefix + "-"):
            # Pastikan ada nama setelah prefix
            suffix = name_upper[len(prefix):].strip().lstrip("-").strip()
            if len(suffix) >= 2:
                return ValidationStatus.valid

    # Nama mengandung minimal satu kata panjang (kemungkinan nama orang) → review
    words = display_name.strip().split()
    if len(words) >= 2 and all(len(w) >= 2 for w in words):
        return ValidationStatus.review

    return ValidationStatus.invalid
