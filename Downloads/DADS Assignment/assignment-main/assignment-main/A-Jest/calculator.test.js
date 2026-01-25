// calculator.test.js 
const calculator = require('./calculator'); 
 
describe('Calculator Module', () => { 
 
  test('should add two numbers correctly', () => { 
    // Arrange: Set up your variables 
    const num1 = 20; 
    const num2 = 15; 
 
    // Act: Call the function you are testing 
    const result = calculator.add(num1, num2); 
 
    // Assert: Check if the result is what you expect 
    expect(result).toBe(35); 
  }); 
 
  it('should subtract two numbers correctly', () => { 
    expect(calculator.subtract(50, 23)).toBe(27); 
  }); 
}); 