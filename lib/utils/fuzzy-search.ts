/**
 * Simple fuzzy search implementation
 * @param text The text to search in
 * @param query The query to search for
 * @returns A score indicating how well the text matches the query (higher is better)
 */
export function fuzzySearch(text: string, query: string): number {
  // If the query is empty, return a high score
  if (!query) return 1

  // Convert both strings to lowercase for case-insensitive matching
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // If the text contains the exact query, give it a high score
  if (textLower.includes(queryLower)) {
    return 2
  }

  // Check if all characters in the query appear in the text in order
  let textIndex = 0
  let queryIndex = 0
  let matchCount = 0

  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      matchCount++
      queryIndex++
    }
    textIndex++
  }

  // Calculate a score based on how many characters matched and how close they are
  if (queryIndex === queryLower.length) {
    // All characters matched
    const matchRatio = matchCount / textLower.length
    return matchRatio
  }

  return 0 // No match
}

/**
 * Fuzzy search in an array of objects
 * @param items Array of objects to search in
 * @param query The query to search for
 * @param keys Object keys to search in
 * @returns Filtered and sorted array of objects
 */
export function fuzzySearchObjects<T>(items: T[], query: string, keys: (keyof T)[]): T[] {
  if (!query) return items

  return items
    .map((item) => {
      // Calculate the maximum score across all specified keys
      const score = Math.max(
        ...keys.map((key) => {
          const value = item[key]
          if (typeof value === "string") {
            return fuzzySearch(value, query)
          }
          return 0
        }),
      )

      return { item, score }
    })
    .filter(({ score }) => score > 0) // Only keep items with a positive score
    .sort((a, b) => b.score - a.score) // Sort by score (descending)
    .map(({ item }) => item) // Return just the items
}
