import cheerio from 'cheerio'

export interface Status {
  key: string
  title: string
  displayValue: string
  value: number
}

export default new (class Parser {
  public getUpdateDate(html: string): Date {
    const $: CheerioStatic = cheerio.load(html)
    let text: string = $('.update_info .text')
      .first()
      .text()

    let pattern: RegExp = /최종업데이트 ([0-9]+)\.([0-9]+)\.([0-9]+)\. ([0-9]+):([0-9]+)/
    let regexp: RegExpExecArray | null = pattern.exec(text)

    if (regexp === null) throw '업데이트 날짜 파싱 실패'

    let [, year, month, date, hours, minutes] = regexp

    return new Date(Number(year), Number(month) - 1, Number(date), Number(hours), Number(minutes))
  }

  public getStatus(html: string): Status[] {
    const $: CheerioStatic = cheerio.load(html)
    const statusList: Status[] = []

    $('.circle .txt').each((index: number, element: CheerioElement) => {
      let title: string = $(element)
        .find('.txt_sort')
        .text()
      let displayValue: string = $(element)
        .find('.num')
        .text()
      let value: number = Number(displayValue.replace(',', ''))
      let statusKey: string | null = this.replaceStatuskeyByTitle(title)

      if (statusKey === null) throw '확진자 현황 파싱 실패'

      statusList.push({
        key: statusKey,
        title: title,
        displayValue: displayValue,
        value: value
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
