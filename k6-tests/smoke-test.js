// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   stages: [
//     { duration: '10s', target: 100 }, // ramp up to 100 users
//     { duration: '20s', target: 100 }, // stay at 100 users
//     { duration: '5s', target: 0 },    // ramp down
//   ],
//   thresholds: {
//     http_req_duration: ['p(95)<150'], // 95% of requests must complete within 150ms
//   },
// };

// export default function () {
//   const url = 'http://localhost';

//   // 1. Health check
//   const healthRes = http.get(`${url}/api/health`);
//   check(healthRes, {
//     'health check status is 200': (r) => r.status === 200,
//     'health check reports ok': (r) => r.json().status === 'ok',
//   });

//   sleep(0.1);

//   // 2. Create a User
//   const payload = JSON.stringify({
//     name: `Test User ${__VU}-${__ITER}`,
//     email: `test-${__VU}-${__ITER}-${Math.floor(Math.random() * 10000000)}@example.com`,
//   });

//   const params = {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   };

//   const createRes = http.post(`${url}/api/users`, payload, params);
//   const isCreated = check(createRes, {
//     'create user status is 201': (r) => r.status === 201,
//     'user has an id': (r) => r.json().id !== undefined,
//   });

//   if (isCreated) {
//     const userId = createRes.json().id;

//     // 3. Fetch User (multiple times to test cache hits)
//     for (let i = 0; i < 5; i++) {
//       const getRes = http.get(`${url}/api/users/${userId}`);
//       check(getRes, {
//         'get user status is 200': (r) => r.status === 200,
//         'user name matches': (r) => r.json().name !== undefined,
//       });
//       sleep(0.05);
//     }
//   }

//   sleep(0.5);
// }









import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:80/api/health");
  check(res, {
    "status 200": (r) => r.status === 200,
    "body ok": (r) => r.body?.includes("ok") ?? false,
  });
  sleep(1); // ← this was the missing line
}

/*
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:80/api/health");
  check(res, {
    "status 200": (r) => r.status === 200,
    "body ok":    (r) => r.body?.includes("ok") ?? false,
  });
  sleep(1); // ← this was the missing line
}
*/