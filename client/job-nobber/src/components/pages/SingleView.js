import React, { useEffect } from "react";
import Sidebar from "../Sidebar";
import AccountDropdown from "../AccountDropdown";
import ErrorBox from "../ErrorBox";
import Footer from "../Footer";

import { useLocation } from "react-router-dom";

const SingleView = () => {
  const location = useLocation();
  const val = location.state;
  const data = [];

  useEffect(() => {
    (async () => {
      try {
        // Create a var and assign it the data from the fetch function
        const response = await fetch("${process.env.REACT_APP_SERVER_URL}/location/" + val);
        // Take that data and put it into JSON format so we can parse through it easier
        const requests = await response.json();
        // Step into the JSON object, and get only the important data
        const feed = requests.data;
        // Initialize an empty array, then push our data into it
        data.push(feed);
        // console.log("Test: ", data);
      } catch (err) {
        console.error(err);
      }

      const requestContainer = document.getElementById("data-container");
      //   const container = document.createElement("div");

      const title = document.createElement("h1");
      title.setAttribute("id", "title");
      title.innerText = "Data for: " + data[0].job.client.companyName;

      const subtitle = document.createElement("h5");
      subtitle.innerText = data[0].job.title;

      const propertyHeader = document.createElement("h6");
      propertyHeader.innerText = "Property Address";

      const propertyInfo = document.createElement("p");
      propertyInfo.innerText =
        data[0].job.property.address.street1 +
        ", " +
        data[0].job.property.address.city +
        ", " +
        data[0].job.property.address.province +
        ", " +
        data[0].job.property.address.postalCode;

      const contactHeader = document.createElement("h6");
      contactHeader.innerText = "Contact Details";

      const contactInfo = document.createElement("p");
      contactInfo.innerText = data[0].job.client.defaultEmails;

      const requestDetailsHeader = document.createElement("h6");
      requestDetailsHeader.innerText = "Request Details";

      const requestDetials = document.createElement("p");
      requestDetials.innerText = "Requested on " + data[0].job.createdAt;

      const serviceDetailsHeader = document.createElement("h6");
      serviceDetailsHeader.innerText = "Service Details";

      const serviceDetailsSub = document.createElement("h6");
      serviceDetailsSub.innerText =
        "Please provide as much information as you can.";

      const serviceDetailsInfo = document.createElement("p");
      serviceDetailsInfo.innerText = "<placeholder>";

      requestContainer.appendChild(title);
      requestContainer.appendChild(subtitle);
      requestContainer.appendChild(propertyHeader);
      requestContainer.appendChild(propertyInfo);

      requestContainer.appendChild(contactHeader);
      requestContainer.appendChild(contactInfo);

      requestContainer.appendChild(requestDetailsHeader);
      requestContainer.appendChild(requestDetials);

      requestContainer.appendChild(serviceDetailsHeader);
      requestContainer.appendChild(serviceDetailsSub);
      requestContainer.appendChild(serviceDetailsInfo);

      const fragment = document.createDocumentFragment();
      //   fragment.appendChild(container);
      requestContainer.appendChild(fragment);
    })();
  });

  /** Display the data */

  return (
    <>
      <Sidebar />
      <AccountDropdown />
      <div className="home-container">
        <div className="data-header">
          {/* <h1>Data for {data[0].title ? data[0].title : "Loading..."}</h1> */}
        </div>
        <div className="data-container">
          <div className="data-display" id="data-container">
            {/* <h3>Store: {finalData.client.companyName?finalData.client.companyName: "Loading..."}</h3> */}
            {/* <h3>Address: {finalData.property.address.city}, {finalData.property.address.province}, {finalData.property.address.postalCode}</h3> */}
          </div>
        </div>
        <ErrorBox />
      </div>
      <Footer />
    </>
  );
};

export default SingleView;
