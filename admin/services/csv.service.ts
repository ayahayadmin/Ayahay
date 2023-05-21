import { ITrip } from "@/../packages/models";

export function processTripCsv(file: File) {
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            if (typeof reader.result === "string") {
                processTripRows(reader.result.split(/\r\n|\n/));
            }
            
        },
        false
    );

    if (file) {
      reader.readAsText(file);
    }
}

function processTripRows(rows: string[]) {
    const trips: ITrip[] = [];
    
    // first row is header row; ignore that
    for (let i = 1; i < rows.length; i++) {
        const tripRow = rows[i].split(',');
        const trip = processTripRow(tripRow);
        trips.push(trip);
    }

}

function processTripRow(row: string[]): ITrip {
    const headers = [
        "shippingLineName",
        "srcPortName",
        "destPortName",
        "departureDate",
        "baseFare",
    ]
}