;(() => {
  const request = require('request')

  class Requester {
    public load(): Promise<PromiseConstructor> {
      const url: string =
        'https://m.search.naver.com/search.naver?ie=utf8&query=%EC%BD%94%EB%A1%9C%EB%82%98+%ED%99%95%EC%A7%84%EC%9E%90'

      return new Promise((resolve, reject) => {
        request(url, (error: any, request: any, body: any) => {
          if (error) {
            console.error('Failed: ', error)

            if (request) console.log('statusCode: ', request.statusCode)

            reject(error)
          }

          resolve(body)
        })
      })
    }
  }

  module.exports = Requester
})()
