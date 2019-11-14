import * as Fuse from 'fuse.js';

export default function queryJson(query) {
  const list = JSON.parse(
    '[{ "code":"01", "en-gb":"germany", "cy":"almain"},{ "code":"02", "en-gb":"wales", "cy":"cymru"},{ "code":"03", "en-gb":"scotland", "cy":"alm"},{ "code":"04", "en-gb":"german", "cy":"alg"}]'
  );
  const fields = ['en-gb'];

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
