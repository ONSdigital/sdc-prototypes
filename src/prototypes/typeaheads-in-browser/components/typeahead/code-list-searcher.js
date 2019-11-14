import * as Fuse from 'fuse.js';

export default function queryJson(query, searchFields) {
  //#####pass in json from json file
  const list = JSON.parse(
    '[{"code": 4,"en-gb": "Afghanistan","cy": "Afghanistan"},{"code": 248,"en-gb": "Aland islands","cy": "ynysoedd Aland"},{"code": 8,"en-gb": "Albania","cy": "Albania"}]'
  );
  const fields = [searchFields];

  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 0,
    keys: fields
  };

  const fuse = new Fuse(list, options);
  const result = fuse.search(query);
  return result;
}
