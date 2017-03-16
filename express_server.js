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

  /////////////allows us to acces POST request parameters stored to the urlDatabase variable.///////////
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  let templateVars = { urls: urlDatabase,
                      username: req.cookies["username"]
                     };
  res.render("urls_index", templateVars);
});

  ///////////redirects to urls_new///////////
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});
  /////////////redirects to urls_show to display full url and name///////////////

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      redirectURL: urlDatabase[req.params.id],
                      username: req.cookies["username"]
   };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                      redirectURL: urlDatabase[req.params.id]
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

app.post('/login', (req, res) => {
  let username = req.body.username
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  // delete urlDatabase[req.body.username]
  res.redirect('/urls');
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



