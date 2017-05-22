const Migration = require('./');
const { getActualPath, getRouteName, removeCampaignData } = require('../helpers');

class MigrateV1 extends Migration {
  constructor(client, collection) {
    super(client, collection);
  }

  pipe(data) {
    for (const item of data) {
      // Update routing schema if its still using old path logic
      if (!item.routing) {
        const pathname = getActualPath(item.page.path);
        const page = getRouteName(pathname);
        const referer = item.page.referer;

        item.routing = { pathname, page, referer };
        delete item.page;
      }

      // Remove extra campaign data
      removeCampaignData(item);

      this.addEvent(item);
    }
  }
}

module.exports = MigrateV1;
