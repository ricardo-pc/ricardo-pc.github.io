(() => {
  "use strict";

  const cleanText = (value) =>
    (value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100);

  const pagePath = () => window.location.pathname;

  const isLocalPreview = () =>
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

  const sendEvent = (name, parameters = {}) => {
    if (isLocalPreview() || typeof window.gtag !== "function") return false;

    window.gtag("event", name, {
      page_path: pagePath(),
      ...parameters,
    });
    return true;
  };

  // A small public bridge for interactive components that need to report
  // events without duplicating the consent and local-preview checks above.
  window.rpcTrack = sendEvent;

  const absoluteUrl = (link) => {
    try {
      return new URL(link.href, window.location.href);
    } catch {
      return null;
    }
  };

  const projectSlug = (url) => {
    if (!url || url.origin !== window.location.origin) return null;
    const match = url.pathname.match(/\/posts\/([^/]+)/);
    return match ? match[1] : null;
  };

  const sectionDetails = (element) => {
    const section = element.closest("main section[id]");
    if (!section) return null;

    const heading = section.querySelector(":scope > h2, :scope > h3, :scope > h4");
    return {
      section_id: section.id,
      section_title: cleanText(heading?.textContent || section.id),
    };
  };

  const trackClicks = () => {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      const url = absoluteUrl(link);
      const linkText = cleanText(link.textContent || link.getAttribute("aria-label"));
      const linkUrl = url ? url.href : link.getAttribute("href");
      const section = sectionDetails(link);

      if (section) {
        sendEvent("section_click", {
          ...section,
          link_text: linkText,
          link_url: linkUrl,
        });
      }

      const slug = projectSlug(url);
      if (slug) {
        const cardTitle = link
          .closest(".rpc-card, .quarto-grid-item, .rpc-course")
          ?.querySelector(".card-title, .listing-title, .rpc-course-name");

        sendEvent("project_click", {
          project_slug: slug,
          project_title: cleanText(cardTitle?.textContent || linkText),
          link_url: linkUrl,
        });
      }

      const navbar = link.closest(".navbar");
      const footer = link.closest(".nav-footer, footer");
      const hero = link.closest(".rpc-hero-section");
      if (navbar || footer || hero) {
        sendEvent("navigation_click", {
          navigation_area: navbar ? "header" : footer ? "footer" : "hero",
          link_text: linkText,
          link_url: linkUrl,
        });
      }

      const hostname = url?.hostname.replace(/^www\./, "");
      let contactMethod = null;
      if (link.protocol === "mailto:") contactMethod = "email";
      else if (hostname === "linkedin.com") contactMethod = "linkedin";
      else if (hostname === "github.com") contactMethod = "github";

      if (contactMethod) {
        sendEvent("contact_click", {
          contact_method: contactMethod,
          link_text: linkText,
        });
      }
    });
  };

  const trackSectionViews = () => {
    if (!("IntersectionObserver" in window)) return;

    const seen = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target.id)) return;

          seen.add(entry.target.id);
          const heading = entry.target.querySelector(
            ":scope > h2, :scope > h3, :scope > h4"
          );
          sendEvent("section_view", {
            section_id: entry.target.id,
            section_title: cleanText(heading?.textContent || entry.target.id),
          });
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.01,
      }
    );

    document.querySelectorAll("main section[id]").forEach((section) => {
      observer.observe(section);
    });
  };

  const initialize = () => {
    trackClicks();
    trackSectionViews();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
