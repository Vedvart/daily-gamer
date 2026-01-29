const express = require('express');
const usersRouter = require('./users');
const resultsRouter = require('./results');
const groupsRouter = require('./groups');
const discussionsRouter = require('./discussions');

const router = express.Router();

// Mount route handlers
router.use('/users', usersRouter);
router.use('/results', resultsRouter);
router.use('/groups', groupsRouter);

// Discussions are nested under groups
router.use('/groups', discussionsRouter);

module.exports = router;
