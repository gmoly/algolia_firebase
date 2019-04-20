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
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);
/*
// Adding a few contacts
Promise.all([
  database.ref('/trips').push({
    user_id :"sdfsdfDFdfd14567",
    name: 'Josh',
    city: 'San Francisco'
  }),
  database.ref('/trips').push({
    user_id :"23445gdfgdfgDDFd",
    name: 'Sem',
    city: 'London'
  }),
  database.ref('/trips').push({
    user_id :"sdfsdfsdfsdfRRRR",
    name: 'Tom',
    city: 'Brasilia'
  }),
  database.ref('/trips').push({
    user_id :"23445gdfgdfgDDFd",
    name: 'Sem',
    city: 'Kasablanka'
  }),
  database.ref('/trips').push({
    user_id :"xvxcvcfDGFdfd345",
    name: 'Tim',
    city: 'Paris'
  })]).then(() => {
    console.log("Contacts added to Firebase");
    process.exit(0);
  }).catch(error => {
    console.error("Error adding contacts to Firebase", error);
    process.exit(1);
  });
*/

// Get all contacts from Firebase
database.ref('/trips').once('value', trips => {
  // Build an array of all records to push to Algolia
  const records = [];
  trips.forEach(trip => {
    // get the key and data from the snapshot
    const childKey = trip.key;
    const childData = trip.val();
    // We set the Algolia objectID as the Firebase .key
    childData.objectID = childKey;
    // Add object for indexing
    records.push(childData);
  });

  // Add or update new objects
  index
    .saveObjects(records)
    .then(() => {
      console.log('Contacts imported into Algolia');
    })
    .catch(error => {
      console.error('Error when importing contact into Algolia', error);
      process.exit(1);
    });
});

