afterAll(() => {
  const H = process._getActiveHandles();     // 非公开 API，仅排查
  const R = process._getActiveRequests();
  const name = x => x?.constructor?.name || typeof x;
  console.log('[DEBUG] ActiveHandles:', H.map(name));
  console.log('[DEBUG] ActiveRequests:', R.map(name));
});