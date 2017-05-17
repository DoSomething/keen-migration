const Migration = require('./');

// From: https://github.com/DoSomething/phoenix-next/pull/261/files

const paths = {
   community: '/',
   action: '/action',
   pages: '/pages/',
 };

function getRouteName(route) {
  // When doing path comparisons, we want the least specific
  // (eg: '/') paths at the end of the array.
  const pathValues = Object.values(paths).sort((pathA, pathB) => pathB.length - pathA.length);

  // Check if /pages/faq starts with /pages/.
  const match = pathValues.find(path => route.startsWith(path));
  if (! match) return 'undefined route';

  // Find the display name for the matched path value.
  // This is a bit crazy because we need to find the index
  // in the `paths` object and the `pathValues` array is in
  // a different order.
  let name = Object.keys(paths)[Object.values(paths).findIndex(path => path === match)];
  if (name === 'pages') {
    // Remove /pages/ from /pages/faq
    // Not the most fullproof solution in the world but should suffice.
    name = route.replace(match, '');
  }

  return name;
}

function getActualPath(path) {
  const split = path.split('/us/campaigns/')[1];
  const campaign = split.indexOf('/');
  const fixed = campaign === -1 ? '/' : split.slice(campaign);

  return fixed;
}

class Test extends Migration {
  constructor(client, project) {
    super(client, project);
  }

  pipe(data, callback) {
    const fixedData = [];
    for (const item of data) {
      const pathname = getActualPath(item.page.path);
      const page = getRouteName(pathname);
      const referer = item.page.referer;

      item.routing = { pathname, page, referer };
      delete item.page;

      // Avoid Keen conflicts
      delete item.keen.id;
      delete item.keen.created_at;

      fixedData.push(item);
    }

    const pushData = () => {
      if (fixedData.length === 0) {
        console.log('pushed events');
        callback();
        return;
      }

      this.client.addEvent(this.project, fixedData.pop(), (err, res) => {
        if (err) console.log(err);
        else console.log(fixedData.length)
        pushData();
      });
    }

    pushData();
  }
}

module.exports = Test;
