const faceapiModule = require('./Modules/face-api.min.js');
//const faceapiModule = require('face-api.js');
const { CustomLogger } = require('./CustomLogger.js');
const path = require('path');
const mongoDataBase = require('./MongoDB.js');
const canvas = require('canvas');
const { Helper } = require('./Modules/Helper.js');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

var faceapi = faceapiModule;
var labeledImagesPaths = [];
var faceMatcher = null;
var percentageDataLoaded = 0;

// Make face-api.js use that fetch implementation
const { Canvas, Image, ImageData, createCanvas, loadImage } = canvas;
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
      //CustomLogger.MessageLogger(labeledFaceDescriptorsData[i].label);
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
      //CustomLogger.MessageLogger(`Result from mongo database \n${JSON.stringify(labeledFaceDescriptorsData)}`);
      faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptorsData, 0.6);
      CustomLogger.MessageLogger("Data loading completed");
    }
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

async function SearchForFaces(imageData) {
    let responseObject = Helper.createResponseObject(400, {}, "Data not found");
  try {
    /**/
    if (faceMatcher !== null && faceMatcher !== undefined) {
      //CustomLogger.MessageLogger("Got the Data");
      ////const imgToDetect = await canvas.loadImage(imageData.base64Image);

      /*
      // Create a canvas
        const canvasInput = createCanvas();
        const context = canvasInput.getContext('2d');
        */

        // Create an Image object and load the image
        const imgToDetect = await loadImage(imageData.base64Image);

        // Draw the image on the canvas
        //context.drawImage(imgToDetect, 0, 0);

        const displaySize = {
            width: imgToDetect.width,
            height: imgToDetect.height,
        };

        /*
        // Adjust canvas dimensions
        canvasInput.width = imgToDetect.width;
        canvasInput.height = imgToDetect.height;
        */

        const images = imgToDetect;
        //CustomLogger.MessageLogger(`Image Input :\n${images}`);

        faceapi.matchDimensions(images, displaySize);

        const detections = await faceapi
        .detectAllFaces(images)
        .withFaceLandmarks()
        .withFaceDescriptors();

        //CustomLogger.MessageLogger(`Detections :\n${detections}`);

    const resizedWithDetections = faceapi.resizeResults(
        detections,
        displaySize
    );

    //CustomLogger.MessageLogger(`Resized With Detections :\n${resizedWithDetections}`);

    const results = resizedWithDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
    );

    //console.log(`Results :\n${results}`);

      /** /
      // Create a canvas
      const canvasInput = createCanvas();
      const context = canvasInput.getContext('2d');
      context.drawImage(images, 0, 0);
      // Adjust canvas dimensions
      canvasInput.width = images.width;
      canvasInput.height = images.height;
      
      let responseImage = "";
      results.forEach((result, i) => {
        const box = resizedWithDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvasInput);
        responseImage = canvasInput.toDataURL(images.mime)
      });
      /**/

      responseObject = Helper.createResponseObject(200, { 
          results: results,
          responseBase64Image: "responseImage",
      }, "Process completed successfully");
    }
    else{
        responseObject = Helper.createResponseObject(403, {}, "Invalid input");
    }
    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
    responseObject = Helper.createResponseObject(500, {}, "Internal Server Error");
  }
  return responseObject;
}

/**
 * Calculate the sum of two numbers.
 *
 * @param {object} imageWithDataList - this is a list object each item contains image in base 64 strings and their labels data= [{label:"", alias:"", profession:"", images:["",""]}] .
 * @returns {number} The sum of the two numbers.
 */
async function ObtainFaceDescriptiorsAndSaveToDB(imagesWithDataList) {
  try {
    //const imagesWithDataList = [{label:"", alias:"", profession:"", references:"", base64Images:["",""]}];

    const labels = paths;
    //console.log(labels);
    let AllImagesDescriptiors = [];
    await Promise.all(imagesWithDataList.map(async (imagesWithDataItem) => {
      const descriptions = [];
      try{
      await Promise.all(imagesWithDataItem.base64Images.map(async (imageItem) => {
        //console.log(fileItem);
        //const img = await canvas.loadImage(fileItem.fileURL);
        try{
        //console.log(fileItem.fileURL);
        const img = await loadImage(imageData.base64Image);
        
        
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
        //console.log("Descriptions data 1: ",JSON.stringify(descriptions));
        }
        catch(ex){
          CustomLogger.MessageLogger(`failed for the image: ${imagesWithDataItem.label}`);
          CustomLogger.ErrorLogger(ex);
        }
      }));
      /**/
      const dbData = {
        label: label.folderName,
        descriptions: descriptions,
      };
      /**/
      //console.log(dbData);
      AllImagesDescriptiors.push(dbData);
      //console.log("data2: ",JSON.stringify(dbData));
      //CustomLogger.MessageLogger('Data is logged to database');
      //return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
    }
    catch(ex){
      CustomLogger.MessageLogger(`failed for the image: ${imagesWithDataItem.label}`);
      CustomLogger.ErrorLogger(ex);}
    }));
    var deleteResponse = await mongoDataBase.DeleteFaceDescriptiors({});
    var responses = await mongoDataBase.SaveFaceDescriptiors(AllImagesDescriptiors);
    return responses;
  }
  catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}

/*
async function ObtainFaceDescriptiorsAndSaveToDB(paths) {
  try {
    const labels = paths;
    //console.log(labels);
    let AllImagesDescriptiors = [];
    await Promise.all(labels.map(async (label) => {
      const descriptions = [];
      await Promise.all(label.filesList.map(async (fileItem) => {
        //console.log(fileItem);
        //const img = await canvas.loadImage(fileItem.fileURL);
        try{
        //console.log(fileItem.fileURL);
        const img = await canvas.loadImage(`data:${fileItem.fileMimeType};base64,${fileItem.base64String}`);//(fileItem.base64String);//(`data:${fileItem.fileMimeType};base64,${fileItem.base64String}`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
        //console.log("Descriptions data 1: ",JSON.stringify(descriptions));
        }
        catch(ex){
          CustomLogger.MessageLogger((label.folderName, fileItem.fileURL));
          CustomLogger.ErrorLogger(ex);
        }
      }));
      /** /
      const dbData = {
        label: label.folderName,
        descriptions: descriptions,
      };
      /** /
      //console.log(dbData);
      AllImagesDescriptiors.push(dbData);
      //console.log("data2: ",JSON.stringify(dbData));
      //CustomLogger.MessageLogger('Data is logged to database');
      //return new faceapi.LabeledFaceDescriptors(label.folderName, descriptions);
    }));
    var deleteResponse = await mongoDataBase.DeleteFaceDescriptiors({});
    var responses = await mongoDataBase.SaveFaceDescriptiors(AllImagesDescriptiors);
    return responses;
  }
  catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
}
*/


loadRequiredModels();

module.exports = {
  loadRequiredModels,
  SearchForFaces,
  loadDescriptiors,
  ObtainFaceDescriptiorsAndSaveToDB,
};
