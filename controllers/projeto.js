const Projeto = require('../models/projeto');
const Naver = require('../models/naver');
const User = require('../models/user');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.getProjetosFilter = (req, res, next) => {
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

    if (filter == 'name') {
        Projeto.find(obj, '-navers -creator')
          .then(projeto => {
              res
                .status(200)
                .json({message: 'Projetos encontrados com sucesso', projetos: projeto});
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

exports.getProjetos = (req, res, next) => {
    //id do criador
    const creator = req.userId;
    //todos os navers que possuem o criador
    Projeto.find({creator: creator}, '-navers -creator')
      .then(projeto => {
          res
            .status(200)
            .json({message: 'Projetos encontrados com sucesso', projetos: projeto});
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });    
}

exports.getProjeto = (req, res, next) => {
    const projetoId = req.params.projetoId;
    Projeto.findById(projetoId, '-creator').populate('navers', '-projetos -creator')
      .then(projeto => {
          //se o naver existe
          if (!projeto) {
              const error = new Error('Projeto nao encontrado.');
              error.statusCode = 404;
              throw error;
          }
          res.status(200).json({ message: 'Projeto encontrado', projeto: projeto });
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
}

exports.postProjeto = async (req, res, next) => {
    //infos
    const name = req.body.name;
    const navers = req.body.navers;

    let arrayNaversTratado
    let gate = 0;
    //if (!isEmpty(projetos)) {
    if (navers != null) {
        gate = 1;
        let array = navers.replace('[','');
        array = array.replace(']','');
        array = array.replace(' ','');
        //Array.from(arrayNavers);
        //.split(" ");
        arrayNaversTratado = array.split(","); 
        for(var i=0; i<arrayNaversTratado.length;i++) {
            arrayNaversTratado[i] = mongoose.Types.ObjectId(arrayNaversTratado[i]);
        }
    }
    else {
        arrayNaversTratado = []
    }

    let creator;
    //console.log(arrayNaversTratado);    
    let encontrados;

    if (gate == 1) {
        const enaver = await Naver.find({'_id': { $in: arrayNaversTratado}}, function(err, found){
            /* o !found nao funciona pois find retorna vazio que entao entra sempre
            no else, ainda assim, da para usar o length para ver se batem.
            if (!found) {
                //return next(new Error({error:"Professional nao existente."}));
                console.log('ID do naver nao encontrado');
                //msg = msg + ' ID do profissional nao existente.';
            }
            else {
                console.log('encontrado');
                //retorna todos os founds, entao nao funciona o _id
                encontrados.push(found._id);
                console.log(found);
                //sum = sum + 1;
            }*/

            if (arrayNaversTratado.length == found.length) {
                encontrados = 1;
            }
            else {
                encontrados = 0;
            }
            //console.log(found.length);
        });
    }
    //console.log(enaver);

    //se encontrados for diferente de 1, ha navers incorreto
    if (encontrados == 1 || gate == 0) {
        //criar nova entrada
        const projeto = new Projeto({
            name: name,
            navers: arrayNaversTratado,
            creator: req.userId
        });
        projeto
          .save()
          //encontrar o usuario
          .then(result => {
             return User.findById(req.userId)
          })
          //colocar no vetor de navers
          .then(user => {
              creator = user;
              user.projetos.push(projeto);
              return user.save();
          })
          .then(result => {
            //console.log("mateus");
            Naver.find({'_id': { $in: arrayNaversTratado}}, function(err, found){
                //found.projetos.push(projeto);
                //console.log(found);
                //found.projetos.push(projeto);
                found.forEach(element => {
                    //console.log(element);
                    element.projetos.push(projeto);
                    return element.save();
                });
            })
          })
          //retorno
          .then(result => {
            res.status(201).json({
              message: 'Projeto criado com sucesso.',
              projeto: projeto,
              creator: { _id: creator._id, email: creator.email}
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
            message: "Nao foi possivel criar novo projeto: naver invalido na entrada"
        });
    }
}

exports.updateProjeto = async (req, res, next) => {
    const projetoId = req.params.projetoId;
    const name = req.body.name;
    const navers = req.body.navers;

    let arrayNaversTratado
    let gate = 0;
    //console.log(projetos);
    //if (!isEmpty(projetos)) {
    if (navers != null) {
        gate = 1;
        let array = navers.replace('[','');
        array = array.replace(']','');
        array = array.replace(' ','');
        arrayNaversTratado = array.split(","); 
        for(var i=0; i<arrayNaversTratado.length;i++) {
            arrayNaversTratado[i] = mongoose.Types.ObjectId(arrayNaversTratado[i]);
        }
    }
    else {
        arrayNaversTratado = [];
    }

    let creator;
    let encontrados;
    let oldNavers;

    if (gate == 1) {
        const enavers = await Naver.find({'_id': { $in: arrayNaversTratado}}, function(err, found){
            if (arrayNaversTratado.length == found.length) {
                encontrados = 1;
            }
            else {
                encontrados = 0;
            }
        });
    }

    if (encontrados == 1 || gate == 0) {

        Projeto.findById(projetoId)
        .then(projeto => {
            //se o naver existe
            if (!projeto) {
                const error = new Error('Projeto nao encontrado.');
                error.statusCode = 404;
                throw error;
            }
            //checar se criador eh o usuario fazendo requisicao
            if (projeto.creator.toString() !== req.userId) {
                const error = new Error('Nao autorizado.');
                error.statusCode = 403;
                throw error;
            }
            //salvar antigos projetos
            oldNavers = projeto.navers;
            //diferencas
            let differenceA = arrayNaversTratado.filter(x => !oldNavers.includes(x));
            let differenceB = oldNavers.filter(x => !arrayNaversTratado.includes(x));
            //atualizar
            projeto.name = name;
            projeto.navers = arrayNaversTratado
            return projeto.save()
        })
        .then(result => {
            //apagar user de todos os projetos em que estava
            Naver.find({'_id': { $in: oldNavers}}, function(err, found){
              //found.projetos.push(projeto);
              //console.log(projetos);
              //console.log(found);
              //found.projetos.push(projeto);
              found.forEach(element => {
                  //console.log(element);
                  element.projetos.pull(projetoId);
                  return element.save();
              });
            })
        })
        .then(result => {
            //apagar user de todos os projetos em que estava
            Naver.find({'_id': { $in: arrayNaversTratado}}, function(err, found){
              //found.projetos.push(projeto);
              //console.log(projetos);
              //console.log(found);
              //found.projetos.push(projeto);
              found.forEach(element => {
                  //console.log(element);
                  element.projetos.push(projetoId);
                  return element.save();
              });
            })
        })
        .then(result => {
            res.status(200).json({ message: 'Projeto atualizado', naver: result });
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
            message: "Nao foi possivel criar novo projeto: naver invalido na entrada"
        });
    }
}

exports.deleteProjeto = (req, res, next) => {
    const projetoId = req.params.projetoId;
    let navers;
    Projeto.findById(projetoId)
      .then(projeto => {
          //se o projeto existe
          if (!projeto) {
            const error = new Error('Projeto nao encontrado.');
            error.statusCode = 404;
            throw error;
          }
          //checar se criador eh o usuario fazendo requisicao
          if (projeto.creator.toString() !== req.userId) {
            const error = new Error('Nao autorizado.');
            error.statusCode = 403;
            throw error;
          }
          //return Naver.findByIdAndRemove(naverId);
          navers = projeto.navers;
          for(var i=0; i<navers.length;i++) {
            navers[i] = mongoose.Types.ObjectId(navers[i]);
          }
          //return Naver.findById(naverId);
          return Projeto.findByIdAndRemove(projetoId);
      })
      .then(result => {
          return User.findById(req.userId);          
      })
      .then(user => {
          user.projetos.pull(projetoId);
          return user.save();
      }) //continuar
      .then(result => {
          //apagar user de todos os projetos em que estava
          Naver.find({'_id': { $in: navers}}, function(err, found){
            //found.projetos.push(projeto);
            //console.log(projetos);
            //console.log(found);
            //found.projetos.push(projeto);
            found.forEach(element => {
                //console.log(element);
                element.projetos.pull(projetoId);
                return element.save();
            });
          })
      })
      .then(result => {
          res.status(200).json({ message: 'Projeto deletado com sucesso.'});
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}