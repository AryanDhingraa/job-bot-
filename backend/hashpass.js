// backend/hashPassword.js
const bcrypt = require('bcryptjs');

// Change this to your desired new password
const newPassword = "admin";

bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }
  bcrypt.hash(newPassword, salt, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return;
    }
    console.log('New Hashed Password:');
    console.log(hash);
  });
});