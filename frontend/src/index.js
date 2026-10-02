import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

// The pre-rendered HTML ships a brand splash and a guard class (see the
// .prerendered rules in index.css). React clears #root on mount, so hand the
// animations back only once the live app has painted, never before.
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);

requestAnimationFrame(() => {
  document.getElementById("prerender-splash")?.remove();
  document.documentElement.classList.remove("prerendered");
});
