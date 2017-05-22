const Migration = require('./');
const { removeCampaignData } = require('../helpers');

class MigrateV2 extends Migration {
  constructor(client, collection) {
    super(client, collection);
  }

  pipe(data) {
    for (const item of data) {
      if (item.keen.timestamp !== item.keen.created_at) continue; // These are duplicates from the first migration attempt

      removeCampaignData(item);

      this.addEvent(item);
    }
  }
}

module.exports = MigrateV2;
