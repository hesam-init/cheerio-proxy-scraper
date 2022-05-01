// Loading the dependencies. We don't need pretty
import cheerio from "cheerio";
import pretty from "pretty";
import colors from "colors";
import axios from "axios";
import ora from "ora";
import fs from "fs";

// progress bar animation
const progressBar = ora("Scraping data from HMA");

// create folder
const dir = "./proxies";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// scraper function
const url = "https://hidemy.name/en/proxy-list/";

const scrapeData = () => {
  axios.get(url).then((data) => {
    const $ = cheerio.load(data.data);
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
        console.log("Successfully written proxies to json file".green);
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
      console.log("Successfully written data proxies to txt file".green);
    });
  });
};

scrapeData();

