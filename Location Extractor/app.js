const express = require("express")
const bodyParser = require("body-parser")
const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const options = {
  polling: true
};
const bot = new TelegramBot("1105893252:AAEF7oJLbZ_VjXLrl99FElPIKYqYmXEMZ-Q", options);
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html")
})
let distance = "Disatnce Not Read Yet";
app.post("/response",function(req,res){
   distance = req.body.distance;
  if(distance*1.6>=10){
    distance = "Distance More then wanted\nActual Distance is :"+distance*1.6+" km"
    console.log(distance);
  } else {
    distance = "Distance not exceeded"
  }

})

bot.onText(/\/echo/, function onEchoText(msg) {
  bot.sendMessage(msg.chat.id, distance);
})

port = process.env.PORT||8000||443;
app.listen(port, function() {
  console.log(`${port}`)
});
