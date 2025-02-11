import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import Header from "../Header";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleInput = (event) => {
    setEmail(event.target.value);
  };

  const handleInput1 = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (email !== "" && password !== "") {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/login`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        if (response.status === 200) {
          navigate("/in-progress-jobs");
        } else if (response.status === 404) {
          document.getElementById("login-error").style.display = "block";
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    }
  };

  function handleRegister() {
    navigate("/register");
  }

  return (
    <>
      <Header />
      <div className="login-page">
        <div className="login-page-svg"></div>
        <div className="login-side">
          <div className="Auth-form-container">
            <form className="Auth-form" id="login-form">
              <div className="Auth-form-content">
                <h3 className="Auth-form-title">Sign In</h3>
                <p className="login-error" id="login-error">
                  Wrong username or password
                </p>
                <div className="form-group mt-3">
                  <label>Email address</label>
                  <input
                    type="email"
                    className="form-control mt-1"
                    placeholder="Enter email"
                    name="email"
                    onChange={handleInput}
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control mt-1"
                    placeholder="Enter password"
                    name="password"
                    onChange={handleInput1}
                  />
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
                <hr />
                <div className="d-grid gap-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleRegister}
                  >
                    Create Account
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

export default Login;
