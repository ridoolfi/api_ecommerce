const router = require('express').Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/$2a$12$hE7XbAMLVB0DjO6.5/tKIufmoAyVOG0iT1O2VPT6EJBJDLGdgB98q', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error })};
        const query = `SELECT * FROM usuario;`
        conn.query(query,
            (error, results, fields) => {
                conn.release()
                if(error){return res.status(500).send({ error: error })};
                const response = {  // Envia todos os usuários
                    mensagem: "Retorna todos os usuários",
                    quantidade: results.length,
                    usuarios: results.map(user => ({
                        id_usuario: user.id_usuario,
                        usuario: user.usuario
                    })),
                    request: {
                        tipo: "POST",
                        descricao: "Cria um novo usuario",
                        url: "http://localhost:3003/usuario/",
                        body: {
                            usuario: "String",
                            nome: "String",
                            sobrenome: "String",
                            cpf: "String",
                            email: "String",
                            rua: "String",
                            numero: "Number",
                            bairro: "String",
                            senha: "String"
                        }
                    }
                };
                res.status(200).send(response);
            })

    });

});

router.post('/cadastro', (req, res, next) => {  // Cria novo usuário
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error })};
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
            if(errBcrypt){return res.status(500).send({ error: errBcrypt })}
            const query = `INSERT INTO usuario(usuario, nome, sobrenome, cpf, email, rua, numero, bairro, senha) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            conn.query(query, [req.body.usuario, req.body.nome, req.body.sobrenome, req.body.cpf, req.body.email, req.body.rua, req.body.numero, req.body.bairro ,hash],
                                (error, result, fields) => {
                                    if(error){ return res.status(500).send({ error: error })};
                                    conn.release();
                                    const response = {
                                        mensagem: "Usuario criado com sucesso",
                                        quantidade: result.length,
                                        usuario: {
                                            id_usuario: result.insertId,
                                            nome: req.body.nome + ' ' + req.body.sobrenome,
                                            email: req.body.email,
                                            request: {
                                                tipo: 'GET',
                                                descricao: 'Faz o login do usuario',
                                                url: "httt://localhost:3003/login",
                                                body: {
                                                    usuario: "String",
                                                    senha: "String"
                                                }
                                            }
                                        }
                                    };

                                    res.status(201).send(response);
                                });
        })
        
        
    });
});

router.post('/login', (req, res, next) => {    // Login do Usuário
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error})};
        const query = 'SELECT * FROM usuario WHERE email = ?'
        conn.query(query, [req.body.email],
            (error, results, fields) => {
                if(error) { return res.status(500).send({ error: error })}
                conn.release()
                if(results.length < 1) {
                    return res.status(401).send({ mensagem: "Não autorizado!"});
                }else {
                    bcrypt.compare(req.body.senha, results[0].senha, (errCrypt, result) => {
                        if(errCrypt){return res.status(500).send({ error: errCrypt})}

                        if(result) {
                            const token = jwt.sign({
                                id_usuario: results[0].id_usuario,
                                email: results[0].email
                            }, process.env.JWT_PASS,
                            {
                                expiresIn: "1h"
                            }
                            );
                            return res.status(200).send({ mensagem: "autenticado com sucesso.",
                            token: token
                        });
                        }

                        return res.status(401).send({ mensagem: "não autorizado "});
                    });
                }
            });
    })
});

router.delete("/delete", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error){ return res.status(500).send({ error: "não encontrado " + error})};
        if(req.body.usuario && req.body.senha) {
            const queryGetUser = "SELECT * FROM usuario WHERE usuario = ?";
            conn.query(queryGetUser, [req.body.usuario],
            (error, results, fieds) => {
                if(error){ return res.status(401).send({error:error})};
                if(results.length < 1){return res.status(401).send({error: "não autorizado"})}
                else{
                    bcrypt.compare(req.body.senha, results[0].senha, (errorBcrypt, resultBCrypt) => {
                    if(errorBcrypt){return res.status(401).send({ error: "não autorizado"})};
                    if(resultBCrypt){
                        const deleteUser= "DELETE FROM usuario WHERE usuario = ? AND senha = ?"
                        const values = [req.body.usuario, results[0].senha]
                        conn.query(deleteUser, values, (error, result, fields) => {
                            conn.release();
                            if(error) {return res.status(401).send({error: error})};
                            const response = {
                                mensagem: "Usuario deletado com sucesso",
                                quantidade: result.length,
                                response: {
                                    usuario_deletado: req.body.usuario,
                                    request: {
                                        metodo: "POST",
                                        descricao: "Cria um novo usuario",
                                        url: "http://localhost:3003/usuario/cadastro",
                                        body: {
                                            usuario: "String",
                                            nome: "String",
                                            sobrenome: "String",
                                            cpf: "String",
                                            email: "String",
                                            rua: "String",
                                            numero: "Number",
                                            bairro: "String",
                                            senha: "String"
                                        }
                                    }
                                }
                            };
                            return res.status(202).send(response);
                    });
                    };
                });
               }; 
            });
        };
    });
});


module.exports = router;