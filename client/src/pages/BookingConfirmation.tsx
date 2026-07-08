import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, MapPin, Calendar, Users, DollarSign, Mail } from 'lucide-react';

interface BookingData {
  bookingId: number;
  gartenlaubeTitle: string;
  gartenlaubeCity: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: string;
  guestEmail: string;
  hostName: string;
  guestMessage?: string;
}

export default function BookingConfirmation() {
  const [location, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get booking data from URL params or session storage
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const data = sessionStorage.getItem('bookingConfirmation');

    if (data) {
      try {
        setBookingData(JSON.parse(data));
        sessionStorage.removeItem('bookingConfirmation');
      } catch (e) {
        console.error('Failed to parse booking data:', e);
      }
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C85A3A]" />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Buchungsdaten nicht gefunden</h2>
          <p className="text-gray-600 mb-6">
            Es scheint, dass die Buchungsinformationen nicht verfügbar sind.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-[#C85A3A] hover:bg-[#B84A2A] text-white"
          >
            Zur Startseite
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const nights = calculateNights(bookingData.checkInDate, bookingData.checkOutDate);

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C85A3A] rounded-full opacity-20 animate-pulse" />
              <CheckCircle className="w-24 h-24 text-[#C85A3A] relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buchung bestätigt!</h1>
          <p className="text-lg text-gray-600">
            Ihre Reservierung wurde erfolgreich abgeschlossen
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#C85A3A] to-[#B8860B] p-6 text-white">
            <h2 className="text-2xl font-bold">{bookingData.gartenlaubeTitle}</h2>
            <div className="flex items-center gap-2 mt-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span>{bookingData.gartenlaubeCity}</span>
            </div>
          </div>

          {/* Booking Info Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Check-in */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#C85A3A]/10">
                    <Calendar className="h-6 w-6 text-[#C85A3A]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ankunft</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(bookingData.checkInDate)}
                  </p>
                  <p className="text-sm text-gray-600">Ab 15:00 Uhr</p>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#B8860B]/10">
                    <Calendar className="h-6 w-6 text-[#B8860B]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Abreise</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(bookingData.checkOutDate)}
                  </p>
                  <p className="text-sm text-gray-600">Bis 11:00 Uhr</p>
                </div>
              </div>

              {/* Guests */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#6B8E7F]/10">
                    <Users className="h-6 w-6 text-[#6B8E7F]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gäste</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {bookingData.numberOfGuests} {bookingData.numberOfGuests === 1 ? 'Person' : 'Personen'}
                  </p>
                  <p className="text-sm text-gray-600">{nights} Nächte</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gesamtpreis</p>
                  <p className="text-lg font-semibold text-gray-900">€{bookingData.totalPrice}</p>
                  <p className="text-sm text-gray-600">Zahlung bei Ankunft</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8" />

            {/* Booking ID and Contact */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Buchungs-ID:</span>
                <span className="font-mono text-lg font-bold text-[#C85A3A]">
                  #{bookingData.bookingId}
                </span>
              </div>

              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Bestätigungsmail gesendet</p>
                  <p className="text-sm text-gray-600">{bookingData.guestEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 p-6 border-l-4 border-l-[#6B8E7F]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nächste Schritte</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B8E7F] text-white flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span className="text-gray-700">
                Der Gastgeber wird Ihre Buchungsanfrage überprüfen und bestätigen
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B8E7F] text-white flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span className="text-gray-700">
                Sie erhalten eine Bestätigungsmail mit allen wichtigen Informationen
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6B8E7F] text-white flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span className="text-gray-700">
                Zahlung erfolgt bei Ankunft direkt beim Gastgeber
              </span>
            </li>
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/profile')}
            className="flex-1 bg-[#C85A3A] hover:bg-[#B84A2A] text-white h-12 text-base"
          >
            Zur Buchungshistorie
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1 border-2 border-[#C85A3A] text-[#C85A3A] hover:bg-[#C85A3A]/5 h-12 text-base"
          >
            Weitere Lauben entdecken
          </Button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Haben Sie Fragen? Kontaktieren Sie unseren{' '}
            <a href="mailto:support@gartenlaube.com" className="text-[#C85A3A] hover:underline">
              Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
