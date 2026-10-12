"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page-space empty-state">
      <h1>Something didn’t load.</h1>
      <p>
        Please try again. Your current answers may still be available in this
        tab.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
