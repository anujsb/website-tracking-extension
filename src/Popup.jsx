import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(null, (items) => {
      const results = Object.entries(items).map(([url, time]) => ({
        url,
        time: (time / 1000 / 60).toFixed(2), // Convert ms to minutes
      }));
      setData(results);
    });
  }, []);

  return (
    <div>
      <h1>Website Usage Tracker</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {item.url}: {item.time} minutes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Popup;