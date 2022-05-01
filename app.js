import cheerio from "cheerio";
import pretty from "pretty";
import axios from "axios";
import colors from "colors";
import fs from "fs";

// scraper function
const url = "https://hidemy.name/en/proxy-list/";

const scrapeData = () => {
  axios.get(url).then((data) => {
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
      urlGenerated.push(`https://hidemy.name/en/proxy-list/?start=${i}#list`);
    }

    urlGenerated.forEach((data, index) => {
      setTimeout(() => {
        axios.get(urlGenerated[index]).then((data) => {
          const $ = cheerio.load(data.data);
          const listItems = $(".table_block tbody").html();
          fs.writeFile(`./export/${index}.html`, pretty(listItems), (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`File ${index} exported`.green);
          });
        });
      }, index * 1000);
    });
  });
};

scrapeData();
