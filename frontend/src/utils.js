const validatePassword = (password) => {
  const minLength = /.{8,}/; // At least 8 characters
  const hasUppercase = /[A-Z]/; // At least one uppercase letter
  const hasLowercase = /[a-z]/; // At least one lowercase letter
  const hasNumber = /[0-9]/; // At least one number
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character

  if (
    minLength.test(password) &&
    hasUppercase.test(password) &&
    hasLowercase.test(password) &&
    hasNumber.test(password) &&
    hasSpecialChar.test(password)
  ) {
    return { valid: true, message: "Password is strong ✅" };
  } else {
    return {
      valid: false,
      message: "Password must be in format: 'StrongPass1@'",
    };
  }
};

module.exports = { validatePassword };
