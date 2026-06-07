import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({
  register,
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",

  labelNames: ["method", "route", "status"],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",

  help: "Duration of HTTP requests in seconds",

  labelNames: ["method", "route", "status"],

  buckets: [0.1, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestsTotal);

register.registerMetric(httpRequestDuration);

