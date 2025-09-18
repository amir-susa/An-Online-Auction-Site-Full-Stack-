// routes/userRoutes.js

const Router = require('@koa/router');
const { registerUser, loginUser } = require('../controllers/userController');

const router = new Router({ prefix: '/api/users' });

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;