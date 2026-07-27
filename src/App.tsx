import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { loadScriptures } from "@/lib/scripture-loader";
import { getOrBuildIndex } from "@/lib/search-index";
import { App as CapApp } from "@capacitor/app";
import Index from "./pages/Index.tsx";
import Books from "./pages/Books.tsx";
import Read from "./pages/Read.tsx";
import Search from "./pages/Search.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    // Eagerly warm cache and index background builds on startup
    loadScriptures()
      .then((data) => {
        getOrBuildIndex(data).catch(() => {});
      })
      .catch(() => {});

    // Listen to Android hardware back button click
    const backListener = CapApp.addListener("backButton", (e) => {
      // 1. If text is highlighted / selected, clear it first
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        selection.removeAllRanges();
        return;
      }

      const path = window.location.pathname;

      // 2. If inside read chapter view (e.g. /read/Genesis/1), navigate back to the books catalog selection context
      if (path.startsWith("/read/")) {
        const routeParts = path.split("/");
        const bookName = routeParts[2] ? decodeURIComponent(routeParts[2]) : "";
        if (bookName) {
          window.location.href = `/?book=${encodeURIComponent(bookName)}`;
        } else {
          window.location.href = "/";
        }
        return;
      }

      // 4. If in home tab / but a book is preselected (e.g., /?book=Genesis), reset selection
      if (path === "/" && window.location.search.includes("book=")) {
        window.location.href = "/";
        return;
      }

      // 5. If we are on one of the other top-level tab screens (Search, Settings), go to the main Read tab (/)
      if (path === "/search" || path === "/settings" || path === "/books") {
        window.location.href = "/";
        return;
      }

      // 6. If we are on the main Read tab (/), close the app
      if (path === "/") {
        CapApp.exitApp();
      } else {
        // Otherwise, navigate back in web routing history
        window.history.back();
      }
    });

    return () => {
      backListener.then((l) => l.remove());
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/read/:book/:chapter" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
