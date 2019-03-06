export default {
  // store can be dispatch, getState, subcribe etc ...
  sampleMiddleware: store => next => action => {
    if (process.env.BROWSER) {
      console.log('SAMPLE MIDDLEWARE REPORT: ',action);
    }
    return next(action);
  }
}