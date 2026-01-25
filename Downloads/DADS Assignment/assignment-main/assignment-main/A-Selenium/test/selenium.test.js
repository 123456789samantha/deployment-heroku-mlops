const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const { spawn } = require("child_process");

// Jest Test Suite
describe("User CRUD UI Flow", () => {
  // Set a longer timeout for Jest because browser automation can be slow.
  jest.setTimeout(30000);

  let driver;
  let serverProcess;

  // This runs once before any tests in this file
  beforeAll(async () => {
    // Start server.js so localhost:3000 is available (needed for both local + CI)
    serverProcess = spawn("node", ["server.js"], { stdio: "inherit" });

    // Wait a moment for the server to start
    await new Promise((r) => setTimeout(r, 1200));

    // Configure Chrome to run in headless mode (lab-style for pipeline)
    const options = new chrome.Options();
    options.addArguments("--headless=new");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--window-size=1280,800");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  // This runs once after all tests in this file have completed
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // A helper function to take a screenshot on failure
  const takeScreenshot = async (testName) => {
    const screenshotDir = "./screenshots";
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    const image = await driver.takeScreenshot();
    const safeTestName = testName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    fs.writeFileSync(`${screenshotDir}/${safeTestName}-failure.png`, image, "base64");
  };

  // Single test for assignment flow: Add -> Verify -> Delete -> Verify deleted
  test("should add a user, verify it appears, delete it, and verify it is removed", async () => {
    const uniqueName = `Test User ${Date.now()}`;
    const uniqueEmail = `test${Date.now()}@example.com`;

    try {
      // 1. Navigate to the web page
      await driver.get("http://localhost:3000");

      // 2. Wait for inputs to exist, then add a new user (IDs come from your index.html)
      await driver.wait(until.elementLocated(By.id("userName")), 10000);
      await driver.wait(until.elementLocated(By.id("userEmail")), 10000);

      await driver.findElement(By.id("userName")).clear();
      await driver.findElement(By.id("userName")).sendKeys(uniqueName);

      await driver.findElement(By.id("userEmail")).clear();
      await driver.findElement(By.id("userEmail")).sendKeys(uniqueEmail);

      await driver.findElement(By.css("#addUserForm button[type='submit']")).click();

      // 3. Wait for the user list and verify the user appears
      const userList = await driver.wait(until.elementLocated(By.id("userList")), 10000);

      await driver.wait(async () => {
        const text = await userList.getText();
        return text.includes(uniqueName) && text.includes(uniqueEmail);
      }, 10000);

      expect(await userList.getText()).toContain(uniqueName);

      // 4. Delete the user (click Delete button inside the matching row)
      const deleteBtn = await driver.findElement(
        By.xpath(
          `//div[contains(@class,'user-item')][contains(., "${uniqueName}") and contains(., "${uniqueEmail}")]//button[contains(@class,'delete-btn')]`
        )
      );
      await deleteBtn.click();

      // 5. Verify the user is removed
      await driver.wait(async () => {
        const text = await userList.getText();
        return !text.includes(uniqueName) && !text.includes(uniqueEmail);
      }, 10000);

      expect(await userList.getText()).not.toContain(uniqueName);
    } catch (err) {
      await takeScreenshot("user_crud_flow");
      throw err;
    }
  });
});
