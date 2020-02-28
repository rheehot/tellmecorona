;(() => {
  const cheerio = require('cheerio')

  class Parser {
    public getUpdateDate(data: any): Date {
      const $ = cheerio.load(data)
      let text: string = $('.update_info .text')
        .first()
        .text()

      let regexp: RegExpExecArray | null = /최종업데이트 ([0-9]+)\.([0-9]+)\.([0-9]+)\. ([0-9]+):([0-9]+)/.exec(
        text
      )

      if (regexp === null) throw '업데이트 날짜 파싱 실패'

      let [, year, month, date, hours, minutes] = regexp

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(date),
        Number(hours),
        Number(minutes)
      )
    }

    public getStatus(data: any): object[] | null {
      const $ = cheerio.load(data)
      const result: object[] = []

      $('.circle .txt').each((index: number, element: any) => {
        let title: string = $(element)
          .find('.txt_sort')
          .text()
        let displayValue: string = $(element)
          .find('.num')
          .text()
        let value: number = Number(displayValue.replace(',', ''))
        let keyType: string | null = null

        switch (title) {
          case '확진환자':
            keyType = 'infected'
            break
          case '검사진행':
            keyType = 'tested'
            break
          case '격리해제':
            keyType = 'recovered'
            break
          case '사망자':
            keyType = 'deaths'
            break
        }

        if (keyType === null) {
          console.error('Failed: 확진자 현황 파싱 실패')
          return null
        }

        result.push({
          key: keyType,
          data: {
            title: title,
            displayValue: displayValue,
            value: value
          }
        })
      })

      return result
    }
  }

  module.exports = Parser
})()
