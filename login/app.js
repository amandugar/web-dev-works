const express = require('express');
const path = require('path');
const pageRouter = require('./routes/pages')
const app = express();

app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.get('/',function(req,res) {
    res.render('index');
})


app.use('/',pageRouter);

app.listen(80,()=> {
    console.log("Server running at port 80")
})

module.exports = app;