class Migration {
  constructor(client, project) {
    this.client = client;
    this.project = project;
  }

  pipe(data, callback) {
    // ...
    callback();
  }
}

module.exports = Migration;
