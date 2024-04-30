module.exports = {
  getPriceFromObj,
  getPriceFromHtml,
  getAreaFromObj,
  getAreaFromHtml,
  getBathRoomsFromObj,
  getBathRoomsFromHtml,
  getBedRoomsFromObj,
  getBedRoomsFromHtml,
  getLatLongFromObj,
  getRentZestimateFromObj,
  getDaysOnZillowFromObj,
  getDaysOnZillowFromHtml,
  getDescriptionFromHtml,
  getContactsFromHtml,
};

function getPriceFromObj(obj) {
  if (obj.unformattedPrice) {
    return obj.unformattedPrice;
  }
  if (obj.hdpData && obj.hdpData.homeInfo.price) {
    return obj.hdpData.homeInfo.price;
  }
  if (obj.units && obj.units[0].price) {
    const price = obj.units[0].price.match(/\d+/)[0];
    return price.replace(/,/g, '');
  }
  return '';
}

function getPriceFromHtml($) {
  const price = $('span[data-testid="price"]').text();
  return price || '';
}

function getAreaFromObj(obj) {
  if (obj.area) {
    return obj.area;
  }
  if (obj.hdpData && obj.hdpData.homeInfo.livingArea) {
    return obj.hdpData.homeInfo.livingArea;
  }
  return '';
}

function getAreaFromHtml($) {
  const sqft = $('span[data-testid="bed-bath-beyond"]')
    .find('span[data-testid="bed-bath-item"]:contains("sqft")')
    .text()
    .match(/\d+/);
  return sqft ? sqft[0] : '';
}

function getBathRoomsFromObj(obj) {
  if (obj.baths) {
    return obj.baths;
  }
  if (obj.hdpData && obj.hdpData.homeInfo.bathrooms) {
    return obj.hdpData.homeInfo.bathrooms;
  }
  return '';
}

function getBathRoomsFromHtml($) {
  const baths = $('button span[data-testid="bed-bath-item"] strong').text();
  return baths || '';
}

function getBedRoomsFromObj(obj) {
  if (obj.beds) {
    return obj.beds;
  }
  if (obj.hdpData && obj.hdpData.homeInfo.bedrooms) {
    return obj.hdpData.homeInfo.bedrooms;
  }
  if (obj.units && obj.units[0].beds) {
    return obj.units[0].beds;
  }
  return '';
}

function getBedRoomsFromHtml($) {
  const beds = $('span[data-testid="bed-bath-beyond"] span[data-testid="bed-bath-item"] strong').text();
  return beds || '';
}

function getLatLongFromObj(obj) {
  if (obj.latLong) {
    return { lat: obj.latLong.latitude, lng: obj.latLong.longitude };
  }
  return '';
}

function getRentZestimateFromObj(obj) {
  if (obj.hdpData && obj.hdpData.homeInfo.rentZestimate) {
    return obj.hdpData.homeInfo.rentZestimate;
  }
  return '';
}

function getDaysOnZillowFromObj(obj) {
  if (obj.hdpData && obj.hdpData.homeInfo.daysOnZillow) {
    return obj.hdpData.homeInfo.daysOnZillow;
  }
  return '';
}

function getDaysOnZillowFromHtml($) {
  const daysListed = $('div.ds-expandable-card-content dl')
    .filter(function () {
      return $(this).text().trim().includes('days listed');
    })
    .find('dt:first-child')
    .text();
  return daysListed || '';
}

function getDescriptionFromHtml($) {
  let description = $('[data-test-id="bdp-description"]').text();
  if (!description) {
    description = $('div[data-zon="commute"]').next('div').text();
  }
  return description || '';
}

function getContactsFromHtml($) {
  const contacts = $('div.ds-expandable-card-content dl')
    .filter(function () {
      return $(this).text().trim().includes('days listed');
    })
    .find('dt:nth-child(3)')
    .text();
  return contacts || '';
}
