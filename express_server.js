function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

// app.use(cookieParser());
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "pogChamp"]
  // Cookie Options
//   maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }));
// app.use(bodyParser.urlencoded({
//   extended: true
}));

var urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com" ,
    userID: "user2RandomID"
  }
};

var users = {
  "userRandomID": {
    'id': "userRandomID",
    'email': "user@example.com",
    'password': bcrypt.hashSync('1', 10)
  },
  "user2RandomID": {
    'id': "user2RandomID",
    'email': "user2@example.com",
    'password': "1"
  }
};

//Custom Middleware

  /////////////allows us to acces POST request parameters stored to the urlDatabase variable.///////////
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({extended: true}));

//MIDDLEWARE

  /////////////displays hello world message on acces to localhost:8080/urls///////////
  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

  /////////////pushes the urlDatabase into json file and text///////////
  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  /////////////redirects to urls_index to show url name and shortenedname///////////
  app.get("/urls", (req, res) => {
    id = req.session.user_id;
  // console.log("loading urls, currnt user email is: ", user_email_goes_here);  // TODO: this should be possible
  let templateVars = { urls: urlsForUser(id),
    users: req.session.user_id
  };
  res.render("urls_index", templateVars);
});

  ///////////redirects to urls_new///////////
  app.get("/urls/new", (req, res) => {
    let templateVars = {users: req.session.user_id};
    if (req.session.user_id){
      res.render("urls_new", templateVars);
    } else {
      res.redirect('/login');
    }
  });





  /////////////redirects to urls_show to display full url and name///////////////

  app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id,
      redirectURL: urlDatabase[req.params.id].longUrl,
      users: req.session.user_id
    };
    res.render("urls_show", templateVars);
  });


  app.post('/urls/:id', (req, res) => {
    let templateVars = { shortURL: req.params.id,
      redirectURL: urlDatabase[req.params.id],
      users: req.session.user_id
    };
    urlDatabase[req.params.id] = req.body.updateURL;
    res.redirect('/urls');
  });






///////////URL PAGE SECTION /////////////
/////////////////////////////////////////
app.post("/urls", (req, res) => {
  console.log(req.session.user_id);  // debug statement to see POST parameters
  // res.send("Ok");
  let generateUrl = generateRandomString()   ;    // Respond with 'Ok' (we will replace this)
  let longurl = req.body.longURL;
  let cookieId = req.session.user_id;
  // urlDatabase[generateUrl] = {};

  urlDatabase[generateUrl] = {
    longUrl: longurl,
    UserId: cookieId
  };
  // urlDatabase[generateUrl][userID] = req.cookies['user_id'];
  // urlDatabase[generateUrl][longUrl] = longurl;

  //test code to generate short url and push long url into urlDatabase
  // res.redirect("/urls/" + generateUrl)
  res.redirect(longurl);
});

    ////////// Delete Button and Update ////////////////

    app.post('/urls/:id/delete', (req, res) => {
      if (req.session.user_id === urlDatabase[req.params.id].userID) {
        delete urlDatabase[req.params.id];
        res.redirect('/urls');
      }
    });

    app.post('/urls/:id/update', (req, res) => {
      if (req.session.user_id === urlDatabase[req.params.id].userID){
        let shortkey = urlDatabase[req.params.id]
        res.redirect('/urls/' + shortkey);
      }

    });



/////////////COOKIE SETUP/////////////////

// app.post('/login', (req, res) => {
//   let username = req.body.username
//   res.cookie('username', username);
//   res.redirect('/urls');
// });

app.post('/logout', (req, res) => {
  delete req.session.user_id;
  // delete urlDatabase[req.body.username]
  res.redirect('/urls');
});


////////REGISTRATION PAGE/////////////////
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase,
    users: req.session.user_id
  };
  res.render('urls_register', templateVars);
});

// app.post('/register', (req, res) => {
//   res.redirect('/register');
// });

app.post('/register', (req, res) => {
  console.log(users);
  let email = req.body.email;
  let password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  let RandomID = generateRandomString();
  // newuserRandomID = (email + RandomID);

  if (!password || !email) {           ///fix stuffs
    res.status(400).render('400');
  } else {
    users[RandomID] = {
      id: RandomID,
      email: email,
      password: hashed_password
    };
    // console.log(users);
    // newuserRandomID = (email + RandomID);
    // users[newuserRandomID].id = newuserRandomID;
    // users[newuserRandomID].email = email;
    // users[newuserRandomID].password = password;
    // console.log(RandomID);
    req.session.user_id = RandomID;
    res.redirect('/urls');
  }
  console.log(users);
});


app.get('/login', (req, res) => {
  res.render('login');
});

// app.post('/login', (req, res) => {
//   console.log(users);
//   const email = req.body.email;
//   const password = req.body.password;

//   let success = false
//   let loggedUser;
//   for (user in users) {
//     console.log('email in loop: ' + email )
//     console.log("checking " + users[user].email);
//     if (email === users[user].email) {
//       success = true;
//       console.log('email check success')
//       // if (success) {
//         // bcrypt.compareSync(password, users[user].password, function(err, res) {
//         //   if (res == true) {
//       var passwordMatch = bcrypt.compareSync(password, users[user].password);
//           if (passwordMatch) {
//           console.log('logged in!');
//           // loggedUser = user;
//           res.cookie('user_id', users[user].id);
//           res.redirect('/urls');
//           } else {
//             // res.status(403).send('403 WRONG PASSWORD');
//           }
//         } else {
//           res.status(403).send('403 WRONG EMAIL');
//       }
//     }
// });

app.post('/login', (req, res) => {
  console.log(users);
  const email = req.body.email;
  const password = req.body.password;

  let success = false;
  for (user in users) {
    if (email === users[user].email) {
      var passwordMatch = bcrypt.compareSync(password, users[user].password);
      if (passwordMatch) {
        console.log('logged in!');
        success = true;
      }
    }
  }

  if (success) {
    req.session.user_id = users[user].id;
    res.redirect('/urls');
  } else {
    res.status(403).send('403 WRONG EMAIL AND PASSWORD');
  }
});

  function urlsForUser(id) {
    userDatabase = {}
    for (userUrl in urlDatabase) {
      if (urlDatabase[userUrl].userID === id) {
        userDatabase[userUrl] = urlDatabase[userUrl]
      }
    }
    return userDatabase;
  }

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});