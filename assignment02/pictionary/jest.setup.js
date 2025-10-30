const {closeMongo} = require('./src/db/mongo')

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(async () => {
  await closeMongo()
})

