class Migration {
  constructor(client, collection) {
    this.client = client;
    this.collection = collection;

    this.events = [];
    this.batches = [];
    this._dispatches = 0;

    this._dispatchBatch = this._dispatchBatch.bind(this);

    this.dispatchEvents = this.dispatchEvents.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.pipe = this.pipe.bind(this);
  }

  pipe(data) {
    // ...
  }

  addEvent(event) {
    // Avoid Keen conflicts
    delete event.keen.id;
    delete event.keen.created_at;

    this.events.push(event);
  }

  dispatchEvents(callback) {
    const batchSize = 20;

    for (let i = 0; i < this.events.length; i++) {
      const batchIndex = Math.floor(i / (parseInt(process.env.BATCH_SIZE) || 20));
      if (!this.batches[batchIndex]) this.batches[batchIndex] = [];

      this.batches[batchIndex].push(this.events[i]);
    }

    this._dispatchBatch(callback);
  }

  _dispatchBatch(callback, last = false) {
    if (last) {
      console.log('all events dispatched');
      this.events = [];
      callback();
      return;
    }

    const batch = this.batches.pop();
    if (!batch) {
      return;
    }

    console.log(`${this.batches.length} batches remaining...`);

    const data = { [this.collection]: batch };
    this.client.addEvents(data, (err, res) => {
      if (err) console.log(err);
      this._dispatchBatch(callback, this.batches.length === 0);
    });
  }
}

module.exports = Migration;
