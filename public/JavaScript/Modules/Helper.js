/*
Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)
*/

const Helper = {
  CodeSuccess: 200,
  CodeClientError: 400,
  CodeServerError: 500,
  createResponseObject: async (statusCode = 0, responseData, message = '') => {
    let responseObject;
    try {
      responseObject = {
        statusCode: statusCode,
        data: responseData,
        message: message,
      };
      return responseObject;
    } catch (ex) {
      responseObject = {
        statusCode: Helper.CodeServerError,
        data: null,
        message:
          'Failed to create a JSON response object, please wait for sometime to fix the issue',
      };
      CustomLogger.ErrorLogger(ex);
    }
    return responseObject;
  },
};
module.exports = { Helper };
