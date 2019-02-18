import { orderBy } from 'lodash';

export function navigationHelper({ pages, ignorePaths }) {
  if (ignorePaths) {
    pages = pages.filter(page => !ignorePaths.includes(page.url) && page.url.split('/').length === 3);
  }

  const groups = [];

  pages.forEach(page => addToGroup(groups, page));

  groups.forEach(group => group.items = orderBy(group.items, 'sortOrder'));

  return groups;
}

function addToGroup(groups, page) {
  const groupName = page.group || '';
  let group = groups.find(group => group.title === groupName);

  if (!group) {
    group = {
      title: page.group,
      items: []
    };

    groups.push(group);
  }

  page.text = page.title;

  group.items.push(page);
}
