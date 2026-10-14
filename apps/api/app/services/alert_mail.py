import smtplib
import ssl
import time
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
    # Only retry transient failures before handing a message to SMTP. Once send_message
    # starts, even a timeout may mean acceptance; retrying could duplicate a digest.
    for attempt in range(2):
        sending = False
        try:
            client: smtplib.SMTP
            if settings.smtp_security == "ssl":
                client = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=5, context=context)
            else:
                client = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5)
            with client:
                if settings.smtp_security == "starttls":
                    client.starttls(context=context)
                client.login(settings.smtp_user, settings.smtp_password.get_secret_value())
                sending = True
                client.send_message(message)
            return
        except (OSError, smtplib.SMTPException) as exc:
            transient = (isinstance(exc, (TimeoutError, ConnectionError, smtplib.SMTPServerDisconnected))
                         or isinstance(exc, smtplib.SMTPResponseException) and 400 <= exc.smtp_code < 500)
            if sending or not transient or attempt == 1:
                raise
            time.sleep(1)
