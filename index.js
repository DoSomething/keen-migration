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

const DAY_TIME = 8.64e7;
const totalDays = Math.ceil((end.getTime() - start.getTime()) / DAY_TIME);

const migration = new (require(`./migrations/${process.env.MIGRATION}`))(toClient, toCollection);

function extract(index) {
  if (index >= totalDays) {
    console.log('done');
    return;
  }

  console.log(`running (${index + 1}/${totalDays + 1})...`);

  const dayStart = start.getTime() + (DAY_TIME * index);
  const dayEnd = dayStart + (DAY_TIME - 1);

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
    migration.dispatchEvents(() => extract(index + 1));
  });
}

Keen.ready(() => {
  extract(0);
});
