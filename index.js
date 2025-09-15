const assert = require('assert');

function twoSum(nums, target) {
  const numMap = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in numMap) {
      return [numMap[complement], i];
    }
    numMap[nums[i]] = i;
  }
  return [];
}

// Public test cases
const publicTestCases = [
  { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1], case_no: 1 },
  { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2], case_no: 2 },
  { input: { nums: [3, 3], target: 6 }, output: [0, 1], case_no: 3 },
  { input: { nums: [1, 5, 1, 5], target: 10 }, output: [1, 3], case_no: 4 },
];

// Test execution function
function executeTests() {
  const results = {
    total: publicTestCases.length,
    passed: 0,
    failed: 0,
    errors: 0,
    details: [],
  };

  publicTestCases.forEach((testCase, index) => {
    const testResult = {
      index: index + 1,
      description: testCase.description || `Test case ${index + 1}`,
      status: 'failed',
      expected: testCase.output, // Use 'output' field from JSON
      actual: null,
      error: null,
    };

    try {
      // Handle the input structure - extract values from the input object
      const inputValues = Object.values(testCase.input);
      const result = twoSum(...inputValues);
      testResult.actual = result;

      // Use assert.deepStrictEqual for proper object comparison
      assert.deepStrictEqual(result, testCase.output);

      testResult.status = 'passed';
      results.passed++;
    } catch (error) {
      if (error.name === 'AssertionError') {
        testResult.status = 'failed';
        testResult.error = `Expected: ${JSON.stringify(testCase.output)}, Got: ${JSON.stringify(testResult.actual)}`;
        results.failed++;
      } else {
        testResult.status = 'error';
        testResult.error = error.message;
        results.errors++;
      }
    }

    results.details.push(testResult);
  });

  return results;
}

// Execute and return results
const testResults = executeTests();
console.log(JSON.stringify(testResults, null, 2));

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { twoSum, executeTests, testResults };
}
