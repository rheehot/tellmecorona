;(() => {
  const cheerio = require('cheerio')

  class Parser {
    public getUpdateDate(html: string): Date {
      const $ = cheerio.load(html)
      let text: string = $('.update_info .text')
        .first()
        .text()

      let pattern: any = /최종업데이트 ([0-9]+)\.([0-9]+)\.([0-9]+)\. ([0-9]+):([0-9]+)/
      let regexp: RegExpExecArray | null = pattern.exec(text)

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

    public getStatus(html: string): object[] {
      const $ = cheerio.load(html)
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

        if (keyType === null) throw '확진자 현황 파싱 실패'

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
