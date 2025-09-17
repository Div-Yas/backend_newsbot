import axios from "axios";
import xml2js from "xml2js";
import dotenv from "dotenv";

dotenv.config();

const BACKEND_INGEST_URL = `${process.env.BACKEND_URL}api/news/ingest`;

const RSS_FEEDS = [
  "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml"
];



async function parseRSS(url) {
  try {
    const res = await axios.get(url);
    const parsed = await xml2js.parseStringPromise(res.data);
    const items = parsed.rss.channel[0].item;
    return items.map(item => ({
      title: item.title[0],
      url: item.link[0],
      content: item.description ? item.description[0] : ""
    }));
  } catch (err) {
    console.error("RSS parse error:", err.message);
    return [];
  }
}

async function fetchArticles() {
  let articles = [];
  for (const feed of RSS_FEEDS) {
    const feedArticles = await parseRSS(feed);
    articles = articles.concat(feedArticles);
  }
  return articles.slice(0, 50);
}

async function ingestArticles(articles) {
  try {
    const res = await axios.post(BACKEND_INGEST_URL, { articles });
    console.log("Ingest response:", res.data);
  } catch (err) {
    console.error("Ingestion error:", err.response?.data || err.message);
  }
}

(async () => {
  const articles = await fetchArticles();
  console.log("Fetched articles:", articles.length);
  await ingestArticles(articles);
})();
