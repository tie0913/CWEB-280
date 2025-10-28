// jest.setup.js
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  // 如需更安静，连 warn 也 mute：
  // jest.spyOn(console, 'warn').mockImplementation(() => {});
});

// 如果后续某些测试需要开启日志，可在对应测试里：console.log.mockRestore()
