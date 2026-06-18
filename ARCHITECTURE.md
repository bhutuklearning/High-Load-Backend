# DocScale Architecture Details

This document contains both the graphical architecture diagram and the raw Mermaid source code representing the DocScale platform topology, including the application pathways, data stores, worker nodes, and the observability stack.

---

## Technical System Architecture

Below is the visual system design diagram depicting the flow of user actions and the telemetry gathering endpoints:

![DocScale System Architecture](./docscale_architecture_diagram.png)

---

## Mermaid System Architecture Code

You can render or inspect the system architecture via the following Mermaid diagram:

```mermaid
graph TD
    %% Styling definitions
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef loadbalancer fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef app fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef cache fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef db fill:#ede7f6,stroke:#651fff,stroke-width:2px;
    classDef worker fill:#fffde7,stroke:#fbc02d,stroke-width:2px;
    classDef external fill:#eceff1,stroke:#37474f,stroke-dasharray: 5 5;
    classDef monitor fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;

    %% Elements
    Users[Users / Clients]:::client
    Nginx[NGINX Load Balancer]:::loadbalancer
    
    subgraph APITier [Express API Clustered Tier]
        Express1[Express API Instance 1]:::app
        Express2[Express API Instance 2]:::app
        Express3[Express API Instance 3]:::app
    end

    subgraph MemoryTier [Redis Memory Tier]
        RCache[Redis Cache]:::cache
        RQueue[Redis Queue]:::cache
    end

    subgraph DatabaseTier [PostgreSQL DB Tier]
        PgBouncer[PgBouncer Connection Pooler]:::db
        Postgres[(PostgreSQL Database)]:::db
    end

    FastAPI[FastAPI Worker Service]:::worker
    OpenRouter[OpenRouter AI API]:::external

    subgraph Observability [Prometheus & Grafana Monitoring Stack]
        Prometheus[Prometheus Collector]:::monitor
        Grafana[Grafana Dashboards]:::monitor
        
        NginxExp[NGINX Exporter]:::monitor
        RedisExp[Redis Exporter]:::monitor
        PostgresExp[Postgres Exporter]:::monitor
    end

    %% Flows
    Users -->|HTTP Requests| Nginx
    Nginx -->|Round Robin| Express1
    Nginx -->|Round Robin| Express2
    Nginx -->|Round Robin| Express3

    %% Cache and Queue Flows
    Express1 & Express2 & Express3 -->|Query/Cache-Aside| RCache
    Express1 & Express2 & Express3 -->|Enqueue Job| RQueue
    
    %% DB Flows
    Express1 & Express2 & Express3 -->|SQL Queries| PgBouncer
    PgBouncer -->|Pooled Connections| Postgres

    %% Worker Flow
    RQueue -->|Fetch Job| FastAPI
    FastAPI -->|Request Analysis| OpenRouter
    FastAPI -->|Post Results| Express1 & Express2 & Express3

    %% Monitoring Scrapes
    Prometheus -->|Scrape Metrics| Express1 & Express2 & Express3
    Prometheus -->|Scrape Metrics| NginxExp
    Prometheus -->|Scrape Metrics| RedisExp
    Prometheus -->|Scrape Metrics| PostgresExp
    
    Nginx -.->|Stats| NginxExp
    RCache -.->|Stats| RedisExp
    Postgres -.->|Stats| PostgresExp

    Grafana -->|Query Dashboard| Prometheus
```
