const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const naverRoutes = require('./routes/naver');
const projetoRoutes = require('./routes/projeto');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use('/navers', naverRoutes);
app.use('/projetos', projetoRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data});

});

mongoose
    .connect(
        'mongodb+srv://testeNave:pelotas@cluster0-kvr5h.mongodb.net/testenave?retryWrites=true&w=majority'
        )
        .then(result => {
            console.log("Conectado com o banco de dados com sucesso!");
            app.listen(8080);
        })
        .catch(err => console.log(err)
    );



//mongodb+srv://<username>:<password>@cluster0-kvr5h.mongodb.net/<dbname>?retryWrites=true&w=majority