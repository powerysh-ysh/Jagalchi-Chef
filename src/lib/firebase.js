import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8QLlbbB0UgYcKSzlosU5xJuvm4Zrh2GA",
  authDomain: "jagalchi-chef-5098e.firebaseapp.com",
  projectId: "jagalchi-chef-5098e",
  storageBucket: "jagalchi-chef-5098e.firebasestorage.app",
  messagingSenderId: "107336719803",
  appId: "1:107336719803:web:3cfa9f396e3e435e32389e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let messaging = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

export { app, auth, messaging };
