import {
  priceSchema,
  guestsSchema,
  dateSchema,
  distanceSchema,
  amenitiesSchema,
  titleSchema,
  descriptionSchema,
  citySchema,
  addressSchema,
  postalCodeSchema,
  latitudeSchema,
  longitudeSchema,
  listingFilterSchema,
  createGartenlaubeSchema,
  updateGartenlaubeSchema,
  bookingSchema,
  reviewSchema,
} from './validation-schemas';

/**
 * Jest-Tests für Validierungs-Schemas
 * Verwendet AAA-Muster (Arrange-Act-Assert)
 * Testet das aktuelle Validierungsverhalten
 */

describe('Validation Schemas', () => {
  describe('Price Schema', () => {
    it('should accept valid prices', () => {
      // Arrange
      const validPrices = [0, 25, 50, 100, 9999];

      // Act & Assert
      validPrices.forEach((price) => {
        expect(priceSchema.safeParse(price).success).toBe(true);
      });
    });

    it('should reject negative prices', () => {
      // Arrange
      const invalidPrice = -10;

      // Act
      const result = priceSchema.safeParse(invalidPrice);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject prices over 10000', () => {
      // Arrange
      const invalidPrice = 10001;

      // Act
      const result = priceSchema.safeParse(invalidPrice);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should accept undefined', () => {
      // Arrange
      const undefinedPrice = undefined;

      // Act
      const result = priceSchema.safeParse(undefinedPrice);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('Guests Schema', () => {
    it('should accept valid guest counts', () => {
      // Arrange
      const validCounts = [1, 2, 5, 10, 50, 100];

      // Act & Assert
      validCounts.forEach((count) => {
        expect(guestsSchema.safeParse(count).success).toBe(true);
      });
    });

    it('should reject zero guests', () => {
      // Arrange
      const invalidCount = 0;

      // Act
      const result = guestsSchema.safeParse(invalidCount);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject negative guests', () => {
      // Arrange
      const invalidCount = -5;

      // Act
      const result = guestsSchema.safeParse(invalidCount);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject guests over 100', () => {
      // Arrange
      const invalidCount = 101;

      // Act
      const result = guestsSchema.safeParse(invalidCount);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject non-integer values', () => {
      // Arrange
      const invalidCount = 2.5;

      // Act
      const result = guestsSchema.safeParse(invalidCount);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Distance Schema', () => {
    it('should accept valid distances', () => {
      // Arrange
      const validDistances = [0, 1, 5, 50, 100];

      // Act & Assert
      validDistances.forEach((distance) => {
        expect(distanceSchema.safeParse(distance).success).toBe(true);
      });
    });

    it('should reject negative distances', () => {
      // Arrange
      const invalidDistance = -1;

      // Act
      const result = distanceSchema.safeParse(invalidDistance);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject distances over 100', () => {
      // Arrange
      const invalidDistance = 101;

      // Act
      const result = distanceSchema.safeParse(invalidDistance);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Amenities Schema', () => {
    it('should accept valid amenities array', () => {
      // Arrange
      const validAmenities = ['wifi', 'parking', 'kitchen'];

      // Act
      const result = amenitiesSchema.safeParse(validAmenities);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validAmenities);
    });

    it('should accept empty array', () => {
      // Arrange
      const emptyArray = [];

      // Act
      const result = amenitiesSchema.safeParse(emptyArray);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should default to empty array for undefined', () => {
      // Arrange
      const undefinedValue = undefined;

      // Act
      const result = amenitiesSchema.safeParse(undefinedValue);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should reject non-string amenities', () => {
      // Arrange
      const invalidAmenities = ['wifi', 123, 'parking'];

      // Act
      const result = amenitiesSchema.safeParse(invalidAmenities);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Title Schema', () => {
    it('should accept valid titles', () => {
      // Arrange
      const validTitles = ['Test', 'Gartenlaube am See', 'Cozy Garden House'];

      // Act & Assert
      validTitles.forEach((title) => {
        expect(titleSchema.safeParse(title).success).toBe(true);
      });
    });

    it('should reject titles under 3 characters', () => {
      // Arrange
      const invalidTitle = 'AB';

      // Act
      const result = titleSchema.safeParse(invalidTitle);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject titles over 255 characters', () => {
      // Arrange
      const invalidTitle = 'A'.repeat(256);

      // Act
      const result = titleSchema.safeParse(invalidTitle);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('City Schema', () => {
    it('should accept valid cities', () => {
      // Arrange
      const validCities = ['Berlin', 'München', 'Hamburg'];

      // Act & Assert
      validCities.forEach((city) => {
        expect(citySchema.safeParse(city).success).toBe(true);
      });
    });

    it('should reject cities under 2 characters', () => {
      // Arrange
      const invalidCity = 'A';

      // Act
      const result = citySchema.safeParse(invalidCity);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should accept undefined', () => {
      // Arrange
      const undefinedCity = undefined;

      // Act
      const result = citySchema.safeParse(undefinedCity);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('Postal Code Schema', () => {
    it('should accept valid 5-digit postal codes', () => {
      // Arrange
      const validCodes = ['10115', '80331', '20095'];

      // Act & Assert
      validCodes.forEach((code) => {
        expect(postalCodeSchema.safeParse(code).success).toBe(true);
      });
    });

    it('should reject postal codes with non-digits', () => {
      // Arrange
      const invalidCode = '1011A';

      // Act
      const result = postalCodeSchema.safeParse(invalidCode);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should reject postal codes with wrong length', () => {
      // Arrange
      const invalidCodes = ['1011', '101150'];

      // Act & Assert
      invalidCodes.forEach((code) => {
        expect(postalCodeSchema.safeParse(code).success).toBe(false);
      });
    });
  });

  describe('Coordinates Schema', () => {
    it('should accept valid latitude', () => {
      // Arrange
      const validLatitudes = [-90, 0, 52.52, 90];

      // Act & Assert
      validLatitudes.forEach((lat) => {
        expect(latitudeSchema.safeParse(lat).success).toBe(true);
      });
    });

    it('should reject latitude over 90', () => {
      // Arrange
      const invalidLatitude = 91;

      // Act
      const result = latitudeSchema.safeParse(invalidLatitude);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should accept valid longitude', () => {
      // Arrange
      const validLongitudes = [-180, 0, 13.405, 180];

      // Act & Assert
      validLongitudes.forEach((lng) => {
        expect(longitudeSchema.safeParse(lng).success).toBe(true);
      });
    });

    it('should reject longitude over 180', () => {
      // Arrange
      const invalidLongitude = 181;

      // Act
      const result = longitudeSchema.safeParse(invalidLongitude);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Listing Filter Schema', () => {
    it('should accept valid filter object', () => {
      // Arrange
      const validFilter = {
        city: 'Berlin',
        minPrice: 30,
        maxPrice: 100,
        maxDistanceToRadweg: 5,
        amenities: ['wifi', 'parking'],
        limit: 20,
        offset: 0,
      };

      // Act
      const result = listingFilterSchema.safeParse(validFilter);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should accept empty filter object with defaults', () => {
      // Arrange
      const emptyFilter = {};

      // Act
      const result = listingFilterSchema.safeParse(emptyFilter);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(20);
      expect(result.data?.offset).toBe(0);
    });

    it('should reject invalid limit', () => {
      // Arrange
      const invalidFilter = { limit: 101 };

      // Act
      const result = listingFilterSchema.safeParse(invalidFilter);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Create Gartenlaube Schema', () => {
    it('should accept valid gartenlaube data', () => {
      // Arrange
      const validData = {
        title: 'Test Laube',
        description: 'A nice garden house',
        pricePerNight: '49',
        maxGuests: 4,
        latitude: '52.52',
        longitude: '13.405',
        address: 'Teststraße 1',
        city: 'Berlin',
        postalCode: '10115',
        distanceToRadweg: '0.8',
        amenities: ['wifi', 'parking'],
      };

      // Act
      const result = createGartenlaubeSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      // Arrange
      const invalidData = {
        title: 'Test',
        // missing other required fields
      };

      // Act
      const result = createGartenlaubeSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Booking Schema', () => {
    it('should accept valid booking data', () => {
      // Arrange
      const validBooking = {
        gartenlaubeId: 1,
        checkInDate: '2026-07-15',
        checkOutDate: '2026-07-17',
        numberOfGuests: 2,
        guestMessage: 'Looking forward to the stay',
      };

      // Act
      const result = bookingSchema.safeParse(validBooking);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject invalid gartenlaube ID', () => {
      // Arrange
      const invalidBooking = {
        gartenlaubeId: 0,
        checkInDate: '2026-07-15',
        checkOutDate: '2026-07-17',
        numberOfGuests: 2,
      };

      // Act
      const result = bookingSchema.safeParse(invalidBooking);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Review Schema', () => {
    it('should accept valid review data', () => {
      // Arrange
      const validReview = {
        gartenlaubeId: 1,
        bookingId: 1,
        rating: 5,
        title: 'Excellent stay',
        comment: 'The garden house was beautiful and clean',
      };

      // Act
      const result = reviewSchema.safeParse(validReview);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject rating outside 1-5 range', () => {
      // Arrange
      const invalidReview = {
        gartenlaubeId: 1,
        bookingId: 1,
        rating: 6,
        comment: 'Good',
      };

      // Act
      const result = reviewSchema.safeParse(invalidReview);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should accept review without title and comment', () => {
      // Arrange
      const minimalReview = {
        gartenlaubeId: 1,
        bookingId: 1,
        rating: 4,
      };

      // Act
      const result = reviewSchema.safeParse(minimalReview);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
