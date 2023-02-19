const list_country_code = require("./country-code.json");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const config = {
  method: "get",
  url: "https://www.wcaworld.com/Directory?siteID=24&au=m&pageIndex=i&pageSize=100&searchby=CountryCode&country=${country_code}&city=&keyword=&orderby=CountryCity&networkIds=1&networkIds=2&networkIds=3&networkIds=4&networkIds=61&networkIds=98&networkIds=108&networkIds=118&networkIds=5&networkIds=22&networkIds=13&networkIds=18&networkIds=15&networkIds=16&networkIds=38&networkIds=103&networkIds=116&layout=v1&submitted=search",
};
const main_domain = "https://www." + getDomain(config.url);

let output = [];
let list_domain = [];

function getDomain(url, subdomain) {
  subdomain = subdomain || false;

  url = url.replace(/(https?:\/\/)?(www.)?/i, "");

  if (!subdomain) {
    url = url.split(".");

    url = url.slice(url.length - 2).join(".");
  }

  if (url.indexOf("/") !== -1) {
    return url.split("/")[0];
  }

  return url;
}

async function main() {
  console.log('start');
  const country_name = process.argv.splice(2).join(" ");
  console.log("country_name: ", country_name);
  const country_obj = list_country_code.find(
    (row) => row.Name === country_name
  );
  if (!country_obj) {
    console.log("Không tìm thấy tên nước phù hợp");
    return;
  }
  const country_code = country_obj.Code;
  let url_base = `https://www.wcaworld.com/Directory?siteID=24&au=m&pageIndex=i&pageSize=100&searchby=CountryCode&country=${country_code}&city=&keyword=&orderby=CountryCity&networkIds=1&networkIds=2&networkIds=3&networkIds=4&networkIds=61&networkIds=98&networkIds=108&networkIds=118&networkIds=5&networkIds=22&networkIds=13&networkIds=18&networkIds=15&networkIds=16&networkIds=38&networkIds=103&networkIds=116&layout=v1&submitted=search`;
  for (let i = 1; i <= 100; i++) {
    let url = url_base.replace("pageIndex=i", `pageIndex=${i}`);
    config.url = url;

    let count = 0;
    await axios(config)
      .then(function (response) {
        const $ = cheerio.load(response.data); // load HTML
        $(".directoyname").each((index, el) => {
          let href = $(el).find("a")[0].attribs["href"];
          const domain = getDomain(href);
          if (domain == "") {
            href = main_domain + href;
          }
          list_domain.push(domain);
          output.push(href);
          count++;
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    if (count === 0) {
      break;
    }
    console.log("page ", i, "done");
  }

  list_domain = [...new Set(list_domain)];
  fs.writeFileSync(
    `./list_domain_country/list_domain_${country_name}.json`,
    JSON.stringify(list_domain, null, 2)
  );
  fs.writeFileSync(
    `./total-url-by-country/total_url_${country_name}.json`,
    JSON.stringify(output, null, 2)
  );
  console.log("total: ", output.length);
}

main();
