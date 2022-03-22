const express = require('express'); 
const joi = require('joi'); //importa joi
const logger = require('./logger.js');
const morgan = require('morgan');
const config = require('config');
const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');


// Middleware
// Middleware: es una funcion que se ejecuta antes de que se ejecute
//  la funcion que se le pasa como parametro
// Es un bloque de codigo que se ejcuta entre las peticiones
// de un usuario(cliente) y el request que llega a el servidor
// antes de que este pueda dar una respuesta al cliente

// Las funciones middleware son funciones que tinenen acceso 
// al objeto de la peticion (req) y al objeto de la respuesta (res)
// y a la siguiente funcion del middleware en el ciclo de peticiones 
// de la aplicacion

// Las funciones middleware hacen las siguientes tareas:
//  -ejecuta cualquier codigo
//  -pueden modificar el objeto de la peticion
//  -pueden modificar el objeto de la respuesta
//  -pueden modificar la siguiente funcion del middleware

const app = express(); // create an instance of express

// Se le dice a express que use este middleware
app.use(express.json()); // use express.json() to parse json

// Funcion middleware
// app.use(logger); // Loger ya hace referencia a la funcion log(exports)

// app.use(function(req, res, next){
//     console.log('Autenticando...');
//     next();
// });

app.use(express.urlencoded({extended: true}));

// public es el nombre de la carpeta que tendra los recursos estaticos
app.use(express.static('public'));

// Uso de middleware morgan
if(app.get('env') == 'development'){
    app.use(morgan('tiny'));
    inicioDebug('morgan esta aqui');
}

console.log(`Aplicacion: ${config.get('nombre')}`);
console.log(`DB server: ${config.get('configDB.host')}`);

// Operaciones con la base de datos
dbDebug('Conectando a la base de datos...');

// Query string
// Query string: es una cadena de texto que se encuentra despues de una diagonal
// en la url de la peticion
// Ejemplo: http://localhost:3000/usuarios?nombre=juan

// 

// Hay cuatro métodos principales de express:
// Operaciones basicas CRUD (create, read, update, delete)
// app.get() Consultar datos
// app.post() Enviar datos al servidor 
// app.put()  Actualizar datos
// app.delete()  Eliminar datos


// Consultar la ruta raiz de nuestro servidor
// usando el modulo process
let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const usuarios = [
    {id: 1, nombre: 'Erick'},
    {id: 2, nombre: 'Juan'},
    {id: 3, nombre: 'Pedro'},
    {id: 4, nombre: 'Carlos'},
    {id: 5, nombre: 'Luis'},
];

app.get('/', (req, res) => {
    res.send('Hello World from express');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

// Como pasar parametros a una ruta
// p. ej. solo quiero un usuario especifico en vez de todos
// Con los los : delante del id , Express sabe que es un  parametro a recibir

// GET
app.get('/api/usuarios/:id', (req, res) => {
    let id = Number(req.params.id);
    let usuario = existeUsuario(id);
    if(!usuario){
        // devuelve un estado http 404 error
        res.status(404).send('Usuario no encontrado');
    } 
    res.send(`Usuario encontrado: ${usuario.nombre}`);
    
});

// POST
app.post('/api/usuarios', (req, res) => {

    // let body = req.body;
    // console.log(body.nombre);
    // res.json({
    //     body
    // })
    const {value, error} = validarUsuario(req.body.nombre);
    if(!error){
    const usuario = {
        id: usuarios.length + 1,
        nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
});

// Metodo para actualizar un usuario

// PUT
app.put('/api/usuarios/:id', (req, res) => { //Recibe un id
    let id = Number(req.params.id);
    let usuario = existeUsuario(id);
    if(!usuario){
        // devuelve un estado http 404 error
        res.status(404).send('Usuario no encontrado');
        return;
    } 
    // En el body del request, se puede pasar un nuevo nombre
    // para actualizar el nombre del usuario

    const {value, error} = validarUsuario(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    // Actualizar el nombre del usuario
    usuario.nombre = value.nombre;
    res.send(usuario);
});

// DELETE 
// Eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
    let id = Number(req.params.id);
    let usuario = existeUsuario(id);
    if(!usuario){
        // devuelve un estado http 404 error
        res.status(404).send('Usuario no encontrado');
        return;
    } 

    // Encontrar el indice del usuario
    const index = usuarios.indexOf(usuario);
    // Eliminar el usuario
    usuarios.splice(index, 1);
    res.send(usuario);
})


function existeUsuario(id){
    return (usuarios.find(usuario => usuario.id == parseInt(id)));
}

function validarUsuario(nom){
    const schema = joi.object({
        nombre: joi.string().min(3).required(),
    });
    return (schema.validate({nombre:nom}));
}