const express = require('express');
const http = require('http');
const connection = require('./config/connection');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const app = express();

const userModel = require('./models/User');
const garbageCategoryModel = require('./models/GarbageCategory');
const paymentMethodModel = require('./models/PaymentMethod');
const depositModel = require('./models/Deposit');
const withdrawalModel = require('./models/Withdrawal');
const bankCustomerModel = require('./models/BankCustomer');

const userControllers = require('./controllers/userControllers');
const bankControllers = require('./controllers/bankControllers');
const bankCustomerControllers = require('./controllers/bankCustomerControllers');
const savingBookControllers = require('./controllers/savingBookControllers');
const depositControllers = require('./controllers/depositControllers');
const withdrawalControllers = require('./controllers/withdrawalControllers');

require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const origin = {
  origin: isProd ? 'https://www.bankboo-api.herokuapp.com' : '*'
}

app.use(compression());
app.use(helmet());

// Body parser
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// CORS
app.use(cors(origin));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
		return res.status(200).json({});
	};
	next();
});

// Controllers
userControllers(app);
bankControllers(app);
bankCustomerControllers(app);
savingBookControllers(app);
depositControllers(app);
withdrawalControllers(app);

connection
  .sync()
  .then(() => {
    const server = app.listen(process.env.PORT || 3000, () => {
      console.log('Your port is listening to localhost 3000');
    });
  })
  // .then(() => {
  //   return connection.drop();
  // })
  .catch(err => {
    console.log('Unable to connect to the database', err);
  });
