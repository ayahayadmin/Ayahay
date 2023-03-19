import { Divider, Form } from 'antd';
import React from 'react';

export default function PassengerPreferencesForm() {
  const form = Form.useFormInstance();
  const passengers = Form.useWatch('passengers', form);

  return (
    passengers && (
      <Form.List name='passengers'>
        {(fields, _) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key}>
                <Divider>
                  {`Preferences for ${passengers[index].firstName} ${passengers[index].lastName}`}
                </Divider>
              </div>
            ))}
          </>
        )}
      </Form.List>
    )
  );
}
