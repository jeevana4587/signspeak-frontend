import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page.jsx";
import JoinCall from "./pages/Join- Room.jsx";
import VideoCall from "./pages/VideoCall";
import HandTrackingDemo from "./pages/HandTrackingDemo";
import Room from "./pages/Room";
import CreateCall from "./pages/CreateCall.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinCall />} />
        <Route path="/call" element={<VideoCall />} />
        <Route path="/create" element={<CreateCall />} />
        <Route path="/hand-demo" element={<HandTrackingDemo />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
