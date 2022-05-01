import cheerio from "cheerio";
import colors from "colors";
import pretty from "pretty";
import axios from "axios";
import ora from "ora";
import fs from "fs";

// scraper function
const url = "https://hidemy.name/en/proxy-list/";

// progress bar animation
const progressBar = ora("Scraping data from HMA");

const types = ["h", "s"];

const scrapeData = (type = "h") => {
  progressBar.start();
  axios
    .get(url)
    .then((data) => {
      const $ = cheerio.load(data.data);
      const allProxies = $(".pagination > ul");
      const getPagination = allProxies.children().length - 1;
      const getAllCountProxies = $(
        `.pagination > ul > li:nth-child(${getPagination}) > a`
      );
      const getCountProxies = getAllCountProxies
        .attr("href")
        .split("=")
        .pop()
        .split("#")[0];

      // get url in loop
      const urlGenerated = [];
      for (let i = 64; i < parseInt(getCountProxies); i += 64) {
        urlGenerated.push(
          `https://hidemy.name/en/proxy-list/?type=${type}&start=${i}#list`
        );
      }

      urlGenerated.forEach((data, index) => {
        setTimeout(() => {
          axios
            .get(urlGenerated[index])
            .then((data) => {
              const $ = cheerio.load(data.data);
              const listItems = $(".table_block tbody");
              listItems.children().map((idx, el) => {
                const proxy = {
                  ip: $(el).find("tr > td:nth-child(1)").text(),
                  port: $(el).find("tr > td:nth-child(2)").text(),
                  ping: $(el).find("tr > td:nth-child(4) > div > p").text(),
                };
                fs.appendFile(
                  "./proxies.txt",
                  `${proxy.ip}:${proxy.port}\n`,
                  (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              });
            })
            .catch((err) => {
              progressBar.fail();
              console.log("Your Ip Blocked".red);
            });
        }, index * 250);
      });
    })
    .catch((err) => {
      progressBar.fail();
      console.log("Your Ip Blocked".red);
    });
};

scrapeData();
