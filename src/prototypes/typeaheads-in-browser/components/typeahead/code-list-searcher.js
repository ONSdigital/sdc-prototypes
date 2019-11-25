import * as Fuse from 'fuse.js';

export default function queryJson(query, data, searchFields) {
  console.log(data);
  data.then(jsonData => {
    const list = jsonData;
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
    console.log(result);
    return result;
  });
}
