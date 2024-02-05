const faceapiModule = require('./Modules/face-api.min.js');
//const faceapiModule = require('face-api.js');
const { CustomLogger } = require('./CustomLogger.js');
const path = require('path');
const mongoDataBase = require('./MongoDB.js');
const canvas = require('canvas');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

var faceapi = faceapiModule;
var labeledImagesPaths = [];
var faceMatcher = null;
var percentageDataLoaded = 0;

// Make face-api.js use that fetch implementation
const { Canvas, Image, loadImage, ImageData } = canvas;
faceapi.env.monkeyPatch({ fetch: nodeFetch });
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadRequiredModels = async () => {
  try {
    const MODELS_PATH = path.join(__dirname, './../Models');
    console.log(MODELS_PATH);
    faceapi.nets.ssdMobilenetv1
      .loadFromDisk(MODELS_PATH)
      .then((result) => {
        console.log('SSD model loaded');
        faceapi.nets.faceRecognitionNet
          .loadFromDisk(MODELS_PATH)
          .then((result) => {
            console.log('faceRecognitionNet model loaded');
            faceapi.nets.faceLandmark68Net
              .loadFromDisk(MODELS_PATH)
              .then((result) => {
                console.log('faceLandmark68Net model loaded');
                loadDescriptiors();
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

async function loadDescriptiors(faceAppoximity = 0.6) {
  try {
    const labeledFaceDescriptorsData =
      await mongoDataBase.GetAllFaceDescriptiors();
    if (
      labeledFaceDescriptorsData !== null &&
      labeledFaceDescriptorsData !== undefined&&
      labeledFaceDescriptorsData.length > 0
    ) {
      let labeledFaceDescriptors = [];
      for (i = 0; i < labeledFaceDescriptorsData.length; i++) {
      //console.log(labeledFaceDescriptorsData[i].label);
        for (
          j = 0;
          j < labeledFaceDescriptorsData[i].descriptions.length;
          j++
        ) {
          labeledFaceDescriptorsData[i].descriptions[j] = new Float32Array(
            Object.values(labeledFaceDescriptorsData[i].descriptions[j])
          );
        }
        /**/
        labeledFaceDescriptorsData[i] = new faceapi.LabeledFaceDescriptors(
          labeledFaceDescriptorsData[i].label,
          labeledFaceDescriptorsData[i].descriptions
        );
        /**/
      }
      //console.log(`Result from mongo database /n ${JSON.stringify(labeledFaceDescriptorsData)}`);
      faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptorsData, 0.6);
      CustomLogger.MessageLogger("Data loading completed");
    }
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

async function SearchForFaces(imageData) {
  try {
    /**/
    if (faceMatcher !== null && faceMatcher !== undefined) {
      CustomLogger.MessageLogger("Got the Data");
      const imgToDetect = await canvas.loadImage(imageData.filesPath);
      CustomLogger.MessageLogger("Image Prepared");

      let canvasInput = faceapi.createCanvasFromMedia(imgToDetect);
      var context = canvasInput.getContext('2d');
      context.drawImage(imgToDetect, 10, 10);

      const displaySize = {
        width: imgToDetect.width,
        height: imgToDetect.height,
      };
      CustomLogger.MessageLogger("Canvas Prepared");
      faceapi.matchDimensions(canvasInput, displaySize);
      CustomLogger.MessageLogger("Dimensions Adjusted");
      const detections = await faceapi
        .detectAllFaces(imgToDetect)
        .withFaceLandmarks()
        .withFaceDescriptors();
      const resizedWithDetections = faceapi.resizeResults(
        detections,
        displaySize
      );
      const results = resizedWithDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );
      /** /
      let responseImage = "";
      results.forEach((result, i) => {
        const box = resizedWithDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvasInput);
        responseImage = canvasInput.toDataURL(imageData.mime)
      });
      return responseImage;
      /**/
      return results;
    }
    else{
      return "Invalid input";
    }
    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);

    return ({"Error": "Invalid input catch"});
  }
}

async function SearchForFaces1 (imageData) {
  try {
    /**/
    if (faceMatcher !== null && faceMatcher !== undefined) {
      CustomLogger.MessageLogger("Got the Data");
      const imgToDetect = await canvas.loadImage(imageData.filesPath);
      CustomLogger.MessageLogger("Image Prepared");

      let canvasInput = faceapi.createCanvasFromMedia(imgToDetect);
      var context = canvasInput.getContext('2d');
      context.drawImage(imgToDetect, 10, 10);

      const displaySize = {
        width: imgToDetect.width,
        height: imgToDetect.height,
      };
      CustomLogger.MessageLogger("Canvas Prepared");
      faceapi.matchDimensions(canvasInput, displaySize);
      CustomLogger.MessageLogger("Dimensions Adjusted");
      const detections = await faceapi
        .detectAllFaces(imgToDetect)
        .withFaceLandmarks()
        .withFaceDescriptors();
      const resizedWithDetections = faceapi.resizeResults(
        detections,
        displaySize
      );
      const results = resizedWithDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );
      /** /
      let responseImage = "";
      results.forEach((result, i) => {
        const box = resizedWithDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvasInput);
        responseImage = canvasInput.toDataURL(imageData.mime)
      });
      return responseImage;
      /**/
      return results;
    }
    else{
      return "Invalid input";
    }
    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);

    return ({"Error": "Invalid input catch"});
  }
}

loadRequiredModels();

module.exports = {
  loadRequiredModels,
  SearchForFaces,
  loadDescriptiors,
};
