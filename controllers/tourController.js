const fs = require('fs');

const _tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  console.log(res.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: res.requestTime,
    results: _tours.length,
    data: {
      tours: _tours
    }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = _tours.find(el => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
};

exports.createTour = (req, res) => {
  //console.log(req.body);

  const newId = _tours[_tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  _tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(_tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  //For simplicity
  const id = req.params.id * 1;
  const tour = _tours.find(el => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  //For simplicity
  const id = req.params.id * 1;
  const tour = _tours.find(el => el.id === id);

  if (!tour) {
    return res.status(204).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: {
      data: null
    }
  });
};
