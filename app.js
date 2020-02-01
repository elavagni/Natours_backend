const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const _tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: _tours.length,
    data: {
      tours: _tours
    }
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});
