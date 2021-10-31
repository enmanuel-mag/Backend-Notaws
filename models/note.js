const {
  //utils
  collection, Timestamp, doc,
  //Read
  getDocs,
  //Create
  setDoc,
  //Update
  updateDoc,
  //Delete
  deleteDoc
} = require('firebase/firestore');

const { getStorage, ref, uploadBytes } = require('firebase/storage');
//Para crear ID unicos
const { v4: UUID } = require('uuid');
const async = require('async');
const fs = require('fs');

//Referencia a la database en firestore
const db = require('../db');

//objecto para definir la manera en que se parsea los datos al
//enviarlos a firestore y al recibirlos de firestore
const noteConverter = {
  toFirestore: (city) => {
    Object.keys(data).forEach((key) => {
      if (
        data[key] === null ||
        data[key] === undefined
      ) {
        delete data[key];
      }
    });
    return data;
  },
  fromFirestore: (snapshot) => {
    console.log('Parsing from firestore')
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data
    };
  }
}

const collectionName = 'notes';

class Note {

  static getAll(params, callback) {
    //collection(database, nombre-de-coleccion)
    const collectionRef = collection(db, collectionName).withConverter(noteConverter);
    // getDocs(coleccion, query <opcional>)
    return getDocs(collectionRef)
      .then(snap => snap.docs.map(doc => doc.data()))
      .then(notes => callback(null, notes))
      .catch(err => {
        console.log('Error getting all notes', err);
        return callback(err);
      });
  }

  static create({ data, file }, callback) {
    data.id = UUID();
    data.createdAt = Timestamp.now();
    
    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    const documentRef = doc(db, collectionName, data.id);
    return async.waterfall([
      (cb) => {
        //Create red to storage        
        const storage = getStorage();
        //Get extension
        const extesion = file.mimetype.split('/')[1];
        //Create ref to storage
        const fullName = `${file.filename}.${extesion}`;
        const fileRef = ref(storage, `${collectionName}/${fullName}`);
        //Upload file
        return uploadBytes(fileRef, fs.readFileSync(file.path))
          .then(() => cb(null, {
            fullName,
            originalname: file.originalname
          }))
          .catch(err => {
            console.log('Error uploading file');
            return cb(err);
          });
      },
      (fileUploaded, cb) => {
        //setDoc(documento, data <objecto con informacion de nuevo documento>)
        data.fileName = fileUploaded.fullName;
        data.displayFileName = fileUploaded.originalname;
        return setDoc(documentRef, data)
        .then(() => cb(null, data))
        .catch(err => {
          console.log('Error creating note');
          return cb(err);
        });
      }
    ], (error, data) => callback(error, data));
  }

  static update({ id, changes = {}, file }, callback) {
    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    const documentRef = doc(db, collectionName, id)

    //updateDoc(documento, data <objecto con informacion de los campos a actualizar>)
    return async.waterfall([
      (cb) => {
        if (!file) {
          return cb(null, null);
        }
        console.log('Uploading file');
        //Create red to storage        
        const storage = getStorage();
        //Get extension
        const extesion = file.mimetype.split('/')[1];
        //Create ref to storage
        const fullName = `${file.filename}.${extesion}`;
        const fileRef = ref(storage, `${collectionName}/${fullName}`);
        //Upload file
        return uploadBytes(fileRef, fs.readFileSync(file.path))
          .then(() => cb(null, {
            fullName,
            originalname: file.originalname,
          }))
          .catch(err => {
            console.log('Error uploading file');
            return cb(err);
          });
      },
      (fileUploaded, cb) => {
        console.log('Updating doc');
        if (
          !fileUploaded &&
          Object.keys(changes).length === 0
        ) {
          return cb(null, changes);
        }
        if (fileUploaded) {
          changes.displayFileName = fileUploaded.originalname;
          changes.fileName = fileUploaded.fullName;
        }
        return updateDoc(documentRef, changes)
          .then(() => cb(null, changes))
          .catch(err => {
            console.log('Error updating note');
            return callback(err);
          });
      }
    ], (error, data) => callback(error, data));
  }

  static delete(id, callback) {
    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    const documentRef = doc(db, collectionName, id);
    
    //deleteDoc(documento)
    return deleteDoc(documentRef)
      .then(() => callback(null, id))
      .catch(err => {
        console.log('Error deleting note');
        return callback(err);
      });
  }
}

module.exports = Note;