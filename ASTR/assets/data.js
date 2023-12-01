const datosClientes = [
    {
      "codigo": '345678',
      "descripcion": "La Estrella",
      "direccion": "Calle San Juan 789",
      "ciudad": "Bordenave",
      "saldo" : 212112
    },
    {
      "codigo": '456789',
      "descripcion": "El Sol",
      "direccion": "Calle San Luis 012",
      "ciudad": "Guatrache",
      "saldo" : 212112
    },
    {
      "codigo": '567890',
      "descripcion": "La Luna",
      "direccion": "Calle San Juan 345",
      "ciudad": "Gral Acha",
      "saldo" : 212112
    },
    {
      "codigo": '678901',
      "descripcion": "El Cielo",
      "direccion": "Calle San Luis 678",
      "ciudad": "Darregueira",
      "saldo" : 212112
    },
    {
      "codigo": '789012',
      "descripcion": "La Nube",
      "direccion": "Calle 9 de Julio 901",
      "ciudad": "Carhue",
      "saldo" : 212112
    },
    {
      "codigo": '890123',
      "descripcion": "El Viento",
      "direccion": "Calle San Juan 234",
      "ciudad": "Bordenave",
      "saldo" : 212112
    },
    {
      "codigo": '901234',
      "descripcion": "La Tormenta",
      "direccion": "Calle San Luis 567",
      "ciudad": "Guatrache",
      "saldo" : 212112
    },
    {
      "codigo": '123450',
      "descripcion": "El Rayo",
      "direccion": "Calle San Juan 890",
      "ciudad": "Gral Acha",
      "saldo" : 212112
    },
    {
      "codigo": '234561',
      "descripcion": "El Trueno",
      "direccion": "Calle San Luis 123",
      "ciudad": "Darregueira",
      "saldo" : 212112
    },
    {
      "codigo": '345672',
      "descripcion": "La Lluvia",
      "direccion": "Calle 9 de Julio 456",
      "ciudad": "Carhue",
      "saldo" : 212112
    },
    {
      "codigo": '456783',
      "descripcion": "El Arcoiris",
      "direccion": "Calle San Juan 789",
      "ciudad": "Bordenave",
      "saldo" : 212112
    },
    {
      "codigo": '567894',
      "descripcion": "La Nieve",
      "direccion": "Calle San Luis 012",
      "ciudad": "Guatrache",
      "saldo" : 212112
    },
    {
      "codigo": '678905',
      "descripcion": "El Hielo",
      "direccion": "Calle San Juan 345",
      "ciudad": "Gral Acha",
      "saldo" : 212112
    },
    {
      "codigo": '789016',
      "descripcion": "El Fuego",
      "direccion": "Calle San Luis 678",
      "ciudad": "Darregueira",
      "saldo" : 212112
    },
    {
      "codigo": '890127',
      "descripcion": "La Tierra",
      "direccion": "Calle 9 de Julio 901",
      "ciudad": "Carhue",
      "saldo" : 212112
    },
    {
      "codigo": '901238',
      "descripcion": "El Agua",
      "direccion": "Calle San Juan 234",
      "ciudad": "Bordenave",
      "saldo" : 212112
    }
];

const prefacturas = [
    {
      "numero": 1,
      "tipo": "PRF",
      "sucursal": 1,
      "codigoCliente": 123456,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '1',
          "descripcion": "Producto 1",
          "cantidad": 2,
          "precioUnitario": 100,
          "descuento": 0,
          "precioTotal": 200
        },
        {
          "codigo": '2',
          "descripcion": "Producto 2",
          "cantidad": 1,
          "precioUnitario": 50,
          "descuento": 10,
          "precioTotal": 40
        }
      ],
      "total": 240
    },
    {
      "numero": 2,
      "codigoCliente": 234567,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '3',
          "descripcion": "Producto 3",
          "cantidad": 3,
          "precioUnitario": 75,
          "descuento": 5,
          "precioTotal": 215
        },
        {
          "codigo": '4',
          "descripcion": "Producto 4",
          "cantidad": 2,
          "precioUnitario": 150,
          "descuento": 20,
          "precioTotal": 260
        }
      ],
      "total": 475
    },
    {
      "numero": 3,
      "codigoCliente": 345678,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '5',
          "descripcion": "Producto 5",
          "cantidad": 1,
          "precioUnitario": 200,
          "descuento": 15,
          "precioTotal": 170
        },
        {
          "codigo": '6',
          "descripcion": "Producto 6",
          "cantidad": 4,
          "precioUnitario": 25,
          "descuento": 0,
          "precioTotal": 100
        }
      ],
      "total": 270
    },
    {
      "numero": 4,
      "codigoCliente": 456789,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '7',
          "descripcion": "Producto 7",
          "cantidad": 2,
          "precioUnitario": 80,
          "descuento": 0,
          "precioTotal": 160
        },
        {
            "codigo": '5',
            "descripcion": "Producto 5",
            "cantidad": 1,
            "precioUnitario": 200,
            "descuento": 15,
            "precioTotal": 170
        },
          {
            "codigo": '6',
            "descripcion": "Producto 6",
            "cantidad": 4,
            "precioUnitario": 25,
            "descuento": 0,
            "precioTotal": 100
        },
        {
          "codigo": '8',
          "descripcion": "Producto 8",
          "cantidad": 3,
          "precioUnitario": 60,
          "descuento": 5,
          "precioTotal": 175
        }
      ],
      "total": 335
    },
    {
      "numero": 5,
      "codigoCliente": 567890,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '9',
          "descripcion": "Producto 9",
          "cantidad": 1,
          "precioUnitario": 300,
          "descuento": 25,
          "precioTotal": 225
        },
        {
          "codigo": '10',
          "descripcion": "Producto 10",
          "cantidad": 2,
          "precioUnitario": 125,
          "descuento": 10,
          "precioTotal": 225
        }
      ],
      "total": 450
    },
    {
      "numero": 6,
      "codigoCliente": 678901,
      "fecha": "2023-11-12",
      "items": [
        {
          "codigo": '11',
          "descripcion": "Producto 11",
          "cantidad": 3,
          "precioUnitario": 50,
          "descuento": 0,
          "precioTotal": 150
        },
        {
          "codigo": '12',
          "descripcion": "Producto 12",
          "cantidad": 1,
          "precioUnitario": 150,
          "descuento": 0,
          "precioTotal": 150
        }
      ],
      "total": 300
    },
]


export {datosClientes, prefacturas};