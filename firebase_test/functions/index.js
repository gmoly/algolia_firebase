const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const firebase = require('firebase');

// load values from the .env file in this directory into process.env
dotenv.config();

// configure firebase
firebase.initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const database = firebase.database();

// configure algolia
const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

exports.updateIndex = functions.database.ref('/trips/{tripId}').onWrite((change, context) => {

    console.log('MY LOG -> context', context);
    console.log('MY LOG -> params', change);
    
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);

const tripId = context.params.tripId

if(!change.after.exists || change.after.val() === null) {
    return index.deleteObject(tripId, (err) => {
        if (err) throw err
        console.log('Trip removed in Algolia Index', tripId)    
    })
}

const data = change.after.val()
const result = {
  objectID: tripId,
  title: data.title,
  user: data.user,
  published: data.published,
  places: data.places.map(place => {return { place: place.placeTitle, latitude: place.location.latitude, longitude: place.location.longitude }})
}


return index.saveObject(result, (err, content) => {
    if (err) throw err
    console.log('Trip updated in Algolia Index', result.objectID)
})

});

/*const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);

const contactsRef = database.ref('/trips');
contactsRef.on('child_added', addOrUpdateIndexRecord);
contactsRef.on('child_changed', addOrUpdateIndexRecord);
contactsRef.on('child_removed', deleteIndexRecord);

function addOrUpdateIndexRecord(contact) {
  // Get Firebase object
  const record = contact.val();
  // Specify Algolia's objectID using the Firebase object key
  record.objectID = contact.key;
  // Add or update object
  index
    .saveObject(record)
    .then(() => {
      console.log('Firebase object indexed in Algolia', record.objectID);
    })
    .catch(error => {
      console.error('Error when indexing contact into Algolia', error);
      process.exit(1);
    });
}

function deleteIndexRecord({key}) {
  // Get Algolia's objectID from the Firebase object key
  const objectID = key;
  // Remove the object from Algolia
  index
    .deleteObject(objectID)
    .then(() => {
      console.log('Firebase object deleted from Algolia', objectID);
    })
    .catch(error => {
      console.error('Error when deleting contact from Algolia', error);
      process.exit(1);
    });
}*/

