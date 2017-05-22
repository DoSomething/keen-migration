require('dotenv').config();
const Keen = require('keen-js');

const fromClient = new Keen({
  projectId: process.env.FROM_PROJECT_ID,
  readKey: process.env.FROM_READ_KEY,
});

const toClient = new Keen({
  projectId: process.env.TO_PROJECT_ID,
  writeKey: process.env.TO_WRITE_KEY,
});

const fromCollection = process.env.FROM_COLLECTION;
const toCollection = process.env.TO_COLLECTION;

const start = new Date(process.env.START_DATE);
const end = process.env.END_DATE ? new Date(process.env.END_DATE) : new Date();

// const INTERVAL = 8.64e7;
const INTERVAL = 1.08e7;
const totalDays = Math.ceil((end.getTime() - start.getTime()) / INTERVAL);

const migration = new (require(`./migrations/${process.env.MIGRATION}`))(toClient, toCollection);

const MIN_TIME = 6e3; // 10 seconds
let startTime = Date.now();

function extract(index) {
  if (index >= totalDays) {
    console.log('done');
    return;
  }

  console.log(`running (${index + 1}/${totalDays + 1})...`);

  startTime = Date.now();
  const dayStart = start.getTime() + (INTERVAL * index);
  const dayEnd = dayStart + (INTERVAL - 1);

  const timeframe = {
    start: new Date(dayStart).toUTCString(),
    end: new Date(dayEnd).toUTCString(),
  };

  const extraction = new Keen.Query('extraction', {
    eventCollection: fromCollection,
    timeframe,
  });

  fromClient.run(extraction, (err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    const { result } = res;
    migration.pipe(result);
    migration.dispatchEvents(() => {
      setTimeout(() => {
        extract(index + 1)
      }, Math.max(0, MIN_TIME - (Date.now() - startTime))); // Prevent API rate limits from crashing the app
    });
  });
}

Keen.ready(() => {
  extract(0);
});
