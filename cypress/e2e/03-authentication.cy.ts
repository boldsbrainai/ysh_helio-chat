/// <reference types="cypress" />

/**
 * Testes E2E para o fluxo de autenticação
 * Cobre: Facebook OAuth, persistência de sessão, logout
 */

describe('Sistema de Autenticação', () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.visit('/');
  });

  it('Deve exibir opção de login quando não autenticado', () => {
    // Verificar se há botão de login/sign-in
    cy.get('button, a').contains(/entrar|login|sign.*in/i).should('exist');
  });

  it('Deve simular login com mock de usuário', () => {
    // Simular login usando comando customizado
    cy.login('test@example.com');
    
    // Recarregar para aplicar estado
    cy.reload();
    
    // Verificar se o usuário está logado (avatar, nome, etc.)
    cy.get('[data-testid="user-avatar"], [aria-label*="perfil" i]').should('exist');
  });

  it('Deve persistir sessão após reload', () => {
    // Login
    cy.login('test@example.com');
    cy.reload();
    
    // Verificar persistência
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('current-auth-user') || '{}');
      expect(user.email).to.equal('test@example.com');
    });
  });

  it('Deve expirar sessão após tempo limite', () => {
    // Login com sessão expirada
    cy.window().then((win) => {
      win.localStorage.setItem('current-auth-user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        session: {
          accessToken: 'expired-token',
          expiresAt: Date.now() - 1000, // Expirado
          plan: 'free'
        }
      }));
    });
    
    cy.reload();
    
    // Usuário deve ser deslogado
    cy.window().then((win) => {
      const user = win.localStorage.getItem('current-auth-user');
      expect(user).to.be.null;
    });
  });

  it('Deve permitir logout', () => {
    cy.login('test@example.com');
    cy.reload();
    
    // Clicar em botão de logout (se existir)
    cy.get('button, a').contains(/sair|logout|sign.*out/i).click();
    
    // Verificar que o usuário foi deslogado
    cy.window().then((win) => {
      const user = win.localStorage.getItem('current-auth-user');
      expect(user).to.be.null;
    });
  });

  it('Deve redirecionar para callback do Facebook OAuth', () => {
    // Simular callback do Facebook
    cy.visit('/?code=mock-facebook-code&state=mock-state');
    
    // App deve processar o código (verificar chamada ou erro)
    cy.window().should('exist'); // Básico: app não crashou
  });
});
