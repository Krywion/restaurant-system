const MenuItem = require('../models/MenuItem');

exports.getAllItems = async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
    const item = new MenuItem({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        available: req.body.available,
        description: req.body.description
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateItem = async (req, res) => {
  try {
      const item = await MenuItem.findById(req.params.id);
      if (item == null) {
          return res.status(404).json({ message: 'Item not found' });
      }

      Object.assign(item, req.body);
      const updatedItem = await item.save();
      res.json(updatedItem);
  }  catch (error) {
      res.status(400).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (item == null) {
            return res.status(404).json({message: 'Item not found'});
        }

        await item.deleteOne();
        res.json({message: 'Item deleted'});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}