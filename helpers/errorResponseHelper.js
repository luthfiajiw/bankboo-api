function errorResponseHelper(statusCode, message) {
  return {
    error: {
      statusCode,
      message
    }
  };
};

module.exports = errorResponseHelper;
