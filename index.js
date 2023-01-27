const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const registerdb = require('./apiQueries');
const chatQueries = require('./chatQueries');
const port = 3000;
const logindb = require('./userAccess')
const { RegisterValidation, loginValidation, forgot_password_user, reset_user_password } = require('./Validator');
const multer = require('multer');
var cookieParser = require('cookie-parser');



app.use(cookieParser());

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());
// {
//   'origin': 'http://localhost:4202'
// }

app.get('/', (request, response) => {
  response.cookie(`Cookie token name`, `encrypted cookie string Value`);
  response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.use(express.static('upload'));
app.use('/images', express.static('images'));

app.get('/userslist',logindb.userListDetails )

app.post('/register', RegisterValidation(), registerdb.registerUser);
app.get('/token',logindb?.cookieToken);
app.delete('/user/delete', registerdb.deleteUser);
app.put('/user/update',  RegisterValidation(), registerdb.updateUser);
app.get('/user', registerdb.getUserById);
app.post('/login/user', loginValidation(),logindb.userAccessToken);
app.post('/user/forgot_password', forgot_password_user(),logindb?.forgot_password);
app.post('/verify/token', logindb?.ToVerifyTokenFromMail);
app.post('/set_password', reset_user_password(), logindb?.resetPassword);
// app.post('/upload_logo', registerdb.upload.single('profileImage'), registerdb.uploadProfileImage);
app.post('/upload_logo',registerdb.uploadProfileImage)
app.post('/chatbackup',chatQueries.chatBackup);
app.post('/save/chatDetails',chatQueries.saveChatData)

app.listen(port, "192.168.1.163", () => {
  console.log(`App running on port ${port}.`)
});


const fs = require("fs");
const path = require("path");
const url = require("url");

app.get('*', (req,res)=>{
  // console.log("req",req);
    // Parsing the URL
  var request = url.parse(req.url, true);
  console.log("request",request);

  // Extracting the path of file
  var action = request.pathname;

  // Path Refinements
  var filePath = path.join(__dirname,
          action).split("%20").join(" ");

  // Checking if the path exists
  fs.exists(filePath, function (exists) {

      if (!exists) {
          res.writeHead(404, {
              "Content-Type": "text/plain" });
          res.end("404 Not Found");
          return;
      }

      // Extracting file extension
      var ext = path.extname(action);

      // Setting default Content-Type
      var contentType = "text/plain";

      // Checking if the extension of
      // image is '.png'
      if (ext === ".png") {
          contentType = "image/png";
      }

      // Setting the headers
      res.writeHead(200, {
          "Content-Type": contentType });

      // Reading the file
      fs.readFile(filePath,
          function (err, content) {
              // Serving the image
              res.end(content);
          });
  });
})
