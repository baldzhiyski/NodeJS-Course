const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is required'],
    minlength: [1, 'First Name should contain at least 1 symbol'],
  },
  lastName: {
    type: String,
    required: [true, 'Last Name is required'],
    minlength: [1, 'Last Name should contain at least 1 symbol'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: 'Please enter a valid email address for the email field',
    },
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    match: [
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ],
  },
  confirmPass: {
    type: String,
    required: [true, 'Confirm Password is required'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Confirm Password must match the Password',
    },
  },
  imageUrl: String,
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
