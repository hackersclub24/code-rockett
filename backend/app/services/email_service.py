import logging

import resend

from app.config import get_settings

log = logging.getLogger(__name__)


def send_email(to: str, subject: str, html: str) -> None:
    s = get_settings()
    if not s.resend_api_key:
        log.info("Email skipped (no RESEND_API_KEY): to=%s subject=%s", to, subject)
        return
    resend.api_key = s.resend_api_key
    resend.Emails.send(
        {
            "from": s.email_from,
            "to": [to],
            "subject": subject,
            "html": html,
        }
    )


def notify_admin_new_registration(student_name: str, student_email: str) -> None:
    s = get_settings()
    if not s.admin_email:
        return
    send_email(
        s.admin_email,
        "New student registration pending",
        f"<p>{student_name} ({student_email}) applied and needs approval.</p>",
    )


def notify_student_decision(email: str, name: str, approved: bool) -> None:
    if approved:
        subject = "Welcome to Coding Rocket"
        body = f"<p>Hi {name},</p><p>Your application was approved. You can log in and join classes.</p>"
    else:
        subject = "Coding Rocket application update"
        body = f"<p>Hi {name},</p><p>Unfortunately your application was not approved at this time.</p>"
    send_email(email, subject, body)
