function errorResponseHelper(statusCode, message) {
  return {
    error: {
      status_code: statusCode,
      message
    }
  };
};

module.exports = errorResponseHelper;
