/** @format */

/// <reference types="cypress" />

/**
 * Testes E2E para páginas de análise solar
 * Cobre: Earth Observation, Shading Analysis, Sizing, Temporal Analysis
 */

describe("Páginas de Análise Solar", () => {
  beforeEach(() => {
    cy.mockEO();
    cy.mockTileServer();
    cy.clearAppStorage();
    cy.login("test@example.com"); // Autenticar para acessar features
    cy.visit("/");
  });

  it("Deve navegar para Earth Observation page", () => {
    // Clicar em link/botão da sidebar
    cy.contains("a, button", /earth.*observation|observação.*terra/i).click();

    // Verificar se a página carregou
    cy.url().should("include", "earth-observation");
    cy.contains(/sentinel|satélite|ndvi/i).should("exist");
  });

  it("Deve navegar para Shading Analysis page", () => {
    cy.contains(
      "a, button",
      /shading.*analysis|análise.*sombreamento/i
    ).click();

    cy.url().should("include", "shading-analysis");
    cy.contains(/sombreamento|horizonte|3d/i).should("exist");
  });

  it("Deve navegar para Sizing page", () => {
    cy.contains("a, button", /sizing|dimensionamento/i).click();

    cy.url().should("include", "sizing");
    cy.contains(/kwp|dimensionamento|cenário/i).should("exist");
  });

  it("Deve navegar para Temporal Analysis page", () => {
    cy.contains("a, button", /temporal.*analysis|análise.*temporal/i).click();

    cy.url().should("include", "temporal-analysis");
    cy.contains(/ndvi|série.*temporal/i).should("exist");
  });

  it("Deve exibir formulário de dimensionamento na Sizing page", () => {
    cy.visit("/?route=sizing"); // Navegar diretamente

    // Verificar inputs de dimensionamento
    cy.get('input[type="number"], input[placeholder*="CEP" i]').should("exist");

    // Verificar labels em PT-BR
    cy.contains(/consumo|kwh|fase/i).should("exist");
  });

  it("Deve calcular 3 cenários de dimensionamento", () => {
    cy.visit("/?route=sizing");

    // Preencher formulário básico
    cy.get('input[placeholder*="CEP" i]').type("01310-100");
    cy.get('input[type="number"]').first().type("500"); // Consumo

    // Submeter (se houver botão)
    cy.contains("button", /calcular|dimensionar/i).click();

    // Verificar se 3 cenários aparecem
    cy.contains(/conservador|equilibrado|otimizado/i).should("exist");
  });

  it("Deve exibir mapa 3D na Shading Analysis page", () => {
    cy.visit("/?route=shading-analysis");

    // Verificar container do mapa (MapLibre GL)
    cy.get(".maplibregl-map, #map, [data-map]").should("exist");
  });

  it("Deve permitir busca de imagens na Earth Observation page", () => {
    cy.visit("/?route=earth-observation");

    // Verificar input de busca
    cy.get(
      'input[placeholder*="CEP" i], input[placeholder*="coordenadas" i]'
    ).should("exist");

    // Verificar seletor de data/período
    cy.get('input[type="date"], select').should("exist");
  });
});
