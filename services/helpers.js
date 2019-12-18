const stringWithArticle = s => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const startsWithVowel = vowels.includes(s[0].toLowerCase());
  return startsWithVowel ? `an ${s}` : `a ${s}`;
};

module.exports = {
  stringWithArticle,
};