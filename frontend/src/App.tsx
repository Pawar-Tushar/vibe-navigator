import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import TourPlanner from "./pages/TourPlanner";
import NotFound from "./pages/NotFound";
import SearchMap from "./pages/SearchMap";
import About from "./pages/About";

const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/tour-planner" element={<TourPlanner />} />
    <Route path="/search-map" element={<SearchMap />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
