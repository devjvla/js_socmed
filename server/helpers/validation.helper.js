import { check } from "express-validator";

const ValidationHelper = {
  SignupForm: [
    check("first_name")
      .trim().escape()
      .notEmpty().withMessage("First name is required"),
    check("last_name")
      .trim().escape()
      .notEmpty().withMessage("Last name is required"),
    check("email_address")
      .trim().escape()
      .notEmpty ().withMessage("Email is required").bail()
      .isEmail().withMessage("Email is invalid"),
    check("password")
      .notEmpty().withMessage("Password is required").bail()
      .isLength({min: 8}).withMessage("Password must be 8 characters or more"),
    check("confirm_password")
      .notEmpty().withMessage("Password should be confirmed").bail()
      .custom((value, {req, loc, path}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
      })
  ],
  SigninForm: [
    check("email_address")
      .trim().escape()
      .notEmpty().withMessage("Email is required"),
    check("password")
      .notEmpty().withMessage("Password is required")
  ]
}

export default ValidationHelper;