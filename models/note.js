const {
  //utils
  collection,
  Timestamp,
  doc,
  //Read
  getDocs,
  //Create
  setDoc,
  //Update
  updateDoc,
  //Delete
  deleteDoc,
} = require('firebase/firestore');

const {
  ref,
  uploadBytes,
  getDownloadURL,
} = require('firebase/storage');
//Para crear ID unicos
const { v4: UUID } = require('uuid');
const async = require('async');
const fs = require('fs');

//Referencia a la database en firestore
const { db, storage } = require('../db');
//Referencia a storage (para almacenar archivos, no de documentos)

//objecto para definir la manera en que se parsea los datos al
//enviarlos a firestore y al recibirlos de firestore
const noteConverter = {
  toFirestore: (city) => {
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });
    return data;
  },
  fromFirestore: (snapshot) => {
    console.log('Parsing from firestore');
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    };
  },
};

const collectionName = 'notes';

class Note {
  static getAll(params, callback) {
    //collection(database, nombre-de-coleccion)
    const collectionRef = collection(db, collectionName).withConverter(
      noteConverter
    );
    return async.waterfall([
      //primer pase
      (cb) => {
        //getDocs(coleccion, query <opcional>)
        return getDocs(collectionRef)
          .then((snap) => snap.docs.map((doc) => doc.data()))
          .then((notes) => cb(null, notes))
          .catch((err) => {
            console.log('Error getting all notes', err);
            return cb(err);
          });
      },
      //segundo pase (ultimo)
      (notes = [], cb) => {
        return async.map(
          notes,//array de notas a iterar
          (note, cbmap) => {//function que se ejecuta por cada nota
            //el primer parametros es la nota actual
            //cbmap es la funcion para continuar a la siguiente nota
            const storagePath = note.storagePath;
            //getDownloadURL(ref(referencia-a-storage, ruta-en-storage))
            return getDownloadURL(ref(storage, storagePath))
              .then(url => {
                note.fileUrl = url;
                return cbmap(null, note);
              })
              .catch((err) => {
                console.log('Error getting download url', err);
                //No retorno error porque es un error
                //que se puede emascarar desde el Frontend
                return cbmap(null, note);
              });
          },
          //esto se ejecuta cuando termina de iterar todas las notas
          (error, result) => cb(error, result)
        );
      },
    //esto se ejecuta cuando se termina de ejecutar el ultimo paso del waterfall
    ], (error, result) => callback(error, result));
  }

  static create({ data, file }, callback) {
    //generar id unico
    data.id = UUID();
    //agregar una fecha de creacion
    data.createdAt = Timestamp.now();

    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    const documentRef = doc(db, collectionName, data.id);
    return async.waterfall(
      [
        (cb) => {
          //Get extension
          const extesion = file.mimetype.split('/')[1];
          //Create ref to storage
          const fullName = `${file.filename}.${extesion}`;
          const storagePath = `${collectionName}/${fullName}`;
          const fileRef = ref(storage, storagePath);
          //Upload file
          return uploadBytes(fileRef, fs.readFileSync(file.path))
            .then(() =>
              cb(null, {
                storagePath,
                originalname: file.originalname,
              })
            )
            .catch((err) => {
              console.log('Error uploading file');
              return cb(err);
            });
        },
        (fileUploaded, cb) => {
          //setDoc(documento, data <objecto con informacion de nuevo documento>)
          data.storagePath = fileUploaded.storagePath;
          data.displayFileName = fileUploaded.originalname;
          return setDoc(documentRef, data)
            .then(() => cb(null, data))
            .catch((err) => {
              console.log('Error creating note');
              return cb(err);
            });
        },
      ],
      (error, data) => callback(error, data)
    );
  }

  static update({ id, changes = {}, file }, callback) {
    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    const documentRef = doc(db, collectionName, id);

    //updateDoc(documento, data <objecto con informacion de los campos a actualizar>)
    return async.waterfall(
      [
        (cb) => {
          if (!file) {
            return cb(null, null);
          }
          console.log('Uploading new file');
          //Get extension
          const extesion = file.mimetype.split('/')[1];
          //Create ref to storage
          const fullName = `${file.filename}.${extesion}`;
          const storagePath = `${collectionName}/${fullName}`;
          const fileRef = ref(storage, storagePath);
          //Upload file
          return uploadBytes(fileRef, fs.readFileSync(file.path))
            .then(() =>
              cb(null, {
                storagePath,
                originalname: file.originalname,
              })
            )
            .catch((err) => {
              console.log('Error uploading file');
              return cb(err);
            });
        },
        (fileUploaded, cb) => {
          console.log('Updating document');
          if (!fileUploaded && Object.keys(changes).length === 0) {
            return cb(null, changes);
          }
          if (fileUploaded) {
            changes.displayFileName = fileUploaded.originalname;
            changes.storagePath = fileUploaded.storagePath;
          }
          return updateDoc(documentRef, changes)
            .then(() => cb(null, changes))
            .catch((err) => {
              console.log('Error updating note');
              return callback(err);
            });
        },
      ],
      (error, data) => callback(error, data)
    );
  }

  static delete(id, callback) {
    //doc(database, nombre-de-coleccion, id <id a usar para el nuevo documento>)
    console.log('ID DELETE', id);
    const documentRef = doc(db, collectionName, id);

    //deleteDoc(documento)
    return deleteDoc(documentRef)
      .then(() => callback(null, id))
      .catch((err) => {
        console.log('Error deleting note');
        return callback(err);
      });
  }
}

module.exports = Note;
