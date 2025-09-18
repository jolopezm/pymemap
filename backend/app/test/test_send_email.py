import os
import resend
from dotenv import load_dotenv


load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]

params: resend.Emails.SendParams = {
    "from": "onboarding@resend.dev",
    "to": ["joselopasdezmignone7@gmail.com"],
    "subject": "hello world",
    "html": "<strong>it works!</strong>",
}

email = resend.Emails.send(params)
print(email)