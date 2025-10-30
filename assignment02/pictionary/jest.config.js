module.exports = {
  testEnvironment: 'node',
  silent: true,                    // 进一步精简输出
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageReporters: ["text", "lcov", "html"], // 控制台、CI、可视化报告
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/db/", "/logs/"]
};
