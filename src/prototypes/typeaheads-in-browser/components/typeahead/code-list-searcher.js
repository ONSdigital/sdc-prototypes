import * as Fuse from 'fuse.js';

export function queryJson() {
  const list = JSON.parse('[{ "name":"John", "age":30, "city":"New York"},{ "name":"jim", "age":29, "city":"cardiff"}]');
  const query = '29';
  const fields = ['name', 'age', 'city'];

  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: fields
  };
  const fuse = new Fuse(list, options);
  const result = fuse.search(query);
  return result;
}
