'use client';

import React from 'react';
import { SUCURSAL_LOCATION, LOG, isWithinCoverage, checkGoogleMapsAPI } from '@/utils/locationPickerUtils';

declare global {
  interface Window {
    google: any;
  }
}

export const useLocationPicker = () => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);
  const autocompleteServiceRef = React.useRef<any>(null);
  const placesServiceRef = React.useRef<any>(null);
  const geocoderRef = React.useRef<any>(null);

  const initializeMap = async (
    onLocationUpdate: (location: { lat: number; lng: number; address: string }) => void,
    onCoverageUpdate: (coverage: { within: boolean; distance: number; message: string }) => void,
    onError: (error: string) => void,
    onLoadingChange: (loading: boolean) => void
  ) => {
    const startTime = Date.now();
    LOG.info('🚀 Starting map initialization...');
    
    try {
      onLoadingChange(true);
      onError('');

      if (!mapRef.current) {
        throw new Error('mapRef.current no disponible - el contenedor del mapa no existe');
      }

      const apiLoaded = await checkGoogleMapsAPI();
      if (!apiLoaded) {
        throw new Error('Google Maps API no pudo cargar después de 10 segundos');
      }

      if (!window.google.maps.Map || !window.google.maps.Marker || !window.google.maps.Geocoder) {
        throw new Error('Google Maps required classes not available');
      }

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: SUCURSAL_LOCATION,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        zoomControl: true,
        minZoom: 10,
        maxZoom: 18,
        mapTypeId: 'roadmap',
      });
      mapInstanceRef.current = map;

      const marker = new window.google.maps.Marker({
        position: SUCURSAL_LOCATION,
        map: map,
        draggable: true,
        title: 'Tu ubicación',
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current = marker;

      const geocoder = new window.google.maps.Geocoder();
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const placesService = new window.google.maps.places.PlacesService(map);
      
      geocoderRef.current = geocoder;
      autocompleteServiceRef.current = autocompleteService;
      placesServiceRef.current = placesService;

      const updateAddress = async (lat: number, lng: number) => {
        const coverage = isWithinCoverage(lat, lng);
        onCoverageUpdate(coverage);

        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results[0]) {
            const address = response.results[0].formatted_address;
            onLocationUpdate({ lat, lng, address });
          } else {
            const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationUpdate({ lat, lng, address: fallbackAddress });
          }
        } catch (error) {
          onLocationUpdate({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      };

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) {
          updateAddress(pos.lat(), pos.lng());
        }
      });

      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        map.panTo({ lat, lng });
        updateAddress(lat, lng);
      });

      await updateAddress(SUCURSAL_LOCATION.lat, SUCURSAL_LOCATION.lng);

      const totalTime = Date.now() - startTime;
      LOG.info(`🎉 MAP INITIALIZATION COMPLETED in ${totalTime}ms`);
      onLoadingChange(false);
    } catch (error) {
      const totalTime = Date.now() - startTime;
      LOG.error(`Map initialization failed after ${totalTime}ms`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el mapa';
      onError(errorMessage);
      onLoadingChange(false);
    }
  };

  const handleSearch = async (
    query: string,
    onPredictionsUpdate: (predictions: any[]) => void
  ) => {
    if (!autocompleteServiceRef.current) return;

    try {
      const response = await autocompleteServiceRef.current.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'mx' },
      });

      onPredictionsUpdate(response.predictions || []);
    } catch (error) {
      LOG.error('Error getting predictions', error);
      onPredictionsUpdate([]);
    }
  };

  const handleSelectPrediction = async (
    prediction: any,
    onLocationUpdate: (location: { lat: number; lng: number; address: string }) => void,
    onCoverageUpdate: (coverage: { within: boolean; distance: number; message: string }) => void
  ) => {
    if (!placesServiceRef.current || !markerRef.current || !mapInstanceRef.current) return;

    return new Promise((resolve, reject) => {
      placesServiceRef.current.getDetails(
        { placeId: prediction.place_id, fields: ['geometry', 'formatted_address'] },
        (result: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();
            const address = result.formatted_address || prediction.description;

            markerRef.current.setPosition({ lat, lng });
            mapInstanceRef.current.panTo({ lat, lng });
            mapInstanceRef.current.setZoom(15);

            const coverage = isWithinCoverage(lat, lng);
            onCoverageUpdate(coverage);
            onLocationUpdate({ lat, lng, address });

            resolve({ lat, lng, address });
          } else {
            reject(new Error(`Places service error: ${status}`));
          }
        }
      );
    });
  };

  return {
    mapRef,
    initializeMap,
    handleSearch,
    handleSelectPrediction,
  };
};
