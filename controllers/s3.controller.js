require('custom-env').env(true)

const {S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl, S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");

const logger = require('../logger/logger');
const HELPERS = require('../utils/helper.utils');

// Configure AWS SDK with your credentials and the S3 region where your bucket is located
// Create an S3 instance

const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    apiVersion: '2006-03-01',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadFile = async function (file) {
    // Set the key for the S3 object (use the same key for upload and download)
    // Set the S3 parameters for the object upload
    try{
        const fileName =  `${Math.floor(Math.random()*1000000000000)}-${file.originalname.replace(/ /g, '-').replace(/\(/g, '').replace(/\)/g, '')}`;
        return await new Promise(async (resolve, reject) => {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: process.env.NODE_ENV +'/'+ fileName,
                Body: file.buffer,
                ACL: "private",
                ContentType: file.mimetype
            };

            const command = new PutObjectCommand(params);
            const response = await s3Client.send(command);
            const location = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.NODE_ENV +'/'+ fileName}`

            if(response) {
                resolve(getAwsS3SignedFileUrl(location));
            }
            else{
                reject("Error Uploading File");
            }
        })
    }catch(err) {
        throw err;
    }
};


const uploadPublicImageFile = async function(file) {
    try{
        const fileName =  `${Math.floor(Math.random()*1000000000000)}-${file.originalname.replace(/ /g, '-').replace(/\(/g, '').replace(/\)/g, '')}`;
        return await new Promise(async (resolve, reject) => {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: process.env.NODE_ENV +'/public/'+ fileName,
                Body: file.buffer,
                ACL: "public-read",
                ContentType: file.mimetype
            };
        
            // Upload the file to S3
            const command = new PutObjectCommand(params);
            const response = await s3Client.send(command);

            const location = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.NODE_ENV +'/public/'+ fileName}`

            if(response) {
                resolve({imageUrl: location});
            }
            else{
                reject("Error Uploading File");
            }
        })
    }catch(err) {
        throw err;
    }
}



const multipleFileUpload = async function (files) {
    try{
        const __FILES = []
        for(let i=0; i< files.length; i++) {
            const file = files[i];
            const file_urls = await uploadFile(file);
            __FILES.push(file_urls)
        }
        return __FILES;
    }catch(err) {
        throw err;
    }
}



const getAwsS3SignedFileUrl = function (fileLink = "") {
    if(fileLink == null || !(fileLink.startsWith(process.env.AWS_S3_DOMAIN))) {
        return {
            orignal_url: null,
            dynamic_url: null
        }
    }
    const key = fileLink.split(process.env.AWS_S3_DOMAIN+'/')[1];
    // Set the S3 parameters for the object download
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 3600, // URL is valid for 1 hour
    };

    let isUrlFetched = false
    let url = ""
    // const command = new GetObjectCommand(params);
    // getSignedUrl(s3Client, command, { expiresIn: 3600 })
    // .then((val) => {
    //     isUrlFetched = true;
    //     url = val;
    // });


    // const url = s3.getSignedUrl('getObject', params);
    return {
        orignal_url: fileLink,
        dynamic_url: fileLink
    };
}

module.exports = { uploadFile, getAwsS3SignedFileUrl, multipleFileUpload, uploadPublicImageFile };
