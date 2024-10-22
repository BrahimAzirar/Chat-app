const ex = require("express");
const AuthMiddlewares = require("../Middlewares/AuthMiddleware");
const SettingsController = require("../Controllers/SettingsController");

const settings = ex.Router();

//////////////////// Middlewares ////////////////////

settings.use(AuthMiddlewares.HaveTheAccess);


//////////////////// APIs ////////////////////

settings.put('/updateProfile/:contentType', SettingsController.UpdateProfile);
settings.put('/UpdateFirstAndLastName', SettingsController.UpdateFirstAndLastName);
settings.post('/VerifyNewEmail', SettingsController.SendVerificationCode);
settings.post('/VerificationCodeIsValid', SettingsController.VerificationCodeIsValid);
settings.put('/UpdateEmail', SettingsController.UpdateEmail);
settings.post('/CheckPasswordIsValid', SettingsController.CheckPasswordIsValid);

module.exports = { settings };