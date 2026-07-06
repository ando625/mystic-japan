"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import type { Spot } from "@/types/domain";
import { RarityStars } from "@/components/ui/RarityStars";

const japanBounds: L.LatLngBoundsExpression = [
  [24, 122],
  [46.5, 146.5],
];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function createPinIcon(spot: Spot) {
  return L.divIcon({
    className: "",
    html: `
      <span class="mystic-pin-wrap ${spot.is_unlocked ? "is-unlocked" : "is-locked"}">
        <span class="mystic-pin"></span>
        <span class="mystic-pin-label">${escapeHtml(spot.name)}</span>
      </span>
    `,
    iconSize: [132, 42],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function positionedSpots(spots: Spot[]) {
  const groups = new Map<string, Spot[]>();

  spots.forEach((spot) => {
    const key = spot.prefecture;
    groups.set(key, [...(groups.get(key) ?? []), spot]);
  });

  return spots.map((spot) => {
    const group = groups.get(spot.prefecture) ?? [spot];
    const index = group.findIndex((item) => item.id === spot.id);

    if (group.length <= 1 || index < 0) {
      return { spot, position: [spot.latitude, spot.longitude] as [number, number] };
    }

    const angle = (Math.PI * 2 * index) / group.length - Math.PI / 2;
    const radius = Math.min(0.22, 0.1 + group.length * 0.035);

    return {
      spot,
      position: [
        spot.latitude + Math.sin(angle) * radius,
        spot.longitude + Math.cos(angle) * radius,
      ] as [number, number],
    };
  });
}

export function MysticMap({ spots }: { spots: Spot[] }) {
  const markers = positionedSpots(spots);

  return (
    <MapContainer
      center={[37.8, 137.8]}
      className="h-full min-h-[620px] w-full"
      maxBounds={japanBounds}
      maxBoundsViscosity={0.95}
      minZoom={5}
      scrollWheelZoom
      worldCopyJump={false}
      zoom={5}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        bounds={japanBounds}
        noWrap
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {markers.map(({ spot, position }) => (
        <Marker key={spot.id} icon={createPinIcon(spot)} position={position}>
          <Popup className="mystic-popup">
            <div className="min-w-52 space-y-2 bg-slate-950 text-slate-100">
              <p className="text-xs text-cyan-200">{spot.region}</p>
              <h3 className="text-base font-semibold">{spot.name}</h3>
              <RarityStars value={spot.rarity} />
              <p className="text-xs leading-5 text-slate-300">{spot.prefecture}</p>
              {!spot.is_unlocked ? <p className="text-xs text-violet-200">未解放: 詳細で条件を確認</p> : null}
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
