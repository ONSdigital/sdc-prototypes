export function possessiveSetter(string) {
  const placeholder = '{possessive}';
  const regex = new RegExp(placeholder, 'g');
  let result;
  
  while ((result = regex.exec(string))) {
    const index = result.index;
    const precedingCharacter = string.charAt(index - 1);

    const possessive = precedingCharacter === 's' ? '\'' : '\'s';
    
    string = string.replace(placeholder, possessive);
  }

  return string;
}
