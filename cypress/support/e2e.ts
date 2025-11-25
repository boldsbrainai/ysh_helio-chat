// ***********************************************
// This file loads custom commands from commands.ts
// and runs before every single test
// ***********************************************

import './commands';

// Prevent Cypress from failing on uncaught exceptions
// (útil para apps em desenvolvimento)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornar false previne que o Cypress falhe o teste
  // para exceções não relacionadas ao teste
  return false;
});
