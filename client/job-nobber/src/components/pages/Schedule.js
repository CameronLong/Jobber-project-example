import React from "react";

import Sidebar from "../Sidebar";

import Button from "react-bootstrap/esm/Button";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import user_icon from "../../icons/user-icon.svg";

function Schedule (){
    return(
        <>
            <Sidebar />
            <div className="account-dropdown-container">
                <div className="account-dropdown">
                <Dropdown as={ButtonGroup}>
                    <Button variant="">Username</Button>

                    <Dropdown.Toggle split variant="" id="dropdown-split-basic" />

                    <Dropdown.Menu>
                    <Dropdown.Item href="\*:4000/logout">
                        Logout
                    </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </div>
                <img src={user_icon} className="user-icon" alt="User Icon" />
            </div>
            <h1>Schedule Page</h1>
        </>
    )
}

export default Schedule;
