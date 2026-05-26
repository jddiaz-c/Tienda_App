CREATE DATABASE tienda_db;
USE tienda_db;

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    impuesto DECIMAL(5,2) NOT NULL
);

CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    tipo_empaque ENUM('carton', 'plastico', 'otro') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL
);

CREATE TABLE proveedor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    ciudad VARCHAR(50) NOT NULL
);

CREATE TABLE producto_proveedor (
    producto_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    PRIMARY KEY (producto_id, proveedor_id),
    FOREIGN KEY (producto_id) REFERENCES producto(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
);

CREATE TABLE venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

CREATE TABLE detalle_venta (
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (venta_id, producto_id),
    FOREIGN KEY (venta_id) REFERENCES venta(id),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);