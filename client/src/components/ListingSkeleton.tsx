import React from 'react';

interface ListingSkeletonProps {
  count?: number;
}

export default function ListingSkeleton({ count = 6 }: ListingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="w-full h-48 bg-gray-300" />

          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-4 bg-gray-300 rounded w-3/4" />

            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded w-full" />
              <div className="h-3 bg-gray-300 rounded w-5/6" />
            </div>

            {/* Price and Rating */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-gray-300 rounded w-1/4" />
              <div className="h-4 bg-gray-300 rounded w-1/4" />
            </div>

            {/* Amenities */}
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-gray-300 rounded w-16" />
              <div className="h-6 bg-gray-300 rounded w-16" />
              <div className="h-6 bg-gray-300 rounded w-16" />
            </div>

            {/* Button */}
            <div className="h-10 bg-gray-300 rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </>
  );
}
