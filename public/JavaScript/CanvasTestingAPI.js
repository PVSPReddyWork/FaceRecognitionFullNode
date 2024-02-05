//const faceapiModule = require('face-api.js');
const { CustomLogger } = require('./CustomLogger.js');
const { Helper } = require('./Modules/Helper.js')
const canvas = require('canvas');
const nodeFetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
//npm install node-fetch@^2.6.6

// Make face-api.js use that fetch implementation
const { createCanvas, loadImage } = canvas;
/*
faceapi.env.monkeyPatch({ fetch: nodeFetch });
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
*/

/*

    "canvas": "^2.10.2",
    "express": "^4.18.2",
    "http": "*",
    "mongodb": "^4.13.0",
    "node-fetch": "^3.3.0"
*/

async function GetImageData(_imageData) {
  let responseObject = Helper.createResponseObject(400, {}, "Data not found");
  try {
    /**/

    // Create a canvas
    const canvas = createCanvas(1, 1);
    const context = canvas.getContext('2d');

    /*
    // Load the image from base64 string
    const img = new loadImage();
    img.src = _imageData.base64Image;

    // Wait for the image to load
    await img.onload;
    */
    const img = await loadImage(_imageData.base64Image);

    console.log(context);

    console.log(img);

    // Resize the canvas to match the image dimensions
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image on the canvas
    context.drawImage(img, 0, 0);

    // Get image data
    //const imageData = context.getImageData(0, 0, img.width, img.height);
    const base64ImageData = canvas.toDataURL('image/png');
    //canvas.loadImage()

    responseObject = Helper.createResponseObject(200, {
      width: img.width,
      height: img.height,
      data: base64ImageData,
      //data: imageData.data,
    }, "Data is obtained Successfully");


    /**/
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
    responseObject = Helper.createResponseObject(500, {}, "Internal Server Error");
  }
  return responseObject;
}

module.exports = {
  GetImageData
};
