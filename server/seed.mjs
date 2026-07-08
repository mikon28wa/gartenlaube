import { getDb } from './db.ts';
import { users, gartenlauben } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function seed() {
  const db = await getDb();
  
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    // Insert test user
    console.log('Inserting test user...');
    const existingUser = await db.select().from(users).where(eq(users.openId, 'test-host-001')).limit(1);
    let userId = 1;
    
    if (existingUser.length === 0) {
      const userResult = await db.insert(users).values({
        openId: 'test-host-001',
        name: 'Max Mustermann',
        email: 'max@example.com',
        loginMethod: 'manus',
        role: 'host',
      });
      userId = userResult[0].insertId || 1;
      console.log(`✓ User created with ID: ${userId}`);
    } else {
      userId = existingUser[0].id;
      console.log(`✓ User already exists with ID: ${userId}`);
    }

    // Insert test gartenlauben
    console.log('Inserting test gartenlauben...');
    
    const testGartenlauben = [
      {
        hostId: userId,
        title: 'Test-Gartenlaube Kassel',
        description: 'Demo-Eintrag für das Gastgeber-Dashboard.',
        pricePerNight: 49,
        maxGuests: 4,
        latitude: 51.312,
        longitude: 9.481,
        address: 'Teststraße 1',
        city: 'Kassel',
        postalCode: '34117',
        distanceToRadweg: 0.8,
        amenities: ['wifi', 'parking'],
        images: ['https://example.com/testbild.jpg'],
        isActive: true,
        isFeatured: true,
      },
      {
        hostId: userId,
        title: 'Gemütliche Laube am Elberadweg',
        description: 'Kleine, aber feine Gartenlaube mit Blick auf die Elbe. Perfekt für Radfahrer auf dem Elberadweg.',
        pricePerNight: 35,
        maxGuests: 2,
        latitude: 51.0504,
        longitude: 13.7373,
        address: 'Elbstraße 42',
        city: 'Dresden',
        postalCode: '01069',
        distanceToRadweg: 0.5,
        amenities: ['WLAN', 'Küche', 'Dusche', 'Bett'],
        images: [],
        isActive: true,
        isFeatured: true,
      },
      {
        hostId: userId,
        title: 'Laube im Grünen - Moseltal',
        description: 'Wunderschöne Gartenlaube im Moseltal mit Ausblick auf die Weinberge.',
        pricePerNight: 40,
        maxGuests: 2,
        latitude: 49.8,
        longitude: 6.6,
        address: 'Weinbergstraße 15',
        city: 'Bernkastel-Kues',
        postalCode: '54470',
        distanceToRadweg: 1.2,
        amenities: ['WLAN', 'Terrasse', 'Küche', 'Dusche'],
        images: [],
        isActive: true,
        isFeatured: true,
      },
      {
        hostId: userId,
        title: 'Radler-Oase am Rheinradweg',
        description: 'Charmante kleine Laube direkt am Rheinradweg. Perfekt für Radreisende mit kleinerem Budget.',
        pricePerNight: 32,
        maxGuests: 1,
        latitude: 50.9,
        longitude: 6.9,
        address: 'Rheinallee 8',
        city: 'Köln',
        postalCode: '50678',
        distanceToRadweg: 0.2,
        amenities: ['WLAN', 'Dusche', 'Küche'],
        images: [],
        isActive: true,
        isFeatured: false,
      },
      {
        hostId: userId,
        title: 'Grüne Oase - Bodensee',
        description: 'Naturnahe Gartenlaube am Bodensee mit Zugang zum Bodensee-Radweg.',
        pricePerNight: 45,
        maxGuests: 3,
        latitude: 47.65,
        longitude: 9.17,
        address: 'Seeuferstraße 22',
        city: 'Konstanz',
        postalCode: '78462',
        distanceToRadweg: 0.8,
        amenities: ['WLAN', 'Terrasse', 'Küche', 'Dusche', 'Garten'],
        images: [],
        isActive: true,
        isFeatured: true,
      },
      {
        hostId: userId,
        title: 'Kleine Laube - Spreeradweg',
        description: 'Gemütliche Gartenlaube am Spreeradweg in Berlin. Budget-freundlich.',
        pricePerNight: 28,
        maxGuests: 1,
        latitude: 52.52,
        longitude: 13.41,
        address: 'Spreestraße 5',
        city: 'Berlin',
        postalCode: '10178',
        distanceToRadweg: 0.3,
        amenities: ['WLAN', 'Dusche'],
        images: [],
        isActive: true,
        isFeatured: false,
      },
      {
        hostId: userId,
        title: 'Laube mit Charme - Neckarradweg',
        description: 'Historische kleine Laube am Neckarradweg mit modernem Komfort.',
        pricePerNight: 38,
        maxGuests: 2,
        latitude: 49.24,
        longitude: 9.17,
        address: 'Neckargasse 12',
        city: 'Heidelberg',
        postalCode: '69117',
        distanceToRadweg: 0.6,
        amenities: ['WLAN', 'Küche', 'Dusche', 'Bett'],
        images: [],
        isActive: true,
        isFeatured: false,
      },
    ];

    for (const data of testGartenlauben) {
      try {
        await db.insert(gartenlauben).values(data);
        console.log(`✓ Inserted: ${data.title}`);
      } catch (error) {
        console.warn(`⚠ Skipped (may already exist): ${data.title}`);
      }
    }

    console.log('\n✓ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error);
    process.exit(1);
  }
}

seed();
