const cheerio = require("cheerio");

class parser {
  getUpdateDate(data) {
    const $ = cheerio.load(data);
    let text = $(".csm_subInfo_area .type_info .text")
      .first()
      .text();

    let regexp = /최종업데이트 ([0-9]+)\.([0-9]+)\.([0-9]+)\. ([0-9]+):([0-9]+)/.exec(
      text
    );

    return new Date(
      Number(regexp[1]),
      Number(regexp[2]) - 1,
      Number(regexp[3]),
      Number(regexp[4]),
      Number(regexp[5])
    );
  }

  getStatus(data) {
    const $ = cheerio.load(data);
    const result = [];

    $(".circle .txt").each((index, element) => {
      let title = $(element)
        .find(".txt_sort")
        .text();
      let value = $(element)
        .find(".num")
        .text();
      let keyType;

      switch (title) {
        case "확진환자":
          keyType = "infected";
          break;
        case "검사진행":
          keyType = "tested";
          break;
        case "격리해제":
          keyType = "recovered";
          break;
        case "사망자":
          keyType = "deaths";
          break;
      }

      result.push({
        key: keyType,
        data: {
          title: title,
          displayValue: value,
          value: value.replace(",", "")
        }
      });
    });

    return result;
  }
}

module.exports = parser;
