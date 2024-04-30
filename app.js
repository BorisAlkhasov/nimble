require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const objectsToCsv = require('objects-to-csv');
const fs = require('fs');

const dataHelper = require('./helpers/dataHelpers');

const app = express();
app.use(bodyParser.json());

async function scrapPage(url) {
  try {
    const htmlContent = await getHtmlContent(url);
    if (!htmlContent) {
      return;
    }
    const $ = cheerio.load(htmlContent);
    const cat1Object = $('#__NEXT_DATA__[type="application/json"]:contains("cat1")').html();
    const cat1Data = JSON.parse(cat1Object);
    const { listResults } = cat1Data.props.pageProps.searchPageState.cat1.searchResults;
    listResults.map((item) => setAppartmentData(item));
    // setAppartmentData(listResults[0]);
    // setAppartmentData(listResults[1]);
  } catch (error) {
    console.log(`Error occured\n${error}`);
  }
}

scrapPage(
  'https://www.zillow.com/mi/rentals/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-89.05549614930489%2C%22east%22%3A-80.71137993836739%2C%22south%22%3A40.90918406361832%2C%22north%22%3A46.0883091766011%7D%2C%22mapZoom%22%3A8%2C%22usersSearchTerm%22%3A%22MI%22%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A30%2C%22regionType%22%3A2%7D%5D%2C%22filterState%22%3A%7B%22fr%22%3A%7B%22value%22%3Atrue%7D%2C%22fsba%22%3A%7B%22value%22%3Afalse%7D%2C%22fsbo%22%3A%7B%22value%22%3Afalse%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22cmsn%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%2C%22mp%22%3A%7B%22min%22%3A1000%2C%22max%22%3A2000%7D%2C%22tow%22%3A%7B%22value%22%3Afalse%7D%2C%22mf%22%3A%7B%22value%22%3Afalse%7D%2C%22con%22%3A%7B%22value%22%3Afalse%7D%2C%22land%22%3A%7B%22value%22%3Afalse%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%2C%22apa%22%3A%7B%22value%22%3Afalse%7D%2C%22manu%22%3A%7B%22value%22%3Afalse%7D%2C%22apco%22%3A%7B%22value%22%3Afalse%7D%2C%22r4r%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22isListVisible%22%3Atrue%7D'
);

async function setAppartmentData(listResult) {
  const url = listResult.detailUrl;
  if (!listResult.detailUrl) {
    return undefined;
  }
  if (!listResult.detailUrl.startsWith('http')) {
    listResult.detailUrl = `https://www.zillow.com${listResult.detailUrl}`;
  }
  const html_content = await getHtmlContent(listResult.detailUrl);
  const $ = cheerio.load(html_content);
  const newData = getData(listResult, $);
  if (newData) {
    addToCsv(newData);
  }
}

function addToCsv(obj) {
  const fileName = './apertments.csv';
  let append = false;
  if (fs.existsSync(fileName)) {
    append = true;
  }
  new objectsToCsv([obj]).toDisk(fileName, { append: append });
}

function getData(listResult, $) {
  const newData = {};
  newData.zpid = listResult.zpid;
  newData.address = listResult.address;
  newData.city = listResult.addressCity;
  newData.state = listResult.addressState;
  newData.zip = listResult.addressZipcode;

  const sqft = dataHelper.getAreaFromObj(listResult);
  newData.sqft = sqft || dataHelper.getAreaFromHtml($);

  const baths = dataHelper.getBathRoomsFromObj(listResult);
  newData.baths = baths || dataHelper.getBathRoomsFromHtml($);

  const beds = dataHelper.getBedRoomsFromObj(listResult);
  newData.beds = beds || dataHelper.getBedRoomsFromHtml($);

  const latLng = dataHelper.getLatLongFromObj(listResult);
  newData.lat = latLng && latLng.lat;
  newData.lng = latLng && latLng.lng;

  const price = dataHelper.getPriceFromObj(listResult);
  newData.rent = price || dataHelper.getPriceFromHtml($);

  newData.zrent = dataHelper.getRentZestimateFromObj(listResult);
  newData.url = listResult.detailUrl;
  newData.description = dataHelper.getDescriptionFromHtml($);

  const days_on_zillow = dataHelper.getDaysOnZillowFromObj(listResult);
  newData.days_on_zillow = days_on_zillow || dataHelper.getDaysOnZillowFromHtml($);

  newData.contacts = dataHelper.getContactsFromHtml($);

  return newData;
}

async function getHtmlContent(url) {
  const urlApi = 'https://api.webit.live/api/v1/realtime/web';
  const headers = {
    Authorization: `Basic ${process.env.API_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const data = {
    url: url,
    method: 'GET',
    parse: true,
    render: true,
    format: 'json',
    country: 'US',
    locale: 'en-US',
    render_flow: [
      {
        infinite_scroll: {
          delay_after_scroll: 2000,
          duration: 15000,
        },
      },
    ],
  };

  const response = await axios.post(urlApi, data, { headers });

  if (response.status === 200 && response.data.html_content) {
    return response.data.html_content;
  }

  return undefined;
}
