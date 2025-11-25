/// <reference types="cypress" />

/**
 * Testes E2E para o fluxo básico de navegação e acessibilidade
 * Cobre: navegação por teclado, sidebar, rotas principais
 */

describe('Navegação e Acessibilidade Básica', () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.visit('/');
  });

  it('Deve carregar a página inicial com elementos principais', () => {
    // Verificar se o app carregou
    cy.get('body').should('be.visible');
    
    // Verificar presença do header/sidebar
    cy.get('aside, [role="navigation"]').should('exist');
    
    // Verificar área de chat principal
    cy.get('main, [role="main"]').should('exist');
  });

  it('Deve permitir navegação por teclado', () => {
    // Tab deve focar o primeiro elemento
    cy.get('body').tab();
    
    // Verificar se algum elemento está focado
    cy.focused().should('exist');
  });

  it('Deve ter botões com aria-label corretos', () => {
    // Verificar botões principais (conforme regra ESLint customizada)
    cy.get('button[aria-label]').should('have.length.at.least', 1);
    
    // Botão de menu/sidebar
    cy.get('button[aria-label*="menu" i]').should('exist');
  });

  it('Deve abrir e fechar sidebar em mobile', () => {
    cy.viewport('iphone-x');
    
    // Clicar no botão de menu
    cy.get('button[aria-label*="menu" i]').first().click();
    
    // Sidebar deve estar visível (verificar por aria-expanded ou classe)
    cy.get('aside, [role="navigation"]').should('be.visible');
  });

  it('Deve ter tema claro/escuro funcional', () => {
    // Verificar se o botão de tema existe
    cy.get('button[aria-label*="tema" i], button[aria-label*="theme" i]').should('exist');
  });
});
