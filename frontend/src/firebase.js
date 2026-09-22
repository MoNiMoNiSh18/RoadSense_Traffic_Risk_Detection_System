import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBhIoRsgSK8sZeEHucpcSUVekdg30A8hnQ",
  authDomain: "roadsense-fbbcd.firebaseapp.com",
  projectId: "roadsense-fbbcd",
  storageBucket: "roadsense-fbbcd.firebasestorage.app",
  messagingSenderId: "1036783071776",
  appId: "1:1036783071776:web:5b650e2ee39d80cd2d8245"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export { messaging, getToken, onMessage };