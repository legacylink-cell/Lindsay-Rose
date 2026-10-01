import { useEffect } from "react";

export const SITE_ORIGIN = "https://brightathomecleaning.com";

// Absolute URL for a route: no trailing slash anywhere except the homepage.
export const absoluteUrl = (path) => {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
};

const upsert = (selector, create, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setMetaName = (name, content) =>
  upsert(`meta[name="${name}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("name", name);
    return el;
  }, "content", content);

const setMetaProp = (property, content) =>
  upsert(`meta[property="${property}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    return el;
  }, "content", content);

/** Keeps title, description, self-referencing canonical and OG tags in sync per route. */
export const usePageHead = ({ title, description, path, noindex = false }) => {
  useEffect(() => {
    if (!title || !description || !path) return;
    const url = absoluteUrl(path);

    document.title = title;
    setMetaName("description", description);
    upsert('link[rel="canonical"]', () => {
      const el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      return el;
    }, "href", url);
    setMetaProp("og:url", url);
    setMetaProp("og:title", title);
    setMetaProp("og:description", description);
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);
  }, [title, description, path]);

  // Unpublished pages must stay out of the index; the shell's own value is restored on exit.
  useEffect(() => {
    if (!noindex) return;
    const el = document.head.querySelector('meta[name="robots"]');
    const previous = el ? el.getAttribute("content") : null;
    setMetaName("robots", "noindex, nofollow");
    return () => {
      const cur = document.head.querySelector('meta[name="robots"]');
      if (!cur) return;
      if (previous === null) cur.remove();
      else cur.setAttribute("content", previous);
    };
  }, [noindex]);
};

export default usePageHead;
