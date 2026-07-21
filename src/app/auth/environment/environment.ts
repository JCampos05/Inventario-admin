const production = true; // Cambia esto a true para usar la URL de producción

export const environment = {
  production: production,
  apiUrl: production
    ? 'https://backend-inventario-5mrd.onrender.com/api' // URL de producción
    : 'http://localhost:3001/api', // URL de desarrollo (Backend corre en el puerto 3001, ver Backend/.env)
};
