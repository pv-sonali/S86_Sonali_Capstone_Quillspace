const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

/**
 * Validate request using express-validator
 * Returns errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return sendError(res, 400, errorMessages.join(', '));
  }

  next();
};

module.exports = validate;
