import cheerio from "cheerio";
import pretty from "pretty";
import axios from "axios";

// scraper function
const url = "https://hidemy.name/en/proxy-list/";

const scrapeData = () => {
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
        urlGenerated.push(`https://hidemy.name/en/proxy-list/?start=${i}#list`);
      }
      console.log(urlGenerated);
    })
    .catch((err) => {
      console.log(err);
    });
};

scrapeData();
