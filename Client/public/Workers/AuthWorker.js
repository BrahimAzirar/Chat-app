const Login = async (data, apiUrl) => {
  try {
    const Req_Data = {
      method: "POST", body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      credentials: 'include'
    };
    const result = await (await fetch(`${apiUrl}/authMember/login`, Req_Data)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
};

const SignUp = async (data, apiUrl) => {
  try {
    const Req_Data = {
      method: "POST", body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      credentials: 'include'
    };
    const result = await (await fetch(`${apiUrl}/authMember/signUp`, Req_Data)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
}

const EmailIsValid = async (data, apiUrl) => {
  try {
    const result = await (await fetch(`${apiUrl}/authMember/verifyEmail/${data.Email}`)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
}

const CodeIsValid = async (data, apiUrl) => {
  try {
    const Req_Data = {
      method: "POST", 
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
    const result = await (await fetch(`${apiUrl}/authMember/verifyCode`, Req_Data)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
}

const UpdatePassword = async (data, apiUrl) => {
  try {
    const Req_Data = {
      method: "PUT", 
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
    const result = await (await fetch(`${apiUrl}/authMember/UpdatePass`, Req_Data)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
};

const IsAuth = async (apiUrl) => {
  try {
    const Req_Data = { credentials: 'include' };
    const result = await (await fetch(`${apiUrl}/authMember/isAuth`, Req_Data)).json();
    if (result.err) throw new Error(result.err);
    return result.response;
  } catch (error) {
    throw new Error(error.message);
  }
}

self.onmessage = async (e) => {
  const { message, data = null, API_URL } = e.data;

  try {
    if (message === "LoginToAccount") {
      const result = await Login(data, API_URL);
      self.postMessage({ message: "ToAccount", result });
    }
    else if (message === "CreateAccount") {
      const result = await SignUp(data, API_URL);
      self.postMessage({ message: "it's created", result });
    }
    else if (message === "VerifyEmail") {
      const result = await EmailIsValid(data, API_URL);
      self.postMessage({ message: "Email is verified", result });
    }
    else if (message === "SendVerificationCode") {
      const result = await CodeIsValid(data, API_URL);
      self.postMessage({ message: "Code is verified", result });
    }
    else if (message === "UpdatePassword") {
      const result = await UpdatePassword(data, API_URL);
      self.postMessage({ message: "Password is updated", result });
    }
    else if (message === "IsAuth") {
      const result = await IsAuth(API_URL);
      self.postMessage({ message: "Is authenticated", result });
    }
  } catch (error) {
    self.postMessage({ err: error.message });
  }
};
