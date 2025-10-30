const { signIn, signOut, signUp, deleteAccount } = require('./actions/auth.action')
const { self } = require('./actions/room.action')
const Room = require('./actions/room.action')
const { params } = require('./parameters')

let owner_cookie, member_cookie;
let roomId;

const uniq = () => Date.now().toString().slice(-6);

describe('Room flow', () => {
  it.only('owner signs up & in', async () => {
    const email = `owner_${uniq()}@test.com`
    const r1 = await signUp('OwnerA', 'Pass#123', email);
    expect(r1).toHaveProperty('code', 0);
    const { cookies, body } = await signIn(email, 'Pass#123');
    expect(body).toHaveProperty('code', 0);
    owner_cookie = cookies[0];
  });

  // --- Create room ---
  it.only('owner creates a room', async () => {
    const payload = { name: 'Lobby One', maxPlayers: 4, visibility: 0 };
    const body = await Room.create(owner_cookie, payload);
    expect(body).toHaveProperty('code', 0);
    expect(body).toHaveProperty('body');
    expect(body.body).toHaveProperty('_id');
    roomId = body.body._id;
  });

  it.only('list rooms shows the new room', async () => {
    const body = await Room.list(owner_cookie, 'page=1&size=10&state=1'); // state=WAITING
    expect(body).toHaveProperty('code', 0);
    expect(Array.isArray(body.body.list)).toBe(true);
    expect(body.body.list.find(r => String(r._id) === String(roomId))).toBeTruthy();
  });


  it.only('member signs up & in', async () => {
    const email = `member_user${uniq()}@test.com`
    const s = await signUp('MemberB', 'Pass#123', email);
    expect(s).toHaveProperty('code', 0);
    const { cookies, body } = await signIn(email, 'Pass#123');
    expect(body).toHaveProperty('code', 0);
    member_cookie = cookies[0];
  });

  it.only('member joins the room', async () => {
    const body = await Room.join(member_cookie, roomId);
    expect(body).toHaveProperty('code', 0);
    const membersCount = body.body.members?.length ?? body.body.members?.size ?? 0;
    expect(membersCount).toBeGreaterThanOrEqual(2);
  });

  // --- Start by owner ---
  it.only('owner starts the room', async () => {
    const body = await Room.start(owner_cookie, roomId);
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('state'); // should be ONGOING
  });

  // member leaves (room still exists)
  it.only('member leaves (room continues)', async () => {
    const body = await Room.leave(member_cookie, roomId);
    expect(body).toHaveProperty('code', 0);
    // when closed=false, body.body is the updated room
    if (body.body && body.body.room) {
      expect(body.body.closed).toBe(false);
    }
  });

  // owner leaves => room closes
  it.only('owner leaves (room closes)', async () => {
    const body = await Room.leave(owner_cookie, roomId);
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('message');
    expect(body.body.message).toMatch(/Room closed/i);
  });

  // cleanup accounts
  it.only('delete both accounts', async () => {
    let b1 = await deleteAccount(owner_cookie);
    expect(b1).toHaveProperty('code', 0);
    let b2 = await deleteAccount(member_cookie);
    expect(b2).toHaveProperty('code', 0);
  });
});