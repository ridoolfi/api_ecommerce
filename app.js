const express = require('express');
const app = express();
const bodyParser = require("body-parser")
const morgan = require('morgan')

const rotaProduto = require('./routes/produto');
const rotaUsuario = require('./routes/usuario');
const rotaPedido = require('./routes/pedido')

// Headers e CORS
app.use((req, res, next) => {
    res.header('Access-control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content Type, Accept, Authorization'
    );
    if(req.method === "OPTIONS"){
        res.headersSent('Access-Control-Allow-Methods', 'PUT, POST, DELETE, PATCH, GET')
        return res.status(200).send({});
    };
    next();
});



// Dependencias
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Rotas
app.use('/produto', rotaProduto);
app.use('/usuario', rotaUsuario);
app.use('/pedido', rotaPedido);



module.exports = app