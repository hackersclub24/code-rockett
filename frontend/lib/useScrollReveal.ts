"use client";

import { useEffect } from "react";

export function useScrollReveal(trigger: number | string = 0) {
  useEffect(() => {
    const selector = "[data-reveal]:not(.is-visible)";

    // Fallback for older/limited browsers: show content without animation.
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
        node.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("is-visible");
            target.dataset.revealObserved = "1";
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    const observePendingNodes = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      nodes.forEach((node) => {
        if (node.dataset.revealObserved === "1") {
          return;
        }
        node.dataset.revealObserved = "1";
        observer.observe(node);
      });
    };

    observePendingNodes();

    const mutationObserver = new MutationObserver(() => {
      observePendingNodes();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [trigger]);
}
