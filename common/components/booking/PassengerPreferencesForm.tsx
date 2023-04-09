import { Button, Divider, Form, Radio, Select, Skeleton } from 'antd';
import React from 'react';

import Trip from '@/common/models/trip.model';
import {
  CABIN_TYPE,
  getEnumKeyFromValue,
  SEAT_TYPE,
  SEX,
} from '@/common/constants/enum';
import EnumRadio from '@/common/components/form/EnumRadio';

interface PassengerPreferencesFormProps {
  trip?: Trip;
}

export default function PassengerPreferencesForm({
  trip,
}: PassengerPreferencesFormProps) {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);

  const copyToCompanionPreferences = () => {
    for (let i = 1; i < passengers.length; i++) {
      copyPreferences(0, i);
    }
  };

  const copyPreferences = (srcIndex: number, destIndex: number) => {
    const srcNamePath = ['passengers', srcIndex, 'preferences'];
    const destNamePath = ['passengers', destIndex, 'preferences'];
    form.setFieldValue(destNamePath, form.getFieldValue(srcNamePath));
  };

  return (
    passengers &&
    trip && (
      <Form.List name='passengers'>
        {(fields, _) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                <Divider>
                  {`Preferences for ${passengers[index].firstName} ${passengers[index].lastName}`}
                </Divider>
                {index > 0 && (
                  <Button type='link' onClick={() => copyPreferences(0, index)}>
                    {passengers[index].firstName} has the same preferences as me
                  </Button>
                )}
                <Form.Item
                  {...restField}
                  name={[name, 'preferences', 'seat']}
                  label='Seat Preference'
                  colon={false}
                >
                  <Radio.Group>
                    <Radio value='Any'>Any</Radio>
                    {trip.availableSeatTypes.map((seatType, index) => (
                      <Radio
                        value={getEnumKeyFromValue(SEAT_TYPE, seatType)}
                        key={index}
                      >
                        {seatType}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'preferences', 'cabin']}
                  label='Cabin Preference'
                  colon={false}
                >
                  <Radio.Group>
                    <Radio value='Any'>Any</Radio>
                    {trip.availableCabins.map((cabin, index) => (
                      <Radio
                        value={getEnumKeyFromValue(CABIN_TYPE, cabin)}
                        key={index}
                      >
                        {cabin}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'preferences', 'meal']}
                  label='Meal Preference'
                  colon={false}
                >
                  <Select
                    options={[
                      { value: 'Any', label: 'Any' },
                      ...trip.meals.map((meal) => ({
                        value: meal,
                        label: meal,
                      })),
                    ]}
                  />
                </Form.Item>
                {index === 0 && passengers.length > 1 && (
                  <Button
                    type='link'
                    onClick={() => copyToCompanionPreferences()}
                  >
                    My companions all have the same seat preferences
                  </Button>
                )}
              </div>
            ))}
          </>
        )}
      </Form.List>
    )
  );
}
