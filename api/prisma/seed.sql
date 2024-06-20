INSERT INTO ayahay.port
    ("name", "code")
    VALUES
--     ('Bacolod'),
--     ('Batangas'),
--     ('Bato'),
--     ('Baybay'),
    ('Bogo', 'BOGO'),
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
    ('Palompon', 'PAL')
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
    ('E.B. Aznar Shipping Corporation')
;

INSERT INTO ayahay.cabin_type
    ("name", "description", shipping_line_id)
    VALUES
    ('Aircon', 'Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')),
    ('Non-Aircon', 'Non-Aircon', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'))
;

INSERT INTO ayahay.vehicle_type
    ("name", "description")
    VALUES
    ('Bicycle', 'Bicycle'),
    ('Trisikad', 'Trisikad with side car'),
    ('Motorcycle', 'Motorcycle'),
    ('Tricycle', 'Tricycle'),
    ('Motorcycle Big Bike', 'Motorcycle Big Bike'),
    ('Big Bus', 'Bus with 60 pax capacity'),
    ('Mini Bus', 'Bus with 30 pax capacity'),
    ('Jeep Owner Type', 'Jeep Owner Type'),
--     ('Sedan', 'Sedan'),
--     ('SUV', 'SUV'),
--     ('Multicab', 'Multicab'),
--     ('Pickup', 'Pickup'),
    ('4-Wheeler Automobile/Multicab/Pickup', '4-Wheeler Automobile/Multicab/Pickup'),
    ('4-Wheeler Van', '4-Wheeler Van'),
    ('4-Wheeler Light Van Canter/Elf', '4-Wheeler Light Van Canter/Elf'),
    ('4-Wheeler Light Van Canter/Elf Loaded', '4-Wheeler Light Van Canter/Elf Loaded'),
    ('6-Wheeler Light Van Canter/Elf', '6-Wheeler Light Van Canter/Elf'),
    ('6-Wheeler Light Van Canter/Elf Loaded', '6-Wheeler Light Van Canter/Elf Loaded'),
    ('6-Wheeler Light Van Forward/Fighter', '6-Wheeler Light Van Forward/Fighter'),
    ('6-Wheeler Light Van Forward/Fighter Loaded', '6-Wheeler Light Van Forward/Fighter Loaded'),
    ('6-Wheeler Big Van', '6-Wheeler Big Van'),
    ('6-Wheeler Big Van Loaded', '6-Wheeler Big Van Loaded'),
--     ('6-Wheeler Chassis', '6-Wheeler Chassis'),
    ('6-Wheeler Dump Truck', '6-Wheeler Dump Truck'),
    ('6-Wheeler Dump Truck Loaded', '6-Wheeler Dump Truck Loaded'),
    ('6-Wheeler Forward/Fighter Extended', '6-Wheeler Forward/Fighter Extended'),
    ('6-Wheeler Forward/Fighter Extended Loaded', '6-Wheeler Forward/Fighter Extended Loaded'),
--     ('8-Wheeler Oil Tanker', '8-Wheeler Oil Tanker'),
--     ('8-Wheeler Chassis', '8-Wheeler Chassis'),
--     ('10-Wheeler Chassis', '10-Wheeler Chassis')
    ('Forklift 5 tons down', 'Forklift 5 tons down'),
    ('Forklift 5-20 tons', 'Forklift 5-20 tons'),
    ('Forklift 20 tons', 'Forklift 20 tons'),
    ('Mixer Truck Small', 'Mixer Truck Small'),
    ('Mixer Truck Medium', 'Mixer Truck Medium'),
    ('Mixer Truck Large', 'Mixer Truck Large'),
    ('Road Roller 5 tons down', 'Road Roller 5 tons down'),
    ('Road Roller 5-20 tons', 'Road Roller 5-20 tons'),
    ('Road Roller 20 tons up', 'Road Roller 20 tons up'),
    ('Farm Tractor 5 tons down', 'Farm Tractor 5 tons down'),
    ('Farm Tractor 5 tons up', 'Farm Tractor 5 tons up'),
    ('Bulldozer Small', 'Bulldozer Small'),
    ('Bulldozer Medium', 'Bulldozer Medium'),
    ('Bulldozer Large', 'Bulldozer Large'),
    ('Grader Small', 'Grader Small'),
    ('Grader Medium', 'Grader Medium'),
    ('Grader Large', 'Grader Large'),
    ('Payloader Small', 'Payloader Small'),
    ('Payloader Medium', 'Payloader Medium'),
    ('Payloader Large', 'Payloader Large'),
    ('Crane Small', 'Crane Small'),
    ('Crane Medium', 'Crane Medium'),
    ('Crane Large', 'Crane Large'),
    ('Excavator Small', 'Excavator Small'),
    ('Excavator Medium', 'Excavator Medium'),
    ('Excavator Large', 'Excavator Large')
;

INSERT INTO ayahay.ship
    ("name", shipping_line_id, recommended_vehicle_capacity)
    VALUES
    ('Melrivic 2', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'), 5),
    ('Melrivic 7', (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'), 5)
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
--     ("Seat Plan", 5, 6, (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation'))
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

-- TODO: add schedules & rate tables in seed sql