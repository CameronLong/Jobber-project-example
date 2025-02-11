import React from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

function Searchbar({value, setValue}) {
  /* This line is used so that we can set the value to the value in the search bar */
  const [val, setVal] = useState("");

  /**This allows us to see when the value in the search bar changes, and uses the above line to set the val variable
   * to whatever piece of text is in the search bar
   */
  const change = (event) => {
    setVal(event.target.val);
    if((event.target.value).length >= 3){
      setValue(event.target.value);
    } else if ((event.target.value).length === 0) {
      setValue(event.target.value);
    }
  };

  return (
    <>
      <div className="input-wrapper">
        <FaSearch className="search-icon" />
        <input
          id="search"
          placeholder="Search..."
          onChange={change}
          value={val}
        />
      </div>
    </>
  );
}

export default Searchbar;
