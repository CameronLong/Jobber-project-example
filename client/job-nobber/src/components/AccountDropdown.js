import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import user_icon from "../icons/user-icon.svg";
import { useNavigate } from "react-router-dom";

const AccountDropdown = () => {
  const navigate = useNavigate();

    /** We have to use useState because javaScript is weird and won't let us regularly assign variables once we get data */
    const [username, setUsername] = useState("");

    /** Async funciton that will fetch the username from our server with the correct headers and methods */
    (async () => {
        await fetch(`${process.env.REACT_APP_SERVER_URL}/userInfo`, {
            method: "GET",
            headers: {
                'Cookie': 'connect.sid=s%3A02r2x20GVi05LaArzUFjUv3BgffEXmr-.jpdalXuDyKp8YTMYpnErpm9Lehndo%2FpGgN%2F3zRcaPSY'
            },
            redirect: "follow"
        })
        /** Once we get the data, turn it into text so that we can actually use it */
          .then((response) => response.text())
          /** Then use the useState function to set our username to the response from our server */
          .then((result) => {
            setUsername(result);
        });
    })();

    function handleClick(){
      navigate("/");
    }

    /** Render the component */
    return (
        <>
          <div className="account-dropdown-container">
            <div className="account-dropdown">
              <Dropdown as={ButtonGroup}>
                <Button variant="">{username}</Button>
    
                <Dropdown.Toggle split variant="" id="dropdown-split-basic" />
    
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleClick}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <img src={user_icon} className="user-icon" alt="User Icon" />
          </div>
        </>
      );
};

export default AccountDropdown;
