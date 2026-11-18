class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ValidationError extends HttpError {
  constructor(details) {
    super(400, 'Dados inválidos', details);
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super(404, message);
  }
}

module.exports = { HttpError, ValidationError, NotFoundError };
