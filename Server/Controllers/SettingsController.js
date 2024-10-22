const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const EmailVerificationCodes = {};

function generateVerificationCode() {
  return parseInt((Math.random() * 999999) + 100000);
}

const UpdateProfile = async (req, res) => {
  try {
    const { db } = req.app.locals
    const { auth } = req.cookies;
    const { data } = req.body;
    const { contentType } = req.params;
    const TokenData = await jwt.verify(auth, process.env.JWT_KEY);

    await db.collection("Members").updateOne({ _id: new ObjectId(TokenData._id) }, {
      $set: { Profile: { data, contentType } }
    });

    TokenData.Profile = { data, contentType };

    const NewToken = await jwt.sign(TokenData, process.env.JWT_KEY);

    res.cookie("auth", NewToken, {
      maxAge: TokenData.exp * 1000 - Date.now(),
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: 'None'
    });

    res.status(200).json({ response: true });
  } catch (error) {
    console.log(`The error from SettingsController in UpdateProfile(): ${error.message}`);
    res.json({ err: "An error occurred on the server. Please try again later." });
  }
}

const UpdateFirstAndLastName = async (req, res) => {
  try {
    const { db } = req.app.locals
    const { auth } = req.cookies;
    const { FirstName, LastName } = req.body;
    const TokenData = await jwt.verify(auth, process.env.JWT_KEY);

    await db.collection("Members").updateOne({ _id: new ObjectId(TokenData._id) }, {
      $set: { FirstName, LastName }
    });

    TokenData.FirstName = FirstName; TokenData.LastName = LastName;

    const NewToken = await jwt.sign(TokenData, process.env.JWT_KEY);

    res.cookie("auth", NewToken, {
      maxAge: TokenData.exp * 1000 - Date.now(),
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: 'None'
    });

    res.status(200).json({ response: true });
  } catch (error) {
    console.log(`The error from SettingsController in UpdateFirstAndLastName(): ${error.message}`);
    res.json({ err: "An error occurred on the server. Please try again later." });
  }
}

const SendVerificationCode = async (req, res) => {
  try {
    const { Email } = req.body;
    const verificationCode = generateVerificationCode();
    const mailOptions = {
      from: process.env.MAIL_SENDER,
      to: Email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: true,
      auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    EmailVerificationCodes[Email] = verificationCode;
    await await transporter.sendMail(mailOptions);

    res.status(200).json({ response: true });
  } catch (error) {
    console.log(`The error from SettingsController in SendVerificationCode(): ${error.message}`);
    res.json({ err: "An error occurred on the server. Please try again later." });
  }
}

const VerificationCodeIsValid = async (req, res) => {
  try {
    const { Email, Code } = req.body;

    if (Code == EmailVerificationCodes[Email]) {
      delete EmailVerificationCodes[Email];
      res.status(200).json({ response: true });
    } else res.status(406).json({ err: "The verification code not valid :(" });
  } catch (error) {
    console.log(`The error from SettingsController in VerificationCodeIsValid(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
}

const UpdateEmail = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { NewEmail } = req.body;
    const TokenData = await jwt.verify(req.cookies.auth, process.env.JWT_KEY);

    await db.collection("Members").updateOne({ _id: new ObjectId(TokenData._id) }, {
      $set: { Email: NewEmail }
    });

    TokenData.Email = NewEmail;

    const NewToken = await jwt.sign(TokenData, process.env.JWT_KEY);

    res.cookie("auth", NewToken, {
      maxAge: TokenData.exp * 1000 - Date.now(),
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: 'None'
    });

    res.status(200).json({ response: true });
  } catch (error) {
    console.log(`The error from SettingsController in UpdateEmail(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
}

const CheckPasswordIsValid = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { Password } = req.body;
    const TokenData = await jwt.verify(req.cookies.auth, process.env.JWT_KEY);
    const TargetPassword = await db.collection("Members").findOne({ _id: new ObjectId(TokenData._id) }, {
      projection: { Password: 1, _id: 0 }
    });

    res.status(200).json({ response: await bcrypt.compare(Password, TargetPassword.Password) });
  } catch (error) {
    console.log(`The error from SettingsController in CheckPasswordIsValid(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
}

module.exports = { 
  UpdateProfile, 
  UpdateFirstAndLastName, 
  SendVerificationCode, 
  VerificationCodeIsValid, 
  UpdateEmail,
  CheckPasswordIsValid
};