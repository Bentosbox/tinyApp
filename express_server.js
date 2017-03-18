
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

//Custom Middleware
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "BentoBox"]
}));


///////////DATABASES/////////////////
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


  /////////////allows us to acces POST request parameters stored to the urlDatabase variable.///////////
  const bodyParser = require("body-parser");
  app.use(bodyParser.urlencoded({extended: true}));


  /////////////pushes the urlDatabase into json file and text///////////
  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  /////////////redirects to urls_index to show url name and shortenedname///////////
  app.get("/urls", (req, res) => {
    id = req.session.user_id;
    console.log("all url for that user is: " + urlsForUser(id));
    console.log(id);
  // console.log("loading urls, currnt user email is: ", user_email_goes_here);  // TODO: this should be possible
    let templateVars = { urls: urlsForUser(id),
      users: req.session.user_id
    };
    res.render("urls_index", templateVars);
  });

  app.get('/', (req, res) => {
    let templateVars = {users: req.session.user_id};
    res.render("urls_new", templateVars);
  });

  ///////////redirects to urls_new///////////
  app.get("/urls/new", (req, res) => {
    let templateVars = {users: req.session.user_id};
    if (req.session.user_id){
      res.send(200).render("urls_new", templateVars);
    } else {
      res.send(401).redirect('/login');
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

  app.get('/u/:id', (req, res) => {
    if (urlDatabase[req.params.id]) {
      res.redirect(urlDatabase[req.params.id].longUrl)
    } else {
      res.status(404).send('404 NOT FOUND');
    }
  });

///////////URL PAGE SECTION /////////////
/////////////////////////////////////////
app.post("/urls", (req, res) => {
  let generateUrl = generateRandomString();
  let longurl = req.body.longURL;
  let cookieId = req.session.user_id;
  let templateVars = urlDatabase[generateUrl] = {
    longUrl: longurl,
    UserId: cookieId
  };
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
app.post('/logout', (req, res) => {
  delete req.session.user_id;
  res.redirect('/urls');
});


////////REGISTRATION PAGE/////////////////
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase,
    users: req.session.user_id
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  console.log(users);
  let email = req.body.email;
  let password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  let RandomID = generateRandomString();
  if (!password || !email) {           ///fix stuffs
    res.status(400).render('400');
  } else {
    users[RandomID] = {
      id: RandomID,
      email: email,
      password: hashed_password
    };
    req.session.user_id = RandomID;
    res.redirect('/urls');
  }
  console.log(users);
});


//////////LOGIN PAGE SECTION///////////
app.get('/login', (req, res) => {
  res.render('login');
});

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

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

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