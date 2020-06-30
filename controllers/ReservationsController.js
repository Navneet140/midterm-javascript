// You need to complete this controller with the required 7 actions
const viewPath = 'reservations';
const Reservation = require('../models/reservation');
const restaurants = Reservation.schema.paths.restaurant.enumValues;
const User = require('../models/user');


// #1
exports.index = async (req, res) => {
  try {
    const reservations = await Reservation
      .find()
      .populate('user')
      .sort({updatedAt: 'desc'});

    res.render(`${viewPath}/index`, {
      pageTitle: 'User Reservations',
      reservations: reservations
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the Collection: ${error}`);
    res.redirect('/');
  }
};

// #2
exports.show = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user');
    console.log(reservation);
    res.render(`${viewPath}/show`, {
      pageTitle: reservation.restaurant,
      reservation: reservation
    });
  } catch (error) {
    req.flash('danger', `Something Went Wrong while displaying this Reservation: ${error}`);
    res.redirect('/');
  }
};

// #3
exports.new = (req, res) => {
  res.render(`${viewPath}/new`, {
    pageTitle: 'New Reservation',
    restaurants: restaurants
  });
};

// #4
exports.create = async (req, res) => {
  try {
    const user = await User.findOne({email: req.session.passport.user});
    const attributes = {user: user._id, ...req.body};
    const reservation = await Reservation.create(attributes);
    req.flash('success', 'Your reservation was created successfully.');
    res.redirect(`/${viewPath}/${reservation.id}`);
  } catch (error) {
    console.error(error);
    req.flash('danger', 'There was an issue with creating this reservation.');
    res.redirect('/');
  }
};


// #5
exports.edit = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    res.render(`${viewPath}/edit`, {
      pageTitle: reservation.restaurant,
      restaurants: restaurants,
      formData: reservation
      
    });
  } catch (error) {
    req.flash('danger', `There was an error getting the reservation: ${error}`);
    res.redirect('/');
  }
};


// #6
exports.update = async (req, res) => {
  try {
    const { user: email } = req.session.passport;
    const user = await User.findOne({email: email});

    let reservation = await Reservation.findById(req.body.id);
    if (!reservation) throw new Error('Could not be found');

    const attributes = {user: user._id, ...req.body};
    await Reservation.validate(attributes);
    await Reservation.findByIdAndUpdate(attributes.id, attributes);

    req.flash('success', 'Reservation updated successfully! Enjoy your day');
    res.redirect(`/reservations/${req.body.id}`);
  } catch (error) {
    req.flash('danger', `Something went wrong: ${error}`);
    res.redirect(`/reservations/${req.body.id}/edit`);
  }
};


// #7
exports.delete = async (req, res) => {
  try {
    console.log(req.body);
    await Reservation.deleteOne({_id: req.body.id});
    req.flash('success', 'The Reservation has been cancelled');
    res.redirect(`/reservations`);
  } catch (error) {
    req.flash('danger', `Something went wrong: ${error}`);
    res.redirect(`/reservations`);
  }
};