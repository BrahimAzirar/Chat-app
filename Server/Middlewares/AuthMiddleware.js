const jwt = require("jsonwebtoken");

const EmailVerification = async (req, res, next) => {
  try {
    const Email = req.params.email;
    const { db } = req.app.locals;
    const result = await db.collection('Members').findOne({ Email }, { projection: { Email: 1 } });
    if (result) {
      res.status(200).json({ response: true });
      next();
    } else res.status(200).json({ err: "This email not exist" });
  } catch (error) {
    console.log(`The error from AuthMiddleware in EmailVerification(): ${error.message}`);
    res.json({ err: "An error in the server try later !" });
  }
};

const EmailIsExist = async (req, res, next) => {
  try {
    const { Email } = req.body;
    const { db } = req.app.locals;
    const result = await db.collection('Members').findOne({ Email }, { projection: { Email: 1 } });
    if (result) res.status(200).json({ err: "This email already exist" });
    else next();
  } catch (error) {
    console.log(`The error from AuthMiddleware in EmailIsExist(): ${error.message}`);
    res.json({ err: "An error in the server try later !" });
  }
}

const HaveTheAccess = async (req, res, next) => {
  try {
    const { auth = false } = req.cookies;

    if (auth) {
      const token = await jwt.verify(auth, process.env.JWT_KEY);
      
      if (token) next();
      else res.status(200).json({ response: "The session expired :(" });
    } else res.status(200).json({ response: "The session expired :(" });

  } catch (error) {
    console.log(`The error from AuthMiddleware in HaveTheAccess(): ${error.message}`);
  }
}

module.exports = { EmailVerification, EmailIsExist, HaveTheAccess };