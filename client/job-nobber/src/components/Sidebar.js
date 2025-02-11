import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useLocation } from "react-router-dom";

import client_hub_icon from "../icons/client-hub-icon.svg";

// Completed Jobs icons
import completed_jobs_icon_normal from "../icons/check-mark-icon.svg";
import completed_jobs_icon_active from "../icons/check-mark-icon-active.svg";

// In progress jobs icons
import in_progress_jobs_icon_normal from "../icons/in-progress-jobs-icon.svg";
import in_progress_jobs_icon_active from "../icons/in-progress-jobs-icon-active.svg";


import Searchbar from "./Searchbar";
import SearchResults from "./SearchResults";

function Sidebar({ value, setValue }) {

  const url = useLocation();

  var completedVariant = "";
  var completedIconVariant = completed_jobs_icon_normal;

  var inProgressVariant = "";
  var inProgressIconVariant = in_progress_jobs_icon_normal;


  if (url.pathname === "/completed-jobs") {
    completedVariant = "primary";
    completedIconVariant = completed_jobs_icon_active;
  } else if (url.pathname === "/in-progress-jobs") {
    inProgressVariant = "primary";
    inProgressIconVariant = in_progress_jobs_icon_active;
  }

  return (
    <>
      <div className="sidebar-container">
        <Container>
          <Row>
            <Col sm={1}>
              <img
                src={client_hub_icon}
                className="client-hub-icon"
                alt="icon"
              />
            </Col>
            <Col sm={8}>
              <h1 className="sidebar-header">Client Hub</h1>
            </Col>
          </Row>
        </Container>

        <div className="wrapper">
          <Searchbar value={value} setValue={setValue} />
          {/* <SearchResults results={results} value={value} /> */}
        </div>

        <div className="sidebar-buttons">
          <Container>
            <Row>
              <Col className="sidebar-button">
                <Button variant={inProgressVariant} href="/in-progress-jobs">
                  <img
                    src={inProgressIconVariant}
                    className="icons active-icon"
                    alt="icon"
                  />
                  In-Progress Jobs
                </Button>{" "}
              </Col>
            </Row>
            <Row>
              <Col className="sidebar-button">
                <Button
                  variant={completedVariant}
                  className="inactive-button"
                  href="/completed-jobs"
                >
                  <img
                    src={completedIconVariant}
                    className="icons active-icon"
                    alt="icon"
                  />
                  Completed Jobs
                </Button>{" "}
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
