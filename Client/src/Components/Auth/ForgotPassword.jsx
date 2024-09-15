import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IsNotEmpty } from "../../ForAll";

export default function ForgotPassword() {
  const [EmailIsValid, setEmailIsValid] = useState(false);
  const [CodeIsValid, setCodeIsValid] = useState(false);
  const [Index, setIndex] = useState(0);
  const [Email, SetEmail] = useState("");
  const [Code, setCode] = useState("");
  const [Password, setPassword] = useState("");
  const [ComPassword, setComPassword] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const worker = new Worker("/Workers/AuthWorker.js");
  const redirect = useNavigate();

  useEffect(() => {
    document.title = "Forget Password Page";
  }, []);

  const SendEmail = (e) => {
    e.preventDefault();
    try {
      const data = { Email };
      const mess = IsNotEmpty(data, "The email field is empty");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (mess) throw new Error(mess);
      if (!emailRegex.test(data.Email))
        throw new Error("This email not valid !");
      worker.postMessage({ message: "VerifyEmail", data, API_URL });
    } catch (error) {
      alert(error.message);
    }
  };

  const SendVerificationCode = (e) => {
    e.preventDefault();
    try {
      const data = { Email, Code };
      const mess = IsNotEmpty(data, "The verification code field is empty");
      if (mess) throw new Error(mess);
      worker.postMessage({ message: "SendVerificationCode", data, API_URL });
    } catch (error) {
      alert(error.message);
    }
  };

  const updatePassword = (e) => {
    e.preventDefault();
    try {
      if (Password === ComPassword) {
        const data = { Email, Password };
        const mess = IsNotEmpty(data, "Some feilds is empty");
        if (mess) throw new Error(mess);
        worker.postMessage({ message: "UpdatePassword", data, API_URL });
      } else throw new Error("The Password not valid !");
    } catch (error) {
      alert(error.message);
    }
  };

  const TargetFunction = (e) => {
    const functions = [SendEmail, SendVerificationCode, updatePassword];
    functions[Index](e);
  };

  worker.onmessage = (e) => {
    try {
      const { result = null, err = null, message = null } = e.data;
      if (err) throw new Error(err);
      if (message === "Email is verified") {
        setEmailIsValid(result);
        setIndex(1);
      } else if (message === "Code is verified") {
        setEmailIsValid(false);
        setCodeIsValid(result);
        setIndex(2);
      } else if (message === "Password is updated") {
        redirect(result);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      id="ForgotPasswordPage"
      className="d-flex justify-content-center align-items-center row m-0"
    >
      <form className="col-11 col-md-7 col-lg-6 p-3 px-sm-4 row">
        <div className="d-flex justify-content-center">
          <img src="/Logo.svg" className="mb-3" />
        </div>
        <div className="mb-2">
          <label>Enter your email</label>
          <input
            type="text"
            name="Email"
            className="form-control"
            value={Email}
            onChange={(e) => SetEmail(e.target.value)}
          />
        </div>
        {EmailIsValid && (
          <div className="mb-5">
            <label>Enter the verification code</label>
            <input
              type="text"
              name="Code"
              className="form-control"
              value={Code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        )}
        {CodeIsValid && (
          <>
            <div className="mb-2">
              <label>Enter password</label>
              <input
                type="password"
                name="Password"
                className="form-control"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label>Comfirm password</label>
              <input
                type="password"
                className="form-control"
                value={ComPassword}
                onChange={(e) => setComPassword(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <button className="btn w-100" onClick={TargetFunction}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
