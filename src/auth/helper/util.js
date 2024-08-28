function levenshteinDistance(word1, word2) {
  const matrix = [];

  for (let i = 0; i <= word2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= word1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= word2.length; i++) {
    for (let j = 1; j <= word1.length; j++) {
      if (word2.charAt(i - 1) == word1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[word2.length][word1.length];
}

const isSimilar = (str1, str2, threshold) => {
  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);
  const similarityPercentage = ((maxLength - distance) / maxLength) * 100;
  return similarityPercentage >= threshold;
};

const getSessionExpiryTimestamp = (expiryTimeInSeconds) => {
  // Get the current time in seconds (Unix timestamp)
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  // Calculate the expiry time by adding the provided expiry time to the current time
  const expiryTimestamp = currentTimeInSeconds + expiryTimeInSeconds;

  return expiryTimestamp;
};

const isEmpty = (value) => {
  if (value === null) {
    return true;
  } else if (typeof value !== "number" && value === "") {
    return true;
  } else if (value === "undefined" || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === "object" &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  isSimilar,
  isEmpty,
  getSessionExpiryTimestamp,
};
