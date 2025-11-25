/** @format */

/// <reference types="cypress" />

/**
 * Testes E2E para features avançadas de AI
 * Cobre: Realtime Voice, Image Analysis, ChatKit Workflows
 */

describe("Features Avançadas de AI", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.login("test@example.com");
    cy.visit("/");
  });

  it("Deve navegar para Realtime Voice page", () => {
    cy.contains("a, button", /voice|voz|conversar/i).click();

    cy.url().should("include", "realtime-voice");
  });

  it("Deve exibir controles de voz na Realtime Voice page", () => {
    cy.visit("/?route=realtime-voice");

    // Verificar botão de iniciar/parar
    cy.get('button[aria-label*="voz" i], button[aria-label*="voice" i]').should(
      "exist"
    );
  });

  it("Deve exibir widget de upload de imagem", () => {
    // Enviar mensagem que aciona widget de imagem
    cy.get('textarea[placeholder*="Mensagem" i]').type("analisar telhado");
    cy.get('button[type="submit"]').click();

    // Verificar widget de upload
    cy.get('input[type="file"]').should("exist");
  });

  it("Deve permitir upload de imagem", () => {
    cy.visit("/?route=chat");

    // Usar base64 fixture sem plugin
    cy.fixture("test-image.base64").then((base64Data) => {
      // Converter base64 para Blob
      const base64Content = base64Data.split(",")[1];
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Criar File object
      const file = new File([blob], "telhado.png", { type: "image/png" });

      // Simular upload via DataTransfer
      cy.get('input[type="file"]').then((input) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Verificar preview ou análise
    cy.contains(/analisando|processando/i).should("exist");
  });

  it("Deve iniciar workflow guiado de dimensionamento", () => {
    // Enviar mensagem que aciona workflow
    cy.get('textarea[placeholder*="Mensagem" i]').type(
      "quero dimensionar meu sistema"
    );
    cy.get('button[type="submit"]').click();

    // Verificar primeiro passo do workflow
    cy.contains(/endereço|cep|localização/i).should("exist");
  });

  it("Deve navegar pelos passos do workflow", () => {
    // Iniciar workflow
    cy.get('textarea[placeholder*="Mensagem" i]').type("dimensionamento");
    cy.get('button[type="submit"]').click();

    // Responder primeiro passo
    cy.get("input, textarea").last().type("01310-100");
    cy.contains("button", /próximo|continuar/i).click();

    // Verificar segundo passo
    cy.contains(/consumo|kwh/i).should("exist");
  });

  it("Deve salvar progresso do workflow", () => {
    // Iniciar workflow
    cy.get('textarea[placeholder*="Mensagem" i]').type("dimensionamento");
    cy.get('button[type="submit"]').click();

    // Responder primeiro passo
    cy.get("input, textarea").last().type("01310-100");

    // Recarregar página
    cy.reload();

    // Verificar que progresso foi salvo
    cy.contains(/01310-100|continuar.*de.*onde.*parou/i).should("exist");
  });

  it("Deve exibir transcrição em tempo real (Realtime Voice)", () => {
    cy.visit("/?route=realtime-voice");

    // Verificar área de transcrição
    cy.get('[data-testid="transcription"], [role="log"]').should("exist");
  });

  it("Deve permitir comandos de voz (mock)", () => {
    cy.visit("/?route=realtime-voice");

    // Simular comando de voz via localStorage/state
    cy.window().then((win) => {
      // Mock de evento de voz
      win.postMessage(
        {
          type: "voice-command",
          text: "Analise o sombreamento",
        },
        "*"
      );
    });

    // Verificar que comando foi processado
    cy.contains(/sombreamento/i).should("exist");
  });
});
