export function sanitiseTypeaheadText(string, sanitisedQueryReplaceChars = [], trimEnd = true) {
  let sanitisedString = string.toLowerCase().replace(/\s\s+/g, ' ');

  sanitisedString = trimEnd ? sanitisedString.trim() : sanitisedString.trimStart();

  sanitisedQueryReplaceChars.forEach(char => {
    sanitisedString = sanitisedString.replace(new RegExp(char, 'g'), '');
  });

  return sanitisedString;
}

//#####add in reading in of json files
//#####files also need to be added in webpack

// export async function readJsonData(jsonFilename) {
//   const reader = new FileReader();
//   const filePath = '/Users/mccrer/Git/sdc-prototypes/src/prototypes/typeaheads-in-browser/code-lists/country-of-birth.json';
//   console.log(filePath);
//   const json = await reader.readAsText(filePath);
//   console.log(json);
//   return json;
// }

// export function loadJSON(path, success, error)
// {
//   const xhr = new XMLHttpRequest();
//   xhr.onreadystatechange = function()
//   {
//     if (xhr.readyState === XMLHttpRequest.DONE) {
//       if (xhr.status === 200) {
//         if (success)
//           success(JSON.parse(xhr.responseText));
//       } else {
//         if (error)
//           error(xhr);
//       }
//     }
//   };
//   xhr.open('GET', path, true);
//   xhr.send();
//}
