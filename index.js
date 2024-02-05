const express = require('express');
const app = express();
const port = 3010;
const path = require('path');
const cors = require('cors');
///*"start": "node index.js"*/
const faceAPILocal = require('./public/JavaScript/FaceRecognition.js');
const canvasAPI = require('./public/JavaScript/CanvasTestingAPI.js');
//const mongoDataBase = require('./public/JavaScript/MongoDB.js');
//const faceAPILocal = require('./public/JavaScript/index.js');
const { CustomLogger } = require('./public/JavaScript/CustomLogger.js');

const createResponseObject = async (responseData, statusCode = 400, message = "") => {
  try {
    const responseObject = {
      "statusCode": statusCode,
      "data": responseData,
      "message": message
    };
    return responseObject;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

/**/
app.use(cors());
/** /
const corsOptions = {
  origin: 'http://your-allowed-origin.com', // Specify the allowed origin(s)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify the allowed HTTP methods
  credentials: true, // Include cookies and HTTP authentication information in the CORS request
  optionsSuccessStatus: 204, // Respond with a 204 status for preflight requests
};

app.use(cors(corsOptions));
/**/

//app.use(express.static('static'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/UI/HTML/index.html'));
});

app.get('/LoadModels', async (req, res) => {
  //await faceAPILocal.loadRequiredModels();
  res.send('Loading');
});

app.post('/IdentifyKnownFaces', async function (req, res) {
  try{
  //console.log(`body is  ${JSON.stringify(req)}`);
  
  let body = "";
  req.on("data", (chunk) => {
    body += chunk; // convert Buffer to string
  });
  req.on("end", async () => {
    const result = JSON.parse(body);
    //console.log(result);
    const response = await faceAPILocal.SearchForFaces(result);//loadDescriptiors();//SearchForFaces
    const responseObj = response;//await createResponseObject(response.statusCode, response.data, response.message);
    console.log(responseObj);
    res.status(response.statusCode).send(responseObj);
    //res.send(result);
    //res.end("ok");
  });
  }
  catch(ex){
    CustomLogger.ErrorLogger(ex);
    res.status(400).send("Unexpected data, please provide a valid data")
  }
});


app.get('/GetMongo', async (req, res) => {
  //await mongoDataBase.GetAllFaceDescriptiors();
  //await faceAPILocal.loadDescriptiors();//SearchForFaces
  res.send('Loading');
});

app.post('/CheckForImage', function (req, res) {
  try{
    console.log('receiving data ...');
    let body = "";
    req.on("data", (chunk) => {
      body += chunk; // convert Buffer to string
    });
    req.on("end", async () => {
      const result = JSON.parse(body);
      console.log(result);
      res.send(result);
      //res.end("ok");
    });
    //var reqObj = JSON.parse(req.body);
    //console.log('body is ', req.body);
    //res.send(reqObj);
  }
  catch(ex){
    CustomLogger.ErrorLogger(ex);
    res.send("Unexpected data, please provide a valid data")
  }
});
/* Testing the project* /

app.post('/CheckForImage', function (req, res) {
  console.log('receiving data ...');
  console.log('body is ', req.body);
  res.send(req.body);
});

app.get('/GetImagesData', async (req, res) => {
  var data = await faceAPILocal.AddImagesToModels();
  res.send(data);
});

app.post('/GetFilesJSON', async function (req, res) {
  console.log('body is ', req.body);
  await AccessFolders.GetImagesFromFolders(req.body.filesPath, false);
  res.send(req.body);
});


/*
app.get('/AssignToModels', (req, res) => {
  faceAPILocal.AddImagesToModels();
  res.send('loaded');
});
app.get('/testDB', async (req, res) => {
  var response = await mongoDataBase.TestMongoConnection();
  // mongoDataBase.SaveFaceDescriptiors;
  res.send(response);
});
*/
/**/


app.post('/GetImageDimensions', async function (req, res) {
  try{
  //console.log(`body is  ${JSON.stringify(req)}`);
  
  let body = "";
  req.on("data", (chunk) => {
    body += chunk; // convert Buffer to string
  });
  req.on("end", async () => {
    const result = JSON.parse(body);
    const response = await canvasAPI.GetImageData(result);//loadDescriptiors();//SearchForFaces
    const responseObj = await createResponseObject(response, 200, "");
    console.log(responseObj);
    res.send(responseObj);
    
  });
  }
  catch(ex){
    CustomLogger.ErrorLogger(ex);
    res.send("Unexpected data, please provide a valid data")
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
