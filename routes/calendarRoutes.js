// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

router.get('/createevent', calendarController.createEvent);
router.get('/bookedslots', calendarController.getBookedSlots);
router.get('/availableslots', calendarController.getAvailableSlots);
router.get('/delete', calendarController.deleteEvent);
router.delete('/delete_event/:eventId', calendarController.deleteEventById);
router.get('/authenticated', calendarController.authenticate);
router.get('/auth', calendarController.redirectToAuth);

module.exports = router;

