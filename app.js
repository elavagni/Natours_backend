const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

//The other of the middleware is really important, if the middleware if define after the routes,
//it will not be executed, as the route handler will finish the request/response cycle
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  //Invoke next function passed as parameter
  next();
});

app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const _tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
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

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

//REFACTORED ABOVE
// app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

const port = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
