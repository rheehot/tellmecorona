const fs = require("fs");

class storage {
  constructor() {
    this.path = "./update.log";
  }

  saveUpdateDate(date) {
    fs.writeFileSync(this.path, date, error => {
      if (error) console.log(error);
    });
  }

  readUpdateDate() {
    if (!fs.existsSync(this.path)) {
      this.saveUpdateDate();
    }

    return fs.readFileSync(this.path, "utf-8", (error, data) => {
      if (error) throw error;
      return data;
    });
  }
}

module.exports = storage;
