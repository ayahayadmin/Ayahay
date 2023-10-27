ALTER TABLE ayahay.passenger ADD CONSTRAINT "passenger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES ayahay.account (id) ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO ayahay.port
    ("name")
    VALUES
--     ('Bacolod'),
--     ('Batangas'),
--     ('Bato'),
--     ('Baybay'),
    ('Bogo'),
--     ('Butuan'),
--     ('Cagayan de Oro'),
--     ('Calapan'),
--     ('Calbayog City'),
--     ('Camotes'),
--     ('Cataingan'),
--     ('Caticlan'),
--     ('Cebu'),
--     ('Consuelo'),
--     ('Danao'),
--     ('Dapa'),
--     ('Dapdap'),
--     ('Dapitan'),
--     ('Dipolog'),
--     ('Dumaguete'),
--     ('EB MagaIona'),
--     ('Escalante'),
--     ('Estancia'),
--     ('Getafe'),
--     ('Guimaras'),
--     ('Hagnaya'),
--     ('Iligan'),
--     ('Iloilo'),
--     ('Isabel'),
--     ('Jagna'),
--     ('Larena'),
--     ('Liloan'),
--     ('Manila'),
--     ('Masbate'),
--     ('Matnog'),
--     ('Medellin'),
--     ('Nasipit'),
--     ('Odiongan'),
--     ('Ormoc'),
--     ('Ozamiz'),
    ('Palompon')
--     ('Plaridel'),
--     ('Puerto Galera'),
--     ('Puerto Princesa'),
--     ('Romblon'),
--     ('Roxas City'),
--     ('Roxas'),
--     ('San Carlos'),
--     ('Santa Fe Island'),
--     ('Sibuyan'),
--     ('Siquijor'),
--     ('Surigao'),
--     ('Tabuelan'),
--     ('Tagbilaran City'),
--     ('Talibon'),
--     ('Toledo')
--     ('Tubigon'),
--     ('Ubay'),
--     ('Zamboanqa')
;

INSERT INTO ayahay.shipping_line
    ("name")
    VALUES
    ('Aznar Shipping')
;

INSERT INTO ayahay.cabin_type
    ("name", "description", shipping_line_id)
    VALUES
    ('Aircon', 'Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping')),
    ('Non-Aircon', 'Non-Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'))
;

INSERT INTO ayahay.vehicle_type
    ("name", "description")
    VALUES
    ('Bicycle', 'Bicycle'),
    ('Motorcycle', 'Motorcycle'),
    ('Tricycle', 'Tricycle'),
    ('Big Bus', 'Bus with 60 pax capacity'),
    ('Mini Bus', 'Bus with 30 pax capacity'),
    ('Sedan', 'Sedan'),
    ('SUV', 'SUV'),
    ('Multicab', 'Multicab'),
    ('Pickup', 'Pickup'),
    ('4-Wheeler Van', '4-Wheeler Van'),
    ('4-Wheeler Light Van', '4-Wheeler Light Van'),
    ('6-Wheeler Light Van', '6-Wheeler Light Van'),
    ('6-Wheeler Chassis', '6-Wheeler Chassis'),
    ('6-Wheeler Dump Truck', '6-Wheeler Dump Truck'),
    ('8-Wheeler Oil Tanker', '8-Wheeler Oil Tanker'),
    ('8-Wheeler Chassis', '8-Wheeler Chassis'),
    ('10-Wheeler Chassis', '10-Wheeler Chassis')
;

INSERT INTO ayahay.ship
    ("name", shipping_line_id, recommended_vehicle_capacity)
    VALUES
    ('Melrivic 2', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'), 5),
    ('Melrivic 7', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'), 5)
;

INSERT INTO ayahay.cabin
    ("name", recommended_passenger_capacity, ship_id, cabin_type_id)
    VALUES
    ('Melrivic 2 Aircon Cabin', 150, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Aircon')),
    ('Melrivic 2 Non-Aircon Cabin', 100, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 2'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Non-Aircon')),
    ('Melrivic 7 Non-Aircon Cabin', 339, (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'), (SELECT id from ayahay.cabin_type WHERE "name" = 'Non-Aircon'))
;

-- INSERT INTO ayahay.seat_plan
--     ("name", row_count, column_count, shipping_line_id)
--     VALUES
--     ("Seat Plan", 5, 6, (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'))
-- ;
--
-- INSERT INTO ayahay.seat
--     ("name", "type", "row", "column", seat_plan_id)
--     SELECT
--         CONCAT(
--             -- map row to letter: 0 -> A, 1 -> B, etc.
--             CHR(r + ASCII('A')),
--             (c + 1)::TEXT
--         ) AS "name",
--         -- seats in first column are window seats, second column aisle, etc.
--         (ARRAY['Window', 'Aisle', 'SingleBed', 'LowerBunkBed', 'UpperBunkBed', 'Window'])
--             [c + 1] AS "type",
--         r AS "row",
--         c AS "column",
--         seat_plan.id AS seat_plan_id
--     FROM ayahay.seat_plan seat_plan
--     CROSS JOIN generate_series(0, 4) r
--     CROSS JOIN generate_series(0, 5) c
-- ;

INSERT INTO ayahay.shipping_line_schedule
    (
        "name",
        departure_hour,
        departure_minute,
        days_before_booking_start,
        days_before_booking_cut_off,
        ship_id,
        shipping_line_id,
        src_port_id,
        dest_port_id
    )
    VALUES
    (
        'Bogo -> Palompon 11:30 AM',
        11,
        30,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon')
    ),
    (
        'Bogo -> Palompon 11:00 PM',
        23,
        00,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon')
    ),
    (
        'Palompon -> Bogo 3:30 PM',
        15,
        30,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo')
    ),
    (
        'Palompon -> Bogo 6:00 PM',
        18,
        00,
        60,
        7,
        (SELECT id FROM ayahay.ship WHERE "name" = 'Melrivic 7'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Aznar Shipping'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Palompon'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bogo')
    )
;

INSERT INTO ayahay.shipping_line_schedule_rate
    (
        schedule_id,
        cabin_id,
        vehicle_type_id,
        fare
    )
    (
        SELECT schedule.id, rate.cabin_id, rate.vehicle_type_id, rate.fare
        FROM ayahay.shipping_line_schedule schedule
        LEFT JOIN (
            VALUES
                ((SELECT id FROM ayahay.cabin WHERE "name" = 'Melrivic 7 Non-Aircon Cabin'), NULL, 400),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Bicycle'), 130),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Motorcycle'), 1150),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Tricycle'), 1440),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Sedan'), 2650),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'SUV'), 2650),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Multicab'), 2650),
                (NULL, (SELECT id FROM ayahay.vehicle_type WHERE "name" = 'Pickup'), 2650)
        ) AS rate(cabin_id, vehicle_type_id, fare) ON true = true
    )
;
