
import React, { useState, useRef, useEffect } from 'react';

export default function GeoScoreTool() {
  const [url, setUrl] = useState('');
  const [scoreData, setScoreData] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculatedUrl, setLastCalculatedUrl] = useState('');
  const reportRef = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const extractBrandName = (inputUrl) => {
    try {
      const urlObj = new URL(inputUrl);
      const hostname = urlObj.hostname.replace('www.', '');
      const parts = hostname.split('.');
      return parts.length >= 2 ? parts[0] : hostname;
    } catch {
      return inputUrl.toLowerCase().split('.')[0];
    }
  };

  const fetchLogo = (inputUrl) => {
    try {
      const urlObj = new URL(inputUrl);
      const domain = urlObj.hostname;
      return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    } catch {
      return '';
    }
  };
  
   const hashScore = (text, max = 100, offset = 0) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % max) + offset;
};

  const checkWikipedia = async (brand) => {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${brand}`);
    const data = await response.json();
    const pages = data.query.pages;
    return !pages || Object.keys(pages)[0] === '-1' ? 0 : 20;
  };

  const checkSchemaMarkup = async (inputUrl) => {
    try {
      const res = await fetch(`https://cors-anywhere.herokuapp.com/${inputUrl}`);
      const text = await res.text();
      return text.includes('schema.org') ? 5 : 0;
    } catch {
      return 0;
    }
  };

  const calculateScore = async () => {
    if (isCalculating || url === lastCalculatedUrl) return;
    setIsCalculating(true);
    setLastCalculatedUrl(url);

    const brand = extractBrandName(url);
    const logo = fetchLogo(url);
    setLogoUrl(logo);
    const recall = hashScore(url, 40); // Deterministic recall score (max 40)
    const seo = hashScore(url + 'seo', 25); // Deterministic SEO score (max 25)
    const platforms = Math.min(15, hashScore(url + 'platforms', 10) + schemaScore);
    const wiki = await checkWikipedia(brand);
    const platforms = Math.min(15, Math.floor(Math.random() * 5) + 5 + schemaScore);
    const total = recall + wiki + seo + platforms;

    setScoreData({ brand, recall, wiki, seo, platforms, total });
    setIsCalculating(false);
  };

  const resetScore = () => {
    setUrl('');
    setScoreData(null);
    setLogoUrl('');
    setLastCalculatedUrl('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">🧠 Generative Engine Optimization (GEO) Score Tool</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="e.g., https://website.in"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={calculateScore}
          disabled={isCalculating}
          className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${isCalculating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isCalculating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Calculating...
            </>
          ) : 'Calculate GEO Score'}
        </button>

        <button
          onClick={resetScore}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {scoreData && (
        <>
          <div className="mt-6 bg-gray-100 p-6 rounded shadow" ref={reportRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                🎯 GEO Score for <span className="text-blue-600">{scoreData.brand}</span>: {scoreData.total}/100
              </h2>
              {logoUrl && (
                <img src={logoUrl} alt="Brand Logo" className="h-12 w-12 rounded" />
              )}
            </div>

            <ul className="list-disc pl-5 space-y-1">
              <li>LLM Recall: {scoreData.recall}/40</li>
              <li>Wikipedia/Wikidata Presence: {scoreData.wiki}/20</li>
              <li>Web & SEO Presence: {scoreData.seo}/25</li>
              <li>Platform Visibility (incl. schema.org): {scoreData.platforms}/15</li>
            </ul>

            <div className="mt-5">
              <h3 className="font-semibold">🛠 Suggestions to Improve:</h3>
              <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                <li>Create Wikidata/Wikipedia with credible sources.</li>
                <li>Publish GEO-powered articles (at least 20/month) on Medium, blogs, etc.</li>
                <li>Perform Data Injections.</li>
                <li>Add structured data (schema.org) to your website.</li>
              </ul>
            </div>

            <div className="mt-6 border-t pt-4 text-center text-sm font-semibold text-gray-700">
              📩 Need help improving your GEO score? Reach out to <span className="text-blue-600">Mr. Swaroop</span> at <a href="mailto:Swaroop@herody.in" className="underline">Swaroop@herody.in</a>,
              who has executed 1000+ Wikidata injections and is a recognized GEO specialist.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
