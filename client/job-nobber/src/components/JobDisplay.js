import React from "react";
import jobs from "../icons/in-progress-jobs-icon.svg";
import "../index.css";
import { RateLimit } from "async-sema";

let data = [];
function JobDisplay({ results, value }) {
  var i = 0;
  const limit = RateLimit(1);
  let filterBySearch;
  /**
   * This is an async function that will send a GET request to our backend and wait for the response. It will then take that data, and put it into our
   * HTML elements and display it to our webpage.
   */
  (async () => {
    try {
      if (results.length === 0) {
        if(document.getElementById("data-container")){
          document.getElementById("data-container").innerHTML = "";
        }
        // Create a var and assign it the data from the fetch function
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/allJobs`
        );
        // Take that data and put it into JSON format so we can parse through it easier
        const requests = await response.json();
        // Step into the JSON object, and get only the important data
        // Initialize an empty array, then push our data into it
        data = requests;
      }
      if (value) {
        filterBySearch = data.filter((items) => {
          return (
            items &&
            items.client.companyName &&
            items.client.companyName.includes(value)
          );
        });

        if(document.getElementById("data-container")){
          document.getElementById("data-container").innerHTML = "";
        }
        // document.getElementById("data-container").innerHTML = "";
        data = filterBySearch;
      }
    } catch (err) {
      document.getElementById("error-container").style.display = "block";
    }

    data.sort(function(a, b){
      const date1 = new Date(a.startAt);
      const date2 = new Date(b.startAt);
      return date1 - date2;
    });

    const requestContainer = document.getElementById("data-container");
    requestContainer.className = "grid-container";
    // Iterate through the array and put the data into our HTML elements
    data.map(async (item) => {
      // console.log(item);
      await limit();
      const singleJob = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/jobDetail/${item.id}`
      );
      const singleResponse = await singleJob.json();

      const container = document.createElement("div");
      container.className = "data-rows light";

      const completed = document.createElement("img");
      completed.className = "data-icons";
      completed.src = jobs;

      const titleElement = document.createElement("div");
      if (singleResponse.data.job.lineItems.nodes.length === 0) {
        titleElement.innerText = "No Line Item";
      } else {
        for (let item in singleResponse.data.job.lineItems.nodes) {
          titleElement.innerText +=
            singleResponse.data.job.lineItems.nodes[item].name + " \n";
        }
      }
      titleElement.className = "job";

      const scheduledElement = document.createElement("div");
      let date = "";
      if (typeof singleResponse.data.job.startAt === "undefined" || singleResponse.data.job.startAt === null) {
        date = "No Date";
      } else if (singleResponse.data.job.startAt !== null) {
        date = singleResponse.data.job.startAt;
      }
      scheduledElement.innerText = date.substring(0, 10);
      scheduledElement.className = "scheduled";

      const clientElement = document.createElement("div");
      let client = "";
      if (
        typeof singleResponse.data.job.property.address.street ===
          "undefined" ||
        singleResponse.data.job.property.address.street == null
      ) {
        client += "No Street Address Found \n";
      } else {
        client += singleResponse.data.job.property.address.street + "\n";
      }

      if (
        typeof singleResponse.data.job.client.firstName === "undefined" ||
        !singleResponse.data.job.client.firstName
      ) {
        client += "No Client Name Found \n";
      } else {
        client +=
          singleResponse.data.job.client.firstName +
          " " +
          singleResponse.data.job.client.lastName +
          "\n";
      }

      if (
        typeof singleResponse.data.job.client.companyName === "undefined" ||
        singleResponse.data.job.client.companyName === null
      ) {
        client += "No Company Name Found";
      } else {
        client += singleResponse.data.job.client.companyName.match(/^.*#\w+\w/);
      }
      clientElement.innerText = client;
      clientElement.className = "address";

      container.appendChild(titleElement);
      container.appendChild(scheduledElement);
      container.appendChild(clientElement);
      container.appendChild(completed);

      const fragment = document.createDocumentFragment();
      fragment.appendChild(container);
      requestContainer.appendChild(fragment);
      ++i;
    });
  })();
  return (
    <>
      <div className="data-display" id="data-container">
      </div>
    </>
  );
}

export default JobDisplay;
