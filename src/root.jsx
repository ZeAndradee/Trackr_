import { useEffect } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import "./index.css";

import TopProgressBar from "./components/Utils/TopProgressBar/TopProgressBar.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { UserLoggedProvider } from "./contexts/UserLoggedContext";
import { AuthModalProvider } from "./contexts/AuthModalContext.jsx";
import { SocketProvider } from "./contexts/SocketContext";
import { SelectedTrackProvider } from "./contexts/SelectedTrackContext";
import { DefaultRatingProvider } from "./contexts/DefaultRatingContext";
import { LogContainerProvider } from "./contexts/LogContainerContext.jsx";
import { PlayerProvider } from "./contexts/PlayerContext.jsx";
import { RelativeColorProvider } from "./contexts/RelativeColorContext.jsx";
import { buildMeta, organizationLd, SITE } from "./services/seo";
import NotFound from "./pages/NotFound/NotFound.jsx";

export const links = () => [
  { rel: "preconnect", href: "https://api.trackr.fm" },
  { rel: "dns-prefetch", href: "https://api.trackr.fm" },
  { rel: "preconnect", href: "https://i.scdn.co" },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "https://trackr.fm/favicon.svg",
  },
  { rel: "apple-touch-icon", href: "https://trackr.fm/favicon.svg" },
];

export const meta = ({ error }) =>
  error
    ? buildMeta({ title: "Not found — Trackr", noindex: true })
    : buildMeta({
        title: "Trackr — Track, Rate & Review the Music You Listen To",
        description: SITE.description,
        canonical: SITE.url,
        jsonLd: organizationLd(),
      });

export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <TopProgressBar />
        {children}
        <div id="modal-root"></div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
//

export default function App() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-EZ0PDTCK15");

    const ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=G-EZ0PDTCK15";
    document.head.appendChild(ga);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserLoggedProvider>
          <AuthModalProvider>
            <SocketProvider>
              <SelectedTrackProvider>
                <DefaultRatingProvider>
                  <LogContainerProvider>
                    <PlayerProvider>
                      <RelativeColorProvider>
                        <Outlet />
                      </RelativeColorProvider>
                    </PlayerProvider>
                  </LogContainerProvider>
                </DefaultRatingProvider>
              </SelectedTrackProvider>
            </SocketProvider>
          </AuthModalProvider>
        </UserLoggedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  let details = "An unexpected error occurred. Please try again.";
  if (isRouteErrorResponse(error)) {
    details = error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <NotFound
      title="Something went wrong"
      subtitle={details}
    />
  );
}
