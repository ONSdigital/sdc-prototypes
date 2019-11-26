import * as Fuse from 'fuse.js';

export default function queryJson(query, data, searchFields) {
  const list = data;
  const fields = [searchFields];

  const options = {
    shouldSort: true,
    threshold: 0.3,
    location: 0,
    distance: 0,
    keys: fields
  };

  const fuse = new Fuse(list, options);
  const result = fuse.search(query);
  return result;
}
