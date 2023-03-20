const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')

// mongodb+srv://minacorrado:SW14D3KwA2WilPUH@cluster0.oopravd.mongodb.net/test
const app = express();
app.use(express.json());

app.use(cors());

const logger = (req, res, next) => {
    console.log("Request at ", req.url);
    next();
}
app.use(logger);

const errorHandler = (error, request, response, next) => {
    console.log( `error ${error.message}`) // log the error
    const status = error.status || 400
    // send back
    response.status(status).send(error.message)
}
app.use(errorHandler);

const blogpostSchema = new mongoose.Schema({
    category: String,
    title: {type: String, required: true},
    cover: String,
    readTime: {
        value: Number,
        unit: String
    },
    author: {
        name: String,
        avatar: String,
    },
    content: {type: String, required: true},
});
const blogpostModel = mongoose.model('Blogpost', blogpostSchema);


app.get('/blogPosts', async (req, res, next) => {
    const {page = '1', size = '4'} = req.query;
    const result = await blogpostModel.find()
            .skip((Number(page)-1) * Number(size))
            .limit(Number(size));
    const count = await blogpostModel.count();
    return res.json({count, results: result});
});

app.get('/blogPosts/:id', async (req, res, next) => {
    const {id} = req.params;
    try {
        const result = await blogpostModel.findById(id);
        return res.json(result);
    } catch (error) {
        next(error)
    }
});

app.post('/blogPosts', async (req, res, next) => {
    const body = req.body;
    console.log(`body is `, body)
    try {
        const post = new blogpostModel({
            category: body.category,
            title: body.title,
            cover: body.cover || 'https://placekitten.com/640/360',
            readTime: {
                value: body.readTime && body.readTime.value || 1,
                unit: "minuti"
            },
            author: {
                name: body.author && body.author.name || 'Mina Corrado',
                avatar: body.author && body.author.avatar || 'https://ui-avatars.com/api/?name=Mina+Corrado',
            },
            content: body.content,
        });
        await post.save();
        // console.log('post ',post);
        return res.status(201).json(post);
    } catch (error) {
        next(error)
    }
});

app.put('/blogPosts/:id', async (req, res, next) => {
    const {id} = req.params;
    try {
        const body = req.body;
        const post = await blogpostModel.findById(id);
        const result = await blogpostModel.updateOne({_id: post._id}, {...body});

        return res.json(result)
    } catch (error) {
        next(error)
    }
});

app.delete('/blogPosts/:id', async (req, res, next) => {
    const {id} = req.params;
    try {
        const post = await blogpostModel.findByIdAndDelete(id)
        return res.json(post);
    } catch (error) {
        next(error)
    }
});



const autoreSchema = new mongoose.Schema({
    // _id: {type: String, required: true},
    nome: {type: String, required: true},
    cognome: {type: String, required: true},
    email: {type: String, required: true},
    data_di_nascita: {type: String, required: true},
    avatar: {type: String, required: false}
});
const autoreModel = mongoose.model('Autore', autoreSchema);

app.get('/authors', async (req, res, next) => {
    const {page = '1', size = '4'} = req.query;
    const result = await autoreModel.find()
                    .skip((Number(page)-1) * Number(size))
                    .limit(Number(size));
    const count = await autoreModel.count();
    return res.json({count, results: result});
});
app.get('/authors/:id', async (req, res) => {
    const {id} = req.params;
    let result;
    try {
        result = await autoreModel.findById(id);
        return res.json(result);
    } catch (err) {
        next(err)
    }
});
app.post('/authors', async (req, res, next) => {
    const body = req.body;
    const newAuthor = new autoreModel({...body});
    try {
        const result = newAuthor.save();
        return res.status(201).json({result});            
    } catch (err) {
        next(err);
    }
});
app.put('/authors/:id', async (req, res, next) => {
    const {id} = req.params;
    const body = req.body;
    try {
        const author = await autoreModel.findById(id);
        console.log("author=> ",author);
        const result = await autoreModel.updateOne({_id: author._id},{...body});
        console.log('modified ', result.modifiedCount)
        return res.json(result);
    } catch (err) {
        next(err)
    }
});
app.delete('/authors/:id', async (req, res, next) => {
    const {id} = req.params;
    try {
        const author = await autoreModel.findByIdAndDelete(id);
        return res.json(author);
    } catch (err) {
        next(err)
    }
});

const start = async() => {
    try {
        await mongoose.connect('mongodb+srv://minacorrado:SW14D3KwA2WilPUH@cluster0.oopravd.mongodb.net/Epicode')
        app.listen(3000, ()=>{
            console.log("listening on port 3000")
        });    
    } catch (error) {
        console.log("error: ", error);    
    }
}

//avvio
start();