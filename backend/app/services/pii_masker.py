import re


# --- PII regex patterns ---

# Email addresses: user@domain.tld
_EMAIL_RE = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
)

# Phone numbers: supports various formats
# +1-555-123-4567, (555) 123-4567, 555.123.4567, +44 20 7946 0958, etc.
_PHONE_RE = re.compile(
    r"(?<!\d)"                       # not preceded by a digit
    r"(?:\+?\d{1,3}[\s.-]?)?"       # optional country code
    r"(?:\(?\d{2,4}\)?[\s.-]?)"     # area code
    r"(?:\d[\s.-]?){5,10}"          # remaining digits
    r"\d"                            # last digit (ensures no trailing separator)
    r"(?!\d)"                        # not followed by a digit
)

# Credit card numbers: 13-19 digit sequences with optional separators
_CC_RE = re.compile(
    r"\b"
    r"(?:\d{4}[\s.-]?){3,4}\d{1,4}"
    r"\b"
)

# Passport numbers: common formats (letters + digits, 6-9 chars)
_PASSPORT_RE = re.compile(
    r"\b[A-Z]{1,2}\d{6,8}\b"
)

# SSN (US): XXX-XX-XXXX
_SSN_RE = re.compile(
    r"\b\d{3}-\d{2}-\d{4}\b"
)


_PII_PATTERNS: list[tuple[re.Pattern, str]] = [
    (_SSN_RE, "[SSN REDACTED]"),
    (_CC_RE, "[CREDIT CARD REDACTED]"),
    (_EMAIL_RE, "[EMAIL REDACTED]"),
    (_PHONE_RE, "[PHONE REDACTED]"),
    (_PASSPORT_RE, "[PASSPORT REDACTED]"),
]


def mask_text(text: str) -> str:
    """Detect and mask PII in the given text using regex patterns.

    Masks the following PII types:
    - Email addresses
    - Phone numbers (various international formats)
    - Credit card numbers
    - Passport numbers (letter+digit format)
    - US Social Security Numbers

    Args:
        text: The input text that may contain PII.

    Returns:
        The text with PII replaced by redaction placeholders.
    """
    if not text:
        return text

    result = text
    for pattern, replacement in _PII_PATTERNS:
        result = pattern.sub(replacement, result)

    return result
