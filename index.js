const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({dest: __dirname + '/uploads/images'});
const AWS = require('aws-sdk');
const app = express();
const PORT = 3000;
const accesKeyId ='AKIAZDMB3MJ5BYFU6XPR';
const secretAccessKey ='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';

const s3 = new AWS.S3({
    accessKeyId: accesKeyId,
    secretAccessKey: secretAccessKey
});

app.use(express.static('public'));

app.post('/upload', upload.single('photo'), async (req, res) => {

    if(req.file) {
      var stream = fs.createReadStream(req.file.path)
      name = req.file.originalname.replace(/\W+/g,'-').toLowerCase();

        const params = {
            Bucket: 'ashimageupload', // pass your bucket name
            Key: name, // file will be saved as originalname
            Body: stream, //the actual *file* being uploaded
            ContentType: req.file.mimetype, //type of file being uploaded
            ACL: 'public-read', //Set permissions so everyone can see the image
            processData: false,
        };
        global.image='';
        await s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            global.image = data.Location;
            const cloudfrontDmain = 'd2fgxsvxrohwn5.cloudfront.net'
            const imagaPath = 'https://'+ cloudfrontDmain +'/'+ name;
            console.log(`File uploaded successfully at ${data.Location}`);
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Upload Images to Server</title>
                <!-- Required meta tags -->
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

                <!-- Bootstrap CSS -->
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
                      integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">

                <style>
                    body {
                        background: darkturquoise;
                    }
                </style>
            </head>
            <body>

            <div class="container">
                <div class="card border-success mt-5">
                    <h1 class="card-header">Image Uploaded successfully</h1>
                </div>
                <div style="width:100%; height:auto">
                  <img style="width:50%; height:auto; margin-left:auto; margin-right:auto; margin-top:50px" src=${imagaPath} alt="">
                </div>
            </div>

            </body>
            </html>`);
        });
    }
    else throw 'error';
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});
