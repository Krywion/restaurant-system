const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getAllItems);

router.get('/:id', menuController.getItem);

router.post('/', menuController.createItem);

router.put('/:id', menuController.updateItem);

router.delete('/:id', menuController.deleteItem);

module.exports = router;