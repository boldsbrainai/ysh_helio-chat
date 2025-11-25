/** @format */

/// <reference types="cypress" />

/**
 * Testes E2E para o sistema de chat
 * Cobre: envio de mensagens, widgets, histórico
 */

describe("Sistema de Chat e Hélio (Copiloto Solar)", () => {
  beforeEach(() => {
    cy.mockOpenAI();
    cy.clearAppStorage();
    cy.visit("/");
  });

  it("Deve exibir a área de chat corretamente", () => {
    // Verificar input de mensagem
    cy.get(
      'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
    )
      .should("exist")
      .and("be.visible");

    // Verificar botão de envio
    cy.get('button[type="submit"], button[aria-label*="Enviar" i]').should(
      "exist"
    );
  });

  it("Deve permitir enviar uma mensagem", () => {
    const mensagem = "Olá, Hélio! Como funciona o dimensionamento solar?";

    // Digitar mensagem
    cy.get(
      'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
    ).type(mensagem);

    // Enviar
    cy.get('button[type="submit"], button[aria-label*="Enviar" i]').click();

    // Verificar que a mensagem foi adicionada ao chat
    cy.contains(mensagem).should("exist");
  });

  it("Deve exibir indicador de digitação durante resposta", () => {
    // Enviar mensagem
    cy.get(
      'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
    ).type("Teste");
    cy.get('button[type="submit"]').click();

    // Verificar indicador de digitação (TypingIndicator)
    cy.get('[aria-label*="digitando" i], [role="status"]').should("exist");
  });

  it("Deve acionar widgets por palavras-chave", () => {
    // Keywords que acionam widgets (conforme widgetDemoMessages)
    const keywords = ["dimensionamento", "irradiação", "equipamento"];

    for (const keyword of keywords) {
      cy.clearAppStorage();
      cy.visit("/");

      cy.get(
        'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
      ).type(keyword);
      cy.get('button[type="submit"]').click();

      // Widget deve aparecer (Card ou componente específico)
      cy.get('[data-widget], .widget, [role="region"]').should("exist");
    }
  });

  it("Deve permitir criar uma nova conversa", () => {
    // Botão "Novo Chat"
    cy.contains("button", /novo.*chat/i).click();

    // Chat deve estar vazio
    cy.get(
      'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
    ).should("have.value", "");
  });

  it("Deve salvar histórico de conversas no Spark KV", () => {
    // Enviar mensagem
    cy.get(
      'textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]'
    ).type("Teste de persistência");
    cy.get('button[type="submit"]').click();

    // Recarregar página
    cy.reload();

    // Mensagem deve ainda estar visível (persistência KV)
    cy.contains("Teste de persistência").should("exist");
  });
});
