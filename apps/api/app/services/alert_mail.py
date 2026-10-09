import smtplib
import ssl
from email.message import EmailMessage
from email.utils import make_msgid

from app.config import Settings


def send_alert_mail(settings: Settings, recipient: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["From"] = settings.smtp_sender
    message["To"] = recipient
    message["Subject"] = subject
    message["Message-ID"] = make_msgid(domain=settings.smtp_sender.rsplit("@", 1)[-1])
    message.set_content(body)
    context = ssl.create_default_context()
    client: smtplib.SMTP
    if settings.smtp_security == "ssl":
        client = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15, context=context)
    else:
        client = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15)
    with client:
        if settings.smtp_security == "starttls":
            client.starttls(context=context)
        client.login(settings.smtp_user, settings.smtp_password.get_secret_value())
        client.send_message(message)
