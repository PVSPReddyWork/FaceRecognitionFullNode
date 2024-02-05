const faceapiModule = require('./../FRModels/face-api.min.js');
//const faceapiModule = require('face-api.js');
const { CustomLogger } = require('./CustomLogger.js');
const https = require('https');
const fs = require('fs');

const mongoDataBase = require('./MongoDB.js');

//const { Canvas, Image, loadImage } = require('canvas');
const canvas = require('canvas');

//const faceapi = require('face-api.js');
//const nodeFetch = require('node-fetch');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

const path = require('path');
//const MODELS_PATH = path.join(__dirname, './../FRModels');
//const MODELS_PATH = './../FRModels';
//globalThis.fetch = fetch;

// Make face-api.js use that fetch implementation
const { Canvas, Image, loadImage, ImageData } = canvas;

const APIAccessCode =
  'AKfycbwip48-94Ot2WwXuxGlBYgB6HoDWc4_VcSuYztNCD2SSu3qav5xDkXFoRARfnRGrqY1';
const FolderAccessCode = '1oEho4aHL_OPxPAUYBAKGRVHtwY7Lju37';

var labeledImagesPaths = [];
var faceDescriptions = [];
var faceMatcher = null;
var faceapi = faceapiModule;

faceapi.env.monkeyPatch({ fetch: nodeFetch });
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadRequiredModels = async () => {
  try {
    faceDescriptions = [];
    faceMatcher = null;
    //faceapi.env.monkeyPatch({ fetch: nodeFetch });
    //faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
    const MODELS_PATH = path.join(__dirname, './../ModelsEdited');

    faceapi.nets.ssdMobilenetv1
      .loadFromDisk(MODELS_PATH)
      .then((result) => {
        console.log('SSD model result >>>>>>');
        console.log(result);
        faceapi.nets.faceRecognitionNet
          .loadFromDisk(MODELS_PATH)
          .then((result) => {
            console.log('faceRecognitionNet result >>>>>>');
            console.log(result);
            faceapi.nets.faceLandmark68Net
              .loadFromDisk(MODELS_PATH)
              .then((result) => {
                console.log('faceLandmark68Net result >>>>>>');
                console.log(result);
                AccessLocalImages();
              })
              .catch((error) => {
                console.log('faceLandmark68Net error >>>>>>');
                console.log(error);
              });
          })
          .catch((error) => {
            console.log('faceRecognitionNet error >>>>>>');
            console.log(error);
          });
      })
      .catch((error) => {
        console.log('SSD Model error >>>>>>');
        console.log(error);
      });

    /*
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH).then(result => {
      console.log(result);
    }).catch(error => {
      console.log(error)
    })
    */

    /*
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
    ]).then(AccessLocalImages()); //(AccessDriveImages(FolderAccessCode));
    */
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};
async function loadDataBase(labeledImagesPaths) {
  try {
    CustomLogger.MessageLogger('Training Models with data starting');
    const labeledFaceDescriptors = await loadLabeledImages(labeledImagesPaths);
    CustomLogger.MessageLogger('Training Models with data Completed');
    CustomLogger.MessageLogger('Detections Data is adding to faceAPI');
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    CustomLogger.MessageLogger('Detections Data is added to faceAPI');
    logData();
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

async function loadLabeledImages(paths) {
  const labels = paths;
  labels.map(async (label) => {
    const descriptions = [];
    label.filesList.map(async (fileItem) => {
      console.log(fileItem.fileURL);
      //const img = await canvas.loadImage(fileItem.fileURL);
      const img = await canvas.loadImage(fileItem.base64);
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);
    });
    /**/
    const dbData = {
      label: label.folderName,
      descriptions: descriptions
    }
    /**/
    //console.log(dbData);
    var responses = await mongoDataBase.SaveFaceDescriptiors([dbData]);
    console.log(responses);
    //CustomLogger.MessageLogger('Data is logged to database');
    //return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
  });
}

function loadLabeledImages2(paths) {
  const labels = [
    'Black Widow',
    'Captain America',
    'Captain Marvel',
    'Hawkeye',
    'Jim Rhodes',
    'Thor',
    'Tony Stark',
  ];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

async function getImageFromSource(input) {
  const img = await canvas.loadImage(input);
  const c = canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);
  // const out = fs.createWriteStream('test.jpg');
  // const stream = c.createJPEGStream({ quality: 0.6, progressive: true, chromaSubsampling: true });
  // stream.pipe(out);
  return c;
}

function loadLabeledImages3(paths) {
  const labels = paths;
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      label.filesList.map(async (fileItem) => {
        /** /
        //const imgSource = 'data:image/jpeg;base64,' + fileItem.base64;
        const imgSource = fileItem.fileURL;//fileItem.base64;
        const img = new Image();
        img.src = imgSource;
        /**/
        /** /
        const img = await faceapi.fetchImage(fileItem.fileURL);
        /**/
        /*
        const img = new Image();

        img.onload = async () => {
          //resolve(img);
          const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        //descriptions.push(detections.descriptor);
        faceDescriptions.push(detections.descriptor);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        };        
        img.src = fileItem.fileURL;
        */
        //const img = await canvas.loadImage(fileItem.fileURL);
        /**/
        const img = await getImageFromSource(fileItem.base64);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        //descriptions.push(detections.descriptor);
        faceDescriptions.push(detections.descriptor);
        /**/
      });
      CustomLogger.MessageLogger('Training Models with data Completing');
      return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
    })
  );
}

async function GetFilesFromFolders(folderPath, folderName = '') {
  try {
    //const LABELED_IMAGES_PATH = path.join(__dirname, './../Pictures');
    const LABELED_IMAGES_PATH = folderPath; //path.join(__dirname, folderPath);//folderPath
    let fileObjects = [];
    await fs.readdirSync(LABELED_IMAGES_PATH).forEach(async (file) => {
      if (!file.toString().includes('.')) {
        let listOfFiles = await GetFilesFromFolders(
          folderPath + '/' + file.toString(),
          file
        );
        if (listOfFiles !== null && listOfFiles !== undefined) {
          const folderObject = {
            folderName: file,
            filesList: listOfFiles,
          };
          fileObjects.push(folderObject);
        }
      } else {
        const imagePath = folderPath + '/' + file.toString(); //path.join( __dirname, folderPath + '/' + file.toString());//folderPath + '/' + file.toString();
        var imageAsBase64 = await fs.readFileSync(imagePath, 'base64');
        const imageObject = {
          folderName: folderName,
          base64: 'data:image/jpeg;base64,' + imageAsBase64, //'',//'data:image/jpeg;base64,' + imageAsBase64,
          fileURL: imagePath,
        };
        fileObjects.push(imageObject);
        console.log(fileObjects);
      }
    });
    return fileObjects;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

const AccessLocalImages = async () => {
  try {
    CustomLogger.MessageLogger('Loaded Models');
    CustomLogger.MessageLogger('Obtaining Images');
    const allData = await GetFilesFromFolders('D:\\Pictures');//./../Pictures
    labeledImagesPaths = allData;
    CustomLogger.MessageLogger('Obtained Images');
    //CustomLogger.DataLogger(allData);
    //CustomLogger.MessageLogger("Training Models with data");
    //loadLabeledImages(allData);
    //loadDataBase(allData);
    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

async function AccessDriveImages(accessID) {
  //divPopupDisplay.style.visibility = 'hidden';
  var urlPart1 = 'https://script.google.com/macros/s/';
  var id = APIAccessCode; //'AKfycbzY7Ur9TbvrbQUlak3NSXvI_Oe8uIcq09Wxizm2HK67MFfNk4A090dPav_su-Q39Gr4'; //"AKfycbwPQZSMXpm2vtSsKYMRY12kENwd9n1rZyJAi_bSldBONoOUKvTEw90f4WIYFLEgU4b0";
  var extension = '/exec';
  var serviceURL = urlPart1 + id + extension;
  var headerObj = 'Contenttype=application/json&userRequest=FileAccess';
  var obj = {
    method_name: 'allFilesInFoldersListFormat',
    service_request_data: { folder_id: accessID },
  };
  var dbParam = JSON.stringify(obj);
  var serviceURLFinal = serviceURL + '?' + headerObj;
  /**/
  var options = {
    hostname: serviceURLFinal,
    agent: https.Agent({ keepAlive: true }),
    //port: 443,
    // path: '/post.php',
    //method: 'POST',
    /*
    headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': postData.length
       }
       * /
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      //process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(dbParam);
  req.end();
/**/
    /** /
  await nodeFetch(serviceURLFinal, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //mode: 'cors', // no-cors, *cors, same-origin
    //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    //redirect: 'follow', // manual, *follow, error
    //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: dbParam, // body data type must match "Content-Type" header
  })
    .then((response) => response.json())
    .then((responseObject) => {
      CustomLogger.DataLogger(responseObject);
    })
    .catch((ex) => {
      CustomLogger.ErrorLogger(ex);
    });
  /**/
    /*
  var xobj = new XMLHttpRequest();
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == 200) {
      var responseData = xobj.response;
      if (responseData != '') {
        var options = JSON.parse(responseData);
        var folderItemsList = options.folder_items;
        for (i = 0; i < folderItemsList.length; i++) {
          //console.log(folderItemsList[i]);
          const alteredGoogleURL =
            'https://drive.google.com/uc?id=' + folderItemsList[i].id;
          labeledImagesPaths.push(folderItemsList[i]);
        }
        loadDataBase();
      } else {
        CustomLogger.MessageLogger(
          'Folder is empty, please provide a valid folder id'
        );
      }
    } else {
    }
  };
  if (accessID == '') {
    xobj.open('GET', serviceURL, true);
    xobj.send();
  } else {
    var headerObj = 'Contenttype=application/json&userRequest=FileAccess';
    var obj = {
      method_name: 'allFilesInFoldersListFormat',
      service_request_data: { folder_id: accessID },
    };
    var dbParam = JSON.stringify(obj);
    xobj.open('POST', serviceURL + '?' + headerObj, true);
    xobj.send(dbParam);  
  }
  */
  };
}

const AddImagesToModels = async () => {
  try {
    CustomLogger.MessageLogger('Training Models with data');
    var data = await loadLabeledImages(labeledImagesPaths);
    //await GetFilesFromFolders('./../Pictures');
    return data;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

async function TestFunction() {
  try {
    loadRequiredModels();
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
//loadRequiredModels();
//TestFunction();
function logData() {
  try {
    CustomLogger.MessageLogger(
      'Loaded Models, and Images also, You can work on it now'
    );
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

//const
module.exports = { loadRequiredModels, AccessLocalImages, AddImagesToModels, loadLabeledImages };
/*
async function GetFilesFromFolders2(folderPath) {
  try {
    //const LABELED_IMAGES_PATH = path.join(__dirname, './../Pictures');
    const LABELED_IMAGES_PATH = path.join(__dirname, folderPath);
    await fs.readdir(LABELED_IMAGES_PATH, (err, files) => {
      files.forEach((file) => {
        if (!file.toString().includes('.')) {
          GetFilesFromFolders2(folderPath + '/' + file.toString());
        } else {
          console.log(JSON.stringify(file));
        }
      });
    });
    console.log('Completed Execution 1');
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
*/
