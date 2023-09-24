import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const datos = require('./datos.json')

import express from 'express'
const html = '<h1>Bienvenido a la API</h1><p>Los comandos disponibles son:</p><ul><li>GET: /productos/</li><li>GET: /productos/id</li>    <li>POST: /productos/</li>    <li>DELETE: /productos/id</li>    <li>PUT: /productos/id</li>    <li>PATCH: /productos/id</li>    <li>GET: /usuarios/</li>    <li>GET: /usuarios/id</li>    <li>POST: /usuarios/</li>    <li>DELETE: /usuarios/id</li>    <li>PUT: /usuarios/id</li>    <li>PATCH: /usuarios/id</li></ul>'

const app = express()

const exposedPort = 1234

app.get('/', (req, res) => {
    res.status(200).send(html)
})

app.get('/productos/', (req, res) =>{
    try {
        let allProducts = datos.productos

        res.status(200).json(allProducts)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.get('/productos/:id', (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = datos.productos.find((producto) => producto.id === productoId)

        res.status(200).json(productoEncontrado)

    } catch (error) {
        res.status(204).json({"message": error})
    }
})

app.post('/productos', (req, res) => {
    try {
        let bodyTemp = ''

        req.on('data', (chunk) => {
            bodyTemp += chunk.toString()
        })
    
        req.on('end', () => {
            const data = JSON.parse(bodyTemp)
            req.body = data
            datos.productos.push(req.body)
        })
    
        res.status(201).json({"message": "success"})

    } catch (error) {
        res.status(204).json({"message": "error"})
    }
})

app.patch('/productos/:id', (req, res) => {
    let idProductoAEditar = parseInt(req.params.id)
    let productoAActualizar = datos.productos.find((producto) => producto.id === idProductoAEditar)

    if (!productoAActualizar) {
        res.status(204).json({"message":"Producto no encontrado"})
    }

    let bodyTemp = ''

    req.on('data', (chunk) => {
        bodyTemp += chunk.toString()
    })

    req.on('end', () => {
        const data = JSON.parse(bodyTemp)
        req.body = data
        
        if(data.nombre){
            productoAActualizar.nombre = data.nombre
        }
        
        if (data.tipo){
            productoAActualizar.tipo = data.tipo
        }

        if (data.precio){
            productoAActualizar.precio = data.precio
        }

        res.status(200).send('Producto actualizado')
    })
})

app.delete('/productos/:id', (req, res) => {
    let idProductoABorrar = parseInt(req.params.id)
    let productoABorrar = datos.productos.find((producto) => producto.id === idProductoABorrar)

    if (!productoABorrar){
        res.status(204).json({"message":"Producto no encontrado"})
    }

    let indiceProductoABorrar = datos.productos.indexOf(productoABorrar)
    try {
         datos.productos.splice(indiceProductoABorrar, 1)
    res.status(200).json({"message": "success"})

    } catch (error) {
        res.status(204).json({"message": "error"})
    }
})

//Endpoint que devuelve el listado
app.get('/usuarios/', (req, res) =>{
    try {
        let allUsuarios = datos.usuarios;

        res.status(200).json(allUsuarios);

    } catch (error) {
        res.status(204).json({"message": error});
    }
});

//Endpoint que devuelve en particular a un usuario
app.get('/usuarios/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId);

        if (usuarioEncontrado) {
            res.status(200).json(usuarioEncontrado);
        } else {
            res.status(204).json({"message": "Usuario no encontrado"});
        }

    } catch (error) {
        res.status(204).json({"message": error});
    }
});

//Endpoint que guarda nuevo usuario
app.post('/usuarios', (req, res) => {
    try {
        let bodyTemp = '';

        req.on('data', (chunk) => {
            bodyTemp += chunk.toString();
        });

        req.on('end', () => {
            const data = JSON.parse(bodyTemp);
            req.body = data;

            const nuevoIdUsuario = generarNuevoIdUsuario();

            req.body.id = nuevoIdUsuario;

            datos.usuarios.push(req.body);

            res.status(201).json({"message": "Usuario creado con éxito", "id": nuevoIdUsuario});
        });

    } catch (error) {
        res.status(204).json({"message": "Error al crear el usuario"});
    }
});

function generarNuevoIdUsuario() {
    let nuevoId = datos.usuarios.length + 1;
    return nuevoId;
}

//Endpoint que modifica atributos del usuario
app.patch('/usuarios/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const usuarioAActualizar = datos.usuarios.find((usuario) => usuario.id === usuarioId);

        if (!usuarioAActualizar) {
            res.status(204).json({"message": "Usuario no encontrado"});
            return;
        }

        let bodyTemp = '';

        req.on('data', (chunk) => {
            bodyTemp += chunk.toString();
        });

        req.on('end', () => {
            const data = JSON.parse(bodyTemp);
            req.body = data;

            if (req.body.nombre) {
                usuarioAActualizar.nombre = req.body.nombre;
            }
            
            if (req.body.email) {
                usuarioAActualizar.email = req.body.email;
            }

            res.status(200).json({"message": "Usuario actualizado con éxito"});
        });
    } catch (error) {
        res.status(204).json({"message": "Error al actualizar el usuario"});
    }
});

//Endpoint que borra un usuario
app.delete('/usuarios/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const indiceUsuarioABorrar = datos.usuarios.findIndex((usuario) => usuario.id === usuarioId);

        if (indiceUsuarioABorrar === -1) {
            res.status(204).json({"message": "Usuario no encontrado"});
            return;
        }

        datos.usuarios.splice(indiceUsuarioABorrar, 1);

        res.status(200).json({"message": "Usuario eliminado con éxito"});
    } catch (error) {
        res.status(204).json({"message": "Error al eliminar el usuario"});
    }
});

//Endpoint que obtiene el precio de un producto por id
app.get('/productos/precio/:id', (req, res) => {
    try {
        const productoId = parseInt(req.params.id);
        const productoEncontrado = datos.productos.find((producto) => producto.id === productoId);

        if (productoEncontrado) {
            const precio = productoEncontrado.precio;
            res.status(200).json({"precio": precio});
        } else {
            res.status(204).json({"message": "Producto no encontrado"});
        }
    } catch (error) {
        res.status(204).json({"message": "Error al obtener el precio del producto"});
    }
});

//Endpoint que busca el nombre de un producto por id
app.get('/productos/nombre/:id', (req, res) => {
    try {
        const productoId = parseInt(req.params.id);
        const productoEncontrado = datos.productos.find((producto) => producto.id === productoId);

        if (productoEncontrado) {
            const nombre = productoEncontrado.nombre;
            res.status(200).json({"nombre": nombre});
        } else {
            res.status(204).json({"message": "Producto no encontrado"});
        }
    } catch (error) {
        res.status(204).json({"message": "Error al obtener el nombre del producto"});
    }
});

//Endpoint que obtiene el tel de un usuario por id
app.get('/usuarios/telefono/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId);

        if (usuarioEncontrado) {
            const telefono = usuarioEncontrado.telefono;
            res.status(200).json({"telefono": telefono});
        } else {
            res.status(404).json({"message": "Usuario no encontrado"});
        }
    } catch (error) {
        res.status(500).json({"message": "Error interno del servidor"});
    }
});

//Endpoint para obtener el nombre de un usuario por id
app.get('/usuarios/nombre/:id', (req, res) => {
    try {
        const usuarioId = parseInt(req.params.id);
        const usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId);

        if (usuarioEncontrado) {
            const nombre = usuarioEncontrado.nombre;
            res.status(200).json({"nombre": nombre});
        } else {
            res.status(404).json({"message": "Usuario no encontrado"});
        }
    } catch (error) {
        res.status(500).json({"message": "Error interno del servidor"});
    }
});

//Endpoint total de stock
app.get('/productos/stock-total', (req, res) => {
    try {
        const productos = datos.productos;
        let totalStock = 0;

        for (const producto of productos) {
            totalStock += producto.precio;
        }

        res.status(200).json({"stock_total": totalStock});
    } catch (error) {
        res.status(500).json({"message": "Error interno del servidor"});
    }
});


app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})

app.listen( exposedPort, () => {
    console.log('Servidor escuchando en http://localhost:' + exposedPort)
})