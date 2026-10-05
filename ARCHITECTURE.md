## Architecture

### Diagram
[Client (React)] <--Socket.IO--> [Server (Express + Socket.IO)]
|
v
[In-memory Trade Data]

### Why this design?

1. **Real-time updates**: Socket.IO pushes new trades to the dashboard instantly—no polling, no page refresh.
2. **Non-blocking UI**: The dashboard opens immediately and shows already-pulled trades.
3. **Configurable delay**: The `/startPull` endpoint accepts a `delay` query param to simulate the 15-minute BSE pull.
4. **Simple and testable**: All data is in-memory, making it easy to seed and reset for testing.