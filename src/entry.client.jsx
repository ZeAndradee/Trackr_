import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

function removeInjectedNodes() {
  const keepTags = new Set([
    "SCRIPT",
    "LINK",
    "STYLE",
    "TEMPLATE",
    "NOSCRIPT",
    "MAIN",
  ]);

  for (const el of [...document.body.children]) {
    const isLayout =
      el.tagName === "DIV" && /(?:^|[\s_])layout/i.test(el.className || "");
    const isModalRoot = el.id === "modal-root";
    if (isLayout || isModalRoot || keepTags.has(el.tagName)) continue;
    el.remove();
  }
}

removeInjectedNodes();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
