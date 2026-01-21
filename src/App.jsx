import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page.jsx";
import JoinRoom from "./pages/Join- room.jsx";
import VideoCall from "./pages/VideoCall";
import HandTrackingDemo from "./pages/HandTrackingDemo";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/call" element={<VideoCall />} />
        <Route path="/hand-demo" element={<HandTrackingDemo />} />


        {/* <Route path="/call" element={<VideoCall />} />
        <Route path="/hand-demo" element={<HandTrackingDemo />} />  */}
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
