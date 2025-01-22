import React, { useEffect, useState, useCallback } from 'react';
import './GifContainer.css';

const API_KEY = 'hVco0y9MOBiXQL0v28xlLj8AsbHUMIKr'; // Replace with your Giphy API key
const SEARCH_TERMS = ['cats', 'french bulldogs']; // Add more categories here if needed
const LIMIT = 20; // Number of GIFs per fetch
const MAX_LIMIT = 100; // Maximum number of GIFs to paginate through

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const GifContainer = () => {
  const [gifsToDisplay, setGifsToDisplay] = useState([]); // Interleaved GIFs for display
  const [offset, setOffset] = useState(0); // Track the current pagination offset

  const fetchGIFs = useCallback(async () => {
    const cache = [];

    for (const term of SEARCH_TERMS) {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=${LIMIT}&offset=${offset}`
        );
        const jsonResponse = await response.json();
        console.log(`API Response for "${term}" (offset: ${offset}):`, jsonResponse);

        if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
          console.error(`Unexpected API response for term "${term}":`, jsonResponse);
          continue;
        }

        // Add randomized GIF URLs for this term to the cache
        cache.push(shuffleArray(jsonResponse.data.map((gif) => gif.images.original.url)));
      } catch (error) {
        console.error(`Error fetching GIFs for term "${term}":`, error);
      }
    }

    // Interleave GIFs from all categories
    const interleavedGifs = [];
    for (let i = 0; i < LIMIT; i++) {
      for (const termGifs of cache) {
        if (i < termGifs.length) {
          interleavedGifs.push(termGifs[i]);
        }
      }
    }

    setGifsToDisplay(interleavedGifs);
  }, [offset]); // Dependencies: function changes only when `offset` changes

  useEffect(() => {
    // Initial fetch
    fetchGIFs();

    // Set interval to fetch new GIFs every 10 minutes
    const fetchInterval = setInterval(() => {
      setOffset((prevOffset) => {
        // Increment offset by LIMIT or reset to 0 if the maximum is reached
        const newOffset = prevOffset + LIMIT;
        return newOffset >= MAX_LIMIT ? 0 : newOffset;
      });
    }, 60000); // 10 minutes = 600,000 ms

    return () => clearInterval(fetchInterval); // Cleanup interval on unmount
  }, [fetchGIFs]);

  useEffect(() => {
    // Fetch new GIFs whenever offset changes
    fetchGIFs();
  }, [fetchGIFs]);

  return (
    <div className="gif-container">
      {gifsToDisplay.map((gif, index) => (
        <img key={index} src={gif} alt={`gif-${index}`} />
      ))}
    </div>
  );
};

export default GifContainer;
