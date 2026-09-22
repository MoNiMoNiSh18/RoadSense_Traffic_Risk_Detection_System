import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging


if not firebase_admin._apps:
    cred = credentials.Certificate(
        "firebase-service-account.json"
    )

    firebase_admin.initialize_app(cred)


def send_push_notification(
    token: str,
    title: str,
    body: str,
):
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token,
        )

        response = messaging.send(message)

        return {
            "success": True,
            "response": response
        }

    except Exception as error:
        print(f"Push notification failed: {error}")

        return {
            "success": False,
            "error": str(error)
        }