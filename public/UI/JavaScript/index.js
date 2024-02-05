function isImage(file) {
    // Check if the file type is an image
    return file.type.startsWith('image/');
}

var base64ImageData = "";
async function onAddedImagePath(owner) {
    try {
        console.log(owner);
        let firstFile = owner.files[0];
        if (firstFile) {
            // Check if the selected file is an image
            if (isImage(firstFile)) {
                // Read the file as a data URL
                const reader = new FileReader();
                reader.onload = function (e) {
                    // Display the base64 result
                    base64ImageData = e.target.result;
                    //console.log(base64ImageData);
                };
                reader.readAsDataURL(firstFile);
            } else {
                alert('Please upload an image file.');
            }
        } else {
            alert('Please select a file.');
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

async function onSubmitSelectedImage() {
    try {
        console.log(base64ImageData);
        //LoadImageForTesting();
        GetImageDescriptions();
    }
    catch (ex) {
        console.log(ex);
    }
}

const baseURL = "http://localhost:3010/";
const identifyFaceEndPoint = "IdentifyKnownFaces";
async function GetImageDescriptions() {
    try {
        const postData = {
            "base64Image": base64ImageData
        }
        // Configuration for the fetch request
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers as needed
            },
            body: JSON.stringify(postData),
        };
        // Making a GET request using fetch
        fetch(`${baseURL}${identifyFaceEndPoint}`, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Successful response
                console.log(JSON.stringify(data));
                //{"statusCode":200,"data":{"results":[{"_label":"Chris Evans","_distance":0.25958504367742014}],"responseBase64Image":"responseImage"},"message":"Process completed successfully"}
                console.log(data.data.results.length);
            })
            .catch(error => {
                // Handle errors
                console.error('Fetch error:', error);
            });
    }
    catch (ex) {
        console.log(ex);
    }
}

/***************************************************************************************************************/
async function LoadImageForTesting() {
    try {
        var myImage = new Image();
        myImage.src = base64ImageData;

        myImage.onload = function () {
            let img = myImage;
            console.log(`Width: ${img.naturalWidth}px, Height: ${img.naturalHeight}px`);
            var canvas = document.getElementById('mycanvas');
            //const c = canvas.createCanvas(img.naturalWidth, img.naturalHeight);
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        };

        /*
        var canvas = document.getElementById('mycanvas');

        
        const img = await canvas.loadImage(input);
        const c = canvas.createCanvas(img.width, img.height);
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        */
        /*
         var ctx = canvas.getContext('2d');
         ctx.beginPath();
         ctx.arc(100, 100, 50, 1.5 * Math.PI, 0.5 * Math.PI, false);
         ctx.lineWidth = 10;
         ctx.stroke();
         //var imgData = canvas.toDataURL();
         ctx.drawImage(myImage, 0, 0);
         */
    }
    catch (ex) {
        console.log(ex);
    }
}
/***************************************************************************************************************/