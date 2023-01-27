const { check, validationResult } = require('express-validator');


const RegisterValidation = () => {
  return [
    check('name')
      .notEmpty()
      .withMessage('UserName is must')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 character long')
      .isLength({ max: 30 })
      .withMessage('Name should not exceed 30 character')
      .custom((value) => {
        return value.match(/^[A-Za-z ]+$/);
      })
      .withMessage('Name should not contain Numbers'),
    check('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Enter the Valid Email'),
    check('password')
      .notEmpty()
      .withMessage('Password is Required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 character long')
      .custom((value) => {
        return value.match(/^[A-Za-z0-9@]+$/);
      })
      .withMessage('Password should not conatain spl character'),
  ]
}

const loginValidation = () => {
  return [
    check('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Enter the Valid Email'),
    check('password')
      .notEmpty()
      .withMessage('Password is Required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 character long')
      .custom((value) => {
        return value.match(/^[A-Za-z0-9@]+$/);
      })
      .withMessage('Password should not conatain spl character'),
  ]
}

const forgot_password_user = () => {
  return [
    check('name')
      .notEmpty()
      .withMessage('UserName is must')
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 character long')
      .isLength({ max: 30 })
      .withMessage('Name should not exceed 30 character')
      .custom((value) => {
        return value.match(/^[A-Za-z ]+$/);
      })
      .withMessage('Name should not contain Numbers'),
    check('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Enter the Valid Email'),
  ]
}

const reset_user_password = () => {
  return [
    check('password')
      .notEmpty()
      .withMessage('Password is Required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 character long')
      .custom((value) => {
        return value.match(/^[A-Za-z0-9@]+$/);
      })
      .withMessage('Password should not conatain spl character'),
    check('confirm_password')
      .notEmpty()
      .withMessage('Password is Required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 character long')
      .custom((value) => {
        return value.match(/^[A-Za-z0-9@]+$/);
      })
      .withMessage('Password should not conatain spl character'),
  ]
}


module.exports = {
  RegisterValidation,
  loginValidation,
  forgot_password_user,
  reset_user_password
}