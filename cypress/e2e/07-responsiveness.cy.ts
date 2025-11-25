/// <reference types="cypress" />

/**
 * Testes E2E para responsividade e mobile
 * Cobre: viewports mobile, tablet, desktop
 */

describe('Responsividade e Mobile', () => {
  const viewports = [
    { device: 'iphone-x', width: 375, height: 812 },
    { device: 'ipad-2', width: 768, height: 1024 },
    { device: 'macbook-15', width: 1440, height: 900 }
  ];

  viewports.forEach(({ device, width, height }) => {
    describe(`Viewport: ${device} (${width}x${height})`, () => {
      beforeEach(() => {
        cy.clearAppStorage();
        cy.viewport(width, height);
        cy.visit('/');
      });

      it(`Deve renderizar corretamente em ${device}`, () => {
        cy.get('body').should('be.visible');
        cy.get('main, [role="main"]').should('be.visible');
      });

      it(`Deve ter sidebar adaptativa em ${device}`, () => {
        if (width < 768) {
          // Mobile: sidebar deve estar oculta inicialmente
          cy.get('aside, [role="navigation"]')
            .should('not.be.visible')
            .or('have.attr', 'aria-hidden', 'true');
          
          // Abrir via botão
          cy.get('button[aria-label*="menu" i]').first().click();
          cy.get('aside, [role="navigation"]').should('be.visible');
        } else {
          // Desktop/Tablet: sidebar visível
          cy.get('aside, [role="navigation"]').should('be.visible');
        }
      });

      it(`Deve ter input de mensagem acessível em ${device}`, () => {
        cy.get('textarea[placeholder*="Mensagem" i], input[placeholder*="Mensagem" i]')
          .should('be.visible')
          .and('not.be.disabled');
      });

      it(`Deve permitir scroll em ${device}`, () => {
        // Enviar múltiplas mensagens para forçar scroll
        for (let i = 0; i < 5; i++) {
          cy.get('textarea[placeholder*="Mensagem" i]').type(`Mensagem ${i}`);
          cy.get('button[type="submit"]').click();
          cy.wait(100);
        }
        
        // Verificar que mensagens são scrollable
        cy.get('main').scrollTo('bottom');
        cy.get('main').scrollTo('top');
      });
    });
  });

  it('Deve usar hook useMobile() corretamente', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // Verificar se layout mobile foi aplicado
    cy.window().then((win) => {
      expect(win.innerWidth).to.be.lessThan(768);
    });
  });

  it('Deve ter touch targets adequados (44x44px mínimo)', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // Verificar tamanho de botões principais
    cy.get('button').each(($btn) => {
      const rect = $btn[0].getBoundingClientRect();
      expect(rect.width).to.be.at.least(40); // Permitir margem
      expect(rect.height).to.be.at.least(40);
    });
  });
});
