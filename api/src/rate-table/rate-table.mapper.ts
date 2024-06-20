import { Injectable } from '@nestjs/common';
import { IRateTable, IRateTableRow, IRateTableMarkup } from '@ayahay/models';
import { VehicleMapper } from '@/vehicle/vehicle.mapper';
import { CabinMapper } from '@/cabin/cabin.mapper';

@Injectable()
export class RateTableMapper {
  constructor(
    private readonly cabinMapper: CabinMapper,
    private readonly vehicleMapper: VehicleMapper
  ) {}

  convertRateTableToPublicDto(rateTable: any): IRateTable {
    return {
      id: rateTable.id,
      shippingLineId: rateTable.shippingLineId,
      name: rateTable.name,
      rows: rateTable.rows.map((row) => this.convertRateTableRowToDto(row)),
      // markups should be private
      markups: [],
    };
  }

  convertRateTableToPrivilegedDto(rateTable: any): IRateTable {
    const publicDto = this.convertRateTableToPublicDto(rateTable);
    return {
      ...publicDto,
      markups:
        rateTable.markups?.map((markup) =>
          this.convertRateTableMarkupToDto(markup)
        ) ?? [],
    };
  }

  convertRateTableRowToDto(rateTableRow: any): IRateTableRow {
    return {
      id: rateTableRow.id,
      rateTableId: rateTableRow.rateTableId,
      cabinId: rateTableRow.cabinId ?? undefined,
      cabin:
        rateTableRow.cabin !== null
          ? this.cabinMapper.convertCabinToDto(rateTableRow.cabin)
          : undefined,
      vehicleTypeId: rateTableRow.vehicleTypeId ?? undefined,
      vehicleType:
        rateTableRow.vehicleType !== null
          ? this.vehicleMapper.convertVehicleTypeToDto(rateTableRow.vehicleType)
          : undefined,
      fare: rateTableRow.fare,
      canBookOnline: rateTableRow.canBookOnline,
    };
  }

  convertRateTableMarkupToDto(rateTableMarkup: any): IRateTableMarkup {
    return {
      id: rateTableMarkup.id,
      rateTableId: rateTableMarkup.rateTableId,
      travelAgencyId: rateTableMarkup.travelAgencyId ?? undefined,
      clientId: rateTableMarkup.clientId ?? undefined,
      markupFlat: rateTableMarkup.markupFlat,
      markupPercent: rateTableMarkup.markupPercent,
      markupMaxFlat: rateTableMarkup.markupMaxFlat,
    };
  }
}
