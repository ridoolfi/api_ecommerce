const mysql = require("../mysql").pool;
const router = require('express').Router();

router.get("/", (req,res,next) => { //Retorna todos os pedidos
    mysql.getConnection((error, conn, next) => {
        if(error){return res.status(401).send({ error: error })};
        const query = "SELECT * FROM pedido";
        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error){return res.status(401).send({ error: error })}
            const response = {
                mensagem: "Pedidos encontrados com sucesso",
                quantidade: results.length,
                pedidos: results.map(pedido => ({
                    id_pedido: pedido.id_pedido,
                    usuario: pedido.id_usuario,
                    produtos: pedido.produtos,
                    request:{
                        metodo: "GET",
                        descricao: "Retorna os pedidos criados",
                        url: "http://localhost:3003/pedido/novo"
                    } 
                })
                )
            };
            return res.status(200).send(response);
        });
    });
});

router.post("/novo", (req,res,next) => { // Cria um novo pedido
    mysql.getConnection((error, conn, next) => {
        if(error){ return res.status(401).send({ error: error})};
        const query = "INSERT INTO pedido(id_usuario, produtos) ";
        const values = `VALUES(${req.body.id_usuario}, '${req.body.produtos}');`
        console.log(query + values);
        conn.query(query + values, (error, results, fields) => {
            conn.release();
            if(error){ return res.status(401).send({ error: error})};
            const response = {
                mensagem: "Pedido criado com sucesso",
                quantidade: results.length,
                pedido: {
                    id_pedido: results.id_pedido,
                    id_usuario: req.body.id_usuario,
                    produtos: req.body.produtos,
                    request: {
                        tipo: "GET",
                        descricao: "Retorna o pedido criado",
                        url: "http://localhost:3003/pedido/" + results.id_pedido
                    }
                }
            };
            return res.status(200).send(response);
        })
    })
})

router.get("/:id_pedido", (req, res, next) => {
    return res.status(200).send({message: "Return pedido by id" + " " + req.params.id_pedido});
});

router.patch("/", (req, res, next) => { // Atualiza o pedido
    return res.status(202).send({ message: "Patch Route is working"})
});

router.delete("/del", (req, res, next) => {
    return res.status(200).send({ message: "Delete is working"})
})


module.exports = router;""
