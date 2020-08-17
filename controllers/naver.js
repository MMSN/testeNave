//const { validationResult } = require('express-validator/check');

const Naver = require('../models/naver');
const User = require('../models/user');
const Projeto = require('../models/projeto');


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.getNaversFilter = (req, res, next) => {
    const creator = req.userId;
    const filter = req.params.filter;
    //console.log(filter);
    //console.log(req.query);
    //console.log(req.query.size);
    let query = req.query;
    //console.log(query);
    var obj = query;
    obj['creator'] = creator;
    //console.log(obj);
    //jsonStr = JSON.stringify(obj);
    //console.log(jsonStr);
    
    //let query = req.query;
    //console.log(query);
    //query.put('creator', creator);
    //console.log(query);

    if ((filter == 'name') || (filter == 'jobrole') || (filter == 'admissiondate')) {
        Naver.find(obj, '-projetos -creator')
          .then(naver => {
              res
                .status(200)
                .json({message: 'Navers encontrados com sucesso', navers: naver});
          })
          .catch(err => {
              if (!err.statusCode) {
                  err.statusCode = 500;
              }
              next(err);
          });
    } else {
        res.status(500).json({
            message: "Nao foi possivel realizar a pesquisa: filtro inexistente."
        });
    }
}

exports.getNavers = (req, res, next) => {
    //id do criador
    const creator = req.userId;
    //todos os navers que possuem o criador
    Naver.find({creator: creator}, '-projetos -creator')
      .then(naver => {
          res
            .status(200)
            .json({message: 'Navers encontrados com sucesso', navers: naver});
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
}

exports.getNaver = (req, res, next) => {
    const naverId = req.params.naverId;
    Naver.findById(naverId, '-creator').populate('projetos', '-navers -creator')
      .then(naver => {
          //se o naver existe
          if (!naver) {
              const error = new Error('Naver nao encontrado.');
              error.statusCode = 404;
              throw error;
          }
          res.status(200).json({ message: 'Naver encontrado', naver: naver });
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
}


exports.postNaver = async (req, res, next) => {
    //infos
    const name = req.body.name;
    const birthdate = req.body.birthdate;
    const admissiondate = req.body.admissiondate;
    const jobrole = req.body.jobrole;
    const projetos = req.body.projetos;
    
    let arrayProjetosTratado
    let gate = 0;
    console.log(projetos);
    //if (!isEmpty(projetos)) {
    if (projetos != null) {
        gate = 1;
        let array = projetos.replace('[','');
        array = array.replace(']','');
        array = array.replace(' ','');
        arrayProjetosTratado = array.split(","); 
        for(var i=0; i<arrayProjetosTratado.length;i++) {
            arrayProjetosTratado[i] = mongoose.Types.ObjectId(arrayProjetosTratado[i]);
        }
    }
    else {
        arrayProjetosTratado = [];
    }

    let creator;
    let encontrados;

    if (gate == 1) {
        const eprojetos = await Projeto.find({'_id': { $in: arrayProjetosTratado}}, function(err, found){
            if (arrayProjetosTratado.length == found.length) {
                encontrados = 1;
            }
            else {
                encontrados = 0;
            }
        });
    }

    if (encontrados == 1 || gate == 0) {
        //criar nova entrada
        const naver = new Naver({
            name: name,
            birthdate: birthdate,
            admissiondate: admissiondate,
            jobrole: jobrole,
            projetos: arrayProjetosTratado,
            creator: req.userId
        });
        naver
        .save()
        //encontrar o usuario
        .then(result => {
            return User.findById(req.userId)
        })
        //colocar no vetor de navers
        .then(user => {
            creator = user;
            user.navers.push(naver);
            return user.save();
        })
        .then(result => {
            //console.log("mateus");
            Projeto.find({'_id': { $in: arrayProjetosTratado}}, function(err, found){
                //found.projetos.push(projeto);
                //console.log(found);
                //found.projetos.push(projeto);
                found.forEach(element => {
                    //console.log(element);
                    element.navers.push(naver);
                    return element.save();
                });
            })
        })
        //retorno
        .then(result => {
            res.status(201).json({
                message: 'Naver criado com sucesso.',
                naver: naver
                //creator: { _id: creator._id, email: creator.email}
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    }
    else {
        res.status(500).json({
            message: "Nao foi possivel criar novo naver: projeto invalido na entrada"
        });
    }
}

exports.updateNaver = async (req, res, next) => {
    const naverId = req.params.naverId;
    const name = req.body.name;
    const birthdate = req.body.birthdate;
    const admissiondate = req.body.admissiondate;
    const jobrole = req.body.jobrole;
    const projetos = req.body.projetos;

    let arrayProjetosTratado
    let gate = 0;
    //console.log(projetos);
    //if (!isEmpty(projetos)) {
    if (projetos != null) {
        gate = 1;
        let array = projetos.replace('[','');
        array = array.replace(']','');
        array = array.replace(' ','');
        arrayProjetosTratado = array.split(","); 
        for(var i=0; i<arrayProjetosTratado.length;i++) {
            arrayProjetosTratado[i] = mongoose.Types.ObjectId(arrayProjetosTratado[i]);
        }
    }
    else {
        arrayProjetosTratado = [];
    }

    let creator;
    let encontrados;
    let oldProjetos;

    if (gate == 1) {
        const eprojetos = await Projeto.find({'_id': { $in: arrayProjetosTratado}}, function(err, found){
            if (arrayProjetosTratado.length == found.length) {
                encontrados = 1;
            }
            else {
                encontrados = 0;
            }
        });
    }

    if (encontrados == 1 || gate == 0) {

        Naver.findById(naverId)
        .then(naver => {
            //se o naver existe
            if (!naver) {
                const error = new Error('Naver nao encontrado.');
                error.statusCode = 404;
                throw error;
            }
            //checar se criador eh o usuario fazendo requisicao
            if (naver.creator.toString() !== req.userId) {
                const error = new Error('Nao autorizado.');
                error.statusCode = 403;
                throw error;
            }
            //salvar antigos projetos
            oldProjetos = naver.projetos;
            //diferencas
            let differenceA = arrayProjetosTratado.filter(x => !oldProjetos.includes(x));
            let differenceB = oldProjetos.filter(x => !arrayProjetosTratado.includes(x));
            //atualizar
            naver.name = name;
            naver.birthdate = birthdate;
            naver.admissiondate = admissiondate;
            naver.jobrole = jobrole;
            naver.projetos = arrayProjetosTratado
            return naver.save()
        })
        .then(result => {
            //apagar user de todos os projetos em que estava
            Projeto.find({'_id': { $in: oldProjetos}}, function(err, found){
              //found.projetos.push(projeto);
              //console.log(projetos);
              //console.log(found);
              //found.projetos.push(projeto);
              found.forEach(element => {
                  //console.log(element);
                  element.navers.pull(naverId);
                  return element.save();
              });
            })
        })
        .then(result => {
            //apagar user de todos os projetos em que estava
            Projeto.find({'_id': { $in: arrayProjetosTratado}}, function(err, found){
              //found.projetos.push(projeto);
              //console.log(projetos);
              //console.log(found);
              //found.projetos.push(projeto);
              found.forEach(element => {
                  //console.log(element);
                  element.navers.push(naverId);
                  return element.save();
              });
            })
        })
        .then(result => {
            res.status(200).json({ message: 'Naver atualizado', naver: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    }
    else {
        res.status(500).json({
            message: "Nao foi possivel criar novo naver: projeto invalido na entrada"
        });
    }
}

exports.deleteNaver = (req, res, next) => {
    const naverId = req.params.naverId;
    let projetos;
    Naver.findById(naverId)
      .then(naver => {
          //se o naver existe
          if (!naver) {
            const error = new Error('Naver nao encontrado.');
            error.statusCode = 404;
            throw error;
          }
          //checar se criador eh o usuario fazendo requisicao
          if (naver.creator.toString() !== req.userId) {
            const error = new Error('Nao autorizado.');
            error.statusCode = 403;
            throw error;
          }
          //return Naver.findByIdAndRemove(naverId);
          projetos = naver.projetos;
          for(var i=0; i<projetos.length;i++) {
            projetos[i] = mongoose.Types.ObjectId(projetos[i]);
          }
          //return Naver.findById(naverId);
          return Naver.findByIdAndRemove(naverId);
      })
      .then(result => {
          return User.findById(req.userId);          
      })
      .then(user => {
          user.navers.pull(naverId);
          return user.save();
      })
      .then(result => {
          //apagar user de todos os projetos em que estava
          Projeto.find({'_id': { $in: projetos}}, function(err, found){
            //found.projetos.push(projeto);
            //console.log(projetos);
            //console.log(found);
            //found.projetos.push(projeto);
            found.forEach(element => {
                //console.log(element);
                element.navers.pull(naverId);
                return element.save();
            });
          })
      })
      .then(result => {
          res.status(200).json({ message: 'Naver deletado com sucesso.'});
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}