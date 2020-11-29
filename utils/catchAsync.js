module.exports = fn => {
    //fn will be an async function, therefore it will return a promise, if there is an error we can just call the catch function avaliable to all promises 
    //return an anonymous function, so that the code it is not immediately run when assigned, but instead it is run on demand when needed
    //pass req, res, and next as parameters to the anonymous function
    return (req, res, next) => { 
        //Since this 
        //We need to pass the next funtion to the catch function in order to pass the error into it
        //so that the error can then be handled by the global error handling middleware
        fn(req, res, next).catch(next);
        //the code above is a simplification of the following line of code:
        //fn(req, res, next).catch(error => next(error));
    };
};
  