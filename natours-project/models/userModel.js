const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
    select: false,
  },
  confirmPass: {
    type: String,
    required: [true, 'Confirm Password is required'],
    // This works only on save  and create ! When updating the pass we need to be mindful of that !
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Confirm Password must match the Password',
    },
  },
  imageUrl: String,
});

//Pre-Save middleware
userSchema.pre('save', async function (next) {
  // Run this function if the field password of the user was actually modified
  if (!this.isModified('password')) return next();

  // Delete passwordConf field
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPass = undefined;
  next();
});

// Adding a method to the userSchema to verify passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // The function takes two parameters:
  // candidatePassword: The plain text password entered by the user during login.
  // userPassword: The hashed password stored in the database.

  // Using bcrypt to compare the candidate password with the stored hashed password.
  // bcrypt.compare returns true if the passwords match, otherwise false.
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
