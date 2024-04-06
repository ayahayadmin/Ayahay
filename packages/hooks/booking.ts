import { IBooking, ITrip } from "@ayahay/models";
import { useEffect, useState } from "react";

export function useBookingControls(
    booking: IBooking | undefined, 
    trip: ITrip | undefined,
    hasPrivilegedAccess: boolean | undefined,
) {
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (isPrinting) {
          window.print();
          setIsPrinting(false);
        }
      }, [isPrinting]);
      
    const showQrCode =
        booking?.bookingStatus === 'Confirmed' &&
        booking?.paymentStatus === 'Success' &&
        trip?.status === 'Awaiting';

    const showCancelBookingButton =
        booking?.bookingStatus === 'Confirmed' &&
        hasPrivilegedAccess;
    
    const onClickPrint = () => {
        if (hasPrivilegedAccess) {
          // swap component to minimal view, then print (for thermal printer)
          setIsPrinting(true);
        } else {
          window.print();
        }
      };

    
      const getUserAction = () => {
        if (booking === undefined) {
          return '';
        }
    
        switch (booking.paymentStatus) {
          case 'Pending':
            return 'The QR code will be available after your payment has been processed.';
          case 'Success':
            return 'Show this QR code to the person in charge to verify your booking';
        }
        return '';
      };    


      return {
        isPrinting, onClickPrint,
        showQrCode, showCancelBookingButton,
        getUserAction
      };
}