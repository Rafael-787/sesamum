# core/utils.py
import re

from nanoid import generate


def generate_nano_id():
    """Gera um NanoID seguro para URL (21 chars por padrão)"""
    return generate(size=21)


def sanitize_digits(value):
    """Remove tudo que não for dígito"""
    if not value:
        return ""
    return re.sub(r"\D", "", value)


# Constantes de Enums
STATUS_CHOICES = (
    ("open", "Open"),
    ("close", "Close"),
    ("pending", "Pending"),
)

ROLE_CHOICES = (
    ("admin", "Admin"),
    ("company", "Company"),
    ("control", "Control"),
)

EVENT_COMPANY_ROLE_CHOICES = (
    ("production", "Production"),
    ("service", "Service"),
)

CHECK_ACTION_CHOICES = (
    ("registration", "Registration"),
    ("check-in", "Check-In"),
    ("check-out", "Check-Out"),
)
