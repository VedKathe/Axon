import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup";
import Home from "./pages/home";
import PDF from "./component/pdf";
import Dashboard from "./pages/dashboard";
import './App.css'

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route index element={<Home />} />
          <Route path="signup" element={<Signup />} />
          <Route path="import" element={<PDF />} />
          <Route path="dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}
