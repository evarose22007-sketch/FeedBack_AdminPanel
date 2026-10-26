// API tests. using Moongose //
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const buildApp = require('../app');
const { ensureCourses } = require('../config/db');

const uri = process.env.TEST_MONGODB_URI;
let app;
let courses;
let feedbackId;

before(async () => {
  if (!uri) throw new Error('Set TEST_MONGODB_URI to a throwaway database to run the tests.');
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await ensureCourses();
  app = buildApp();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('courses are seeded and listed', async () => {
  const res = await request(app).get('/api/courses');
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 8);
  assert.ok(res.body.every((c) => c.courseId && c.name && c.duration));
  courses = res.body;
});

test('seeding twice does not duplicate courses', async () => {
  await ensureCourses();
  const res = await request(app).get('/api/courses');
  assert.equal(res.body.length, 8);
});

test('POST /api/feedback creates feedback with course details', async () => {
  const mern = courses.find((c) => c.courseId === 'MERN-401');
  const res = await request(app)
    .post('/api/feedback')
    .send({ course: mern.id, comments: 'Great hands-on projects.', rating: 5 });
  assert.equal(res.status, 201);
  assert.equal(res.body.courseId, 'MERN-401');
  assert.equal(res.body.courseName, 'Full Stack Development with MERN');
  assert.equal(res.body.courseDuration, '12 weeks');
  assert.equal(res.body.rating, 5);
  feedbackId = res.body.id;
});

test('POST /api/feedback rejects bad input with field messages', async () => {
  const res = await request(app).post('/api/feedback').send({ course: '', comments: ' ', rating: 9 });
  assert.equal(res.status, 422);
  assert.deepEqual(Object.keys(res.body.fields).sort(), ['comments', 'course', 'rating']);

  const fakeCourse = await request(app)
    .post('/api/feedback')
    .send({ course: new mongoose.Types.ObjectId().toString(), comments: 'Valid text here', rating: 3 });
  assert.equal(fakeCourse.status, 422);
  assert.ok(fakeCourse.body.fields.course);
});

test('GET /api/feedback lists feedback, newest first', async () => {
  const dsa = courses.find((c) => c.courseId === 'DSA-210');
  await request(app).post('/api/feedback').send({ course: dsa.id, comments: 'Tough but worth it.', rating: '4' });
  const res = await request(app).get('/api/feedback');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.map((f) => f.courseId), ['DSA-210', 'MERN-401']);
});

test('course list includes average rating and count', async () => {
  const res = await request(app).get('/api/courses');
  const mern = res.body.find((c) => c.courseId === 'MERN-401');
  assert.equal(mern.feedbackCount, 1);
  assert.equal(mern.averageRating, 5);
  const ux = res.body.find((c) => c.courseId === 'UX-120');
  assert.equal(ux.averageRating, null);
});

test('GET /api/feedback/:id returns one entry', async () => {
  const res = await request(app).get(`/api/feedback/${feedbackId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.comments, 'Great hands-on projects.');
});

test('PUT /api/feedback/:id updates the entry', async () => {
  const net = courses.find((c) => c.courseId === 'NET-230');
  const res = await request(app)
    .put(`/api/feedback/${feedbackId}`)
    .send({ course: net.id, comments: 'Changed my mind: good labs.', rating: 3 });
  assert.equal(res.status, 200);
  assert.equal(res.body.courseId, 'NET-230');
  assert.equal(res.body.rating, 3);

  const bad = await request(app).put(`/api/feedback/${feedbackId}`).send({ course: net.id, comments: '', rating: 3 });
  assert.equal(bad.status, 422);
});

test('DELETE /api/feedback/:id removes the entry', async () => {
  const res = await request(app).delete(`/api/feedback/${feedbackId}`);
  assert.equal(res.status, 200);
  assert.equal((await request(app).get(`/api/feedback/${feedbackId}`)).status, 404);
  assert.equal((await request(app).get('/api/feedback')).body.length, 1);
});

test('unknown ids and routes return 404', async () => {
  const id = new mongoose.Types.ObjectId().toString();
  assert.equal((await request(app).delete(`/api/feedback/${id}`)).status, 404);
  assert.equal((await request(app).get('/api/feedback/not-an-id')).status, 404);
  assert.equal((await request(app).get('/api/nothing')).status, 404);
});
