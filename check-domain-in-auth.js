const auth = require("./auth.json");
const list_domain = require("./list_domain.json");

function main() {
  let domain_no_auth = [];
  for (let domain of list_domain) {
    let check_domain = domain.split('.')[0];
    let keys = Object.keys(auth);
    if (!keys.includes(check_domain.trim())){
        domain_no_auth.push(domain);
    }
  }
  console.log('domain_no_auth: ', domain_no_auth);
}

main();
