import { useEffect, useRef, useState } from "react";

export default function ConnectGoogleButton({ onConnected }) {
  const clientRef = useRef(null); // store the Google OAuth2 client instance
  const [ready, setReady] = useState(false);  // indicates if the Google library is fully loaded and ready to use

  useEffect(() => {
    // wait for the GIS script to load
    const t = setInterval(() => {
      if (window.google?.accounts?.oauth2 && !clientRef.current) {
        clientRef.current = window.google.accounts.oauth2.initCodeClient({  // creates a Google OAuth2 Code Client
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/calendar.events", // or calendar.readonly
          ux_mode: "popup",  // opens a small popup instead of redirecting the whole page
          callback: async ({ code }) => {  // Google returns an object { code } after user signs in
            if (!code) return;
            await fetch("http://localhost:3000/api/auth/exchange-code", {  // send that code to backend
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // important so your session cookie is set
              body: JSON.stringify({ code })
            });
            onConnected?.(); // calls connected to refresh the UI and show the user’s calendar
          }
        });
        setReady(true);  // update UI state so the button becomes active
      }
    }, 100);
    return () => clearInterval(t);
  }, [onConnected]);

  return (
    <button disabled={!ready} onClick={() => clientRef.current?.requestCode()}>
       {ready ? "Connect Google" : "Loading…"} {/* we can change this to anything */}
    </button>
  );
}
