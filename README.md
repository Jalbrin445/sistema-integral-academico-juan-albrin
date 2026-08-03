# Proyecto Sistema Integral Académico

El servicio se encuentra en: <https://sia-apijamg.netlify.app/login>


## Descripción del proyecto

Este proyecto se origino como forma de solucionar un proyecto educativo solicitado en la tecnología
Análisis y Desarrollo de Software, el cual tuvo un desarrollo desde la fase de Análisis de requerimientos 
funcionales y no funcionales del proyecto, donde se licitaron todos los requerimientos pedidos
por parte del cliente **(imaginario: Yo)** para luego especificarlos haciendo uso de UML (caso de uso e historias de usuarios) y
para luego crear un artefacto donde se diera hincapie a todas aquellas implementaciones que se harían (ofertarían) 
para que el usuario final (cliente) las aprobará, luego se salto a la fase de planeación, donde se comenzo 
a estructurar, diseñar y recrear la estructura final del proyecto, luego, se llego la fase de ejecución donde se creo este
repositorio, y se empezo con el desarrollo del producto final de forma local hasta implementarlo en la nube (con servicios gratuitos),
por último, la fase de mantenimiento es la última, en la cual se define el cronograma, herramientas y tipos de mantenimiento que se
llevarán a cabo en el transcurso del desarrollo de la solución informatica.

## Dependencias

Todas las dependencias, librerías, frameworks y herramientas utilizadas en desarrollo son las siguientes (se encuentran también en package.json):

### **En el Backend:**

* **bcryptjs**: "^3.0.3",
* **cookie-parser**: "^1.4.7",
* **cors**: "^2.8.6",
* **csurf**: "^1.2.2",
* **dotenv**: "^17.3.1",
* **express**: "^5.2.1",
* **express-rate-limit**: "^8.5.2",
* **express-validator**: "^7.3.2",
* **file-type**: "^22.0.1",
* **helmet**: "^8.3.0",
* **jsonwebtoken**: "^9.0.3",
* **multer**: "^2.1.1",
* **mysql2**: "^3.20.0",
* **winston**: "^3.19.0",
* **nodemon**: "^3.1.14" **(Para desarollo)**

### **En el Frontend:**

* **axios**: "^1.13.6",
* **bootstrap**: "^5.3.8",
* **lucide-react**: "^1.7.0",
* **react**: "^19.2.4",
* **react-dom**: "^19.2.4",
* **react-router-dom**: "^7.13.1",
* **sweetalert2**: "^11.26.24",

A continuación se encuentran algunas dependencias que se usaron en desarrollo y se encuentran 
en el package.json de la carpeta client:

* **@eslint/js**: "^9.39.4", 
* **@types/react**: "^19.2.14",
* **@types/react-dom**: "^19.2.3",
* **@vitejs/plugin-react**: "^6.0.1",
* **eslint**: "^9.39.4",
* **eslint-plugin-react-hooks**: "^7.0.1",
* **eslint-plugin-react-refresh**: "^0.5.2",
* **globals**: "^17.4.0",
* **vite**: "^8.0.1"

## Para implementar el proyecto en local 

En primer lugar, se debe clonar el proyecto en una carpeta como Documentos o cualquier otra de su elección:

```bash
git clone https://github.com/Jalbrin445/sistema-integral-academico-juan-albrin.git
```
Antes que esto se debe tener instalado Node. Por lo tanto:

### En Windows:

Se recomienda utilizar el archivo .msi que se encuentra en la página oficial <https://nodejs.org/es> 
siguiendo hasta la sección de Descargas y seguir con el instalador, pero para mayor información visitar la página oficial de Node.js.

### En MacOS:

Se recomienda seguir la siguiente ruta:

1. **Descarga e instala nvm**:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

2. **en lugar de reiniciar la shell**

```
\. "$HOME/.nvm/nvm.sh"
```

3. **Descarga e instala Node.js**:

```
nvm install 24
```

4. **Verifica la versión de Node.js**:

```
node -v (Debería mostrar "v24.18.0")**
```

5. **Verifica versión de npm**:

```
npm -v # Debería mostrar "11.16.0".
```

**NOTA**: estas recomendaciones pueden variar según las actualizaciones de Node.js, por lo tanto, recomiendo ir a la página oficial para verificar la versión
LTS, la cual se recomienda descargar para poner en marcha el proyecto.

### Linux

Se deben seguir los mismos pasos que en MacOS, con la diferencia de que se encuentra en un entorno diferente, pero los comandos para instalar Node.js y
npm se mantienen.

Luego, se deben instalar las diferentes dependencias:

1. Primero nos vamos a la carpeta client con el siguiente comando:

```bash
cd client
```

2. Luego se deben descargar e instalar las dependencias con:

```bash
npm install
```

3. Para ejecutar el código se recomienda usar:

```bash
npm run dev
```

## Contactos

Administrador y desarrollador principal: 

* Nombre de Usuario: <https://github.com/Jalbrin445>
* Correo Electrónico: <mezaguzmanjuanalbrin@gmail.com>
* Página web: <https://mi-portafoliojamg.vercel.app/>

