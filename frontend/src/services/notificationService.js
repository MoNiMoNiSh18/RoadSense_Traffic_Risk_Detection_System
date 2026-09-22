import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

const API_URL = "http://127.0.0.1:8000";

const VAPID_KEY = "BCaEYNKQWUvPm8fuespm9BTxthSI-8dafPkPw-Ljv9os_2CP1lOnFR2zNU_6AXvBmP7tqOP4TkVrUSU2tl9SaXg";

export async function enableNotifications() {
  try {
    if (!("Notification" in window)) {
      throw new Error(
        "This browser does not support notifications."
      );
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error(
        "Notification permission was not granted."
      );
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      throw new Error(
        "Could not generate notification token."
      );
    }

    const response = await fetch(
      `${API_URL}/api/v1/notifications/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          token: token,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to register notification device."
      );
    }

    return {
      success: true,
      token,
    };
  } catch (error) {
    console.error(
      "Notification setup failed:",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}