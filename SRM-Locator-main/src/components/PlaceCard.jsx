import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Car,
  Clock,
  Coffee,
  Flag,
  MapPin,
  Monitor,
  Navigation,
  ScanLine,
  ShieldCheck,
  Snowflake,
  VolumeX,
  Wifi,
  X,
  BookOpen,
  Camera
} from 'lucide-react';
import { Button, Chip } from './ui';
import BuildingInfo from './BuildingInfo';
import { locateTarget } from '../utils/direction';
import { PLACE, categoryLabel, directionLabel, distanceLabel, walkLabel } from '../copy/place';
import { getBuildingAsset } from '../data/srmBuildingAssets';
import CampusBuildingImage from './map/CampusBuildingImage';

/**
 * Facility icon mapping for senior Google/Apple Maps aesthetic.
 */
function getFacilityIcon(facility) {
  const f = facility.toLowerCase();
  if (f.includes('wi-fi') || f.includes('wifi') || f.includes('internet')) return Wifi;
  if (f.includes('ac') || f.includes('air conditioning')) return Snowflake;
  if (f.includes('study') || f.includes('reading') || f.includes('library')) return BookOpen;
  if (f.includes('computer') || f.includes('lab') || f.includes('pc') || f.includes('terminal')) return Monitor;
  if (f.includes('quiet') || f.includes('silent')) return VolumeX;
  if (f.includes('security') || f.includes('safe')) return ShieldCheck;
  if (f.includes('cafeteria') || f.includes('dining') || f.includes('mess') || f.includes('coffee') || f.includes('food')) return Coffee;
  if (f.includes('parking') || f.includes('valet')) return Car;
  return Building2;
}

/**
 * Modern Tactical / Glassmorphic Place Detail Card.
 * Redesigned with sleek transparent frosted glass, HUD aesthetics, and clean typography
 * instead of puffy/cloudy opaque containers.
 *
 * @param {{ place: object, me: {lat:number,lng:number}|null, heading?: number,
 *   headingLive?: boolean, choosingDestination?: boolean, expanded: boolean,
 *   onToggleExpanded: () => void, onClose: () => void, onNavigate: () => void,
 *   onArScan: () => void, onSetMeetingPoint?: (() => void) | null, onShowOnMap: () => void }} props
 */
export default function PlaceCard({
  place,
  me,
  heading,
  headingLive,
  choosingDestination = false,
  expanded,
  onToggleExpanded,
  onClose,
  onNavigate,
  onArScan,
  onSetMeetingPoint = null,
  onShowOnMap,
}) {
  const where = locateTarget(me, place, { heading, headingLive });
  const category = categoryLabel(place.category);
  const direction = directionLabel(where);

  const asset = getBuildingAsset(place);
  const photos = asset?.photos || [asset?.image];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Approximate walk time in minutes
  const walkMinutes = where && !where.here ? Math.max(1, Math.round(where.distance / 75)) : 2;

  return (
    <div className="relative rounded-2xl bg-[#0b0f19]/80 dark:bg-[#0b0f19]/85 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] text-slate-100 font-ui flex flex-col overflow-hidden max-h-[85vh]">
      {/* Top Hero Photo Gallery */}
      <div className="relative w-full h-44 sm:h-48 bg-black/40 shrink-0 overflow-hidden">
        <CampusBuildingImage
          src={photos[activePhotoIdx] || asset?.image}
          alt={place.name}
          aspectRatio="aspect-auto"
          containerClassName="w-full h-full"
        />

        {/* Tactical gradient vignette seamlessly blending photo into transparent card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/35 to-black/30 pointer-events-none" />

        {/* Floating Controls Over Hero Banner */}
        <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-8 h-8 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/15 text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm pointer-events-auto"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              aria-label="Bookmark"
              className={`w-8 h-8 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                isBookmarked
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                  : 'bg-black/50 hover:bg-black/75 border-white/15 text-white/90 hover:text-white'
              }`}
            >
              <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={PLACE.close}
              className="w-8 h-8 rounded-xl bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/15 text-white/90 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Photo Index Indicator */}
        {photos.length > 1 && (
          <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-semibold tracking-wider flex items-center gap-1.5 shadow-sm">
            <Camera size={11} className="text-blue-400" />
            <span>{activePhotoIdx + 1}/{photos.length}</span>
          </div>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 custom-scrollbar">
        {/* Title & Category Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {category && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-md border border-blue-500/25">
                  {category}
                </span>
              )}
              {asset?.categoryDisplay && asset.categoryDisplay !== category && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/25">
                  {asset.categoryDisplay}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white break-words leading-tight">
              {place.name}
            </h2>
            {asset?.floors && (
              <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                <span>{asset.floors} Floors</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Stat Chips (Apple Maps / HUD aesthetic) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Distance & Walk Time */}
          {where && (
            <div
              data-testid="place-distance"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-md transition-colors text-left"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <MapPin size={14} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">
                  {!where.here ? distanceLabel(where.shownDistance) : 'Here'}
                </p>
                <p className="text-[10.5px] font-medium text-slate-400 truncate">
                  ~{walkMinutes} min walk
                </p>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 backdrop-blur-md transition-colors text-left">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-400 leading-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>Open</span>
              </p>
              <p className="text-[10.5px] font-medium text-slate-400 truncate">
                {asset?.hours?.replace('Open • ', '') || 'Campus Hours'}
              </p>
            </div>
          </div>

          {/* Quick AR Action */}
          <button
            type="button"
            onClick={onArScan}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 hover:border-indigo-500/40 backdrop-blur-md transition-all text-left group"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 flex items-center justify-center shrink-0 transition-transform">
              <ScanLine size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-indigo-300 leading-tight transition-colors">
                AR Scan
              </p>
              <p className="text-[10.5px] font-medium text-slate-400 truncate">
                Camera Finder
              </p>
            </div>
          </button>
        </div>

        {/* Description */}
        <div className="text-xs text-slate-300/90 leading-relaxed font-normal bg-white/[0.03] p-3 rounded-xl border border-white/[0.07]">
          {asset?.description || place.info}
        </div>

        {/* Facilities Grid */}
        {asset?.facilities && asset.facilities.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Facilities & Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {asset.facilities.map((fac) => {
                const IconComponent = getFacilityIcon(fac);
                return (
                  <div
                    key={fac}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11.5px] font-medium text-slate-200"
                  >
                    <IconComponent size={14} className="text-blue-400 shrink-0" />
                    <span className="truncate">{fac}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Photos Strip */}
        {photos.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Photos
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {photos.map((photoUrl, idx) => (
                <button
                  type="button"
                  key={photoUrl}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all border ${
                    activePhotoIdx === idx
                      ? 'border-blue-400 ring-2 ring-blue-500/40 scale-105 shadow-md'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  <CampusBuildingImage
                    src={photoUrl}
                    alt={`${place.name} ${idx + 1}`}
                    aspectRatio="aspect-auto"
                    containerClassName="w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Building Info section */}
        {expanded && (
          <div className="border-t border-white/10 pt-3">
            <BuildingInfo building={place} me={me} heading={heading} headingLive={headingLive} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="p-3 bg-black/40 backdrop-blur-xl border-t border-white/10 flex flex-col gap-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <Button
            icon={Navigation}
            onClick={onNavigate}
            className="w-full !rounded-xl !h-10 !py-0 font-semibold !text-xs tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] !text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30 gap-1.5"
          >
            {choosingDestination ? PLACE.setDestination : PLACE.navigate}
          </Button>
          <Button
            variant="tonal"
            icon={ScanLine}
            onClick={onArScan}
            className="w-full !rounded-xl !h-10 !py-0 font-semibold !text-xs tracking-wide !bg-white/10 hover:!bg-white/15 active:scale-[0.98] !text-white border border-white/15 gap-1.5"
          >
            {PLACE.arScan}
          </Button>
        </div>

        {onSetMeetingPoint && (
          <Button
            variant="secondary"
            icon={Flag}
            block
            onClick={onSetMeetingPoint}
            className="!rounded-xl !h-8 !py-0 font-medium !text-[11.5px] !text-slate-300 hover:!text-white hover:!bg-white/5 border-0 gap-1.5"
          >
            {PLACE.setMeetingPoint}
          </Button>
        )}

        <div className="flex justify-center items-center gap-3 pt-0.5">
          <Button
            variant="plain"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            className="!text-[11.5px] font-medium !min-h-6 !py-0 px-2 !text-slate-400 hover:!text-white transition-colors"
          >
            {expanded ? PLACE.less : PLACE.more}
          </Button>
          {expanded && (
            <Button
              variant="plain"
              icon={MapPin}
              onClick={onShowOnMap}
              className="!text-[11.5px] font-medium !min-h-6 !py-0 px-2 !text-slate-400 hover:!text-white transition-colors"
            >
              {PLACE.showOnMap}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
