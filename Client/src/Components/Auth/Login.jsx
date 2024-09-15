import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IsNotEmpty } from '../../ForAll';

export default function Login() {
  const TargetForm = useRef();
  const worker = new Worker("/Workers/AuthWorker.js");
  const API_URL = import.meta.env.VITE_API_URL;
  const redirect = useNavigate();

  useEffect(() => {
    document.title = "Login Page";
    worker.postMessage({ message: "IsAuth", API_URL });
  }, []);

  const LoginHandler = (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(TargetForm.current));
      const mess = IsNotEmpty(data);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (mess) throw new Error(mess);
      if (!emailRegex.test(data.Email))
        throw new Error("This email not valid !");
      worker.postMessage({ message: "LoginToAccount", data, API_URL });
    } catch (error) {
      alert(error.message);
    }
  };

  worker.onmessage = (e) => {
    try {
      const { message = null, result = null, err = null } = e.data;
      if (err) throw new Error(err);
      if (message === "ToAccount") {
        redirect(result);
      }
      else if (message === "Is authenticated") {
        if (result) redirect('/Account/friends');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div id='LoginForm' className='d-flex justify-content-center align-items-center row m-0'>
      <form ref={TargetForm} className='col-11 col-md-7 col-lg-6 p-3 px-sm-4 row'>
        <div className='d-flex justify-content-center'>
          <img src="/Logo.svg" className='mb-3' />
        </div>
        <div className='col-11 mx-auto'>
            <label className='form-label mb-1'>Email</label>
            <input type="email" name="Email" className='form-control'/>
        </div>
        <div className='col-11 mx-auto'>
            <label className='form-label mb-1'>Password</label>
            <input type="password" name='Password' className='form-control'/>
        </div>
        <div className='col-11 mx-auto d-grid'>
          <button onClick={LoginHandler} className='btn'>Log in</button> 
        </div>
        <div className='col-11 mx-auto text-center'>
          <span>Create a new account ?</span>
          <span> <Link to="/SignUp" id='ToSignUpPage'>Sign Up</Link> </span>
        </div>
        <div className='col-11 mx-auto text-center'>
          <span>Forgot your password ?</span>
          <span> <Link to="/forgotPassword" id='ToForgotPasswordPage'>Forgot</Link> </span>
        </div>
      </form>
    </div>
  );
}
