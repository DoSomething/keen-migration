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

function removeCampaignData(item) {
  const legacyCampaignId = item.campaign.legacyCampaignId;
  item.campaign = { legacyCampaignId };
}

module.exports = {
  paths,
  getRouteName,
  getActualPath,
  removeCampaignData,
};
