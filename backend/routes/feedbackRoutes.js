const router = require('express').Router();
const fb = require('../controllers/feedbackController');
router.get('/', fb.listFeedback);
router.post('/', fb.createFeedback);
router.get('/:id', fb.getFeedback);
router.put('/:id', fb.updateFeedback);
router.delete('/:id', fb.deleteFeedback);
module.exports = router;