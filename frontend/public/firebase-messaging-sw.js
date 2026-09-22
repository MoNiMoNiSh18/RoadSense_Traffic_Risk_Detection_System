importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBhIoRsgSK8sZeEHucpcSUVekdg30A8hnQ",
  authDomain: "roadsense-fbbcd.firebaseapp.com",
  projectId: "roadsense-fbbcd",
  storageBucket: "roadsense-fbbcd.firebasestorage.app",
  messagingSenderId: "1036783071776",
  appId: "1:1036783071776:web:5b650e2ee39d80cd2d8245"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "RoadSense Alert";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "A RoadSense safety alert was detected.",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});