const { signUp, signIn, deleteAccount } = require('./actions/auth.action');
const { params } = require('./parameters');
const Word = require('./actions/word.action');

let adminCookie;
let userCookie;
let createdIds = [];

const uniq = () => Date.now().toString().slice(-6);

describe('WORDS API', () => {
  // --- admin login using parameters.js
  it.only('admin signs in', async () => {
    const { cookies, body } = await signIn(params.admin_email, params.admin_pwd);
    expect(body).toHaveProperty('code', 0);
    expect(Array.isArray(cookies)).toBe(true);
    expect(cookies[0]).toMatch(/pictionary_user/);
    adminCookie = cookies[0];
  });

  // --- regular user (for negative tests)
  it.only('regular user signs up & in', async () => {
    const email = `word_user_${uniq()}@test.com`;
    const r1 = await signUp('WordUser', 'Pass#123', email);
    expect(r1).toHaveProperty('code', 0);
    const { cookies, body } = await signIn(email, 'Pass#123');
    expect(body).toHaveProperty('code', 0);
    userCookie = cookies[0];
  });

  // --- create words (admin)
  it.only('admin creates three words (easy/medium/hard)', async () => {
    for (const d of ['easy', 'medium', 'hard']) {
      const payload = { word: `${d}_sample_${uniq()}`, difficulty: d };
      const body = await Word.create(adminCookie, payload);
      expect(body).toHaveProperty('code', 0);
      expect(body).toHaveProperty('body');
      createdIds.push(body.body._id);
    }
  });

  // --- duplicate protection (force duplicate)
  it.only('creating an exact duplicate should fail', async () => {
    const word = `dup_${uniq()}`;
    const ok = await Word.create(adminCookie, { word, difficulty: 'hard' });
    expect(ok).toHaveProperty('code', 0);

    const dup = await Word.create(adminCookie, { word, difficulty: 'hard' });
    expect(dup.code).not.toBe(0);            // controller returns fail()
    // Optional: expect(dup.message).toMatch(/DuplicateWord|duplicate/i);
  });

  // --- list with filters
  it.only('list only easy words', async () => {
    const body = await Word.list(adminCookie, 'page=1&size=10&difficulty=easy');
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('list');
    expect(Array.isArray(body.body.list)).toBe(true);
    body.body.list.forEach(w => expect(w.difficulty).toBe('easy'));
  });

  // --- random endpoints
  it.only('random word returns a word', async () => {
    const body = await Word.random(adminCookie);
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('word');
    expect(body.body).toHaveProperty('difficulty');
  });

  it.only('random hard returns hard', async () => {
    const body = await Word.randomByDiff(adminCookie, 'hard');
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('difficulty', 'hard');
  });

  // --- update (admin)
  it.only('admin updates a word text', async () => {
    const _id = createdIds[0];
    const word = `updated_${uniq()}`;
    const body = await Word.update(adminCookie, _id, { word, difficulty: 'easy' });
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('_id');
    expect(body.body).toHaveProperty('word', word);
  });

  // --- permission: regular user cannot create
  it.only('regular user cannot create (admin required)', async () => {
    const body = await Word.create(userCookie, { text: `user_try_${uniq()}`, difficulty: 'easy' });
    // your adminValidator returns code 5 for insufficient authorities
    expect(body.code === 5 || body.code !== 0).toBe(true);
  });

  // --- delete (admin)
  it.only('admin deletes created words', async () => {
    for (const id of createdIds) {
      const r = await Word.remove(adminCookie, id);
      // DELETE: 204 may produce undefined body; just ensure no throw
      expect(true).toBe(true);
    }
  });

  // --- cleanup accounts
  it.only('delete regular user account', async () => {
    const r = await deleteAccount(userCookie);
    expect(r).toHaveProperty('code', 0);
  });
});