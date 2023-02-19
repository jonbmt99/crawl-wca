const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const list_url = require("./total_url_singapore.json");
const auth = require("./auth.json");

var config = {
  method: 'get',
  url: '',
  headers: { 
    'Accept': '*/*', 
    'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
    'Connection': 'keep-alive',
    'Cookie': '', 
    'Sec-Fetch-Dest': 'empty', 
    'Sec-Fetch-Mode': 'cors', 
    'Sec-Fetch-Site': 'same-origin', 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 
    'X-Requested-With': 'XMLHttpRequest', 
    'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"', 
    'sec-ch-ua-mobile': '?0', 
    'sec-ch-ua-platform': '"macOS"'
  }
};


async function main(){
  console.log('total: ', list_url.length);
  let output = [];
  let i = 1;
  for(let url of list_url) {
    console.log('current_link: ', i);
    for (let [key, value] of Object.entries(auth)) {
  
      if(url.includes(key.trim())) {
        console.log('@@@');
        config.headers.Cookie = value;
      }
    }
    i++;
    config.url = url;
    await axios(config)
    .then(function (response) {
        let data = {};
          const $ = cheerio.load(response.data); // load HTML
    
          const company_name = $(".company_name").text();
          console.log('company_name: ', company_name.trim());
          data['company_name'] = company_name;
          $(".compid").each((index, el) => {
            const compid = $(el).find("span").text().split(' ')[1];
            data['company_id'] = compid;
            console.log(compid);
          });
    
          $(".profile_row").each((index, el) => {
            const label = $(el).find(".profile_label").text().replace(':', '').replace(' ', '');
            const value = $(el).find(".profile_val").text().trim().replace('\n', '');
            data[label] = data[label] ? data[label] + `\n ${value}` :value;
          });
          console.log('data: ', data);
          output.push(data);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  fs.writeFileSync('./data-v2/singapore.json', JSON.stringify(output, null, 2));
  console.log('done');
}

main();