import React, { useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Coordinates, NearbyPerson, MeetupSpot, UserProfile } from '../types';
import { Coffee, Wine, Trees, BookOpen, MapPin, Navigation } from 'lucide-react';

interface GoogleMapViewProps {
  user: UserProfile;
  nearbyPeople: NearbyPerson[];
  spots: MeetupSpot[];
  selectedPerson: NearbyPerson | null;
  selectedSpot: MeetupSpot | null;
  onSelectPerson: (person: NearbyPerson) => void;
  onSelectSpot: (spot: MeetupSpot) => void;
  routeDestination: Coordinates | null;
}

/**
 * Polyline renderer for routes using Google Maps geometry/maps library
 */
function RoutePolyline({
  origin,
  destination,
}: {
  origin: Coordinates;
  destination: Coordinates | null;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const coreLib = useMapsLibrary('core');

  useEffect(() => {
    if (!map || !mapsLib || !destination) return;

    // Create polyline for the walking path
    const polyline = new mapsLib.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: '#f43f5e',
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: map,
    });

    // Fit map bounds to show both points
    const LatLngBoundsClass = coreLib?.LatLngBounds || (typeof google !== 'undefined' && google.maps ? google.maps.LatLngBounds : null);
    if (LatLngBoundsClass) {
      const bounds = new LatLngBoundsClass();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, coreLib, origin, destination]);

  return null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  user,
  nearbyPeople,
  spots,
  selectedPerson,
  selectedSpot,
  onSelectPerson,
  onSelectSpot,
  routeDestination,
}) => {
  const getSpotIcon = (category: string) => {
    switch (category) {
      case 'cafe':
        return <Coffee className="w-3.5 h-3.5 text-amber-300" />;
      case 'bar':
        return <Wine className="w-3.5 h-3.5 text-rose-300" />;
      case 'park':
        return <Trees className="w-3.5 h-3.5 text-emerald-300" />;
      case 'bookstore':
        return <BookOpen className="w-3.5 h-3.5 text-blue-300" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
      <Map
        defaultCenter={user.coords}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full min-h-[480px]"
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
      >
        {/* User Location Marker */}
        <AdvancedMarker position={user.coords} title="You Are Here">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white ring-4 ring-rose-500/30 shadow-lg animate-pulse">
              <Navigation className="w-4 h-4 fill-white" />
            </div>
            <span className="mt-1 px-1.5 py-0.5 text-[9px] font-bold text-white bg-zinc-950/90 rounded border border-rose-500/50 shadow">
              You
            </span>
          </div>
        </AdvancedMarker>

        {/* Nearby People Markers */}
        {!user.isGhostMode &&
          nearbyPeople.map(person => {
            const isSelected = selectedPerson?.id === person.id;

            return (
              <AdvancedMarker
                key={person.id}
                position={person.coords}
                title={`${person.name} (${person.distanceWalkingMin}m walk)`}
                onClick={() => onSelectPerson(person)}
              >
                <div
                  className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  <div
                    className={`relative w-9 h-9 rounded-full overflow-hidden p-0.5 shadow-xl ${
                      isSelected
                        ? 'ring-2 ring-rose-400 bg-rose-500'
                        : 'ring-1 ring-zinc-700 bg-zinc-800'
                    }`}
                  >
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-rose-900 flex items-center justify-center text-xs font-bold text-white">
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1.5 py-0.5 text-[9px] font-mono-numbers font-medium text-zinc-100 bg-zinc-950/90 rounded border border-zinc-800 shadow whitespace-nowrap">
                    {person.name.split(' ')[0]} · {person.distanceMiles}mi
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* Safe Meetup Spot Markers */}
        {spots.map(spot => {
          const isSelected = selectedSpot?.id === spot.id;

          return (
            <AdvancedMarker
              key={spot.id}
              position={spot.coords}
              title={`${spot.name} (${spot.walkTimeMin}m walk)`}
              onClick={() => onSelectSpot(spot)}
            >
              <div
                className={`flex flex-col items-center cursor-pointer transition-transform ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-lg border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-300 ring-2 ring-amber-400/40 text-zinc-950'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-200'
                  }`}
                >
                  {getSpotIcon(spot.category)}
                </div>
                <span className="mt-0.5 px-1.5 py-0.5 text-[8px] font-medium text-zinc-200 bg-zinc-950/90 rounded border border-zinc-800 shadow whitespace-nowrap">
                  {spot.name.split(' ')[0]}
                </span>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Route Polyline if destination is active */}
        {routeDestination && (
          <RoutePolyline origin={user.coords} destination={routeDestination} />
        )}
      </Map>

      {/* Floating Map Legend / Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 p-1.5 bg-zinc-950/90 backdrop-blur-md rounded-xl border border-zinc-800 text-[11px] text-zinc-300 shadow-xl">
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Nearby singles</span>
        </div>
        <span className="text-zinc-600">·</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span>Safe meetup spots</span>
        </div>
      </div>
    </div>
  );
};
