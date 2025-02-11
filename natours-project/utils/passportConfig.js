const passport = require('passport');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const crypto = require('crypto');
const GitHubStrategy = require('passport-github2').Strategy;

function generateStrongPassword(length = 16) {
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?';

  const allChars = lowerChars + upperChars + numbers + specialChars;

  // Randomly select characters from all the groups
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  return password;
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('GitHub Profile:', profile);

        // Check if user exists in DB
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          const randomPassword = generateStrongPassword(16);
          // Create a new user if not found
          console.log('User not found. Creating new user...');

          // Create new user
          user = new User({
            username: profile.username,
            email: profile.emails?.[0]?.value,
            imageUrl: profile.photos?.[0]?.value || null, // Get profile image
            password: randomPassword,
            confirmPass: randomPassword, // Fix the typo
            firstName: profile.displayName?.split(' ')[0] || null,
            lastName: profile.displayName?.split(' ')[1] || null,
          });

          await user.save();
        }

        console.log(user);

        // Return the user information and token to the client
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
