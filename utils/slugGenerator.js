/**
 * Slug Generator Utility
 * Generates URL-friendly slugs from titles and calculates reading time
 */

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to slug
 * @returns {string} - The generated slug
 */
function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate reading time from content
 * @param {string} content - The blog content
 * @returns {string} - Reading time in format "X min read"
 */
function calculateReadingTime(content) {
  if (!content) return '1 min read';
  
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return `${minutes} min read`;
}

/**
 * Generate a unique slug by checking against existing slugs
 * @param {string} title - The title to convert to slug
 * @param {Array} existingSlugs - Array of existing slugs to check against
 * @returns {string} - A unique slug
 */
function generateUniqueSlug(title, existingSlugs = []) {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;
  
  // Keep incrementing until we find a unique slug
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

module.exports = {
  generateSlug,
  calculateReadingTime,
  generateUniqueSlug
};
