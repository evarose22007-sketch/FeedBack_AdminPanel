const router = require('express').Router();
const { listCourses } = require('../controllers/courseController');
router.get('/', listCourses);
module.exports = router;