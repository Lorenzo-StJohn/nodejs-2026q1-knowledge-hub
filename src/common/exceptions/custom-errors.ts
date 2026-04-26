export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  constructor(message = 'Validation Error') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnprocessableEntityError extends Error {
  statusCode = 422;
  constructor(message = 'Unprocessable Entity') {
    super(message);
    this.name = 'UnprocessableEntityError';
  }
}

export class TooManyRequestsError extends Error {
  statusCode = 429;
  constructor(message = 'Too Many Requests') {
    super(message);
    this.name = 'TooManyRequestsError';
  }
}
