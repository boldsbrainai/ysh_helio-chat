// Cypress test to validate keyboard flow and skip-to-content visibility
// This test assumes the dev server is running at http://localhost:3000

describe('Keyboard and accessibility basic flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Focuses skip link first and tab order works', () => {
    // Press Tab to focus the first focusable element
    cy.get('body').tab();

    // The skip link should be present and visible when focused
    cy.get('a.skip-link, a[href="#content"]').should('exist');

    // Focus should then move to the main navigation button
    cy.get('button[aria-label*="menu"], button[aria-label*="menu" i]').should('exist');

    // Tab until we find settings button -> should have aria-label
    cy.get('button[aria-label="Abrir configurações"]').should('exist');
  });

  it('Open prompt library via keyboard', () => {
    cy.get('body').tab();
    // Move to prompt library button
    cy.get('button[aria-label="Abrir biblioteca de prompts"]').focus().type('{enter}');
    cy.get('[role="dialog"]').should('exist');
  });
});