const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (!Validator.isLength(data.school, { min: 2, max: 30 })) {
    errors.school = "School must be between 2 and 30 caharacters";
  }

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }

  if (!Validator.isLength(data.degree, { min: 2, max: 45 })) {
    errors.degree = "Degree must be between 2 and 45 characters";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }

  if (!Validator.isLength(data.fieldofstudy, { min: 2, max: 45 })) {
    errors.fieldofstudy = "Field of study must be between 2 and 45 characters";
  }

  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study field is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From date field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
