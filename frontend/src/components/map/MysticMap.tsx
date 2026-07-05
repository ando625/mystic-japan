"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import type { Spot } from "@/types/domain";
import { RarityStars } from "@/components/ui/RarityStars";

const pinIcon = L.divIcon({
  className: "",
  html: '<span class="mystic-pin"></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

export function MysticMap({ spots }: { spots: Spot[] }) {
  return (
    <MapContainer center={[37.8, 137.8]} zoom={5} scrollWheelZoom className="h-full min-h-[620px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {spots.map((spot) => (
        <Marker key={spot.id} icon={pinIcon} position={[spot.latitude, spot.longitude]}>
          <Popup className="mystic-popup">
            <div className="min-w-52 space-y-2 bg-slate-950 text-slate-100">
              <p className="text-xs text-cyan-200">{spot.region}</p>
              <h3 className="text-base font-semibold">{spot.name}</h3>
              <RarityStars value={spot.rarity} />
              <p className="text-xs leading-5 text-slate-300">{spot.prefecture}</p>
              <Link className="text-sm font-medium text-violet-200" href={`/spots/${spot.id}`}>
                詳細へ
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
