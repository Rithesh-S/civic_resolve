const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password The plaintext password to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed password string.
 */
const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
};

/**
 * Compares a plaintext password against a stored bcrypt hash to verify a match.
 * @param {string} enteredPassword The plaintext password provided by the user.
 * @param {string} storedHash The hash retrieved from storage (e.g., a database).
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, otherwise false.
 */
const verifyPassword = async (enteredPassword, storedHash) => {
  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  return isMatch;
};

module.exports = {
  hashPassword,
  verifyPassword,
};