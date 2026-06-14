import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 100,
    duration: "30s",
    thresholds: {
        http_req_duration: [
            "p(95)<500"
        ],

        http_req_failed: [
            "rate<0.01"
        ],
    },
};

export default function () {
    // CREATE DOCUMENT
    const payload = JSON.stringify({
        title: "AI in Healthcare",
        content:
            "Artificial intelligence is transforming healthcare systems across the world.",
    });

    const params = {
        headers: {
            "Content-Type":
                "application/json",
        },
    };

    const createResponse = http.post(
        "http://localhost/api/documents",
        payload,
        params
    );

    check(createResponse, {
        "document created":
            (r) => r.status === 201,
    });

    // GET DOCUMENTS
    const getResponse = http.get("http://localhost/api/documents");

    check(getResponse, {
        "documents fetched":
            (r) => r.status === 200,
    });

    sleep(1);
}