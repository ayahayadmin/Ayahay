import { ITrip } from '@ayahay/models';
import { getPort } from './port.service';
import { getShippingLine } from './shipping-line.service';

export function mapTripResponseData(responseData: ITrip) {
  return Promise.allSettled([
    // For now we are just interested with Ports & Shipping Line. In the future we can add more like Ship
    getPort(responseData.srcPortId),
    getPort(responseData.destPortId),
    getShippingLine(responseData.shippingLineId),
  ]).then(([srcPort, destPort, shippingLine]) => {
    return {
      ...responseData,
      srcPort: srcPort.status === 'fulfilled' ? srcPort.value : '',
      destPort: destPort.status === 'fulfilled' ? destPort.value : '',
      shippingLine:
        shippingLine.status === 'fulfilled' ? shippingLine.value : '',
    };
  });
}
