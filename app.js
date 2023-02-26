const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = process.env.PORT || 4000
const { MONGO_URI } = require('./config/keys')

//schema
require('./models/user')
require('./models/post')

app.use(express.json())

//router
app.use(require('./routes/auth'))
app.use(require('./routes/post'))

//CONNECTING TO MONGODB
mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI)
mongoose.connection.on('connected', () => {
    console.log('connected to mongoDb');
})
mongoose.connection.on('eroor', (err) => {
    console.log('error connecting ', err);
})

if (process.env.NODE_ENV == 'production') {
    app.use(express.static('frontend/build'))
    const path = require('path')
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(_dirname, 'frontend', 'build', 'index.html'))
    })
}

//listening to SERVER
app.listen(PORT, () => {
    console.log('server is running on', PORT);
})

