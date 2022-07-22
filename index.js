const express = require('express');
const connection = require('./config/connection');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const app = express();

const userModel = require('./models/User');
const adminModel = require('./models/Admin');
const garbageCategoryModel = require('./models/GarbageCategory');
const paymentMethodModel = require('./models/PaymentMethod');
const depositModel = require('./models/Deposit');
const withdrawalModel = require('./models/Withdrawal');
const bankCustomerModel = require('./models/BankCustomer');

const userControllers = require('./controllers/userControllers');
const adminControllers = require('./controllers/adminControllers');
const bankControllers = require('./controllers/bankControllers');
const bankCustomerControllers = require('./controllers/bankCustomerControllers');
const savingBookControllers = require('./controllers/savingBookControllers');
const depositControllers = require('./controllers/depositControllers');
const withdrawalControllers = require('./controllers/withdrawalControllers');
const garbageCategoryControllers = require('./controllers/garbageCategoryControllers');
const paymentMethodControllers = require('./controllers/paymentMethodControllers');

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
adminControllers(app);
bankControllers(app);
bankCustomerControllers(app);
savingBookControllers(app);
depositControllers(app);
withdrawalControllers(app);
garbageCategoryControllers(app);
paymentMethodControllers(app);

connection
  .authenticate()
  .then(() => {
    const isProd = process.env.NODE_ENV === "production"
    const port = isProd ? process.env.PROD_DB_PORT : process.env.DEV_DB_PORT

    app.listen(port, () => {
      console.log('Your port is listening to localhost 3000 ', process.env.NODE_ENV);
    });
  })
  // .then(() => {
  //   return connection.drop();
  // })
  .catch(err => {
    console.log('Unable to connect to the database', err);
  });
