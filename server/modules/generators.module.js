const logger = require("../utils/logger.utils");
const moment = require('moment-timezone');

const { WEATHER } = require("../generators/weather.generator");
const { NEWS } = require("../generators/news.generator");
const { XMLTVPARSE } = require("../generators/xmltvmerge.generator");

const GENERATION = async () => {
//   WEATHER();
//  NEWS();
XMLTVPARSE()
}

module.exports = {
    GENERATION
};
