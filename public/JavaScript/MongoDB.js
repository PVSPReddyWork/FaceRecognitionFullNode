const { MongoClient, ServerApiVersion } = require('mongodb');
const { CustomLogger } = require('./CustomLogger.js');

const uri =
  'mongodb+srv://pvspreddy_mongo:1234509876@cluster0.hxu712f.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/* to create a database
var url = "mongodb://localhost:27017/mydb";

MongoClient(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

*/

//db//face_recognition
//collection//face_descriptiors

const createResponseObject = async (statusCode, responseData) => {
  try {
    const responseObject = {
      statusCode: statusCode,
      data: responseData,
    };
    return responseObject;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const SaveFaceDescriptiors = async (arrayOfValues) => {
  try {
    await client.connect();
    const db = client.db('face_recognition');
    const collection = db.collection('face_descriptiors');
    const insertResult = await collection.insertMany(arrayOfValues);
    client.close();
    const result = `Insert Result: ${insertResult}`;
    return result;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const GetAllFaceDescriptiors = async () => {
  try {
    await client.connect();
    const db = client.db('face_recognition');
    const collection = db.collection('face_descriptiors');
    const result = await collection.find({}).toArray();
    //console.log(`Result from mongo database /n ${JSON.stringify(result)}`);
    client.close();
    return result;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const DeleteFaceDescriptiors = async (arrayOfValues) => {
  try {
    console.log(arrayOfValues);
    await client.connect();
    const db = client.db('face_recognition');
    const collection = db.collection('face_descriptiors');
    const insertResult = await collection.deleteMany(arrayOfValues);
    client.close();
    const result = `Insert Result: ${insertResult}`;
    return result;
  } catch (ex) {
    CustomLogger.ErrorLogger(ex);
  }
};

const TestMongoConnection = async () => {
  await client.connect();
  const db = client.db('test');
  const collection = db.collection('devices');
  const values = await collection.find({}).toArray();
  //const collection = client.db('test').collection('devices');
  client.close();
  return values;
};

module.exports = { GetAllFaceDescriptiors, SaveFaceDescriptiors, DeleteFaceDescriptiors };
