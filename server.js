if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const db = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_db,
  port: 3308
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('MySql is connected');
  }
});

// main variables
var loggedIn = false;
var message = null;
var messages = [];
// var name = null
app.set('view-engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Validate cookies
function validateCookie(req, res, next) {
  const { cookies } = req;
  if ('sessionToken' in cookies) {
    loggedIn = true;
    next();
  } else {
    loggedIn = false;
    next();
  }
}

app.get('/', validateCookie, (req, res) => {
  res.render('home.ejs', {
    loggedIn: loggedIn,
    messages: messages,
    name: req.cookies.name,
    id: req.cookies.id,
  });
});

app.get('/', validateCookie, (req, res) => {
  res.render('home.ejs', {
    loggedIn: loggedIn,
    messages: messages,
    name: req.cookies.name,
    id: req.cookies.id,
  });
});

app.get('/home', validateCookie, (req, res) => {
  res.render('home.ejs', { loggedIn: loggedIn, messages: messages });
});

app.get('/login', validateCookie, (req, res) => {
  if (!loggedIn) res.render('login.ejs', { loggedIn: false, message: message });
  else res.redirect('/');
});
app.get('/register', validateCookie, (req, res) => {
  if (!loggedIn)
    res.render('register.ejs', { loggedIn: false, message: message });
  else res.redirect('/');
});

app.post('/login', validateCookie, (req, res) => {
  if (loggedIn) res.redirect('/');
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login.ejs', {
        loggedIn: false,
        message: 'Email and password required',
      });
    }
    db.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, result) => {
        // console.log(result);

        if (
          !result ||
          !result.length > 0 ||
          !result[0]['email'] ||
          !(await bcrypt.compare(password, result[0].password))
        ) {
          res.render('login.ejs', {
            loggedIn: false,
            message: 'Email or password incorrect',
          });
        } else {
          const id = result[0]['id'];
          const name = result[0]['name'];
          const token = jwt.sign({ id }, process.env.JWT_TOKEN, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
          const cookiesOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 3600000
            ),
            httpOnly: true,
          };

          res.cookie('sessionToken', token, cookiesOptions);
          res.cookie('name', name, cookiesOptions);
          res.cookie('email', email, cookiesOptions);
          res.cookie('id', id, cookiesOptions);

          loggedIn = true;
          message = null;
          res.redirect('/');
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.get('/register', validateCookie, (req, res) => {
  if (!loggedIn)
    res.render('register.ejs', { loggedIn: loggedIn, message: message });
  else res.redirect('/');
});

app.post('/register', validateCookie, async (req, res) => {
  if (loggedIn) {
    return res.redirect('/');
  }
  const { name, email, password, conf_password } = req.body;

  //Verify if email already exist and passwords match
  db.query(
    'SELECT email from users WHERE email = ?',
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }
      if (result.length > 0) {
        return res.render('register.ejs', {
          message: 'Email already exists',
          loggedIn: false,
        });
      } else if (password !== conf_password) {
        return res.render('register.ejs', {
          message: "Passwords don't match",
          loggedIn: false,
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
          'INSERT INTO users SET ?',
          { name: name, email: email, password: hashedPassword },
          (err, resu) => {
            if (err) {
              console.log(err);
              return res.render('register.ejs', {
                message: "Couldn't create the user, please try again",
                loggin: false,
              });
            }
          }
        );
        return res.redirect('/login');
      }
    }
  );
});

app.post('/logout', (req, res) => {
  res.cookie('sessionToken', '', { maxAge: 0 });
  res.cookie('name', '', { maxAge: 0 });
  res.cookie('email', '', { maxAge: 0 });

  loggedIn = false;
  message = null;
  res.redirect('/');
});

app.get('/loadMessages', (req, res) => {
  db.query(
    'SELECT name, message FROM users , messages WHERE users.id = messages.user_id ORDER BY messages.time ASC',
    (err, result) => {
      if (err) console.log(err);
      res.json(result);
    }
  );
});

app.post('/saveMessage', (req, res) => {
  console.dir('saving :'+ JSON.stringify(req.body))
  var data = JSON.stringify(req.body);
  const NewMessage = JSON.parse(data);
  console.log('newMessage :' + NewMessage.message);
  db.query(
    'INSERT INTO messages SET ?',
    { message: NewMessage.message, user_id: NewMessage.user_id },
    (err, result) => {
      if (err) console.log(err);
      res.json(result);
    }
  );
});
const server = app.listen(4040);
console.log('Server is up on port 4040');

const webSocket = require('ws');
const SocketServer = require('ws').Server;
const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[server] a client was connected ');
  ws.on('close', () => {
    console.log('[server] client desconnected ');
  });
  ws.on('message', (message) => {
    console.log('[server] receiced message %s', message);
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === webSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
