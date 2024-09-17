const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
const fs = require("fs");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const VerificationCodes = {};

console.log(__dirname);

function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function SendToEmailBox(Content, To, Subject) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_SENDER,
    to: To,
    subject: Subject,
    html: Content,
  });
}

const login = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { Email, Password } = req.body;
    const member = await db.collection("Members").findOne({ Email }, {
      projection: {
        _id: 1,
        FirstName: 1,
        LastName: 1,
        Email: 1,
        Email_Verified: 1,
        Password: 1
      }
    });
    if (member !== null) {
      const validPss = await bcrypt.compare(Password, member.Password);
      if (validPss) {
        delete member.Password;
        const accessToken = jwt.sign(member, process.env.JWT_KEY, {
          expiresIn: "1h",
        });
        res.cookie("auth", accessToken, {
          maxAge: 1000 * 60 * 60,
          httpOnly: true,
          path: "/",
          secure: true,
          sameSite: 'None'
        });
        res.status(200).json({ response: "/Account/friends" });
      } else res.status(200).json({ err: "The email or password incorrect !" });
    } else res.status(200).json({ err: "This email not found !" });
  } catch (error) {
    console.log(`The error from AuthController in login(): ${error.message}`);
    res.json({ err: "An error in the server try later !" });
  }
};

const signUp = async (req, res) => {
  try {
    const { db } = req.app.locals;
    let HTML = await readFileAsync("Public/verifyEmail.html", "utf8");
    const member = {
      ...req.body,
      Password: await bcrypt.hash(req.body.Password, 10),
      FriendsRequests: [],
      Friends: [],
      BlockedFriends: [],
      Chat: [],
      Notifications: []
    };
    const result = await db.collection("Members").insertOne(member);
    delete req.body.Password;
    const accessToken = jwt.sign({ _id: result.insertedId, ...req.body }, process.env.JWT_KEY, {
      expiresIn: "10m",
    });

    HTML = HTML.replace(
      "{{ TO }}",
      `${process.env.SERVER_URL}/authMember/EmailIsValid/${accessToken}`
    );

    SendToEmailBox(HTML, member.Email, "Verify your email");
    res.status(200).json({ response: "/verifyEmail" });
  } catch (error) {
    console.log(`The error from AuthController in signUp(): ${error.message}`);
    res.json({ err: "An error in the server try later !" });
  }
};

const SendVerificationCode = async (req, res) => {
  try {
    const email = req.params.email;
    const verificationCode = generateVerificationCode();
    let HTML = await readFileAsync("Public/Code.html", "utf8");

    VerificationCodes[email] = verificationCode;
    HTML = HTML.replace("{ Code }", verificationCode);

    SendToEmailBox(HTML, email, "Chat App email verification");
  } catch (error) {
    console.log(
      `The error from AuthController in SendVerificationCode(): ${error.message}`
    );
    res.json({ err: "An error in the server try later !" });
  }
};

const verfyCode = async (req, res) => {
  try {
    const { Email, Code } = req.body;
    if (VerificationCodes[Email] == Code) {
      delete VerificationCodes[Email];
      res.status(200).json({ response: true });
    } else res.status(200).json({ err: "The verification code incorrect" });
  } catch (error) {
    console.log(
      `The error from AuthController in verfyCode(): ${error.message}`
    );
    res.json({ err: "An error in the server try later !" });
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { Email, Password } = req.body;
    await db
      .collection("Members")
      .updateOne(
        { Email },
        { $set: { Password: await bcrypt.hash(Password, 10) } }
      );
    res.status(200).json({ response: "/" });
  } catch (error) {
    console.log(
      `The error from AuthController in UpdatePassword(): ${error.message}`
    );
    res.json({ err: "An error in the server try later !" });
  }
};

const EmailIsValid = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const data = await jwt.verify(req.params.token, process.env.JWT_KEY);

    await db
      .collection("Members")
      .updateOne({ Email: data.Email }, { $set: { Email_Verified: true } });

    data.Email_Verified = true;
    const token = await jwt.sign(data, process.env.JWT_KEY);

    res.cookie("auth", token, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: 'None'
    });
    res.redirect(`${process.env.CLIENT_URL}/Account/friends`);
  } catch (error) {
    console.log(
      `The error from AuthController in EmailIsValid(): ${error.message}`
    );
    res.json({ err: "An error in the server try later !" });
  }
};

const IsAuth = async (req, res) => {
  try {
    const { auth = false } = req.cookies;

    if (auth) {
      const jwtIsValid = await jwt.verify(auth, process.env.JWT_KEY);
      return res.status(200).json({
        response:
          typeof jwtIsValid === "object" &&
          jwtIsValid !== null &&
          !Array.isArray(jwtIsValid),
      });
    }

    return res.status(200).json({ response: false });
  } catch (error) {
    console.log(`The error from AuthController in IsAuth(): ${error.message}`);
    res.status(200).json({ response: false });
  }
};

module.exports = {
  login,
  signUp,
  SendVerificationCode,
  verfyCode,
  UpdatePassword,
  EmailIsValid,
  IsAuth,
};
