import React from "react";
import "../../index.css";
import Header from "../Header";

function Register() {

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-page-svg"></div>
        <div className="login-side">
          <div className="Auth-form-container">
            <form className="Auth-form" action={`${process.env.REACT_APP_SERVER_URL}/register`} encType="application/x-www-form-urlencoded" method="post">
              <div className="Auth-form-content">
                <h3 className="Auth-form-title">Register</h3>
                <div className="form-group mt-3">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control mt-1"
                    placeholder="Enter first name"
                    name="firstName"
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control mt-1"
                    placeholder="Enter last name"
                    name="lastName"
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control mt-1"
                    placeholder="Enter username"
                    name="username"
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Email address</label>
                  <input
                    type="email"
                    className="form-control mt-1"
                    placeholder="Enter email"
                    name="email"
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control mt-1"
                    placeholder="Enter password"
                    name="password"
                  />
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
