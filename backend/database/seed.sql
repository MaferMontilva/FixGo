PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO roles (code, name, description) VALUES
('CLIENT','Cliente','Solicita servicios y recibe presupuestos.'),
('PROFESSIONAL','Profesional','Ofrece servicios y envía presupuestos.'),
('ADMIN','Administrador','Gestiona y supervisa la plataforma.');

INSERT OR IGNORE INTO countries (iso2, name) VALUES ('ES','España');
INSERT OR IGNORE INTO regions (country_id,name,code) SELECT id,'Comunidad de Madrid','MD' FROM countries WHERE iso2='ES';
INSERT OR IGNORE INTO regions (country_id,name,code) SELECT id,'Cataluña','CT' FROM countries WHERE iso2='ES';
INSERT OR IGNORE INTO regions (country_id,name,code) SELECT id,'Comunidad Valenciana','VC' FROM countries WHERE iso2='ES';
INSERT OR IGNORE INTO cities (region_id,name,postal_code_prefix) SELECT id,'Madrid','28' FROM regions WHERE name='Comunidad de Madrid';
INSERT OR IGNORE INTO cities (region_id,name,postal_code_prefix) SELECT id,'Barcelona','08' FROM regions WHERE name='Cataluña';
INSERT OR IGNORE INTO cities (region_id,name,postal_code_prefix) SELECT id,'Valencia','46' FROM regions WHERE name='Comunidad Valenciana';

INSERT OR IGNORE INTO categories (code,name,slug,description,icon_name,sort_order) VALUES
('HANDYMAN','Manitas','manitas','Pequeñas reparaciones, montajes y ajustes.','Hammer',10),
('ELECTRICITY','Electricidad','electricidad','Instalaciones y averías eléctricas.','Zap',20),
('PLUMBING','Fontanería','fontaneria','Fugas, grifería, tuberías y desagües.','Droplets',30),
('METAL_CARPENTRY','Carpintería de metal','carpinteria-metal','Trabajos de aluminio, hierro y metal.','Wrench',40),
('WOOD_CARPENTRY','Carpintería de madera','carpinteria-madera','Muebles, puertas y trabajos en madera.','PanelsTopLeft',50),
('APPLIANCES','Electrodomésticos','electrodomesticos','Instalación y reparación de electrodomésticos.','WashingMachine',60),
('AWNINGS_BLINDS','Toldos y persianas','toldos-persianas','Toldos, estores y persianas.','PanelTop',70),
('AIR_CONDITIONING','Climatización','climatizacion','Aire acondicionado, calefacción y ventilación.','AirVent',80),
('PAINTING','Pintura','pintura','Pintura interior y exterior.','PaintRoller',90),
('MASONRY','Albañilería','albanileria','Obra, revestimientos y reparaciones.','BrickWall',100),
('LOCKSMITH','Cerrajería','cerrajeria','Apertura y cambio de cerraduras.','KeyRound',110),
('RENOVATIONS','Reformas','reformas','Reformas parciales e integrales.','HousePlus',120),
('CONSTRUCTION','Construcción','construccion','Obra nueva y construcción.','HardHat',130),
('GLAZING','Cristalería','cristaleria','Cristales, mamparas y espejos.','PanelsTopLeft',140),
('CLEANING','Limpieza','limpieza','Limpieza de viviendas, oficinas y fin de obra.','Sparkles',150),
('GARDENING','Jardinería','jardineria','Jardines, poda y riego.','Leaf',160),
('MOVING','Mudanzas','mudanzas','Mudanzas, portes y montaje.','Truck',170),
('PEST_CONTROL','Control de plagas','control-plagas','Prevención y tratamiento de plagas.','Bug',180);

INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'HANDYMAN_ASSEMBLY','Montaje de muebles','montaje-muebles','Montaje e instalación de mobiliario.',10 FROM categories WHERE code='HANDYMAN';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'HANDYMAN_REPAIRS','Pequeñas reparaciones','pequenas-reparaciones','Ajustes y reparaciones menores.',20 FROM categories WHERE code='HANDYMAN';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'ELECTRICITY_BREAKDOWN','Avería eléctrica','averia-electrica','Diagnóstico y reparación de averías.',10 FROM categories WHERE code='ELECTRICITY';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'ELECTRICITY_INSTALLATION','Instalación eléctrica','instalacion-electrica','Puntos de luz, enchufes y cuadros.',20 FROM categories WHERE code='ELECTRICITY';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'PLUMBING_LEAK','Reparación de fugas','reparacion-fugas','Localización y reparación de fugas.',10 FROM categories WHERE code='PLUMBING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'PLUMBING_DRAIN','Desatascos','desatascos','Desatasco de tuberías y desagües.',20 FROM categories WHERE code='PLUMBING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'PLUMBING_FIXTURES','Grifería y sanitarios','griferia-sanitarios','Instalación y reparación de grifos y sanitarios.',30 FROM categories WHERE code='PLUMBING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'AC_INSTALL','Instalación de aire acondicionado','instalacion-aire-acondicionado','Instalación de equipos de climatización.',10 FROM categories WHERE code='AIR_CONDITIONING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'AC_REPAIR','Reparación de climatización','reparacion-climatizacion','Diagnóstico y reparación de equipos.',20 FROM categories WHERE code='AIR_CONDITIONING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'PAINTING_INTERIOR','Pintura interior','pintura-interior','Pintura de paredes, techos y estancias.',10 FROM categories WHERE code='PAINTING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'PAINTING_EXTERIOR','Pintura exterior','pintura-exterior','Pintura de fachadas y exteriores.',20 FROM categories WHERE code='PAINTING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'LOCK_OPENING','Apertura de puerta','apertura-puerta','Apertura de puertas bloqueadas.',10 FROM categories WHERE code='LOCKSMITH';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'LOCK_CHANGE','Cambio de cerradura','cambio-cerradura','Sustitución e instalación de cerraduras.',20 FROM categories WHERE code='LOCKSMITH';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'RENOVATION_KITCHEN','Reforma de cocina','reforma-cocina','Reforma parcial o integral de cocina.',10 FROM categories WHERE code='RENOVATIONS';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'RENOVATION_BATHROOM','Reforma de baño','reforma-bano','Reforma parcial o integral de baño.',20 FROM categories WHERE code='RENOVATIONS';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'RENOVATION_FULL','Reforma integral','reforma-integral','Reforma completa de vivienda o local.',30 FROM categories WHERE code='RENOVATIONS';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'CLEANING_HOME','Limpieza de vivienda','limpieza-vivienda','Limpieza periódica o puntual de viviendas.',10 FROM categories WHERE code='CLEANING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'CLEANING_OFFICE','Limpieza de oficina','limpieza-oficina','Limpieza de oficinas y negocios.',20 FROM categories WHERE code='CLEANING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'CLEANING_AFTER_WORKS','Limpieza fin de obra','limpieza-fin-obra','Limpieza posterior a reformas u obras.',30 FROM categories WHERE code='CLEANING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'MOVING_HOME','Mudanza de vivienda','mudanza-vivienda','Traslado completo de vivienda, embalaje y apoyo en montaje.',10 FROM categories WHERE code='MOVING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'MOVING_OFFICE','Mudanza de oficina','mudanza-oficina','Traslado organizado de oficinas, puestos de trabajo y material.',20 FROM categories WHERE code='MOVING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'MOVING_FURNITURE','Transporte y traslado de muebles','transporte-traslado-muebles','Portes y traslado de muebles o piezas voluminosas.',30 FROM categories WHERE code='MOVING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'GARDEN_MAINTENANCE','Mantenimiento de jardines','mantenimiento-jardines','Cuidado periódico de jardines, plantas y zonas exteriores.',10 FROM categories WHERE code='GARDENING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'GARDEN_PRUNING','Poda de árboles y arbustos','poda-arboles-arbustos','Poda, saneado y mantenimiento de árboles y arbustos.',20 FROM categories WHERE code='GARDENING';
INSERT OR IGNORE INTO services (category_id,code,name,slug,description,sort_order)
SELECT id,'GARDEN_LAWN','Instalación o cuidado de césped','instalacion-cuidado-cesped','Instalación, recuperación y mantenimiento de césped natural o artificial.',30 FROM categories WHERE code='GARDENING';

INSERT OR IGNORE INTO site_settings (setting_key,setting_value,value_type,is_public,description) VALUES
('brand.name','FixGo','STRING',1,'Nombre de la marca.'),
('brand.primaryColor','#FD5C03','STRING',1,'Naranja principal.'),
('brand.interfaceUsesBlue','false','BOOLEAN',1,'La interfaz no utiliza azul.'),
('marketplace.currency','EUR','STRING',1,'Moneda predeterminada.'),
('ai.enabled','true','BOOLEAN',0,'Activa el asistente de IA.'),
('ai.provider','PENDING_CONFIGURATION','STRING',0,'Proveedor de IA pendiente.'),
('serviceRequest.maxImages','5','NUMBER',1,'Máximo inicial de imágenes.'),
('serviceRequest.maxImageSizeMb','5','NUMBER',1,'Tamaño máximo por imagen.');
