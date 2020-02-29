import request from 'request'
export default new (class Requester {
  public load(): Promise<string> {
    const url: string =
      'https://m.search.naver.com/search.naver?ie=utf8&query=%EC%BD%94%EB%A1%9C%EB%82%98+%ED%99%95%EC%A7%84%EC%9E%90'

    return new Promise((resolve, reject) => {
      request(url, (error: any, response: request.Response, body: any) => {
        if (error) reject(error)

        resolve(body)
      })
    })
  }
})()
