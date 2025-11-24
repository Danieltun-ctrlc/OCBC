const API_BASE = "http://localhost:4000/api";

export async function submitIssue(payload) {
    const res = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    return res.json();
}

export async function fetchQueues() {
    const res = await fetch(`${API_BASE}/queues`);
    return res.json();
}

export async function serveNext(queue) {
    const res = await fetch(`${API_BASE}/serve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queue })
    });
    return res.json();
}

export async function resetSystem() {
    const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
    return res.json();
}
export async function bookSlot(payload) {
    const res = await fetch("http://localhost:4000/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return res.json();
}
