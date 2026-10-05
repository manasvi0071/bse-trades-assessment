// client/src/App.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [trades, setTrades] = useState([]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState('Idle');

  useEffect(() => {
    socket.on('initialTrades', ({ trades, isPulling }) => {
      setTrades(trades);
      setIsPulling(isPulling);
      setPullStatus(isPulling ? 'Pulling...' : 'Idle');
    });

    socket.on('newTrades', (newTrades) => {
      setTrades(prev => [...prev, ...newTrades]);
    });

    socket.on('pullComplete', ({ total }) => {
      setIsPulling(false);
      setPullStatus(`Complete (${total} trades)`);
    });

    return () => {
      socket.off('initialTrades');
      socket.off('newTrades');
      socket.off('pullComplete');
    };
  }, []);

  const startPull = async (delay = 900) => {
    const res = await fetch(`http://localhost:4000/startPull?delay=${delay}`);
    const data = await res.json();
    setPullStatus(data.message);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📈 BSE Trades Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => startPull(10)} style={{ marginRight: '10px' }}>
          Start Pull (10s test)
        </button>
        <button onClick={() => startPull(900)}>
          Start Pull (15 min)
        </button>
        <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>
          Status: {pullStatus}
        </span>
      </div>
      <div>
        <h3>Total Trades: {trades.length}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={thStyle}>Trade ID</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(-50).reverse().map(trade => (
              <tr key={trade.tradeId} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{trade.tradeId}</td>
                <td style={tdStyle}>{trade.client}</td>
                <td style={tdStyle}>{trade.symbol}</td>
                <td style={tdStyle}>{trade.quantity}</td>
                <td style={tdStyle}>₹{trade.price}</td>
                <td style={tdStyle}>{new Date(trade.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left'
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px'
};

export default App;