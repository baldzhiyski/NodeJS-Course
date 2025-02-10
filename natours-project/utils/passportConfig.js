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
        // login: 'baldzhiyski',
        // id: 143875511,
        // node_id: 'U_kgDOCJNdtw',
        // avatar_url: 'https://avatars.githubusercontent.com/u/143875511?v=4',
        // gravatar_id: '',
        // url: 'https://api.github.com/users/baldzhiyski',
        // html_url: 'https://github.com/baldzhiyski',
        // followers_url: 'https://api.github.com/users/baldzhiyski/followers',
        // following_url: 'https://api.github.com/users/baldzhiyski/following{/other_user}',
        // gists_url: 'https://api.github.com/users/baldzhiyski/gists{/gist_id}',
        // starred_url: 'https://api.github.com/users/baldzhiyski/starred{/owner}{/repo}',
        // subscriptions_url: 'https://api.github.com/users/baldzhiyski/subscriptions',
        // organizations_url: 'https://api.github.com/users/baldzhiyski/orgs',
        // repos_url: 'https://api.github.com/users/baldzhiyski/repos',
        // events_url: 'https://api.github.com/users/baldzhiyski/events{/privacy}',
        // received_events_url: 'https://api.github.com/users/baldzhiyski/received_events',
        // type: 'User',
        // user_view_type: 'public',
        // site_admin: false,
        // name: 'Hristo Baldzhiyski',
        // company: null,
        // blog: '',
        // location: 'Stuttgart\\Plovdiv',
        // email: 'hristo.bld032@gmail.com',
        // hireable: null,
        // bio: "Job's not finished\r\n",
        // twitter_username: null,
        // notification_email: 'hristo.bld032@gmail.com',
        // public_repos: 34,
        // public_gists: 0,
        // followers: 2,
        // following: 6,
        // created_at: '2023-09-02T09:41:01Z',
        // updated_at: '2025-02-02T16:30:07Z'

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

const signToken = (id, email) =>
  jwt.sign(
    {
      id: id,
      email: email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

module.exports = passport;
