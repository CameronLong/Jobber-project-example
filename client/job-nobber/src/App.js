import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';

import CompletedJobs from "./components/pages/CompletedJobs";
import InProgressJobs from "./components/pages/InProgressJobs";
import Schedule from "./components/pages/Schedule";
import Header from "./components/Header";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import SingleView from "./components/pages/SingleView";

function App() {
  return (
    <>
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path="/completed-jobs" element={<CompletedJobs />}/>
          <Route path="/in-progress-jobs" element={<InProgressJobs />}/>
          <Route path="/schedule" element={<Schedule />}/>
          <Route index element={<Login />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/location" element={<SingleView />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
