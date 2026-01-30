from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Now
from django.utils import timezone

from .utils import generate_nano_id, sanitize_digits


# --- Enums Modernos (Django TextChoices) ---
class Status(models.TextChoices):
    OPEN = "open", "Open"
    CLOSE = "close", "Close"
    PENDING = "pending", "Pending"


class UserRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    COMPANY = "company", "Company"
    CONTROL = "control", "Control"


class CompanyRole(models.TextChoices):
    PRODUCTION = "production", "Production"
    SERVICE = "service", "Service"


class CheckAction(models.TextChoices):
    REGISTRATION = "registration", "Registration"
    CHECK_IN = "check-in", "Check-In"
    CHECK_OUT = "check-out", "Check-Out"


# --- Managers ---
class CustomUserManager(BaseUserManager):
    def create_user(
        self, email, name, password=None, role=UserRole.COMPANY, **extra_fields
    ):
        if not email:
            raise ValueError("Email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)
        return self.create_user(
            email, name, password=password, role=UserRole.ADMIN, **extra_fields
        )


# --- Entidades ---


class Company(models.Model):
    name = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=14, unique=True)
    # db_default=Now() delega ao MySQL inserir o timestamp
    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(
        "User", on_delete=models.SET_NULL, null=True, related_name="companies_created"
    )

    def save(self, *args, **kwargs):
        self.cnpj = sanitize_digits(self.cnpj)
        super().save(*args, **kwargs)

    class Meta:
        db_table = "company"


class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    # Uso do TextChoices
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.COMPANY,  # Mantemos default python aqui pois a lógica de criação de user é complexa
    )

    company = models.ForeignKey(
        Company, on_delete=models.SET_NULL, null=True, blank=True, related_name="users"
    )
    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "users"


class UserInvite(models.Model):
    id = models.CharField(
        primary_key=True, max_length=21, default=generate_nano_id, editable=False
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    email = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invite_used",
    )
    created_at = models.DateTimeField(db_default=Now())
    expires_at = models.DateTimeField()
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="invites_created"
    )

    @property
    def status(self):
        # Propriedade computada (não vai pro banco)
        if self.used_by:
            return "used"
        if self.expires_at <= timezone.now():
            return "expired"
        return "pending"

    class Meta:
        db_table = "user_invites"


class Staff(models.Model):
    name = models.CharField(max_length=255)
    cpf = models.CharField(max_length=11)
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="staffs"
    )
    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        self.cpf = sanitize_digits(self.cpf)
        super().save(*args, **kwargs)

    class Meta:
        db_table = "staffs"
        unique_together = ["company", "cpf"]


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_begin = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)

    # db_default define 'pending' direto na coluna do banco
    status = models.CharField(
        max_length=10, choices=Status.choices, db_default=Status.PENDING
    )

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="projects"
    )
    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "projects"


class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    date_begin = models.DateTimeField()
    date_end = models.DateTimeField()

    status = models.CharField(
        max_length=10, choices=Status.choices, db_default=Status.PENDING
    )

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, null=True, blank=True, related_name="events"
    )
    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = "events"


class EventsCompany(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="participating_companies"
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=CompanyRole.choices)
    staff_limit = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1)], default=1
    )

    class Meta:
        db_table = "events_company"
        unique_together = ["event", "company"]


class EventsStaff(models.Model):
    id = models.CharField(
        primary_key=True, max_length=21, default=generate_nano_id, editable=False
    )
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="event_staffs"
    )
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    staff_cpf = models.CharField(max_length=11)

    # Forward Reference explícita com string é mantida para evitar circular import
    registration_check = models.ForeignKey(
        "Check",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="registered_staff_entry",
    )

    created_at = models.DateTimeField(db_default=Now())
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        if self.staff_id and not self.staff_cpf:
            # Otimização: só busca se não tiver, ou confia no frontend/logica
            # No Django 6, recomenda-se evitar queries dentro do save se possível,
            # mas para redundância é aceitável.
            self.staff_cpf = self.staff.cpf
        super().save(*args, **kwargs)

    class Meta:
        db_table = "events_staff"
        unique_together = ["event", "staff_cpf"]


class Check(models.Model):
    action = models.CharField(max_length=20, choices=CheckAction.choices)
    timestamp = models.DateTimeField(db_default=Now())  # DB Timestamp
    events_staff = models.ForeignKey(
        EventsStaff, on_delete=models.CASCADE, related_name="checks_history"
    )
    user_control = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="checks_performed"
    )

    class Meta:
        db_table = "checks"
