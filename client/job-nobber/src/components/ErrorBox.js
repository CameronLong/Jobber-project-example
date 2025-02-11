import React from "react";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";

import error from "../icons/error-icon.svg";

const ErrorBox = () => {
    return (
        <>
            <div className="error-container" id="error-container">
                <div className="error-popup">
                    <Row>
                        <Col xs lg="2">
                            <img src={error} className="error-icon" alt="error-icon" />
                        </Col>
                        <Col md="auto">
                            <p className="error-text">Please <a className="api-key-link" href={`https://api.getjobber.com/api/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_SERVER_URL}/auth-key`}>Authorize</a></p>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
}

export default ErrorBox;
