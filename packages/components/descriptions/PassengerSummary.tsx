import React from 'react';
import { Descriptions, Skeleton, Grid } from 'antd';
import { IPassenger } from '@ayahay/models';
import dayjs from 'dayjs';
import {
  CIVIL_STATUS,
  OCCUPATION,
  SEX,
} from '@ayahay/constants/enum';

interface TripSummaryProps {
  passenger?: IPassenger;
}

const { useBreakpoint } = Grid;

export default function PassengerSummary({ passenger }: TripSummaryProps) {
  const screens = useBreakpoint();
  return (
    <Skeleton loading={passenger === undefined} active>
      {passenger && (
        <Descriptions
          bordered={screens.sm}
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label='First Name'>
            {passenger?.firstName}
          </Descriptions.Item>
          <Descriptions.Item label='Last Name'>
            {passenger?.lastName}
          </Descriptions.Item>
          <Descriptions.Item label='Sex'>
            {SEX[passenger?.sex]}
          </Descriptions.Item>
          <Descriptions.Item label='Civil Status'>
            {CIVIL_STATUS[passenger?.civilStatus]}
          </Descriptions.Item>
          <Descriptions.Item label='Occupation'>
            {OCCUPATION[passenger?.occupation]}
          </Descriptions.Item>
          <Descriptions.Item label='Birthday'>
            {dayjs(passenger?.birthdayIso).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label='Address'>
            {passenger?.address}
          </Descriptions.Item>
          <Descriptions.Item label='Nationality'>
            {passenger?.nationality}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Skeleton>
  );
}
