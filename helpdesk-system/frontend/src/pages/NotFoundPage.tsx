import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  SearchX,
  Sparkles,
} from "lucide-react";

import "../styles/NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-glow not-found-glow-yellow" />
      <div className="not-found-glow not-found-glow-pink" />

      <section className="not-found-card">
        <div className="not-found-visual">
          <span className="not-found-mini-label">
            <Sparkles size={13} />
            WASL SYSTEM
          </span>

          <div className="not-found-code">
            <span>4</span>

            <div className="not-found-zero">
              <SearchX size={46} strokeWidth={1.6} />
            </div>

            <span>4</span>
          </div>

          <div className="not-found-status">
            <span className="not-found-status-dot" />
            ROUTE NOT FOUND
          </div>
        </div>

        <div className="not-found-content">
          <span className="not-found-eyebrow">
            SOMETHING GOT DISCONNECTED
          </span>

          <h1>
            This page isn't
            <span> connected.</span>
          </h1>

          <p>
            The page you requested may have moved,
            been removed, or the address may be incorrect.
            Your WASL workspace is still right where you left it.
          </p>

          <div className="not-found-actions">
            <Link
              to="/dashboard"
              className="not-found-primary"
            >
              <Home size={17} />
              Back to Dashboard
            </Link>

            <button
              type="button"
              className="not-found-secondary"
              onClick={() => window.history.back()}
            >
              <ArrowLeft size={17} />
              Previous Page
            </button>
          </div>

          <div className="not-found-reference">
            <span>Error code</span>
            <strong>WASL / 404</strong>
          </div>
        </div>
      </section>
    </main>
  );
}