import { Typography } from 'antd';
const { Title } = Typography;

export default function BookingTermsAndConditions() {
  return (
    <section style={{ margin: 10 }}>
      <Title level={1} style={{ fontSize: 11 }}>
        Terms and Conditions
      </Title>
      <ul style={{ fontSize: 9 }}>
        <li>This ticket is valid for one voyage only</li>
        <li>
          Tickets may refund after 24 hours of booking may have 20% surcharge.
          (validity of ticket for refund is one month).
        </li>
        <li>Service fee is NON REFUNDABLE.</li>
        <li>Ticket lost are not entitled for refund.</li>
        <li>
          Passengers are advised to be at the terminal at least 1 hour before
          the indicated departure.
        </li>
      </ul>
    </section>
  );
}
