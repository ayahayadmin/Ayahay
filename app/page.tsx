import AboutUsCard from '@/common/components/AboutUsCard';
import TripSearchQuery from '@/common/components/TripSearchQuery';
import Port from '@/common/models/port';

export default function Home() {
  const portNames = [
    'Ilolo',
    'Bacolod',
    'Batangas',
    'Baybay, Leyte',
    'Bogo, Cebu',
    'Bato, Leyte',
    'Butuan',
    'Cagayan de Oro',
    'Calapan',
    'Calbayog City',
    'Caticlan',
    'Cebu',
    'Consuelo, Camotes',
    'Danao',
    'Dapitan',
    'Dapdap',
    'Dumaguete',
    'Dipolog',
    'Dapa, Siargao',
    'EB MagaIona,  Negros Occidental',
    'Estancia',
    'Getafe',
    'Guimaras',
    'Hagnaya',
    'lligan',
    'Isabel, Leyte',
    'Jagna, Bohol',
    'Medellin, Cebu',
    'Larena, Siquijor',
    'Cataingan, Masbate',
    'Masbate',
    'Matnog',
    'Manila',
    'Nasipit',
    'Odiongan, Romblon',
    'Ormoc',
    'Ozamiz',
    'Ozamiz',
    'Palompon',
    'Plaridel',
    'Puerto Princesa, Palawan',
    'Puerto Galera',
    'Romblon, Romblon',
    'Roxas City, Capiz',
    'Roxas, Mindoro',
    'San Carlos, Negros',
    'Sibuyan, Romblon',
    'Siquijor',
    'Santa Fe, Bantayan Island',
    'Surigao',
    'Tagbilaran City, Bohol',
    'Talibon',
    'Toledo',
    'Tubigon',
    'Ubay, Bohol',
    'Zamboanqa',
  ] as string[];

  const ports = portNames.map((name, id) => {
    return { id, name } as Port;
  });

  return (
    <div>
      <TripSearchQuery ports={ports} />
      <AboutUsCard />
    </div>
  );
}
