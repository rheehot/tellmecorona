;(function() {
  const request = require('request')

  class requester {
    public load() {
      const url: string =
        'https://m.search.naver.com/search.naver?ie=utf8&query=%EC%BD%94%EB%A1%9C%EB%82%98+%ED%99%95%EC%A7%84%EC%9E%90'

      return new Promise((resolve, reject) => {
        request(url, (error: any, request: any, body: any) => {
          if (error && request.statusCode !== 200) {
            console.error('Failed: ', error)
            console.log('statusCode: ', request && request.statusCode)
            reject()
          }

          resolve(body)
        })
      })
    }
  }

  module.exports = requester
})()
