(async () => {
  const token = "demo_token_testuser";
  const Q = "Pythagorean theorem";
  const base = "http://localhost:5001";
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const post = async (path, body) => {
    try {
      const res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
      const text = await res.text();
      try { return JSON.parse(text); } catch { return text; }
    } catch (e) { return { error: e.message }; }
  };

  console.log('--- DIAGNOSTIC ---');
  console.log(JSON.stringify(await post('/api/ask/diagnostic', { question: Q, subject: 'Mathematics', grade: '10' }), null, 2));

  console.log('\n--- ROADMAP ---');
  const roadmapResp = await post('/api/ask/roadmap', { question: Q, diagnosticScore: 40, learningStyle: 'slow' });
  console.log(JSON.stringify(roadmapResp, null, 2));

  const topic = (roadmapResp?.roadmap && roadmapResp.roadmap[0]) || Q;
  console.log('TOPIC:', topic);

  console.log('\n--- EXPLAIN ---');
  console.log(JSON.stringify(await post('/api/ask/explain', { topic, grade: '10', mode: 'explain', learningStyle: 'slow' }), null, 2).slice(0,1000));

  console.log('\n--- FLASHCARDS ---');
  console.log(JSON.stringify(await post('/api/learning/flashcards', { topic }), null, 2));

  console.log('\n--- FINAL QUIZ GENERATE ---');
  console.log(JSON.stringify(await post('/api/quiz/final-quiz', { topic, grade: '10' }), null, 2));

  console.log('\n--- SUBMIT QUIZ (3/6) ---');
  console.log(JSON.stringify(await post('/api/quiz/final-quiz/submit', { userId: 'testuser', topic, subject: 'Mathematics', score: 3, total: 6, weakAreas: ['applications'] }), null, 2));

  console.log('\n--- HISTORY (testuser) ---');
  try { const h = await fetch(base + '/api/ask/history/testuser', { headers }); const j = await h.json(); console.log(JSON.stringify(j, null, 2)); } catch (e) { console.log({ error: e.message }); }
})();
