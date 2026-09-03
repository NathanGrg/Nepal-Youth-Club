const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.log('Usage: npm run hash-password -- yourPasswordHere');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Add this to your .env as ADMIN_PASSWORD_HASH:');
  console.log(hash);
});