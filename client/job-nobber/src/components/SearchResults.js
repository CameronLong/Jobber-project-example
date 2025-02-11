import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchResults({ results, value }) {
  //   const [val, setVal] = useState("");
  let navigate = useNavigate();
  let data = [];
  let temp = "";

  /** This function is an async function that runs when the search button is clicked */
  const handleSubmit = async () => {
    /** When the search button is clicked, we want to send a post request to the server with the value that we stored earlier */
    try {
      const searchData = await fetch(`${process.env.REACT_APP_SERVER_URL}/get-clients`, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      /** Once we get the data back from the server, we want to put it into JSON format to make it easier to use */
      const arrayData = await searchData.json();
      data.push(arrayData);

      /** We then want to iterate through the data array and do stuff with the data */
      for (let element in Object.keys(data)) {
        for (let key in data[element]) {
          /** We are able to access the data in the array in the following format: data[element][key].client.companyName
           * The next two lines turn both the value we grabbed from the search bar, and the value from the server into
           * lowercase. We do this so that the comparison is easier, and not case sensitive. This improves user experience
           */
          if (data[element][key].client.companyName !== null) {
            const lowerElementTitle = data[element][
              key
            ].client.companyName.substring(10, 14);
            /** We then compare the two values, and if what the user is searching for exists in the database, we log that
             * we have found that element, and if it does not exist we log that as well
             */
            if (value === lowerElementTitle) {
              // console.log("Found: ", data[element][key].client.companyName);
              // console.log("ID: ", fixID);
              navigate("/location", { state: data[element][key].id });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="results-list">
        {results.map((result, id) => {
          if (temp !== result.client.companyName) {
            temp = result.client.companyName;
            return (
              <a className="search-result" key={id} onClick={handleSubmit}>
                {result.client.companyName}
              </a>
            );
          }
        })}
      </div>
    </>
  );
}

export default SearchResults;
