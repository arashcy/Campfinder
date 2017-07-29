
const request = require('request');


var getWeather = (lat, lng, callback) =>{
  request({
  url: `https://api.darksky.net/forecast/e71aeab89da38309baf3c1b3b50f833b/${lat},${lng}`,
  //37.8267,-122.4233
  json:true
  }, (error, response, body)=>{
  if(error){
    callback(error);
  }else if(response.statusCode === 400){
    callback('Unable to fetch weather!');
  }else if(response.statusCode === 200){
    callback(undefined, {
      temperature: body.currently.temperature,
      apparentTemp: body.currently.apparentTemperature,
      humidity: body.currently.humidity,
      summary: body.daily.summary
    });
  }
  });
}

module.exports.getWeather = getWeather;
