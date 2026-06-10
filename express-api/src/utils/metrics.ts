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


// Custom application metrics
export const documentsCreatedTotal =
  new client.Counter({
    name: "documents_created_total",
    help: "Total documents created",
  });

export const documentsDeletedTotal =
  new client.Counter({
    name: "documents_deleted_total",
    help: "Total documents deleted",
  });

export const cacheHitsTotal =
  new client.Counter({
    name: "cache_hits_total",
    help: "Total Redis cache hits",
  });

export const cacheMissesTotal =
  new client.Counter({
    name: "cache_misses_total",
    help: "Total Redis cache misses",
  });

export const documentProcessingDuration =
  new client.Histogram({
    name: "document_processing_duration_seconds",
    help: "Document processing duration",
    buckets: [0.1, 0.5, 1, 2, 5],
  });


register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);


register.registerMetric(documentsCreatedTotal);
register.registerMetric(documentsDeletedTotal);
register.registerMetric(cacheHitsTotal);
register.registerMetric(cacheMissesTotal);
register.registerMetric(documentProcessingDuration);
