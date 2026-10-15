const Plato = require('../models/Plato');
const Seccion = require('../models/Seccion');
const Carta = require('../enums/Carta');

const FOTO = {
    lasagna: 'platos/pepediroma_02_lasagna_ragu.jpg',
    focacce: 'platos/pepediroma_03_focacce.jpg',
    gnocchiFritti: 'platos/pepediroma_04_gnocchi_fritti.jpg',
    cavolfiore: 'platos/pepediroma_05_nueva_carta.jpg',
    gnocchi: 'platos/pepediroma_06_gnocchi_29.jpg',
    agnolotti: 'platos/pepediroma_10_agnolotti_funghi.jpg',
    cappelacci: 'platos/pepediroma_11_cappelacci.jpg',
    cioccolato: 'platos/pepediroma_12_postres.jpg',
    anolini: 'platos/pepediroma_13_pastas_frescas.jpg',
    maccheroni: 'platos/pepediroma_36_maccheroni_cacio_e_pepe.jpg',
    yogurt: 'platos/pepediroma_55_desayuno_con_yogur.jpg'
};

const CARTAS = [
    {
        carta: Carta.RISTORANTE,
        secciones: [
            {
                titulo: "L' Antipasto",
                platos: [
                    ["Gnocchi fritti all'arrabbiata", 15900, { destacado: true, descripcion: 'Gnocchis de papa y muzzarella fritos, salsa de pomodoro italiano con pepperoncino, ajo y perejil.', picante: true, imagen: FOTO.gnocchiFritti }],
                    ['Polpette al sugo', 15900, { descripcion: 'Albóndiga de carne de cerdo y res cocida en pomodoro italiano, mortadella, guanciale y parmesano.' }],
                    ['Burrata, romesco e gamberi', 23500, { descripcion: 'Burrata, salsa romesco, chauchas y arvejas, langostinos a la plancha y limón.' }],
                    ['Asparagi alla carbonara', 15900, { descripcion: 'Espárragos a la plancha, crema de carbonara, guanciale crocante y pangrattato, parmesano 24 meses y pimienta negra.' }],
                    ['Cavolfiore al forno', 13700, { destacado: true, descripcion: 'Coliflores asados con canela, hojas de repollitos, ajo blanco, puré de limón.', vegano: true, imagen: FOTO.cavolfiore }],
                    ['Pizza margherita', 19500, { descripcion: 'Pizzeta de masa madre, salsa de tomate italiano, muzzarella fior di latte, cherrys reliquia frescos, albahaca.' }],
                    ['Pizza alla mortadella', 19500, { descripcion: 'Pizzeta bianca con mozzarella, mortadella con nuez, pesto, stracciatella, pistacho.' }]
                ]
            },
            {
                titulo: 'Il Primo Piatto',
                nota: 'Consulta por nuestras pastas veganas simples o rellenas.',
                platos: [
                    ['Radiatore al pesto e gamberi', 31500, { descripcion: 'Pasta corta extruida en bronce, pesto de albahaca, stracciatella y langostinos a la plancha.' }],
                    ['Spaghetti cacio e pepe', 28500, { descripcion: 'Pasta larga extruida en bronce con queso parmesano de 24 meses y pimienta negra.', picante: true }],
                    ['Mafaldine pomodoro e stracciate', 29500, { descripcion: 'Pasta larga extruida en bronce, pomodoro italiano, albahaca, stracciatella, cherrys asados.' }],
                    ["Mezze Maniche all'amatriciana", 28500, { descripcion: 'Pasta corta extruida en bronce, guanciale, pomodoro italiano, pimienta negra, pepperoncino, parmesano de 24 meses.', picante: true }],
                    ['Casoncelli di patate dolci', 31500, { descripcion: 'Pasta rellena hecha a mano, masa veteada de remolacha, con boniato y mascarpone, crema de queso gorgonzola, pistachos y puré ácido de remolacha.' }],
                    ['Cappelletti di ossobuco', 31500, { descripcion: 'Pasta hecha a mano, masa tricolor de huevo, pimentón y carbón activado, relleno de osobuco al vino tinto, demi glace, pomodoro, ricotta asada y chips de papa.' }],
                    ['Anolini di gamberi', 32500, { descripcion: 'Pasta rellena hecha a mano, masa tricolor con remolacha y carbón activado, mejillones, crema ácida, limón, croutons, cherry confitado y polvo de pepperoncino.' }],
                    ['Agnolotti ai funghi', 29900, { destacado: true, descripcion: 'Pasta rellena hecha a mano, masa al huevo, relleno de hongos y parmesano, demiglace de hongos, puré de limón, mollica.', imagen: FOTO.agnolotti }],
                    ['Lasagna al ragù', 43500, { destacado: true, descripcion: 'Láminas de masa al huevo, ragú de asado y salchicha casera, fonduta de parmesano y pomodoro.', imagen: FOTO.lasagna }],
                    ['Tagliata di manzo', 49500, { descripcion: 'Ojo de bife, demi glace, zanahoria y cebollas asadas, cremoso de boniato.' }],
                    ['Pesce alla piastra', 36500, { descripcion: 'Pesca blanca, hummus de zucchini y tahina, brócoli y papines asados con beurre blanc. Opcional de guarnición: mix verdes, cebolla, aderezo de limón.' }]
                ]
            },
            {
                titulo: 'Il Dolce',
                platos: [
                    ['Tiramisù', 15900, { descripcion: 'Crema de mascarpone, cacao, vainilla casera con almíbar de café y oporto.' }],
                    ['Affogatto', 15900, { descripcion: 'Helado casero de vainilla, praliné de pistacho y shot de espresso illy.' }],
                    ['Cioccolato 70% e kumquat', 15900, { destacado: true, descripcion: 'Mousse de chocolate al 70%, chantilly de vainilla, quinotos al whisky, praliné de avellanas tostadas y crocante de feuilletine.', imagen: FOTO.cioccolato }],
                    ['Pavlova al limone e mirtilli', 15900, { descripcion: 'Merengue relleno de ganache de arándanos y choco blanco, curd de limón, soleta de frambuesa y frutos rojos frescos de estación.' }],
                    ['Crostata de formaggio', 15900, { descripcion: 'Tarta tipo vasca, membrillo casero en almíbar, nueces pecan caramelizadas.' }],
                    ['Vulcano di pistacchio', 17500, { descripcion: 'Volcán de pistacho, helado casero de chocolate blanco y lima.' }]
                ]
            },
            {
                titulo: 'Il Caffè',
                platos: [
                    ['Espresso Italiano', 4200, { medida: '-pocillo-' }],
                    ['Espresso Lungo', 4200, { medida: '-pocillo-' }],
                    ['Espresso Americano', 5200, { medida: '-taza-' }],
                    ['Espresso Doppio', 5200, { medida: '-taza-' }],
                    ['Macchiato', 4200, { medida: '-pocillo-' }],
                    ['Cortado', 4400, { medida: '-jarrito-' }],
                    ['Flat White', 5200, { medida: '-taza-' }],
                    ['Caffè Latte', 5700, { medida: '-taza grande-' }],
                    ['Moca Latte', 6200, { medida: '-taza grande-' }],
                    ['Vaniglia Latte', 6200, { medida: '-taza grande-' }],
                    ['Caramel Latte', 6200, { medida: '-taza grande-' }],
                    ['Pistacchio Latte', 6200, { medida: '-taza grande-' }],
                    ['Nocciola Latte', 6200, { medida: '-taza grande-' }],
                    ['Cappuccino Italiano', 5600, { medida: '-taza-' }],
                    ['Cappuccino doble', 6200, { medida: '-taza grande-' }],
                    ['Submarino', 5200, { medida: '-taza grande-' }],
                    ['Adicional Leche Almendras', 500],
                    ['Adicional Crema', 500],
                    ['Adicional Shot Caffè', 500]
                ]
            },
            {
                titulo: 'Il Tè',
                platos: [
                    ['Té en hebras Tehani Chai', 5200, { descripcion: 'Té negro, pimienta en grano, anís estrellado, clavo de olor, cardamomo, jengibre, canela.' }],
                    ['Té en hebras Tehani Chamomile', 5200, { descripcion: 'Flores de manzana, pétalos de rosa, ginkgo biloba, menta, poleo, sabor miel.' }],
                    ['Té en hebras Tehani Green Tea', 5200, { descripcion: 'Cosecha selección.' }],
                    ['Té en hebras Tehani Earl Grey', 5200, { descripcion: 'Té negro en hebras, bergamota, cáscara de naranja, clavo de olor.' }],
                    ['Té clásico negro', 3900]
                ]
            },
            {
                titulo: 'La Bevanda',
                platos: [
                    ['Agua con gas', 4600],
                    ['Agua sin gas', 4600],
                    ['Agua saborizada', 4600],
                    ['Acqua Panna Sin Gas', 8900, { medida: 'x505ml' }],
                    ['S. Pellegrino Gasificada', 9500, { medida: 'x505ml' }],
                    ['S. Pellegrino Tonica', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Pompelmo', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Limonata', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Aranciata Rossa', 7000, { medida: 'x330ml' }],
                    ['Gaseosas', 4600],
                    ['Limonada', 5900],
                    ['Pomelada', 5900]
                ]
            },
            {
                titulo: 'La Birra',
                platos: [
                    ['Cerveza Minga Amber Lager', 6200],
                    ['Cerveza Minga Light Lager', 6200],
                    ['Peroni', 8800, { medida: '- cerveza rubia -' }]
                ]
            },
            {
                titulo: 'Il Cocktail-Bar',
                platos: [
                    ['Aperol Spritz', 11500],
                    ['Gin Tonic (Gin Blu)', 11500],
                    ['Adicional Gin Bombay', 6000],
                    ['Vermut Carpano Rosso con soda', 11500],
                    ['Campari con naranja', 11500],
                    ['Negroni', 11500],
                    ['Campari Spritz (con Prosecco)', 12000],
                    ['Fernet Branca + Cola', 11500]
                ]
            },
            {
                titulo: 'Licores',
                platos: [
                    ['Antica Formula / Grappa', 5500],
                    ['Limoncello', 5500, { medida: '-Strega-' }],
                    ['Licor de Café', 5500, { medida: '-Borghetti-' }],
                    ['Fernet Branca', 5500],
                    ['Sambuca', 5500, { medida: '-Oro Borghetti-' }]
                ]
            },
            {
                titulo: 'I Vini per Calice',
                platos: [
                    ['Copa de vino', 9200, { descripcion: 'Consultar variedad.' }]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Tintos Livianos',
                platos: [
                    ['Tutu Pinot Noir, Tutu Wines', 36000],
                    ['Red Soil Manos Negras Pinot Noir', 29500],
                    ['Coincidir Pinot Noir, Coincidir Wines', 30500],
                    ['Tinto Nero Sangiovese, Mil Suelos', 24000],
                    ['Bonjolais, Magna Montis', 41500],
                    ['Rosso D Uco, Bira Wines', 33000],
                    ['Kung Fu Criolla, Riccitelli Wines', 44000],
                    ['Tigerstone Garnacha, Estancia Los Cardones', 31000]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Tintos Medianos',
                platos: [
                    ['Tutu Cabernet Franc, Tutu Wines', 36000],
                    ['Asa Nisi Masa Cabernet Franc, Mundo Reves Wine', 32000],
                    ['Berna Malbec', 32000],
                    ['Tanito', 31000, { medida: '(Blend Malbec/Sangiovese/CabFranc)' }],
                    ['Tano, Bira Wines', 56000],
                    ['Kung Fu Malbec, Riccitelli Wines', 44000],
                    ['Solito Va Malbec', 25000],
                    ['The Party Malbec, Riccitelli Wines', 34000],
                    ['Flor de Cardon Cabernet Sauvignon', 27000],
                    ['Berna Syrah', 29500],
                    ['Berna Malbec y Cabernet Franc', 23000],
                    ['Zaha Cabernet Sauvignon', 37000]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Blancos, Rosados y Naranjos',
                platos: [
                    ['Antro Clarete, Tutu Wines', 24000],
                    ['Antropo Clarete, Antropo Wines', 32000],
                    ['Kung Fu Orange, Riccitelli Wines', 44000],
                    ['Rosa Di Rosso, Bira Wines', 29500],
                    ['Flora By Zaha Rose de Pinot, Mil Suelos', 29500],
                    ['Invader Semillon, Riccitelli Wines', 46000],
                    ['Invader Chenin Blanc, Riccitelli Wines', 46000],
                    ['Tutu Chardonnay, Tutu Wines', 33000],
                    ['3 Sapas Viognier', 31500],
                    ['Bianco D Uco, Bira Wines', 32000],
                    ['Berna Chardonnay', 29500]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Espumantes',
                platos: [
                    ['Manos Negras Brut Nature', 28000],
                    ['Baron B Extra Brut', 55000],
                    ['Baron B Brut Nature', 55000]
                ]
            }
        ]
    },
    {
        carta: Carta.PER_PORTARE_VIA,
        secciones: [
            {
                titulo: 'Paste Ripiene',
                subtitulo: 'Pastas rellenas',
                platos: [
                    ['Anolini', 8500, { destacado: true, descripcion: 'Jamón cocido natural y queso mozzarella.', imagen: FOTO.anolini }],
                    ['Cappelacci', 8500, { descripcion: 'Espinaca, gruyere y ricotta.', imagen: FOTO.cappelacci }],
                    ['Caramelle', 8500, { descripcion: 'Calabaza y mascarpone.' }],
                    ['Casoncelli', 9500, { descripcion: 'Estofado de tres carnes (res, cerdo y pollo).' }],
                    ['Tortelloni', 9500, { descripcion: 'Pollo estofado y espinaca.' }],
                    ['Agnolotti ai funghi', 9500, { descripcion: 'Hongos.', imagen: FOTO.agnolotti }],
                    ['Casoncelli Patate Dolce', 9500, { descripcion: 'Boniato, ajo confitado, mascarpone.' }],
                    ['Cappelletti Ossobuco', 9500, { descripcion: 'Osobuco braseado, morrón asado.' }],
                    ['Anolini Gamberi', 10500, { descripcion: 'Langostinos al ajillo.' }],
                    ['Tortelli', 10500, { descripcion: 'Trucha, mascarpone y ciboulette.' }],
                    ['Lasagna Bolognese', 18000, { imagen: FOTO.lasagna }]
                ]
            },
            {
                titulo: 'Paste Semplice',
                subtitulo: 'Pastas simples',
                platos: [
                    ['Spaghetti', 4900],
                    ['Mafaldine', 4900],
                    ['Radiatore', 4900],
                    ['Maccheroni', 4900, { imagen: FOTO.maccheroni }],
                    ['Fusilli', 4900],
                    ['Mezze Maniche', 4900],
                    ['Gnocchi di Patate', 4900, { imagen: FOTO.gnocchi }]
                ]
            },
            {
                titulo: 'Salse',
                subtitulo: 'Salsas',
                platos: [
                    ['Pomodoro', 4900, { descripcion: 'Ajo, albahaca y tomate italiano.' }],
                    ['Fonduta de queso', 7500, { descripcion: 'Crema de parmesano, gruyere y provolone.' }],
                    ['Pesto', 11500, { descripcion: 'Albahaca, semillas de girasol, oliva, sal de mar.' }],
                    ['Amatriciana', 9000, { descripcion: 'Panceta, guanciale, tomate italiano, pepperoncino.' }]
                ]
            },
            {
                titulo: 'Altre Cose',
                platos: [
                    ['Parmigiano grattugiato', 5900, { descripcion: 'Queso parmesano rallado.' }],
                    ['Focaccia Clásica', 3800, { descripcion: 'Consultar otros sabores.' }]
                ]
            },
            {
                titulo: 'Focacce',
                subtitulo: 'Sandwiches de focaccia',
                platos: [
                    ['Schiacciata di Mortadella', 16800, { descripcion: 'Focaccia fina rellena de mortadella con nuez, pesto, stracciatella y pistacho picado.', imagen: FOTO.focacce }],
                    ['Schiacciata di Prosciutto', 20000, { descripcion: 'Focaccia fina rellena de prosciutto, rúcula, cherrys confitados y mozzarella fior di latte.' }],
                    ['Schiacciata Cotto e Formaggio', 11500, { descripcion: 'Focaccia fina rellena de jamón cocido, queso muzzarella y parmesano.' }],
                    ['Schiacciata di Melanzane', 14800, { descripcion: 'Focaccia fina rellena de berenjena frita, pomodoro italiano, albahaca, mozzarella fior di latte y parmesano.' }]
                ]
            },
            {
                titulo: 'Il Dolce',
                subtitulo: 'Postres',
                platos: [
                    ['Tiramisù', 15900, { descripcion: 'Crema de mascarpone, cacao, vainillas con almíbar de café y oporto.' }],
                    ['Tiramisù al pistacchio', 15900, { descripcion: 'Crema de mascarpone y pistacho, pasta artesanal de pistachos, vainilla con almíbar de café y oporto.' }],
                    ['Pavlova di fichi', 15900, { descripcion: 'Merengue crocante por fuera y suave en su interior, higos en almíbar, mermelada de higos y crema ligera de mascarpone con nueces acarameladas.' }]
                ]
            },
            {
                titulo: 'Altre Dolce',
                subtitulo: 'Otros dulces',
                platos: [
                    ['Cornetto', 2500, { descripcion: 'Cornetto tradicional.' }],
                    ['Cornetto alla Nocciola', 4500, { descripcion: 'Cornetto relleno de crema de avellanas.' }],
                    ['Sfogliatella', 4000, { descripcion: 'Rellena de crema pastelera.' }],
                    ['Sfogliatella DDL', 4000, { descripcion: 'Rellena de dulce de leche.' }],
                    ['Napoletani Bianche', 3800, { descripcion: 'Alfajores de vainilla rellenos de crema pastelera, frutos rojos y avellanas tostadas.' }],
                    ['Lingotti al Limone', 10900, { descripcion: 'Crostata rellena de crema de limón, sablée de vainilla y merengue italiano.' }],
                    ['Lingotti al Cioccolato', 10900, { descripcion: 'Crostata rellena, sablée de cacao, húmedo de chocolate y crema de chocolate blanco.' }],
                    ['Lingotti Pere & Mandorle', 10900, { descripcion: 'Crostata rellena, sablée de vainilla, masa de almendras, peras y almendras tostadas.' }],
                    ['Cookie Red Velvet', 5900, { descripcion: 'Cookie con chips de chocolate blanco, mermelada de frambuesa y crema de chocolate blanco.' }],
                    ['Cookie al Cioccolato', 5900, { descripcion: 'Cookie sin harina, crema de chocolate con leche y Nutella.' }],
                    ['Cookie con Gocce', 5900, { descripcion: 'Cookie clásica con chips de chocolate, crema de vainilla, toffee y nueces caramelizadas.' }],
                    ['Biscotti de pistacho y cacao', 3500],
                    ['Biscotti de praliné', 3500],
                    ['Torta de Carote e Noci', 6500, { descripcion: 'Budín de zanahoria y nueces con crema de queso.' }],
                    ['Cinnamon Rolls', 4500],
                    ['Grageas al Pistacho', 14500, { descripcion: 'Pistachos tostados con chocolate caramelizado.' }],
                    ['Grageas de Avellanas', 14500, { descripcion: 'Avellanas caramelizadas con chocolate semi amargo.' }]
                ]
            },
            {
                titulo: 'La Bevanda',
                platos: [
                    ['Acqua Panna Sin Gas', 8900, { medida: 'x505ml' }],
                    ['S. Pellegrino Gasificada', 9500, { medida: 'x505ml' }],
                    ['S. Pellegrino Tonica', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Pompelmo', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Limonata', 7000, { medida: 'x330ml' }],
                    ['S. Pellegrino Aranciata Rossa', 7000, { medida: 'x330ml' }]
                ]
            },
            {
                titulo: 'La Birra',
                platos: [
                    ['Cerveza Minga Amber', 6200],
                    ['Cerveza Minga Light Lager', 6200],
                    ['Peroni', 8800, { medida: '- cerveza rubia -' }]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Tintos Livianos',
                platos: [
                    ['Tutu Pinot Noir, Tutu Wines', 34000],
                    ['Red Soil Manos Negras Pinot Noir', 27500],
                    ['Coincidir Pinot Noir, Coincidir Wines', 29500],
                    ['Tinto Nero Sangiovese, Mil Suelos', 22000],
                    ['Bonjolais, Magna Montis', 41500],
                    ['Rosso D Uco, Bira Wines', 31000],
                    ['Kung Fu Criolla, Riccitelli Wines', 42500],
                    ['Tigerstone Garnacha, Est. Los Cardones', 29500]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Tintos Medianos',
                platos: [
                    ['Tutu Cabernet Franc, Tutu Wines', 34000],
                    ['Asa Nisi Masa Cabernet Franc, Mundo Reves Wine', 29900],
                    ['Tanito', 28800, { medida: '(Blend Malbec/Sangiovese/CabFranc)' }],
                    ['Tano, Bira Wines', 54500],
                    ['Kung Fu Malbec, Riccitelli Wines', 41500],
                    ['Solito Va Malbec', 23900],
                    ['The Party Malbec, Riccitelli Wines', 32000],
                    ['Flor de Cardon Cabernet Sauvignon', 25500],
                    ['Berna Syrah', 28000],
                    ['Berna Malbec/Cabernet Franc', 21000],
                    ['Zaha Cabernet Sauvignon', 34500]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Blancos, Rosados y Naranjos',
                platos: [
                    ['Antro Clarete, Tutu Wines', 22500],
                    ['Antropo Clarete, Antropo Wines', 30500],
                    ['Kung Fu Orange, Riccitelli Wines', 41500],
                    ['Rosa Di Rosso, Bira Wines', 27500],
                    ['Flora By Zaha Rose de Pinot, Mil Suelos', 27500],
                    ['Invader Semillon, Riccitelli Wines', 44500],
                    ['Invader Chenin Blanc, Riccitelli Wines', 44500],
                    ['Tutu Chardonnay, Tutu Wines', 30500],
                    ['3 Sapas Viognier', 31500],
                    ['Bianco D Uco, Bira Wines', 30000],
                    ['Berna Chardonnay', 28000]
                ]
            },
            {
                grupo: 'I Vini',
                titulo: 'Espumantes',
                platos: [
                    ['Manos Negras Brut Nature', 28000],
                    ['Baron B Extra Brut', 55000],
                    ['Baron B Brut Nature', 55000]
                ]
            }
        ]
    },
    {
        carta: Carta.COLAZIONE,
        secciones: [
            {
                grupo: 'Dolce',
                titulo: 'Specialità Italiane',
                platos: [
                    ['Cornetto', 2500, { descripcion: 'Cornetto tradicional.' }],
                    ['Cornetto alla nocciola', 4500, { descripcion: 'Cornetto relleno de crema de avellanas.' }],
                    ['Sfogliatella', 4000, { descripcion: 'Consultar rellenos del día.' }],
                    ['Cannoli Siciliani', 4500, { descripcion: 'Rellenos de crema pastelera y pistacho.' }],
                    ['Napoletani Bianchi', 3800, { descripcion: 'Alfajores de vainilla rellenos de crema pastelera y avellanas tostadas.' }]
                ]
            },
            {
                grupo: 'Dolce',
                titulo: 'Lingotti Dolci',
                subtitulo: 'Crostata rellena',
                platos: [
                    ['Limone', 10900, { descripcion: 'Crema de limón, sablée de vainilla y merengue italiano.' }],
                    ['Cioccolato', 10900, { descripcion: 'Sablé de cacao, cheesecake de chocolate y ganache de café.' }],
                    ['Frutto Rosso', 10900, { descripcion: 'Sablé de vainilla, masa de almendras, mermelada de frambuesa, crema chantilly y frutos rojos frescos.' }]
                ]
            },
            {
                grupo: 'Dolce',
                titulo: 'Biscotti & Cookies',
                platos: [
                    ['Cookie al Pistacchio', 5900, { descripcion: 'Cookie de pistacho con ganache de chocolate blanco y gel de frambuesa.' }],
                    ['Cookie al Cioccolato', 5900, { descripcion: 'Cookie de chocolate semi amargo con compota de frambuesa.' }],
                    ['Cookie con gocce di cioccolato', 5900, { descripcion: 'Cookie con chips de chocolate, toffee salado y almendras.' }],
                    ['Duo di Biscotti', 3500, { descripcion: '2 de pistacho y cacao - 2 de praliné.' }]
                ]
            },
            {
                grupo: 'Dolce',
                titulo: 'Soffici & Lievitati',
                platos: [
                    ['Torta di carote e noci', 6500, { descripcion: 'Budín de zanahoria y nueces con crema de queso.' }],
                    ['Cinnamon Rolls', 4500, { descripcion: 'Masa suave con canela y crema.' }]
                ]
            },
            {
                grupo: 'Salato',
                titulo: 'Focacce Assortite',
                subtitulo: 'Sandwiches de focaccia',
                platos: [
                    ['Schiacciata di Mortadella', 16800, { descripcion: 'Focaccia fina rellena de mortadella con nuez, pesto, stracciatella y pistacho picado.', imagen: FOTO.focacce }],
                    ['Schiacciata di Prosciutto', 20000, { descripcion: 'Focaccia fina rellena de prosciutto, rúcula, cherries confitados y mozzarella fior di latte.' }],
                    ['Schiacciata di Prosciutto Cotto e Formaggio', 11500, { descripcion: 'Focaccia fina rellena de jamón cocido, queso muzzarella y parmesano.' }],
                    ['Schiacciata di Melanzane alla Parmigiana', 14800, { descripcion: 'Focaccia fina rellena de berenjena frita, pomodoro italiano, albahaca, mozzarella fior di latte y parmesano.' }]
                ]
            },
            {
                grupo: 'Salato',
                titulo: 'Altre Cose',
                platos: [
                    ['Pane tostato', 7500, { descripcion: 'Tostadas con queso crema y mermelada.' }],
                    ['Uova Strapazzate', 8500, { descripcion: 'Huevos revueltos, tostada en pan de ciabatta.' }],
                    ['Uova Strapazzate e Avocado', 12800, { descripcion: 'Huevos revueltos, palta, cherries confitados y tostada.' }],
                    ['Yogurt e Granola', 10900, { descripcion: 'Yogurt natural, granola, frutas frescas, oliva, menta y miel.', imagen: FOTO.yogurt }]
                ]
            },
            {
                titulo: 'Il Caffè',
                platos: [
                    ['Espresso Italiano', 4200, { medida: '-pocillo-' }],
                    ['Espresso Lungo', 4200, { medida: '-pocillo-' }],
                    ['Espresso Americano', 5200, { medida: '-taza-' }],
                    ['Espresso Doppio', 5200, { medida: '-taza-' }],
                    ['Macchiato', 4200, { medida: '-pocillo-' }],
                    ['Cortado', 4400, { medida: '-jarrito-' }],
                    ['Flat White', 5200, { medida: '-taza-' }],
                    ['Caffè Latte', 5700, { medida: '-taza grande-' }],
                    ['Moca Latte', 6200, { medida: '-taza grande-' }],
                    ['Vaniglia Latte', 6200, { medida: '-taza grande-' }],
                    ['Caramel Latte', 6200, { medida: '-taza grande-' }],
                    ['Pistacchio Latte', 6200, { medida: '-taza grande-' }],
                    ['Nocciola Latte', 6200, { medida: '-taza grande-' }],
                    ['Cappuccino Italiano', 5600, { medida: '-taza-' }],
                    ['Cappuccino doble', 6200, { medida: '-taza grande-' }],
                    ['Submarino', 5200, { medida: '-taza grande-' }],
                    ['Adicional crema, leche de almendras o shot de caffè', 500]
                ]
            },
            {
                titulo: 'Il Tè',
                platos: [
                    ['Té en hebras Tehani', 5200, { descripcion: 'Chai: té negro, pimienta, anís estrellado, clavo de olor, cardamomo, jengibre, canela.\nChamomile: flores de manzana, pétalos de rosa, ginkgo biloba, menta, poleo, sabor miel.\nEarl Grey: té negro en hebras, bergamota, cáscara de naranja, clavo de olor.\nGreen Tea: té verde.' }],
                    ['Té clásico negro', 3900]
                ]
            },
            {
                titulo: 'La Bevanda',
                platos: [
                    ['Agua con gas / sin gas / saborizada', 4600],
                    ['Acqua Panna Sin Gas', 8900, { medida: 'x505ml' }],
                    ['S. Pellegrino Gasificada', 9500, { medida: 'x505ml' }],
                    ['S. Pellegrino Saborizadas', 7000, { medida: 'x330ml' }],
                    ['Gaseosas', 4600],
                    ['Limonada / Pomelada', 5900]
                ]
            },
            {
                titulo: 'La Birra',
                platos: [
                    ['Cerveza Minga', 6200, { medida: 'Amber o Light Lager' }],
                    ['Peroni', 8800, { medida: '- cerveza rubia -' }]
                ]
            },
            {
                titulo: 'Il Cocktail-Bar',
                platos: [
                    ['Aperol Spritz / Gin Tonic', 11500],
                    ['Adicional Gin Bombay', 6000],
                    ['Vermut Rosso con soda', 11500],
                    ['Negroni / Campari con naranja', 11500],
                    ['Campari Spritz (con Prosecco)', 12000],
                    ['Fernet Branca + Cola', 11500]
                ]
            },
            {
                titulo: 'Licores',
                platos: [
                    ['Antica Formula / Grappa', 5500],
                    ['Limoncello / Licor de café', 5500],
                    ['Fernet Branca / Sambuca', 5500]
                ]
            }
        ]
    }
];

function construirCarta() {
    const platos = [];
    const secciones = [];
    let orden = 0;

    CARTAS.forEach(({ carta, secciones: definiciones }) => {
        definiciones.forEach((definicion) => {
            orden += 1;
            const ids = definicion.platos.map(([nombre, precio, extra = {}]) => {
                const plato = new Plato(
                    platos.length + 1,
                    nombre,
                    precio,
                    Boolean(extra.vegano),
                    Boolean(extra.sinTacc),
                    extra.imagen || null,
                    extra.descripcion || null,
                    extra.medida || null,
                    Boolean(extra.picante),
                    Boolean(extra.destacado)
                );
                platos.push(plato);
                return plato.id;
            });

            secciones.push(new Seccion(
                orden,
                definicion.titulo,
                orden,
                ids,
                carta,
                definicion.grupo || null,
                definicion.subtitulo || null,
                definicion.nota || null
            ));
        });
    });

    return { platos, secciones };
}

const { platos, secciones } = construirCarta();

function platoDeCarta(carta, nombre) {
    const ids = new Set(secciones.filter((s) => s.carta === carta).flatMap((s) => s.platos));
    return platos.find((p) => ids.has(p.id) && p.nombre === nombre);
}

module.exports = {
    platos,
    secciones,
    platoDeCarta
};
