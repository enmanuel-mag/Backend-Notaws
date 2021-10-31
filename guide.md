## Pasos

1. Inicializar un proyecto de npm con:
```sh
npm init
```
2. Instalar los paquetes necesarios:
```sh
npm i express firebase schema-inspector cors dotenv uuid multer morgan async
```
3. Crear proyecto en firebase desde cero pero usar el anterior.
  - En la pagina principal, dar clic en web (`</>`).
  - Dar nombre a la web.
  - Clic en registrar app.
  - Tomar el codigo que nos da firebase para inicializar la app.
  - Clic en firestore.
  - Crear base de datos.
  - Cambiar las reglas en firestore para permitir acceso.
4. Crear la siguiente estructura de carpectas:
```
├── controllers
├── db
├── .env
├── index.js
├── models
└── schemas
```
5. Crear el server en el `index.js`
6. Inicialiar controladores y crear los repectivos esquemas validadores y modelos que atiendan las peticiones