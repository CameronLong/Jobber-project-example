import React from "react";
import AccountDropdown from "../AccountDropdown";
import { useState } from "react";

import Sidebar from "../Sidebar";
import ErrorBox from "../ErrorBox";
import "../../index.css";
import JobDisplay from "../JobDisplay";
import Footer from "../Footer";

function InProgressJobs() {
  const [results, setResults] = useState([]);
  const [value, setValue] = useState([]);

  return (
    <>
      <Sidebar value={value} setValue={setValue}/>
      <AccountDropdown />
      <div className="home-container">
        <div className="data-header">
          <h1>In-Progress Jobs</h1>
        </div>
        <div className="data-container">
          <div className="data-container-header">
            <p>Job</p>
            <p>Scheduled</p>
            <p>Client</p>
            <p>Status</p>
          </div>
          <JobDisplay page="in-progress-jobs" results={results} value={value}/>
        </div>
        <ErrorBox />
      </div>
      <Footer />
    </>
  );
}

export default InProgressJobs;
