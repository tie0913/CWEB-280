const {signIn, signOut, signUp, deleteAccount} = require('./actions/auth.action')
const {self} = require('./actions/room.action')
const Room = require('./actions/room.action')
const {params} = require('./parameters')

let owner_cookie, member_cookie;
let roomId;

describe('Room flow', () => {
  it('owner signs up', async () => {
    const body = await signUp('Owner A', 'Pass#123', 'owner_a@test.com');
    expect(body).toHaveProperty('code', 0);
  });

  it('owner signs in', async () => {
    const { cookies, body } = await signIn('owner_a@test.com', 'Pass#123');
    expect(body).toHaveProperty('code', 0);
    ownerCookie = cookies[0];
    expect(ownerCookie).toMatch(/pictionary_user/);
  });

  // --- Create room ---
  it('owner creates a room', async () => {
    const payload = { name: 'Lobby One', maxMembers: 4, visibility: 0 };
    const body = await Room.create(ownerCookie, payload);
    expect(body).toHaveProperty('code', 0);
    expect(body).toHaveProperty('body');
    expect(body.body).toHaveProperty('_id');
    roomId = body.body._id;
  });

  it('list rooms shows the new room', async () => {
    const body = await Room.list(ownerCookie, 'page=1&size=10&state=1'); // state=WAITING
    expect(body).toHaveProperty('code', 0);
    expect(Array.isArray(body.body.list)).toBe(true);
    expect(body.body.list.find(r => String(r._id) === String(roomId))).toBeTruthy();
  });


  it('member signs up & in', async () => {
    const s = await signUp('Member B', 'Pass#123', 'member_b@test.com');
    expect(s).toHaveProperty('code', 0);
    const { cookies } = await signIn('member_b@test.com', 'Pass#123');
    memberCookie = cookies[0];
  });

  it('member joins the room', async () => {
    const body = await Room.join(memberCookie, roomId);
    expect(body).toHaveProperty('code', 0);
    expect(body.body.members.length).toBeGreaterThanOrEqual(2);
  });

  // --- Start by owner ---
  it('owner starts the room', async () => {
    const body = await Room.start(ownerCookie, roomId);
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('state'); // should be ONGOING
  });

  // member leaves (room still exists)
  it('member leaves (room continues)', async () => {
    const body = await Room.leave(memberCookie, roomId);
    expect(body).toHaveProperty('code', 0);
    // when closed=false, body.body is the updated room
    if (body.body && body.body.room) {
      expect(body.body.closed).toBe(false);
    }
  });

  // owner leaves => room closes
  it('owner leaves (room closes)', async () => {
    const body = await Room.leave(ownerCookie, roomId);
    expect(body).toHaveProperty('code', 0);
    expect(body.body).toHaveProperty('message');
    expect(body.body.message).toMatch(/Room closed/i);
  });

  // cleanup accounts
  it('delete both accounts', async () => {
    let b1 = await deleteAccount(ownerCookie);
    expect(b1).toHaveProperty('code', 0);
    let b2 = await deleteAccount(memberCookie);
    expect(b2).toHaveProperty('code', 0);
  });
});