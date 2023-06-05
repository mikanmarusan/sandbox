
// Sample Lambda Function
// 環境変数からBaerer tokenを取得しAPIアクセスするコード

const axios = require("axios");

exports.handler = async(event, context) => {
  
  const payload = {
    "daysOfWeek":        [1,2,3,4,5],
    "genders":           'f',
    "page":              1
  };
  
  let statusCode   = 200;
  let responseData = {};
  
  await axios({
    method: 'post',
    url: 'https://www.example.com/api',
    headers: {
      Authorization: `Bearer ${process.env['BEARER_TOKEN']}`,
      'Content-Type': 'application/json',
    },
    data: payload
  })
  .then(function (response) {
    statusCode = response.status;
    responseData = response.data;
  })
  .catch(function (error) {
    statusCode = error.response.status;
  });

  return {
    'statusCode': statusCode,
    'body': candidateLessons
  }
};
