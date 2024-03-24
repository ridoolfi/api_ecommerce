const router = require('express').Router();
const mysql = require('../mysql').pool


router.get('/', (req, res, next) =>{ // Lista todos os produtos
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error })};
        const query = "SELECT * FROM produto";
        conn.query(query,
            (error, results, fields) => {
                conn.release();
                if(error){return res.status(500).send({error: error})};
                
                const response = {
                    mensagem: "Todos os produtos cadastrados",
                    quantidade: results.length,
                    produtos: results.map(produto => ({
                        produtoID: produto.id_produto,
                        nome: produto.nome,
                        descricao: produto.descricao,
                        valor: produto.valor
                    })),
                    request: {
                        tipo: "POST",
                        descricao: "Insere um novo produto",
                        url: "http://localhost:3003/produto/novo",
                        body: {
                            nome: "String",
                            descricao: "String",
                            valor: "float"
                        }
                    }
                };
                return res.status(200).send(response);
            });
    });
});


router.get('/:id_produto', (req, res, next) => {

    mysql.getConnection((error, conn) => {
    if(error){return res.status(500).send({error:error})};
    const query = "SELECT * FROM produto WHERE id_produto = ?"
    conn.query(query, req.params.id_produto,
        (error, results, fields) => {
            conn.release();
            if(error){res.status(401).send({error: error})};
            const response = {
                mensagem: "Produto encontrado com sucesso",
                quantidade: results.length,
                produto: results.map(produto => ({
                    id_produto: req.params.id_produto,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    valor: produto.valor
                })),
                request: {
                    tipo: "POST",
                    descricao: "Insere um novo produto",
                    url: "http://localhost:3003/produto/novo",
                    body: {
                        nome: "String",
                        descricao: "String",
                        preco: "Float"
                    }
                }
            };
            return res.status(200).send(response);
        })
    })
});


router.post('/novo', (req, res, next) => { // Cria Produtos
    mysql.getConnection((error, conn) => {
        if(error) {res.status(401).send({error: error})}
        const query = "INSERT INTO produto(nome, descricao, valor) VALUES(?, ?, ?)"
        const values = [req.body.nome, req.body.descricao, req.body.valor]
        conn.query(query, values,
            (error, results, fields) => {
                conn.release();
                if(error){return res.status(401).send({error:error})};
                const response = {
                    mensagem: "Produto inserido com sucesso",
                    quantidade: res.length,
                    produto_inserido: {
                        id_produto: results.insertId,
                        nome: req.body.nome,
                        descricao: req.body.descricao,
                        preco: req.body.preco,
                        request: {
                            tipo: "GET",
                            descricao: "Retorna o pedido inserido",
                            url: "http://localhost:3003/pedido/" + req.body.id_produto
                        }
                    }
                };
                return res.status(200).send(response);
            })
    });
});

router.patch('/', (req, res, next) => { // Atualiza o produto
    mysql.getConnection((error, conn) => {
        if(error){res.status(401).send({error: error})};
        const query = `UPDATE produto SET ${req.body.coluna} = ${req.body.new} where id_produto = ${req.body.id_produto}`
        conn.query(query,
            (error, results, fields) => {
                conn.release();
                if(error){res.status(401).send({error: error})}
                const response = {

                    mensagem: "Produto atualizado com sucesso",
                    quantidade: results.length,
                    produto_atualizado: {
                        id_produto: req.body.id_produto,
                        coluna: req.body.coluna,
                        novo_valor: req.body.new,
                        request: {
                            tipo: "GET",
                            descricao: "Retorna o produto atualizado",
                            url: "http://localhost:3003/produto/" + req.body.id_produto
                        }
                    }
                };
                return res.status(401).send(response);
            })
    });
});


router.delete('/', (req, res, next) => {
    
    mysql.getConnection((error, conn) => {
        if(error){res.status(401).send({error: error})};
        const query = "DELETE FROM produto WHERE id_produto = ?"
        conn.query(query, [req.body.id_produto],
            (error, results, fields) => {
                conn.release();
                if(error){res.status(401).send({error:error})};
                const response = {
        
                    mensagem: "Produto deletado com sucesso",
                    quantidade: results.length,
                    produto_deletado: {
                        id_produto: req.body.id_produto,
                        request: {
                            tipo: "POST",
                            descricao: "Insere um produto",
                            url: "http://localhost:3003/produto/novo",
                            body: {
                                nome: "String",
                                descricao: "String",
                                preco: "Float"
                            }
                        }
                    }
                };
                res.status(202).send(response);
            })
    });
});


module.exports = router;
