import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import ListingPagination from '@/components/ListingPagination';
import ListingSkeleton from '@/components/ListingSkeleton';
import { MapPin, Users, Star, Wifi, UtensilsCrossed } from 'lucide-react';
import { useLocation } from 'wouter';

const ITEMS_PER_PAGE = 6;

export default function ListingsWithPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'distance-asc' | 'distance-desc' | 'featured'>('featured');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: 0,
    maxPrice: 200,
    maxDistanceToRadweg: 10,
    amenities: [] as string[],
  });

  // Calculate offset based on current page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch listings with pagination
  const { data, isLoading, error } = trpc.gartenlauben.list.useQuery({
    city: filters.city || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    maxDistanceToRadweg: filters.maxDistanceToRadweg || undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
    limit: ITEMS_PER_PAGE,
    offset: offset,
  });

  // Calculate total pages (assuming backend returns total count)
  // For now, we'll estimate based on the number of items returned
  const totalPages = data && data.length > 0 ? Math.ceil(100 / ITEMS_PER_PAGE) : 1;
  let listings = Array.isArray(data) ? data : [];

  // Apply sorting
  if (listings.length > 0) {
    listings = [...listings].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-asc':
          return Number(a.pricePerNight) - Number(b.pricePerNight);
        case 'price-desc':
          return Number(b.pricePerNight) - Number(a.pricePerNight);
        case 'distance-asc':
          return Number(a.distanceToRadweg || 0) - Number(b.distanceToRadweg || 0);
        case 'distance-desc':
          return Number(b.distanceToRadweg || 0) - Number(a.distanceToRadweg || 0);
        case 'featured':
        default:
          return b.isFeatured ? 1 : -1;
      }
    });
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
    setCurrentPage(1);
  };

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'kitchen', label: 'Küche', icon: UtensilsCrossed },
    { id: 'shower', label: 'Dusche', icon: null },
    { id: 'bed', label: 'Bett', icon: null },
    { id: 'terrace', label: 'Terrasse', icon: null },
    { id: 'garden', label: 'Garten', icon: null },
    { id: 'parking', label: 'Parkplatz', icon: null },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8D5C4] py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#333] mb-2">Gartenlauben entdecken</h1>
          <p className="text-[#666]">Finde die perfekte Gartenlaube für dein Radabenteuer</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-[#333] mb-4">Filter</h2>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333] mb-2">Stadt</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, city: e.target.value })
                  }
                  placeholder="z.B. Berlin"
                  className="w-full px-3 py-2 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A3A]"
                />
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333] mb-2">
                  Preis pro Nacht: €{filters.minPrice} - €{filters.maxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      maxPrice: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Distance Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333] mb-2">
                  Max. Entfernung zum Radweg: {filters.maxDistanceToRadweg} km
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.maxDistanceToRadweg}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      maxDistanceToRadweg: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* Amenities Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333] mb-3">Ausstattung</label>
                <div className="space-y-2">
                  {amenityOptions.map((amenity) => (
                    <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="w-4 h-4 rounded border-[#E8D5C4]"
                      />
                      <span className="text-sm text-[#666]">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListingSkeleton count={ITEMS_PER_PAGE} />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">Fehler beim Laden der Gartenlauben</p>
              </div>
            )}

            {/* Sort Controls */}
            {!isLoading && listings.length > 0 && (
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-[#666]">{listings.length} Gartenlauben gefunden</p>
                <div className="flex gap-2">
                  <label className="text-sm text-[#666] flex items-center gap-2">
                    Sortieren nach:
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C85A3A] text-sm"
                    >
                      <option value="featured">Empfohlen</option>
                      <option value="price-asc">Preis: Niedrig → Hoch</option>
                      <option value="price-desc">Preis: Hoch → Niedrig</option>
                      <option value="distance-asc">Entfernung: Nah → Fern</option>
                      <option value="distance-desc">Entfernung: Fern → Nah</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* Listings Grid */}
            {!isLoading && listings.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {listings && listings.map((listing: any) => (
                    <div
                      key={listing.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="w-full h-48 bg-gradient-to-br from-[#C85A3A] to-[#B8860B] flex items-center justify-center">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-white text-center">
                            <MapPin size={32} className="mx-auto mb-2" />
                            <p>Keine Bilder verfügbar</p>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-[#333] mb-1">{listing.title}</h3>
                        <p className="text-sm text-[#666] mb-3 line-clamp-2">
                          {listing.description}
                        </p>

                        {/* Location and Rating */}
                        <div className="flex justify-between items-center mb-3 text-sm">
                          <div className="flex items-center gap-1 text-[#666]">
                            <MapPin size={16} />
                            {listing.city}
                          </div>
                          <div className="flex items-center gap-1 text-[#B8860B]">
                            <Star size={16} fill="currentColor" />
                            4.8
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {listing.amenities?.slice(0, 3).map((amenity: string) => (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-[#E8D5C4] text-[#333] text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>

                        {/* Distance to Radweg */}
                        {listing.distanceToRadweg && (
                          <div className="text-xs text-[#666] mb-3">
                            <span className="font-semibold">Zum Radweg:</span> {listing.distanceToRadweg} km
                          </div>
                        )}

                        {/* Price and Button */}
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-[#C85A3A]">
                              €{listing.pricePerNight}
                            </p>
                            <p className="text-xs text-[#666]">pro Nacht</p>
                          </div>
                          <button className="px-4 py-2 bg-[#C85A3A] text-white rounded-lg hover:bg-[#B84A2A] transition-colors duration-200">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <ListingPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* Empty State */}
            {!isLoading && listings.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-[#666] text-lg">
                  Keine Gartenlauben gefunden. Versuche andere Filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
