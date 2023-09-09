import { SHIPPING_LINE_API } from '@ayahay/constants';
import { IShippingLine } from '@ayahay/models/shipping-line.model';
import axios from 'axios';
import dayjs from 'dayjs';
import { isWithinTimeInterval, removeCache } from './utils';

export function getShippingLinesMock(): IShippingLine[] {
  const shippingLineNames = [
    'ALESON SHIPPING LINES, INC.',
    'MONTENEGRO SHIPPING LINES, INC.',
    'LITE SHIPPING CORPORATION',
    'OCEAN FAST FERRIES INC.',
    'COKALIONG SHIPPING LINES INC.',
    'ARCHIPELAGO PHILIPPINE FERRIES CORPORATION',
    'DAIMA SHIPPING CORPORATION',
    'STARLITE FERRIES, INC.',
    '2GO GROUP, INC.',
    'SRN FAST SEACRAFTS INC.',
    'SUPERCAT FAST FERRY CORP.',
    'STA. CLARA SHIPPING CORPORATION',
    'TRANS ASIA SHIPPING LINES INC.',
    'SEA HIGHWAY CARRIER INC.',
    'ASIAN MARINE TRANSPORT CORPORATION',
    'MARINA FERRIES INC.',
    'TRANS-ASIA SOUTHLAND SHIPPING',
    'REGINA SHIPPING LINES INC.',
    'ROBLE SHIPPING LINES',
    'Philippine Archipelago Ports & Terminal Services, Inc.',
    'TRI-STAR MEGALINK CORPORATION',
    'GEORGE AND PETER LINES, INC.',
    'ERNESTO SOCOBOS SR.',
    'MEDALLION TRANSPORT, INC.',
    'GL SHIPPING LINES',
    'IBNERIZAM SHIPPING LINES INC.',
    'GREAT SEA PLUS CORPORATION',
    'MORETA SHIPPING LINES INC.',
    'MCC TRANSPORT PHILIPPINES, INC.',
    'PRUDENTIAL SHIPPING AGENCY SERVICES INC.',
    'EVERGREEN SHIPPING AGENCY PHILIPPINES CORP.',
    'CABANERO, NORBERTO B.',
    'J & N SHIPPING LINES CORP.',
    'BESTA SHIPPING LINES, INC.',
    'BICOLANDIA LINES INC.',
    'ISLAND SHIPPING CORPORATION',
    'EVER LINES INC.',
    'NEGROS NAVIGATION CO., INC.',
    'MENDOZA, MIRBEN P.',
    'SING SHIPPING LINES INC.',
    'GOTHONG SOUTHERN SHIPPING LINES, INC.',
    'KATRAFAR SHIPPING LINES',
    'JOMALIA SHIPPING CORPORATION',
    'SUCRE ENTERPRISES CORPORATION',
    'SUNLINE SHIPPING CORPORATION',
    'MILAGROSA J SHIPPING CORPORATION',
    'LORENZO SHIPPING CORPORATION',
    'MANDAUE SHIPPING AND LIGHTERAGE CORPORATION',
    'TMS SHIP AGENCIES, INC.',
    'OBLIGADO, NERI A.',
    'CRUZ, REYNALDO M.',
    'MAGNOLIA SHIPPING CORP.',
    'OCEANIC CONTAINER LINES, INC.',
    'APL CO. PTE LTD.',
    'LARRY BATAS NUYDA',
    'CARLITO E. EBRADA',
    'DOLE PHILIPPINES INC.',
    'BCT SHIPPING LINES, INC.',
    'MERIDIAN CARGO-FORWARDERS INC.',
    'EAGLE EXPRESS LINES INC.',
    'AMERICAN PRESIDENT LINES',
    'E. B. AZNAR SHIPPING CORPORATION',
    'FKT SHIPPING AGENCY',
    'MAJESTIC SHIPPING CORPORATION',
    'NMC CONTAINER LINES, INC.',
    'SOLID SHIPPING LINES CORPORATION',
    'ASIAN SHIPPING CORPORATION',
    'ABOITIZ ONE INCORPORATED',
    'LARCENA SHIPPING LINES',
    'CMA CGM AND ANL PHILIPPINES, INC.',
    'FULLSTEAM SHIPPING CORP.',
    'VICTORIANA CUYSONA',
    'PHILIPPINE SPAN ASIA CARRIER CORP.',
    'MINOLO SHIPPING LINES',
    'FIESTA CARGO AND LOGISTICS INC.',
    'ND SHIPPING AGENCY & ALLIED SERVICES INC.',
    'ISLAND INTEGRATED OFFSHORE SERVICES INC.',
    'CHRISTOPHER A. TRIUMFANTE',
    'CONCRETE SOLUTIONS, INC.',
    'JP SHIPPING LINES INC.',
    'BONANZA, WENIFREDO',
    'SUSANA SHIPPING LINES',
    'PULUPANDAN NCP VESSELS',
    'WENIFREDO B. ARAOJO',
    "FATHER N' SON LINES - RDI SHIPPING INC.",
    'MANDAUE SHIPPING AND LIGHTERAGE CORP.',
    'CEBU SEA CHARTERERS, INC.',
    'ORLINES SEA-LAND TRANSPORT INC.',
    'APO CEMENT CORPORATION',
    'ATLANTIS YOHAN EXPRESS CORP.',
    'SKYLINE SHIPPING',
    'RONEL A. ECALNIR',
    'LEIGHTON CONTRACTORS (PHILS.) INC.',
    'JOHN PAUL MORTEGA NATE',
    'COSCO CONTAINER LINES',
    'ESCANO LINES INC.',
    'HARBOR STAR SHIPPING SERVICES INC.',
    'FATHER & SON SHIPPING LINES',
    'ASIA BREWERY INC.',
    'GARCIA, REBECCA E.',
  ] as string[];

  return shippingLineNames.map((name, id) => {
    return { id, name } as IShippingLine;
  });
}

export async function getShippingLines(): Promise<IShippingLine[]> {
  const shippingLinesJson = localStorage.getItem('shipping-lines');
  if (shippingLinesJson === undefined || shippingLinesJson === null) {
    const { data } = await axios.get(`${SHIPPING_LINE_API}`);
    localStorage.setItem(
      'shipping-lines',
      JSON.stringify({ data, timestamp: dayjs() })
    );
    return data;
  }

  const { data, timestamp } = JSON.parse(shippingLinesJson);
  if (!isWithinTimeInterval(timestamp)) {
    removeCache('shipping-lines');
    //re-fetch shipping-lines?
  }
  return data;
}

export async function getShippingLine(
  shippingLineId: number
): Promise<IShippingLine | undefined> {
  const shippingLines = await getShippingLines();
  return shippingLines.find(
    (shippingLine) => shippingLine.id === shippingLineId
  );
}
