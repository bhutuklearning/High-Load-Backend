import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '15s', target: 100 }, // Ramp up to 100 users
    { duration: '20s', target: 200 }, // Sustain peak load (200 users)
    { duration: '10s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete within 200ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

export default function () {
  const url = 'http://localhost';

  // 1. Health check
  const healthRes = http.get(`${url}/api/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check reports ok': (r) => {
      try {
        return r.json().status === 'ok';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.1);

  // 2. Create a User
  const emailRandomPart = Math.floor(Math.random() * 1000000000);
  const payload = JSON.stringify({
    name: `Load Test User ${__VU}-${__ITER}`,
    email: `load-test-${__VU}-${__ITER}-${emailRandomPart}@example.com`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const createRes = http.post(`${url}/api/users`, payload, params);
  const isCreated = check(createRes, {
    'create user status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'user has an id': (r) => {
      try {
        return r.json().id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (isCreated) {
    let userId;
    try {
      userId = createRes.json().id;
    } catch (e) {
      // ignore
    }

    if (userId) {
      // 3. Fetch User (multiple times to test cache hits)
      for (let i = 0; i < 5; i++) {
        const getRes = http.get(`${url}/api/users/${userId}`);
        check(getRes, {
          'get user status is 200': (r) => r.status === 200,
          'user matches expected id': (r) => {
            try {
              return r.json().id === userId;
            } catch (e) {
              return false;
            }
          },
        });
        sleep(0.05);
      }
    }
  }

  sleep(0.5);
}
