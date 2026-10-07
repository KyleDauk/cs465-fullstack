const mongoose = require('mongoose');
const Model = mongoose.model('trips');

// GET: /api/trips - lists all the trips
const tripsList = async (req, res) => {
    try {
        const q = await Model.find({}).exec();

        if (!q || q.length === 0) {
            return res
                .status(404)
                .json({ message: 'No trips found' });
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

// POST: /api/trips - adds a new trip
const tripsAddTrip = async (req, res) => {
    try {
        const newTrip = new Model({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
        });

        const q = await newTrip.save();

        if (!q) {
            return res
                .status(400)
                .json({ message: 'Trip could not be created' });
        }
        return res
            .status(201)
            .json(q);
    } catch (err) {
        return res
            .status(400)
            .json({ message: err.message });
    }
};

// PUT: /api/trips/:tripCode - updates an existing trip
const tripsUpdateTrip = async (req, res) => {
    try {
        const q = await Model
            .findOneAndUpdate(
                { 'code': req.params.tripCode },
                {
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
                },
                // new:true returns the updated document rather than the
                // pre-update one, which is what the Angular client expects back.
                { returnDocument: 'after' }
            )
            .exec();

        if (!q) {
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

// DELETE: /api/trips/:tripCode - removes a trip
const tripsDeleteTrip = async (req, res) => {
    try {
        const q = await Model
            .findOneAndDelete({ 'code': req.params.tripCode })
            .exec();

        if (!q) {
            return res
                .status(404)
                .json({ message: `Trip ${req.params.tripCode} not found` });
        }
        return res
            .status(204)
            .json(null);
    } catch (err) {
        return res
            .status(500)
            .json({ message: err.message });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip,
    tripsDeleteTrip
};
