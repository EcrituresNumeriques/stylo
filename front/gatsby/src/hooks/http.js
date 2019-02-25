import { useState, useEffect } from 'react';
import env from '../helpers/env'

export const useHttp = (payload, dependencies) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    console.log('Sending Http request to URL: ' + env.GRAPHQL_ENDPOINT + ' / ' + JSON.stringify(payload));

    fetch(env.GRAPHQL_ENDPOINT,{
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch.');
        }
        return response.json();
      })
      .then(data => {
        setIsLoading(false);
        setFetchedData(data);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  }, dependencies);

  return [isLoading, fetchedData];
};