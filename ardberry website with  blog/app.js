const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const detailed_news = require("./array")
const delay = require('delay');
const app = express();
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const creds = require('./client_secret.json');
app.set('view engine', 'ejs');
var contact = [];
var usernameAuthenticated = "";
var project = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogArdberryDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
});

const postSchema = new mongoose.Schema({
  author: String,
  title: String,
  subTitle: String,
  time: String,
  content: String,
  image: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Post = new mongoose.model("Post", postSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



async function acessSpreadSheetContact() {
  const doc = new GoogleSpreadsheet('1S78KFcKw9zvD3sHSC61eQcCzL85DngdKGPYfbopnRIE');
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet1 = info.worksheets[0];
  const rows1 = await promisify(sheet1.getRows)({
    offset: 1
  })
  const contactdetails = {
    name: contact[0].name,
    email: contact[0].email
  }
  await promisify(sheet1.addRow)(contactdetails);
  contact.length = 0;
}
async function acessProjectSheet() {
  const doc = new GoogleSpreadsheet('1YRPlzbC4NWTNqgdzRzlSHOCByp0DcdTjrmKGRHoLDWA');
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet1 = info.worksheets[0];
  const rows1 = await promisify(sheet1.getRows)({
    offset: 1
  })
  const projectDetails1 = {
    name: project[0].name,
    email: project[0].email,
    contact: project[0].contact,
    project_name: project[0].project_name,
    project_description: project[0].project_details,
    service_required: project[0].service_name,
    drive_link: project[0].drive_link
  }
  await promisify(sheet1.addRow)(projectDetails1);
  project.length = 0;
}

app.get("/", function (req, res) {
  res.render("main")
})
app.get("/home", function (req, res) {
  res.render("home")

})
app.get("/sucess", function (req, res) {
  res.render("sucess")
})
app.post("/sucess", function (req, res) {
  name = req.body.Name;
  email = req.body.Email;
  const details1 = {
    name: name,
    email: email
  }
  res.render("sucess")

  contact.push(details1);

  acessSpreadSheetContact();
})

app.get("/news", function (req, res) {
  // acessSpreadSheet();
  (async () => {

    await delay(1000);
    res.render("news", {
      news: detailed_news.news
    })
  })();

})
app.post("/news", function (req, res) {
  res.redirect("/news");
})
app.get("/gallery", function (req, res) {
  res.render("gallery")
})
app.post("/gallery", function (req, res) {
  res.redirect("/gallery");
})
app.get("/catalog", function (req, res) {
  res.render("catalog")
})
app.post("/catalog", function (req, res) {
  res.redirect("/catalog");
})
app.get("/portfolio", function (req, res) {
  res.render("portfolio")
})
app.get("/team", function (req, res) {
  res.render("team")
})

app.get("/formQuotation", function (req, res) {
  res.render("quotation")
})

app.post("/formQuotation", function (req, res) {
  clientName = req.body.q1;
  clientEmail = req.body.q2;
  clientContact = req.body.q3;
  projectName = req.body.q4;
  projectDetails = req.body.q5;
  serviceName = req.body.q6;
  projectLink = req.body.q7;
  const clientProject = {
    name: clientName,
    email: clientEmail,
    contact: clientContact,
    project_name: projectName,
    project_details: projectDetails,
    service_name: serviceName,
    drive_link: projectLink
  }
  project.push(clientProject);

  res.render("sucess")
  acessProjectSheet();
})


app.get("/blog", function (req, res) {
  res.render("blog");
})


app.get("/blog/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect(`/blog/${usernameAuthenticated}/blogMain`);
  } else {
    res.render("login");
  }
})
app.get("/blog/signup", function (req, res) {
  res.render("signup")
})

app.post("/blog/signup", function (req, res) {

  User.register({ email: req.body.email, username: req.body.username, name: req.body.name }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/blog/signup");
    } else {
      res.send("Username or Email exists please choose a diffrent one");
    }
  });

});
app.post("/blog/login", function (req, res) {
  let username = req.body.username;
  const user = new User({
    username: username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        usernameAuthenticated = username;
        res.redirect(`/blog/${username}/blogMain`);
      });
    }
  });

});

app.get("/blog/:username/blogMain", function (req, res) {
  var name = '';
  if (req.isAuthenticated && usernameAuthenticated == req.params.username) {
    User.findOne({ username: usernameAuthenticated }, function (err, person) {
      if (err) {
        console.log(err);
      } else {
        name = person.name;
        console.log(name);
      }
    })
    Post.find({}, function (err, users) {
      res.render("blogHomePage", {
        username: req.params.username,
        users: users,
        name: name
      })
    })

  } else {
    res.redirect("/blog")
  }
})

app.get("/blog/:username/blogMain/:blogNumber", function (req, res) {
  if (usernameAuthenticated == req.params.username && req.isAuthenticated()) {
    Post.findOne({ _id: req.params.blogNumber }, function (err, post) {
      res.render("singlePageBlog", {
        post: post
      })
    })

  } else {
    res.redirect("/blog")
  }
})

app.get("/blog/:username/create", function (req, res) {
  if (req.isAuthenticated() && usernameAuthenticated == req.params.username) {
    res.render("create", {
      username: req.params.username
    })
  } else {
    res.redirect("/blog")
  }
})

app.post("/blog/:username/create", function (req, res) {
  if (req.isAuthenticated() && usernameAuthenticated == req.params.username) {
    let author = req.params.username;
    let title = req.body.title;
    let content = req.body.content;
    let subTitle = req.body.subTitle;
    let image = req.body.image;
    let time = Date(Date.now());

    const newPost = new Post({
      author: author,
      title: title,
      subTitle: subTitle,
      content: content,
      time: time,
      image: image
    })
    newPost.save(function (err, post) {
      if (err) {
        console.log(err)
        res.render("404")
      } else {
        res.redirect("/blog/" + usernameAuthenticated + "/blogMain")
      }
    })
  } else {
    res.redirect("/blog")
  }
})
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/blog");
});

app.get('*', function (req, res) {
  res.render("404");
});
port = process.env.PORT || 880 || 443;
app.listen(port, function () {
  console.log(`${port}`)
});
