import cheerio from 'cheerio'

export interface Status {
  key: string
  title: string
  displayValue: string
  value: number
  increment: number
}

export default new (class Parser {
  public replaceUpdateDateTextToDateObject(text: string): Date {
    let pattern: RegExp = /([0-9]+)\.([0-9]+)\.([0-9]+)\. ([0-9]+):([0-9]+)/
    let regexp: RegExpExecArray | null = pattern.exec(text)

    if (regexp === null) throw '업데이트 날짜 파싱 실패'

    let [, year, month, date, hours, minutes] = regexp
    return new Date(Number(year), Number(month) - 1, Number(date), Number(hours), Number(minutes))
  }

  public getUpdateDate(html: string): Date {
    const $: CheerioStatic = cheerio.load(html)
    let text: string = $('.info_text')
      .first()
      .text()

    return this.replaceUpdateDateTextToDateObject(text)
  }

  public getStatus(html: string): Status[] {
    const $: CheerioStatic = cheerio.load(html)
    const statusList: Status[] = []

    $('.status_info li').each((index: number, element: CheerioElement) => {
      let title: string = $(element)
        .find('.info_title')
        .text()
      let displayValue: string = $(element)
        .find('.info_num')
        .text()
      let displayIncrement: string = $(element)
        .find('.info_variation')
        .text()
      let value: number = Number(displayValue.replace(',', ''))
      let statusKey: string | null = this.replaceStatuskeyByTitle(title)
      let increment: number = 0

      if (statusKey === null) throw '확진자 현황 파싱 실패'
      if (displayIncrement !== '-') {
        increment = Number(displayIncrement.replace(',', ''))
      }

      statusList.push({
        key: statusKey,
        title: title,
        displayValue: displayValue,
        value: value,
        increment: increment
      })
    })

    return statusList
  }

  private replaceStatuskeyByTitle(title: string): string | null {
    switch (title) {
      case '확진환자':
        return 'infected'
      case '검사진행':
        return 'tested'
      case '격리해제':
        return 'recovered'
      case '사망자':
        return 'deaths'
    }

    return null
  }
})()
