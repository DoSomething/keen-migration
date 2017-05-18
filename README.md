## keen-migration

This tool is used to migrate breaking changes in a Keen.Io schema.

### Setup

```sh
$ npm install
$ cp .env.example .env
```

### Configuration

Make sure to update the .env file with the proper settings. There are sets of **TO** and **FROM** properties, which correspond to the Keen project you want to extract data from the the Keen project you want to put data into.

```
FROM_PROJECT_ID=
FROM_READ_KEY=
FROM_COLLECTION=
```

You also need to specify the start date (eg: 2017-04-17T00:00:00.000Z) and the end date will default to the current day if not specified.

Finally, you need tell it what migration to run. The name of the migration should match a .js file in the migrations folder and the BATCH_SIZE can be optionally configured depending on the size of your events. Keen has a limit of 10MB per batch, so you'll need to do the math on your own or just go with the default (20) to be safe!

### Process

1. Create a new Keen project (eg: Phoenix 2) and leave your old one untouched.
2. Ship your new data spec to production, switch out credentials to start collecting data in the new project.
3. Write a migration in the `/migrations` folder to update the legacy events from your previous Keen project. (Use a sandbox project for testing it!)
4. Run the migration!

### Developing a migration

First, create a new .js file in the `/migrations` folder with a descriptive name of what you're doing. With that, make a new class that extends the base migration class, and export that as a module. Here is an example template,

```js
const Migration = require('./');

class ExampleMigration extends Migration {
  constructor(client, collection) {
    super(client, collection);
  }

  pipe(data) {
    for (const item of data) {
      if (!item.newProperty) {
        item.newProperty = ':wave:';
        delete item.oldProperty;
      }

      this.addEvent(item);
    }
  }
}

module.exports = ExampleMigration;
```

The critical concepts here are,

- Checking if the data is legacy format or not,
- If it is, updating it with the correct format & deleting the old data.
- Pushing all events to `this.addEvent`. This function will prep the event under the hood by removing certain Keen field conflicts. Additionally, it's what allows the tool to send off all your data automatically in batch sizes.
