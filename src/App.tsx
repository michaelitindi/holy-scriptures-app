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

      // 2. If we are at the top-level main screen (/), close the app
      if (window.location.pathname === "/") {
        CapApp.exitApp();
      } else {
        // 3. Otherwise, navigate back in web routing history
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
        <Route path="/books" element={<Books />} />
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
