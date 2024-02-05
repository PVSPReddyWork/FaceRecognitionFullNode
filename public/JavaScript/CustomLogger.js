const CustomLogger = {
  MessageLogger: (dataObject) => {
    try {
      //var dataObjectString = JSON.stringify(dataObject);
      console.log(dataObject);
    } catch (ex) {
      CustomLogger.ErrorLogger(ex);
    }
  },
  DataLogger: (dataObject) => {
    try {
      var dataObjectString = JSON.stringify(dataObject);
      console.log(dataObjectString);
    } catch (ex) {
      CustomLogger.ErrorLogger(ex);
    }
  },
  ErrorLogger: (errorObject) => {
    try {
      console.log(errorObject);
    } catch (ex) {
      console.log(ex);
    }
  },
};
module.exports = { CustomLogger };
