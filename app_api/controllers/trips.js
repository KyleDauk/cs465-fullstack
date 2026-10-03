const mongoose = require('mongoose');
const Model = mongoose.model('trips');

// GET: /api/trips - lists all the trips
const tripsList = async (req, res) => {
    try {
        const q = await Model.find({}).exec();

        if (!q || q.length === 0) {
            // Database query succeeded but returned no records
            return res
                .status(404)
                .json({ message: 'No trips found' });
        }
        return res
            .status(200)
            .json(q);
    } catch (err) {
        // Database or server failure
        return res
            .status(500)
            .json({ message: err.message });
    }
};

// GET: /api/trips/:tripCode - returns a single trip by its code
const tripsFindByCode = async (req, res) => {
    try {
        const q = await Model.find({ 'code': req.params.tripCode }).exec();

        // find() returns an empty array when nothing matches, and an empty
        // array is truthy, so the length must be checked for the 404 to fire.
        if (!q || q.length === 0) {
            return res
                .status(404)
                .json({ message: `Trip ${req.params.tripCode} not found` });
        }
        return res
            .status(200)
            .json(q);
    } catch (err) {
        return res
            .status(500)
            .json({ message: err.message });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode
};
