# DocScale

DocScale is a high-throughput, distributed document processing and AI-powered analysis platform. Designed with horizontal scalability and robustness in mind, the platform distributes workload across a cluster of Express API instances behind an Nginx load balancer, distributes workload buffers using a Redis queue, and runs intensive AI summarization, keyword extraction, and sentiment classification tasks asynchronously via a FastAPI worker service integrated with LLM inference APIs.

---

## Key Features

- **Load-Balanced API Tier**: Three Node.js + Express instances running concurrently behind an Nginx load balancer configured with round-robin request distribution.
- **Asynchronous Task Processing**: High-performance worker model utilizing Redis as a message broker and queue buffer to run long-running AI tasks without blocking user requests.
- **AI-Powered Analysis**: Deep document inspection including automatic summary generation, keyphrase/keyword extraction, and sentiment analysis powered by LLM models via OpenRouter.
- **Multi-Layered Caching**: Sub-millisecond read speeds enabled by caching database queries and processed document payloads directly in Redis.
- **Database Connection Pooling**: Fine-grained Postgres database scaling and pool management optimized via PgBouncer in transaction pooling mode.
- **Production-Ready Observability**: Prometheus instrumentation across the system coupled with pre-configured Grafana dashboards displaying application health, CPU/memory usage, active database pools, and HTTP request statistics.
- **Automated Health Monitoring**: Comprehensive health status endpoint returning 503 Service Unavailable if critical services (PostgreSQL, Redis) experience connection dropouts.
- **Resilient Rate Limiting**: Global rate limiting enforced by `express-rate-limit` on every Express instance (100 requests per 15-minute window by default), configurable via environment variables and bypassable for internal load tests.

---

## Architecture Overview

The system architecture is structured to separate incoming API transactions from heavy compute tasks. Users submit documents, which are immediately persisted as raw records, queued, and returned with a tracking ID. Workers pull jobs, request AI analysis from OpenRouter, and update the API tier once completed.

```
                  +------------------+
                  |  Client Traffic  |
                  +--------+---------+
                           |
                           v
                  +--------+---------+
                  |    Nginx LB      |
                  +---+----+----+----+
                      |    |    |
      +---------------+    |    +---------------+
      v                    v                    v
+-----+------+       +-----+------+       +-----+------+
| Express-1  |       | Express-2  |       | Express-3  |
+-----+------+       +-----+------+       +-----+------+
      |                    |                    |
      +---------------+----+----+---------------+
                      |
                      v
      +---------------+---------------+
      |                               |
      v                               v
+-----+------+                  +-----+------+
|  PgBouncer |                  |    Redis   |
+-----+------+                  |  (Cache &  |
      |                         |   Queue)   |
      v                         +-----+------+
+-----+------+                        ^
| PostgreSQL |                        |
+------------+                        v
                                +-----+------+
                                |  FastAPI   |
                                |   Worker   |
                                +-----+------+
                                      |
                                      v
                                +-----+------+
                                | OpenRouter |
                                |  AI API    |
                                +------------+
```

---

## Technology Stack

- **Application Core**: Node.js, Express, TypeScript
- **Machine Learning Worker**: Python 3.11, FastAPI, Uvicorn, HTTPX
- **Data Store**: PostgreSQL 16
- **Connection Proxy**: PgBouncer (Transaction Pool Mode)
- **Caching & Broker**: Redis 7 (In-Memory Key-Value Store)
- **Routing & Balancing**: Nginx (Reverse Proxy & Round-Robin Load Balancer)
- **Monitoring**: Prometheus, Grafana
- **Testing**: k6 Load Tester
- **Infrastructure**: Docker, Docker Compose

---

## Folder Structure

```
project/
├── docker-compose.yml              # Multi-container orchestration definition
├── nginx/
│   └── nginx.conf                  # Load balancer and reverse proxy configuration
├── redis/
│   └── redis.conf                  # Custom Redis saving and memory config
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml          # Prometheus scrape targets configuration
├── express-api/                    # Core backend system written in Node.js
│   ├── prisma/
│   │   ├── schema.prisma           # Relational schema configuration (Postgres)
│   │   └── migrations/             # Database migration history
│   ├── src/
│   │   ├── config/                 # Redis and Prisma PgPool client initiators
│   │   ├── middleware/             # Rate limiter, prometheus collector, error handler
│   │   ├── modules/
│   │   │   ├── dashboard/          # Aggregated system metrics endpoints
│   │   │   ├── documents/          # Core CRUD, search, and validation logic
│   │   │   ├── health/             # Multi-dependency health checker router
│   │   │   ├── internal/           # Worker-to-API synchronization endpoints
│   │   │   └── users/              # User management and creation modules
│   │   ├── app.ts                  # App instantiation and middleware chain
│   │   └── server.ts               # HTTP startup process listener
│   └── package.json
└── fastapi-service/                # Asynchronous worker service written in Python
    ├── app/
    │   ├── main.py                 # FastAPI app configuration and worker lifespans
    │   ├── routes/                 # AI service triggers router
    │   ├── services/
    │   │   ├── openrouter_service.py # LLM orchestration client for text analysis
    │   │   └── worker.py           # Blocking redis queue consumer thread loop
    └── requirements.txt            # Python dependencies manifest
```

---

## API Endpoints

### Public Endpoints

| Method | Path | Description | Caching |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Creates a new system user | No |
| `GET` | `/api/users/:id` | Fetches user details | Yes (Redis) |
| `POST` | `/api/documents` | Uploads a new document for processing | No |
| `GET` | `/api/documents` | Lists all documents (paginated) | No |
| `GET` | `/api/documents/search` | Searches documents by title/content queries | No |
| `GET` | `/api/documents/:id` | Fetches specific document details and AI analysis | Yes (Redis) |
| `DELETE` | `/api/documents/:id` | Deletes a document record and clears its cache | No |
| `GET` | `/api/dashboard/stats` | Returns aggregated metrics (User, Document counts) | No |
| `GET` | `/api/health` | Service health status | No |
| `GET` | `/metrics` | Exposes Prometheus application metrics | No |

### Internal Endpoints (Worker Only)

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/internal/documents/:id/complete` | Updates status to processed and updates AI data fields |
| `POST` | `/api/internal/documents/:id/failed` | Marks processing job as failed |

---

## System Design

DocScale is architected to survive traffic surges, rate-limit malicious users, and scale database access paths efficiently:

### Concurrency and Workload Isolation
User requests for resource-intensive operations (such as processing lengthy files through an external AI model) do not occupy HTTP request-response loops. The Express API serves as an ingestion gateway, writing records to PostgreSQL and dispatching a job descriptor directly to Redis before responding immediately with `202 Accepted`. This frees database transaction slots and thread execution context to absorb further client requests.

### Database Pooling with PgBouncer
Node.js web servers spin up multiple database connection pools. Direct connection pools to PostgreSQL can quickly saturate limits, causing memory spikes and query failures. DocScale places PgBouncer between the API tier and PostgreSQL. Operating in `transaction` mode, PgBouncer allows hundreds of virtual database client threads to share a compact, high-efficiency physical pool of database connections.

### Rate Limiting and Cache Strategy
To protect services under load, each Express instance runs an `express-rate-limit` middleware that enforces a ceiling of 100 requests per IP per 15-minute sliding window. The limit and window are configurable through the `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` environment variables. Because the counter is stored in each instance's process memory, the limiter is per-instance rather than globally shared across the cluster. To speed up read pathways, the system applies a Cache-Aside pattern. If a document read request hits a cache miss in Redis, the system fetches the record from PostgreSQL, writes it into the Redis cache, and sets a Time-To-Live (TTL). Future requests for the same document resolve in sub-milliseconds without touching PostgreSQL.

---

## High Level Request Flow

The following sequence diagram represents the execution timeline of a document upload request, showing how the frontend, API gateways, database, queue, and background workers synchronize:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Nginx as Nginx Load Balancer
    participant Express as Express API Instance
    participant Redis as Redis Cache & Queue
    participant Postgres as PostgreSQL (via PgBouncer)
    participant Worker as FastAPI Worker
    participant AI as OpenRouter AI API

    Client->>Nginx: POST /api/documents (Upload Content)
    Nginx->>Express: Route request to instance
    Express->>Postgres: Insert document metadata (status: pending)
    Express->>Redis: Enqueue job (document-processing-queue)
    Express-->>Client: Return 202 Accepted (documentId)

    Note over Worker, Redis: Worker blocks on BRPOP
    Worker->>Redis: BRPOP document-processing-queue
    Redis-->>Worker: Return job payload

    Worker->>AI: POST chat/completions (analyze content)
    AI-->>Worker: Return parsed summary, keywords, sentiment
    Worker->>Express: POST /api/internal/documents/:id/complete (save results)
    Express->>Postgres: Update document fields & status: processed
    Express->>Redis: Set cache "document:id" with parsed results
    Express-->>Worker: 200 OK
```

---

## AI Processing Flow

The FastAPI worker service is engineered for resilient document transformation. The flowchart below details the decision tree utilized during worker processing:

```mermaid
graph TD
    A[Worker Receives Job] --> B[Extract Content and ID]
    B --> C[Construct Prompt for Analysis]
    C --> D[Send Request to OpenRouter AI API]
    D -->|API Response Received| E{Valid Response?}
    E -->|Yes| F[Extract Summary, Keywords, and Sentiment]
    E -->|No / Exception| G[Post Failed Status to Express API]
    F --> H[Post Completed Results to Express API]
    H --> I[Update PostgreSQL database status: processed]
    H --> J[Store Processed Data in Redis Cache]
    G --> K[Update PostgreSQL database status: failed]
```

---

## Redis Queue Flow

Redis manages the producer-consumer task pipeline. The incoming traffic is distributed by Nginx among the active Node.js processes, which produce jobs to the queue. Python worker instances consume these jobs asynchronously:

```mermaid
graph LR
    A[Express Instance 1] -->|LPUSH| Q[(Redis Queue)]
    B[Express Instance 2] -->|LPUSH| Q
    C[Express Instance 3] -->|LPUSH| Q
    Q -->|BRPOP| W[FastAPI Worker Service]
```

---

## Monitoring

DocScale comes with a preconfigured monitoring stack to track infrastructure status and application load.

### Prometheus Metrics
Each Express instance exposes metrics at the `/metrics` endpoint. Prometheus scrapes these endpoints every 15 seconds to collect:
- HTTP request count and average response latencies.
- Process memory footprints and CPU utilization rates.
- Node.js event loop lag.
- Redis client connection pool status.

### Grafana Dashboard
A preconfigured dashboard consumes Prometheus data sources to display:
- **System Health**: Active API instances and memory profiles.
- **Throughput**: HTTP request/response rate per second.
- **Latency Heatmap**: Latency distribution curves across routes.
- **Database Statistics**: Open client connection counts on PgBouncer.

---

## Load Testing

To ensure the backend handles load properly, the repository includes k6 automated test scripts under `k6-tests/`.

### Running a Load Test
Execute the test from the host using:
```bash
k6 run k6-tests/load-test.js
```

### Performance Target Results
During verification under high concurrency (200 Virtual Users looping for 55 seconds), the load test showed:
- **Total Requests**: 40,040 requests completed.
- **RPS (Requests Per Second)**: 721.7 requests/sec.
- **HTTP Failure Rate**: 0.00% (0 out of 40,040 requests failed).
- **Latency metrics**:
  - Median: 6.96ms
  - 95th Percentile (p95): 40.63ms

---

## Running the Project Locally

### Prerequisites
Ensure you have the following installed on your host machine:
- Node.js (version 20 or higher)
- PostgreSQL (or PgAdmin running locally)
- Redis server
- Python (version 3.10 or higher)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/docscale.git
cd docscale/project
```

### Step 2: Configure PostgreSQL & Redis locally
Ensure your local database server is running, and create a database named `highload`. 

### Step 3: Run migrations from Host
Navigate into the backend directory and run the initialization commands:
```bash
cd express-api
npm install
npx prisma generate
npx prisma migrate dev
```

### Step 4: Start local processes
Run the Express API:
```bash
npm run dev
```

For the worker service, configure the virtual environment and launch FastAPI:
```bash
cd ../fastapi-service
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## Docker Setup

To orchestrate and launch the entire microservice architecture, including the monitoring stack, run the following Docker Compose sequence:

### Step 1: Clean build environment
Ensure no stale Docker volumes, networks, or containers remain:
```bash
docker compose down -v --rmi all
```

### Step 2: Build images
Build all the local containers (Express API servers and FastAPI worker) without using cached layers:
```bash
docker compose build --no-cache
```

### Step 3: Start database & cache tier first
Bring up Postgres, Redis, and PgBouncer and let them fully initialize:
```bash
docker compose up -d postgres redis pgbouncer
```

### Step 4: Run database migrations from host
Let the Prisma client sync the PostgreSQL schema locally:
```bash
cd express-api
npx prisma generate
npx prisma migrate dev
cd ..
```

### Step 5: Start the remaining stack
Run the full environment containing load balancers, API instances, FastAPI workers, and monitoring tools:
```bash
docker compose up -d
```

---

## Environment Variables

### Express API (`express-api/.env`)
Create a `.env` file inside the `express-api` folder for local execution:
```env
PORT=4000
POSTGRES_HOST=localhost
POSTGRES_PORT=6432
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=highload
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL="postgresql://admin:admin@localhost:6432/highload"
DIRECT_DATABASE_URL="postgresql://admin:admin@localhost:5432/highload"
```

### FastAPI Worker (`fastapi-service/.env`)
Create a `.env` file inside `fastapi-service` for local execution:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
OPENROUTER_API_KEY="your-openrouter-api-key-here"
```

---

## Screenshots Section Placeholders

### Grafana Cluster Dashboard
```
[Insert Grafana System Dashboard Screenshot: Exposing HTTP Request Throughput, Instance CPU/Memory usage, Event Loop Lag, and Database connection count]
```

### k6 Performance Load Test Results
```
[Insert k6 execution terminal screenshot showing 0.00% request failure rate, 720+ requests per second, and a p95 latency under 41 milliseconds]
```

---

## Future Improvements

- **Horizontal Pod Autoscaling**: Implement Kubernetes configuration manifests to autoscale Express API pods based on Prometheus metrics.
- **Dead Letter Queue (DLQ)**: Add DLQ logic to the Redis-based broker to retry and isolate failed AI processing jobs.
- **Semantic Search**: Integrate a vector database (such as pgvector) to perform semantic and contextual document searches instead of keyword-based queries.
- **JSON Schema Validation**: Transition API interfaces to strictly validated OpenAPI configurations.
- **Secure Authentication**: Add JWT authentication middleware and role-based access controls to safeguard endpoints.

---

## Resume Highlights

- **Built and deployed** a highly scalable, load-balanced Node.js monolith utilizing Nginx and three clustered Express instances to handle more than 700 requests per second.
- **Designed an asynchronous task queue** using Redis and FastAPI to offload long-running LLM document analysis processing tasks, reducing user-facing latency.
- **Optimized SQL query pathways** by integrating PgBouncer to manage database connection pooling and implementing Redis as a caching layer to bypass databases on read actions.
- **Established extensive observability** by implementing Prometheus metrics exporters and Grafana dashboards tracking CPU profiles, event loop lag, and connection pools.
- **Designed testing harnesses** using k6 to execute concurrent load simulations, verifying 100% success rate under peak load (200 Virtual Users) and maintaining p95 latency below 41ms.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
