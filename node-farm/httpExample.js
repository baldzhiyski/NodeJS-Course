const http = require("http");
const fs = require("fs");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/template");

// Top level code, executes only once.
const products = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const parsed = JSON.parse(products);

console.log(slugify("Fresh Avocados ", { lower: true }));

// Server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/overview" || pathname === "/") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    // Create the card elements and add all cards to the overview page
    const cardsHtml = parsed
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);

    // Product Page
  } else if (pathname === "/product") {
    const product = parsed[query.id];
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const out = replaceTemplate(tempProduct, product);
    res.end(out);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(products);

    // Not Found Page
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
