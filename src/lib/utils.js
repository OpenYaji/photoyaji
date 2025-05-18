/**
 * Utility functions for common tasks.
 */
const utils = {
  /**
   * Combines multiple class names into a single string, handling duplicates and falsy values.
   *
   * @param {...string} classes - The class names to combine.
   * @returns {string} - The combined class string.
   *
   * Example:
   * cn("class1", "class2", null, undefined, "class1", "class3"); // returns "class1 class2 class3"
   */
  cn(...classes) {
    const classSet = new Set();
    for (const cls of classes) {
      if (cls) { // Ignore null, undefined, empty strings, etc.
        const classNames = cls.split(/\s+/); // Split by spaces in case of multiple classes
        for (const className of classNames) {
          if (className) {
             classSet.add(className);
          }
        }
      }
    }
    return Array.from(classSet).join(' ');
  },
};

export const { cn } = utils;
export default utils;
