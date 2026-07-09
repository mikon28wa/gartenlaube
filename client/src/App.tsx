import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import SearchFilters from "@/pages/SearchFilters";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BookingConfirmation from "./pages/BookingConfirmation";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import HostDashboard from "./pages/HostDashboard";
import Profile from "./pages/Profile";
import MapView from "./pages/MapView";
import BookingTest from "./pages/BookingTest";
import CalendarTest from "./pages/CalendarTest";
import ListingsWithPagination from "./pages/ListingsWithPagination";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"listings-paginated"} component={ListingsWithPagination} />
      <Route path={"listings"} component={Listings} />
      <Route path={"listings/:id"} component={ListingDetail} />
      <Route path={"search"} component={SearchFilters} />
      <Route path={"/booking-confirmation"} component={BookingConfirmation} />
      <Route path={"/dashboard"} component={HostDashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/map"} component={MapView} />
      <Route path="/booking-test" component={BookingTest} />
      <Route path="/calendar-test" component={CalendarTest} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
