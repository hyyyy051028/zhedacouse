import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Survey from "@/pages/Survey";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        <Route path="/survey" element={<Survey />} />
      </Routes>
    </Router>
  );
}
