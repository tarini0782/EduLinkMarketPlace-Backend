const express = require('express');
const { getStudentProfile, updateStudentProfile, registerStudent } = require('../controllers/userController');

const router = express.Router();

router.route('/student').get(getStudentProfile).put(updateStudentProfile);
router.route('/register').post(registerStudent);

module.exports = router;
