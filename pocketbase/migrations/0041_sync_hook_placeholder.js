migrate(
  (app) => {
    // Chamada de sincronização inicial na migration para popular e verificar
    // Como migrations não têm $http, a sincronização é feita pelo hook / endpoint
  },
  (app) => {},
)
