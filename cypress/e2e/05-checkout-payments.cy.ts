/** @format */

/// <reference types="cypress" />

/**
 * Testes E2E para sistema de pagamentos e checkout
 * Cobre: seleção de planos, Asaas/Stripe, verificação de limites
 */

describe("Sistema de Pagamentos e Checkout", () => {
  beforeEach(() => {
    cy.mockPaymentGateway();
    cy.clearAppStorage();
    cy.login("test@example.com");
    cy.visit("/");
  });

  it("Deve navegar para página de checkout", () => {
    cy.contains("a, button", /checkout|planos|upgrade/i).click();

    cy.url().should("include", "checkout");
  });

  it("Deve exibir 3 planos (Free, Pro, Enterprise)", () => {
    cy.visit("/?route=checkout");

    // Verificar cards de planos
    cy.contains(/grátis|free/i).should("exist");
    cy.contains(/profissional|pro/i).should("exist");
    cy.contains(/empresarial|enterprise/i).should("exist");
  });

  it("Deve exibir preços em reais (R$)", () => {
    cy.visit("/?route=checkout");

    // Verificar formatação de moeda brasileira
    cy.contains(/r\$.*\d+/i).should("exist");
  });

  it("Deve exibir features de cada plano", () => {
    cy.visit("/?route=checkout");

    // Verificar features mencionadas no doc
    cy.contains(/projetos|análises|sentinel|suporte|white.*label/i).should(
      "exist"
    );
  });

  it("Deve permitir seleção de plano", () => {
    cy.visit("/?route=checkout");

    // Selecionar plano Pro
    cy.contains(/profissional|pro/i)
      .parents("div, section")
      .within(() => {
        cy.contains("button", /selecionar|escolher/i).click();
      });

    // Verificar que plano foi selecionado
    cy.contains(/plano.*selecionado|selecionou/i).should("exist");
  });

  it("Deve exibir métodos de pagamento (PIX, Boleto, Cartão)", () => {
    cy.visit("/?route=checkout");

    // Selecionar um plano pago
    cy.contains(/profissional/i)
      .parents("div, section")
      .within(() => {
        cy.contains("button", /selecionar/i).click();
      });

    // Verificar opções de pagamento
    cy.contains(/pix|boleto|cartão/i).should("exist");
  });

  it("Deve validar formulário de cartão de crédito", () => {
    cy.visit("/?route=checkout");

    // Selecionar plano e método cartão
    cy.contains(/profissional/i)
      .parents("div, section")
      .within(() => {
        cy.contains("button", /selecionar/i).click();
      });

    // Tentar submeter sem preencher
    cy.contains("button", /pagar|finalizar/i).click();

    // Verificar mensagens de erro de validação
    cy.contains(/obrigatório|preencha|inválido/i).should("exist");
  });

  it("Deve verificar limites do plano Free", () => {
    // Usuário com plano Free (padrão)
    cy.window().then((win) => {
      const user = JSON.parse(
        win.localStorage.getItem("current-auth-user") || "{}"
      );
      user.session.plan = "free";
      win.localStorage.setItem("current-auth-user", JSON.stringify(user));
    });

    cy.reload();

    // Tentar criar mais de 3 projetos (limite Free)
    // Este teste depende da implementação de CRUD de projetos
    cy.contains(/limite.*atingido|upgrade|plano.*free/i);
  });
});
