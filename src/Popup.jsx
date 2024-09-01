import React, { useEffect, useState } from "react";

const Popup = () => {
  const [websites, setWebsites] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [numWebsites, setNumWebsites] = useState(0); // State for number of websites visited
  const [sortOption, setSortOption] = useState("timeDesc");

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get(null, (items) => {
        const websiteList = [];
        let total = 0;
        let count = 0; // Initialize website count

        for (const [url, time] of Object.entries(items)) {
          if (typeof time === "number") {
            const timeSpent = (time / 1000).toFixed(2); // Convert to seconds
            websiteList.push({ domain: url, timeSpent });
            total += parseFloat(timeSpent); // Accumulate total time
            count++; // Increment website count
          }
        }

        setTotalTime(total.toFixed(2)); // Update total time state
        setNumWebsites(count); // Update number of websites visited
        sortWebsites(websiteList, sortOption); // Sort websites based on the current option
      });
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [sortOption]); // Dependency on sortOption

  const extractDomain = (url) => {
    try {
      const { hostname } = new URL(url);
      return hostname.replace(/^www\./, ""); // Remove 'www.' if present
    } catch (error) {
      return url; // Return original URL if extraction fails
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const sortWebsites = (list, option) => {
    const sortedList = [...list].sort((a, b) => {
      switch (option) {
        case "timeAsc":
          return a.timeSpent - b.timeSpent;
        case "timeDesc":
          return b.timeSpent - a.timeSpent;
        case "domainAsc":
          return extractDomain(a.domain).localeCompare(extractDomain(b.domain));
        case "domainDesc":
          return extractDomain(b.domain).localeCompare(extractDomain(a.domain));
        default:
          return 0;
      }
    });
    setWebsites(sortedList);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const clearData = () => {
    chrome.storage.local.clear(() => {
      setWebsites([]);
      setTotalTime(0); // Reset total time when data is cleared
      setNumWebsites(0); // Reset website count when data is cleared
    });
  };

  const totalTimeInSeconds = parseFloat(totalTime); // Convert total time to seconds

  return (
    <div className="w-96 p-6 bg-gradient-to-br from-blue-50 to-neutral-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-neutral-800">Tracked Websites</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Total Time</h2>
          <p className="text-2xl font-bold text-neutral-600">{formatTime(totalTimeInSeconds)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Websites</h2>
          <p className="text-2xl font-bold text-neutral-600">{numWebsites}</p>
        </div>
      </div>

      <select 
        className="w-full p-2 mb-4 bg-white border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 text-gray-700" 
        onChange={handleSortChange} 
        value={sortOption}
      >
        <option value="timeDesc">Sort by Time (Descending)</option>
        <option value="timeAsc">Sort by Time (Ascending)</option>
        <option value="domainAsc">Sort by Domain (A-Z)</option>
        <option value="domainDesc">Sort by Domain (Z-A)</option>
      </select>

      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-y-auto h-56">
        <table className="w-full">
          <thead className="bg-neutral-200">
            <tr>
              <th className="py-2 px-4 text-left text-neutral-800 font-semibold">Website</th>
              <th className="py-2 px-4 text-right text-neutral-800 font-semibold">Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {websites.map((website, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-neutral-100' : 'bg-white'}>
                <td className="py-2 px-4 text-left text-neutral-800">{extractDomain(website.domain)}</td>
                <td className="py-2 px-4 text-right text-neutral-800">{formatTime(parseFloat(website.timeSpent))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="mt-6 w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition duration-300 ease-in-out flex items-center justify-center"
        onClick={clearData}
      >
        <TrashIcon className="mr-2 h-5 w-5" />
        Clear Data
      </button>
    </div>
  );
};

export default Popup;

function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
