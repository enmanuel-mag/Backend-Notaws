const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: '../uploads' });

const Note = require('../models/note');
const inspector = require('schema-inspector');
const NoteSchema = require('../schemas/note');

//Get all notes
router.get('/', (req, res) => {
  //limpiar y aplicar transformacion a los datos
  const payload = inspector.sanitize(
    NoteSchema.getSanitation(),
    req.query
  );
  //validar los datos
  return inspector.validate(
    NoteSchema.getValidation(),
    payload.data,
    (err, result) => {
      if (!result.valid) {
        return res.status(400).json({
          code: 'BR',
          message: 'Bad Request: ' + result.format()
        });
      }
      return Note.getAll(req.query, (err, notes) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }
        return res.status(200).json({ notes});
      });
    }
  );
});

//Create a note
router.post('/', upload.single('file'), (req, res) => {
  const file = req.file;
  console.log('File from user', !!file);
  const payload = inspector.sanitize(
    NoteSchema.createSanitation(),
    req.body
  );
  //validar los datos
  return inspector.validate(
    NoteSchema.createValidation(),
    payload.data,
    (err, result) => {
      if (!result.valid) {
        return res.status(400).json({
          code: 'BR',
          message: 'Bad Request: ' + result.format()
        });
      }
      return Note.create({ data: payload.data, file }, (err, note) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }
        return res.status(201).json({ note });
      });
    }
  );
});

//Update a note
router.patch('/:id', upload.single('file'), (req, res) => {
  const file = req.file;
  console.log('File form user', !!file);
  const payload = inspector.sanitize(
    NoteSchema.updateSanitation(),
    req.body
  );
  //validar los datos
  return inspector.validate(
    NoteSchema.updateValidation(),
    payload.data,
    (err, result) => {
      if (!result.valid) {
        return res.status(400).json({
          code: 'BR',
          message: 'Bad Request: ' + result.format()
        });
      }
      const id = req.params.id;
      return Note.update({ id, changes: payload.data, file }, (err, note) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }
        return res.status(200).json({ note });
      });
    }
  );
});

//Delete a note
router.delete('/:id', (req, res) => {
  const payload = inspector.sanitize(
    NoteSchema.deleteSanitation(),
    req.params
  );
  //validar los datos
  return inspector.validate(
    NoteSchema.deleteValidation(),
    payload.data,
    (err, result) => {
      if (!result.valid) {
        return res.status(400).json({
          code: 'BR',
          message: 'Bad Request: ' + result.format()
        });
      }
      return Note.delete(payload.data.id, (err, id) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }
        return res.status(200).json({ id });
      });
    }
  );
});

module.exports = router;
