INSERT INTO ayahay.port
    ("name")
    VALUES
    ('Bacolod'),
    ('Batangas'),
    ('Baybay, Leyte'),
    ('Bogo, Cebu'),
    ('Bato, Leyte'),
    ('Butuan'),
    ('Cagayan de Oro'),
    ('Calapan'),
    ('Calbayog City'),
    ('Caticlan'),
    ('Cebu'),
    ('Consuelo, Camotes'),
    ('Danao'),
    ('Dapitan'),
    ('Dapdap'),
    ('Dumaguete'),
    ('Dipolog'),
    ('Dapa, Siargao'),
    ('EB MagaIona, Negros Occidental'),
    ('Estancia'),
    ('Getafe'),
    ('Guimaras'),
    ('Hagnaya'),
    ('Iligan'),
    ('Iloilo'),
    ('Isabel, Leyte'),
    ('Jagna, Bohol'),
    ('Medellin, Cebu'),
    ('Larena, Siquijor'),
    ('Cataingan, Masbate'),
    ('Masbate'),
    ('Matnog'),
    ('Manila'),
    ('Nasipit'),
    ('Odiongan, Romblon'),
    ('Ormoc'),
    ('Ozamiz'),
    ('Ozamiz'),
    ('Palompon'),
    ('Plaridel'),
    ('Puerto Princesa, Palawan'),
    ('Puerto Galera'),
    ('Romblon, Romblon'),
    ('Roxas City, Capiz'),
    ('Roxas, Mindoro'),
    ('San Carlos, Negros'),
    ('Sibuyan, Romblon'),
    ('Siquijor'),
    ('Santa Fe, Bantayan Island'),
    ('Surigao'),
    ('Tagbilaran City, Bohol'),
    ('Talibon'),
    ('Toledo'),
    ('Tubigon'),
    ('Ubay, Bohol'),
    ('Zamboanqa')
;

INSERT INTO ayahay.ship
    ("name", passenger_capacity, vehicle_capacity)
    VALUES
    ('Royal Seal', 150, 10)
;

INSERT INTO ayahay.cabin
    ("name", "type", number_of_rows, number_of_columns, ship_id)
    VALUES
    ('Economy 1F', 'Economy', 5, 6, (SELECT id FROM ayahay.ship WHERE "name" = 'Royal Seal')),
    ('Economy 2F', 'Economy', 5, 6, (SELECT id FROM ayahay.ship WHERE "name" = 'Royal Seal')),
    ('Business 1F', 'Business', 5, 6, (SELECT id FROM ayahay.ship WHERE "name" = 'Royal Seal')),
    ('First Class 2F', 'First', 5, 6, (SELECT id FROM ayahay.ship WHERE "name" = 'Royal Seal'))
;

INSERT INTO ayahay.seat
    ("name", "type", "row", "column", cabin_id)
    SELECT
        CONCAT(
            -- map row to letter: 0 -> A, 1 -> B, etc.
            CHR(r + ASCII('A')),
            (c + 1)::TEXT
        ) AS "name",
        -- seats in first column are window seats, second column aisle, etc.
        (ARRAY['Window', 'Aisle', 'SingleBed', 'LowerBunkBed', 'UpperBunkBed', 'Window'])
            [c + 1] AS "type",
        r AS "row",
        c AS "column",
        cabin.id AS cabin_id
    FROM ayahay.cabin cabin
    CROSS JOIN generate_series(0, 4) r
    CROSS JOIN generate_series(0, 5) c
;

INSERT INTO ayahay.shipping_line
    ("name")
    VALUES
    ('Cokaliong')
;

INSERT INTO ayahay.trip
    (
        departure_date,
        base_fare,
        reference_number,
        ship_id,
        shipping_line_id,
        src_port_id,
        dest_port_id
    )
    VALUES
    (
        TIMESTAMP '2023-12-15 06:15:00',
        500,
        'SEED1',
        (SELECT id FROM ayahay.ship WHERE "name" = 'Royal Seal'),
        (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Cokaliong'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Cebu'),
        (SELECT id FROM ayahay.port WHERE "name" = 'Bacolod')
    )
;