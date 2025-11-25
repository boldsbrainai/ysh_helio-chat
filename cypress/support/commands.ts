/** @format */

// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

/// <reference types="cypress" />

// Comando customizado para navegação por Tab
Cypress.Commands.add("tab", { prevSubject: "optional" }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger("keydown", {
      key: "Tab",
      code: "Tab",
      keyCode: 9,
    });
  } else {
    cy.focused().trigger("keydown", { key: "Tab", code: "Tab", keyCode: 9 });
  }
});

// Comando para login (para testes futuros de autenticação)
Cypress.Commands.add("login", (email: string, password?: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      "current-auth-user",
      JSON.stringify({
        id: "test-user-id",
        email: email,
        name: "Test User",
        session: {
          accessToken: "mock-token",
          expiresAt: Date.now() + 3600000,
          plan: "free",
        },
      })
    );
  });
});

// Comando para limpar storage entre testes
Cypress.Commands.add("clearAppStorage", () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// =============================================================================
// Mock Commands for Deterministic Testing (R1 Priority)
// =============================================================================

/**
 * Mock OpenAI ChatKit API responses
 * @param fixture - Nome do fixture JSON (default: 'mocks/openai-response')
 */
Cypress.Commands.add("mockOpenAI", (fixture = "mocks/openai-response") => {
  // Mock ChatKit session creation
  cy.intercept("POST", "**/api.openai.com/v1/chatkit/sessions*", {
    fixture: "mocks/chatkit-session.json",
    statusCode: 201,
  }).as("chatkitSession");

  // Mock chat completions
  cy.intercept("POST", "**/api.openai.com/v1/chat/completions*", {
    fixture,
    statusCode: 200,
  }).as("chatCompletion");

  // Mock Whisper transcription
  cy.intercept("POST", "**/api.openai.com/v1/audio/transcriptions*", {
    statusCode: 200,
    body: {
      text: "Olá, gostaria de dimensionar um sistema solar para minha residência.",
    },
  }).as("whisperTranscription");

  // Mock Realtime WebSocket (stub connection)
  cy.window().then((win) => {
    if (win.WebSocket) {
      cy.stub(win, "WebSocket").returns({
        send: cy.stub(),
        close: cy.stub(),
        addEventListener: cy.stub(),
        readyState: 1, // OPEN
      });
    }
  });
});

/**
 * Mock Earth Observation (Sentinel) STAC API
 */
Cypress.Commands.add("mockEO", () => {
  cy.intercept("GET", "**/bdc/**", {
    fixture: "mocks/eo-search.json",
    statusCode: 200,
  }).as("eoSearch");

  cy.intercept("GET", "**/sentinel/**", {
    fixture: "mocks/eo-search.json",
    statusCode: 200,
  }).as("sentinelSearch");
});

/**
 * Mock tile servers (MapTiler, OSM)
 */
Cypress.Commands.add("mockTileServer", () => {
  // Mock MapTiler style JSON
  cy.intercept("GET", "**/maptiler.com/**style.json*", {
    statusCode: 200,
    body: {
      version: 8,
      name: "Hybrid",
      sources: {},
      layers: [],
    },
  }).as("mapStyle");

  // Mock tile requests (return 1x1 transparent PNG)
  cy.intercept("GET", "**/tiles/**/*.{png,jpg,webp}", {
    statusCode: 200,
    body: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    headers: { "Content-Type": "image/png" },
  }).as("tileRequest");
});

/**
 * Mock payment gateway responses
 */
Cypress.Commands.add("mockPaymentGateway", () => {
  // Mock Stripe/Asaas payment intent creation
  cy.intercept("POST", "**/payment/**", {
    fixture: "mocks/payment-success.json",
    statusCode: 200,
  }).as("paymentIntent");

  // Mock payment confirmation webhook
  cy.intercept("POST", "**/webhooks/payment/**", {
    statusCode: 200,
    body: { received: true },
  }).as("paymentWebhook");
});

/**
 * Seed test projects into KV storage
 */
Cypress.Commands.add("seedProjects", () => {
  cy.window().then((win) => {
    const mockProjects = [
      {
        id: "proj-1",
        name: "Residência São Paulo",
        location: { cep: "01310-100", city: "São Paulo", state: "SP" },
        consumption: 450,
        systemSize: 5.5,
        createdAt: new Date().toISOString(),
      },
      {
        id: "proj-2",
        name: "Comércio Campinas",
        location: { cep: "13010-111", city: "Campinas", state: "SP" },
        consumption: 1200,
        systemSize: 15,
        createdAt: new Date().toISOString(),
      },
    ];

    // Store in localStorage (fallback for KV)
    win.localStorage.setItem("ysh_projects", JSON.stringify(mockProjects));
  });
});

// Adicionar tipagem para TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      tab(
        options?: Partial<Cypress.TypeOptions>
      ): Chainable<JQuery<HTMLElement>>;
      login(email: string, password?: string): Chainable<void>;
      clearAppStorage(): Chainable<void>;
      /**
       * Mock OpenAI API responses
       * @param fixture - Optional fixture name (default: 'mocks/openai-response')
       */
      mockOpenAI(fixture?: string): Chainable<void>;
      /**
       * Mock Earth Observation (Sentinel/BDC) API
       */
      mockEO(): Chainable<void>;
      /**
       * Mock tile server requests (MapTiler, OSM)
       */
      mockTileServer(): Chainable<void>;
      /**
       * Mock payment gateway API (Stripe/Asaas)
       */
      mockPaymentGateway(): Chainable<void>;
      /**
       * Seed test projects into storage
       */
      seedProjects(): Chainable<void>;
    }
  }
}
