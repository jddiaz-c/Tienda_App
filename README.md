# Validation System (RULES + VALIDATOR)

Este sistema define un esquema de validación basado en RULES declarativas por entidad.
Permite validar datos de entrada antes de ser procesados por el sistema.

---

## Arquitectura

Request → Repository (HTTP) → Controller (lógica de negocio) → Validator → Model → DB

---

## Estructura de RULES

Cada entidad define sus reglas de la siguiente forma:

```php
protected const RULES = [
    'campo' => [
        'required' => true,
        'type' => 'string|int|decimal|boolean|email|date|datetime|enum',
        'min' => 0,
        'max' => 0,
        'precision' => 10,
        'scale' => 2,
        'regex' => '',
        'values' => []
    ]
];
```

---

## STRING

Tipo de dato: texto.

Propósito:
Se utiliza para nombres, descripciones, títulos y cualquier texto general.

Reglas disponibles:

- required: indica si el campo es obligatorio
- min: número mínimo de caracteres
- max: número máximo de caracteres
- regex: patrón de validación del texto

Ejemplo:

```php
'nombre' => [
    'required' => true,
    'type' => 'string',
    'min' => 3,
    'max' => 50,
    'regex' => '/^[a-zA-Z0-9 ]+$/'
]
```

---

## INT

Tipo de dato: número entero.

Propósito:
Se utiliza para cantidades, stock, identificadores numéricos y contadores.

Reglas disponibles:

- required: campo obligatorio
- min: valor mínimo permitido
- max: valor máximo permitido

Ejemplo:

```php
'stock' => [
    'required' => true,
    'type' => 'int',
    'min' => 0,
    'max' => 1000
]
```

---

## DECIMAL

Tipo de dato: número con decimales (tipo SQL DECIMAL).

Propósito:
Se utiliza para precios, valores monetarios y cálculos financieros.

Reglas disponibles:

- required: campo obligatorio
- precision: cantidad total de dígitos (enteros + decimales)
- scale: cantidad de decimales permitidos

Ejemplo:

```php
'precio' => [
    'required' => true,
    'type' => 'decimal',
    'precision' => 10,
    'scale' => 2
]
```

Ejemplo válido:
99999999.99

---

## BOOLEAN

Tipo de dato: lógico.

Propósito:
Estados, activaciones, flags y condiciones binarias.

Valores válidos:

- true
- false
- 1
- 0
- "1"
- "0"

Ejemplo:

```php
'activo' => [
    'type' => 'boolean'
]
```

---

## EMAIL

Tipo de dato: correo electrónico.

Propósito:
Usuarios, contactos, autenticación.

Reglas:

- Debe cumplir formato de email válido

Ejemplo:

```php
'email' => [
    'required' => true,
    'type' => 'email'
]
```

Ejemplo válido:
user@email.com

---

## DATE

Tipo de dato: fecha sin hora.

Propósito:
Fechas de nacimiento, eventos, registros históricos.

Formato obligatorio:
YYYY-MM-DD

Ejemplo:

```php
'fecha' => [
    'required' => true,
    'type' => 'date'
]
```

Ejemplo válido:
2026-05-25

---

## DATETIME

Tipo de dato: fecha con hora.

Propósito:
Logs, creación de registros, auditoría.

Formato obligatorio:
YYYY-MM-DD HH:MM:SS

Ejemplo:

```php
'created_at' => [
    'type' => 'datetime'
]
```

Ejemplo válido:
2026-05-25 14:30:00

---

## ENUM

Tipo de dato: valores limitados.

Propósito:
Roles, estados, categorías controladas.

Reglas disponibles:

- values: lista de valores permitidos

Ejemplo:

```php
'rol' => [
    'required' => true,
    'type' => 'enum',
    'values' => ['admin', 'cliente', 'vendedor']
]
```

---

## REGLAS GENERALES

- required define si el campo es obligatorio
- type define el tipo de validación
- cada tipo tiene reglas específicas
- el validator solo valida estructura de datos
- no contiene lógica de negocio
- las rules son declarativas

---

## EJEMPLO COMPLETO

```php
protected const RULES = [
    'nombre' => [
        'required' => true,
        'type' => 'string',
        'min' => 3,
        'max' => 50
    ],
    'precio' => [
        'required' => true,
        'type' => 'decimal',
        'precision' => 10,
        'scale' => 2
    ],
    'stock' => [
        'required' => true,
        'type' => 'int',
        'min' => 0
    ],
    'activo' => [
        'type' => 'boolean'
    ],
    'email' => [
        'type' => 'email'
    ],
    'categoria' => [
        'type' => 'enum',
        'values' => ['ropa', 'tech', 'hogar']
    ],
    'created_at' => [
        'type' => 'datetime'
    ]
];
```

---

## BENEFICIOS

- Validación centralizada
- Código reutilizable
- Escalable para microservicios
- Separación de responsabilidades
- Fácil mantenimiento
