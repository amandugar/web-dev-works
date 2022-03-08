const express = require("express");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const e = require("express");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogTestDB", {useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
    email: String,
    username: String,
    password: String,
});

const postSchema = new mongoose.Schema({
    author: String,
    title: String,
    subTitle: String,
    time : String,
    content: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Post = new mongoose.model("Post",postSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
  });
  
  app.get("/login", function(req, res){
    if (req.isAuthenticated()){
      res.redirect(`/${usernameAuthenticated}/blog`);
    } else {
      res.render("login");
    }
  });
  
  app.get("/register", function(req, res){
    res.render("register");
  });
  
  app.get("/:username/blog", function(req, res){
    const username = req.params.username;
    if (req.isAuthenticated()&&req.params.username === usernameAuthenticated){
      User.findOne({username:username},function(err,user){
        if(err){
          console.log(err);
        } else{
          console.log(user);
        }
      })
      Post.find({},function(err,post){
          if(err){
              console.log(err)
          } else {
              console.log(post);
              res.render("blogs",{
                username:username,
                posts:post
            });
          }
      })
  

    } else {
      res.redirect("/login");
    }
  });
  
  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });
  
  app.post("/register", function(req, res){
  
    User.register({email:req.body.email,username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
          res.redirect("/login");
      }
    });
  
  });
  
  app.post("/login", function(req, res){
    let username = req.body.username;
    const user = new User({
      username: username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          usernameAuthenticated = username;
          res.redirect(`/${username}/blog`);
        });
      }
    });
  
  });


app.get("/:username/create",function(req,res){
    if(req.isAuthenticated()&&usernameAuthenticated === req.params.username){
    res.render("createBlog",{
        username: req.params.username
    })
    } else{
        res.redirect("/")
    }
})

app.post("/:username/create",function(req,res){
    if(req.isAuthenticated()&&req.params.username === usernameAuthenticated){
    let author = req.params.username;
    let title = req.body.title;
    let content = req.body.content;
    let subTitle = req.body.subTitle;
    let time = Date(Date.now());

    const newPost = new Post({
        author: author,
        title: title,
        subTitle: subTitle,
        content: content,
        time: time
    })
    newPost.save(function(err,post){
        if(err){
            console.log(err)
        } else{
            res.redirect("/sucess")
        }
    })
} else {
    res.redirect("/")
}
})

app.get("/:username/blog/:id",function(req,res){
    if(req.params.username === usernameAuthenticated&&req.isAuthenticated()){
    Post.findOne({_id:req.params.id},function(err,found){
        if(err){
            console.log(err)
        } else {
            console.log(found)
            res.render("singleBlog",{
                blog: found,   
            })
        }
    })
}else{
    res.redirect("/")
}
})

app.get("/sucess",function(req,res){
    res.render("sucess",{
        username:usernameAuthenticated
    })
})

app.listen(3000,function(){
    console.log("Server Started at port 3000")
})