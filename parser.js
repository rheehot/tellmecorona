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

    return new Date(regexp[1], regexp[2], regexp[3], regexp[4], regexp[5]);
  }

  getStatus(data) {
    const $ = cheerio.load(data);
    const result = [];

    $(".circle .txt").each((index, element) => {
      let title = $(element)
        .find(".txt_sort")
        .text();
      let num = $(element)
        .find(".num")
        .text();
      result.push([title, num]);
    });

    return result;
  }
}

module.exports = parser;
