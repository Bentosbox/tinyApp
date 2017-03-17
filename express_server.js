//express_server.js

//planning
// app.get('/customer')
// app.get('/customer/:id')
// app.post('/customer')
// app.put('/customer/:id')
// app.delete('/customer/:id')

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
var cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs");







var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  "userRandomID": {
    'id': "userRandomID",
    'email': "user@example.com",
    'password': "1"
  },
 "user2RandomID": {
    'id': "user2RandomID",
    'email': "user2@example.com",
    'password': "1"
  }
};


//Custom Middleware
// app.use((req, res, next) => {
//   console.log('Custom User Middleware Session', req.session);
//   // Find a user from the cookies
//   // const user = userDB[req.cookies.email]; // Cookie Version
//   const user = users[req.session.email]; // Session Version
//   // If the user is found, add it to the request
//   if(user){
//     req.user = user;
//   }
//   // Do the next thing
//   next();
// });


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

  // console.log("loading urls, currnt user email is: ", user_email_goes_here);  // TODO: this should be possible

  let templateVars = { urls: urlDatabase,
                      users: req.cookies["user_id"]
                     };
  res.render("urls_index", templateVars);
});

  ///////////redirects to urls_new///////////
app.get("/urls/new", (req, res) => {
  let templateVars = {users: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});







  /////////////redirects to urls_show to display full url and name///////////////

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      redirectURL: urlDatabase[req.params.id],
                      users: req.cookies['user_id']
   };
  res.render("urls_show", templateVars);
});


app.post('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      redirectURL: urlDatabase[req.params.id],
                      users: req.cookies['user_id']
   };
  urlDatabase[req.params.id] = req.body.updateURL;
  res.redirect('/urls');
});









///////////URL PAGE SECTION /////////////
/////////////////////////////////////////
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");
  let generateUrl = generateRandomString()   ;    // Respond with 'Ok' (we will replace this)
  let longurl = req.body.longURL;
  urlDatabase[generateUrl] = longurl;

  //test code to generate short url and push long url into urlDatabase
  // res.redirect("/urls/" + generateUrl)
  res.redirect(longurl);
});

    ////////// Delete Button and Update ////////////////

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  let shortkey = urlDatabase[req.params.id]
  res.redirect('/urls/' + shortkey);
});


/////////////COOKIE SETUP/////////////////

// app.post('/login', (req, res) => {
//   let username = req.body.username
//   res.cookie('username', username);
//   res.redirect('/urls');
// });

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  // delete urlDatabase[req.body.username]
  res.redirect('/urls');
});


////////REGISTRATION PAGE/////////////////
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase,
                      users: req.cookies["user_id"]
                     };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  res.redirect('/register');
});

app.post('/register/email', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let RandomID = generateRandomString();
  // newuserRandomID = (email + RandomID);

  if (!password || !email) {           ///fix stuffs
    res.status(400).render('400');
  } else {
    users[RandomID] = {
      id: RandomID,
      email: email,
      password: password
    };
    console.log(users);
    // newuserRandomID = (email + RandomID);
    // users[newuserRandomID].id = newuserRandomID;
    // users[newuserRandomID].email = email;
    // users[newuserRandomID].password = password;
    // console.log(RandomID);
    res.cookie('user_id', RandomID);
    res.redirect('/urls');
  }
    console.log(users);
});

console.log(users);

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  // TODO: currently only works on first user (other users get the 403 even if they're valid)
  // Check to see if there is a user with the body email
  // const user = users[req.body.user];
    // Check to see if that user has the body password
  var successId = false
  for (let userId in users) {
    if (req.body.email === users[userId].email){     // at least 2 bugs
      // If so, login, set email cookie, and redirect

      // res.cookie('email', req.body.email); // Cookie Version
      // req.session.email = req.body.email; // Session Versio
      successId = true;
      // break;
    }
      // res.status(403).send('403: WRONG EMAIL');
    if (successId) {
      if (req.body.password ===users[userId].password) {
        console.log('your logged in');
        res.cookie('user_id', userId);                                                   // ??????
        res.redirect('/urls');
        // break;
      // If not, send status 403 and show 403
      }
      res.status(403).send('403: WRONG PASSWORD');
    }
  }
});

// app.get('/', (req, res) => {
//   // Pass the email from the cookie to the template
//   res.render('index', {email: req.cookies.email, user: req.user});
// });




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



