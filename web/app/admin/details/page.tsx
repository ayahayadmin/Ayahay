'use client';
import { getTime } from '@/services/search.service';
import { ITrip, mockTrips } from '@ayahay/models/trip.model';
import { find, join, split } from 'lodash';
import React, { useEffect, useState } from 'react';

export default function Details() {
  const [tripData, setTripData] = useState({} as ITrip);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const fetchTrip = find(mockTrips, { id: Number(params.tripId) })!;
    console.log(fetchTrip);

    setTripData(fetchTrip);
  }, []);

  return (
    <div>
      {tripData && (
        <div>
          <strong>Source:</strong> {tripData.srcPort?.name}
          <br></br>
          <strong>Destination:</strong> {tripData.destPort?.name}
          <br></br>
          <strong>Departure Date & Time:</strong>{' '}
          {split(tripData.departureDateIso, 'T')[0]}{' '}
          {getTime(tripData.departureDateIso)}
          <br></br>
          <strong>Trip Type:</strong> {tripData.type}
          <br></br>
          <strong>Seats Types:</strong>{' '}
          {join(tripData.availableSeatTypes, ', ')}
          <br></br>
          <strong>Cabin Types:</strong> {join(tripData.availableCabins, ', ')}
          <br></br>
          <strong>Meals:</strong> {join(tripData.meals, ', ')}
          <br></br>
          <strong>Base:</strong> {tripData.baseFare}
        </div>
      )}
    </div>
  );
}

// we can include graphs
// we can include seat map
