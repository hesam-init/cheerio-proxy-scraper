// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
const cheerio = require("cheerio");
const pretty = require("pretty");
const axios = require("axios");
const fs = require("fs");

// create folder
const dir = "./proxies";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// scraper function
const url = "https://hidemy.name/en/proxy-list/";
const scrapeData = async () => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const listItems = $(".table_block tbody");

    // We will store the data in this array
    const cityFunction = (el) => {
      if ($(el).find("tr > td:nth-child(3) > .city").text() === "") {
        return "N/A";
      } else {
        return $(el).find("tr > td:nth-child(3) > .city").text();
      }
    };

    // proxy list is in a table to json
    let proxiesList = { count: `${listItems.children().length}`, proxies: [] };
    listItems.children().map((idx, el) => {
      const proxy = {
        ip: $(el).find("tr > td:nth-child(1)").text(),
        port: $(el).find("tr > td:nth-child(2)").text(),
        ping: $(el).find("tr > td:nth-child(4) > div > p").text(),
        type: $(el).find("tr > td:nth-child(5)").text(),
        country: $(el).find("tr > td:nth-child(3) > .country").text(),
        city: cityFunction(el),
      };
      proxiesList.proxies.push(proxy);
    });

    // export to json
    fs.writeFile(
      "./proxies/proxies.json",
      JSON.stringify(proxiesList, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      }
    );

    // proxy list is in a table to txt
    let proxiesListTxt = "";
    listItems.children().map((idx, el) => {
      const proxy = {
        country: $(el).find("tr > td:nth-child(3) > .country").text(),
        ip: $(el).find("tr > td:nth-child(1)").text(),
        port: $(el).find("tr > td:nth-child(2)").text(),
        city: cityFunction(el),
      };
      proxiesListTxt += `${proxy.ip}:${proxy.port} \n`;
    });

    // export to txt
    fs.writeFile("./proxies/proxies.txt", proxiesListTxt, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    });
  } catch (err) {
    console.error(err);
  }
};

scrapeData();
