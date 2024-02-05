const { CustomLogger } = require('./CustomLogger.js');
const https = require('https');
const fs = require('fs');
const path = require('path');
var labeledImagesPaths = [];

async function GetFilesFromFolders(folderPath, folderName = '', isAccessingProjFiles = false) {
  try {
    const FILES_PATH = (isAccessingProjFiles) ? path.join(__dirname, folderPath) : folderPath ;
    let fileObjects = [];
    await fs.readdirSync(FILES_PATH).forEach(async (file) => {
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
        const filePath = (isAccessingProjFiles) ? path.join(__dirname, folderPath + '/' + file.toString()) : folderPath + '/' + file.toString();
        const imageObject = {
          folderName: folderName,
          fileURL: filePath,
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

const AccessProjectFiles = async (filePath) => {
  try {
    const allData = await GetFilesFromFolders(filePath, "", true);//"./../Pictures"
    labeledImagesPaths = allData;
    CustomLogger.MessageLogger('Obtained Files');
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const AccessLocalFiles = async (filePath) => {
    try {
      const allData = await GetFilesFromFolders(filePath, "", false);//'D:\\Pictures'
      labeledImagesPaths = allData;
      CustomLogger.MessageLogger('Obtained Files');
    } catch (ex) {
      CustomLogger.ErrorLogger(ex);
    }
};

const GetImagesFromFolders = async (filePath, fromProjectFolders) => {
    try {
        let imageFolderObjects = [];
      const allFiles = (fromProjectFolders) ? await AccessProjectFiles(filePath) : await AccessLocalFiles(filePath);
      if(allFiles !== null && allFiles !== undefined){
        allFiles.forEach(async (eachFile) => {
            let imagesList = [];
            eachFile.filesList.forEach( async (element) => {
                if(element.fileURL.includes('.')){
                    var fileType = element.fileURL.split('.')[element.fileURL.split('.').length - 1];
                    if(fileType.toLower() === "jpg" || fileType.toLower() === "jpeg" || 
                    fileType.toLower() === "png"){
                        var imageAsBase64 = await fs.readFileSync(imagePath, 'base64');
                        const newImageObject = {
                            folderName: eachFile.folderName,
                            base64String: imageAsBase64,
                            fileURL: element.fileURL,
                        }
                        imagesList.push(newImageObject);
                    }
                }
                else{

                }
            });
            const folderObject = {
                folderName: eachFile.folderName,
                filesList: listOfFiles,
              };
              imageFolderObjects.push(folderObject);
        });
        return imageFolderObjects;
      }
      return null;
    } catch (ex) {
      CustomLogger.ErrorLogger(ex);
      return null;
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

module.exports = { AccessProjectFiles, AccessLocalFiles, GetImagesFromFolders };