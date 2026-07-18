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
        // Find if we came from /books or / (Read tab)
        // If the document referrer or history state doesn't specify, default to "/books" (or "/" depending on entry)
        // We go back to books grid catalog list to pick chapters. Let's inspect routing context.
        // If we want to show the chapter list of that book, we can redirect back to /books (or /) with selected book parameter
        // To do this cleanly, we redirect to the tab they came from. Since Books tab is /books and Read tab is /:
        // Let's redirect to /books to browse book chapters.
        // Actually, we can check if they came from books. Let's redirect to /books as a safe, predictable fallback,
        // or check window.history.state to see if there is history.
        // Let's extract the book name from route: e.g. /read/Genesis/1 -> Genesis
        const routeParts = path.split("/");
        const bookName = routeParts[2] ? decodeURIComponent(routeParts[2]) : "";
        if (bookName) {
          // Navigate to Books list with the book pre-selected
          window.location.href = `/books?book=${encodeURIComponent(bookName)}`;
        } else {
          window.location.href = "/books";
        }
        return;
      }

      // 3. If in /books but a book is preselected (e.g., /books?book=Genesis), go back to /books list
      if (path === "/books" && window.location.search.includes("book=")) {
        window.location.href = "/books";
        return;
      }

      // 4. If in home tab / but a book is preselected (e.g., /?book=Genesis), reset selection
      if (path === "/" && window.location.search.includes("book=")) {
        window.location.href = "/";
        return;
      }

      // 5. If we are on one of the other top-level tab screens (Books, Search, Settings), go to the main Read tab (/)
      if (path === "/books" || path === "/search" || path === "/settings") {
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
