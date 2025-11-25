# Checkout e Autenticação - Yello Solar Hub

## Visão Geral

O sistema de checkout e autenticação do Yello Solar Hub oferece uma experiência completa de compra com múltiplas formas de pagamento, análise de crédito integrada e visualização 3D dos projetos solares.

## Autenticação (Login/Cadastro)

### Funcionalidades

1. **Login com E-mail e Senha**
   - Autenticação segura com validação de credenciais
   - Recuperação de senha (em desenvolvimento)
   - Persistência de sessão usando `useKV`

2. **Cadastro de Novos Usuários**
   - Campos obrigatórios: Nome, CPF, Telefone, E-mail, Senha
   - Validação de senha (mínimo 8 caracteres)
   - Confirmação de senha
   - Verificação de e-mail duplicado

3. **Login Social (Em Desenvolvimento)**
   - Google OAuth
   - Facebook OAuth

4. **Proteção de Dados**
   - Conformidade com LGPD
   - Armazenamento seguro de credenciais
   - Termos de serviço e política de privacidade

### Estrutura de Dados

```typescript
interface AuthUser {
  id: string
  email: string
  name: string
  cpf?: string
  phone?: string
  createdAt: number
}
```

### Armazenamento

- **Key**: `auth-users` - Array de todos os usuários cadastrados
- **Key**: `current-auth-user` - Usuário atualmente logado

## Sistema de Checkout

### Visualização 3D do Telhado

O checkout inclui uma visualização interativa 3D usando **MapLibre GL** que mostra:

- **Vista Aérea**: Visão superior do telhado com painéis dispostos
- **Vista Sul**: Perspectiva sul para análise de orientação
- **Vista Leste**: Perspectiva leste para validação de layout

#### Informações Exibidas

- Área ocupada pelos painéis
- Produção anual estimada
- Economia anual projetada
- Orientação e inclinação
- Irradiação média
- Fator de sombreamento

### Métodos de Pagamento

#### 1. Pagamentos Tradicionais

##### Cartão de Crédito
- Suporte para todas as bandeiras
- Parcelamento em até 12x
- Campos: Número, Nome, Validade, CVV
- Cálculo automático de parcelas

##### PIX
- Geração de QR Code instantâneo
- Código copiável para pagamento
- Confirmação em tempo real

##### Boleto Bancário
- Geração de código de barras
- Vencimento em 3 dias úteis
- Download em PDF

#### 2. Financiamento (Análise de Crédito)

Sistema completo de pré-aprovação de crédito com:

**Campos de Análise:**
- Renda mensal
- Vínculo empregatício (CLT, PJ, Autônomo, Aposentado)
- Declaração de dívidas ativas
- Opt-in para consulta de crédito

**Processo:**
1. Usuário preenche dados financeiros
2. Aceita termos de consulta SPC/Serasa
3. Sistema realiza análise (simulada)
4. Pré-aprovação em minutos
5. Exibição de condições (taxa, prazo, parcela)

**Conformidade:**
- Autorização explícita para consulta de CPF
- Conformidade com regulamentação do Banco Central
- Proteção de dados LGPD

**Estrutura de Dados:**
```typescript
interface CreditAnalysisData {
  income: string
  employment: string
  hasDebts: boolean
  acceptedTerms: boolean
  status: "pending" | "approved" | "rejected" | "analyzing"
}
```

#### 3. Pagamentos Alternativos

##### Criptomoedas
- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- USD Coin (USDC)
- Conversão em tempo real
- Geração de endereço de pagamento

##### DREX (Real Digital)
- Integração com moeda digital do Banco Central
- Em fase piloto
- Suporte para carteiras DREX
- Disponível para instituições participantes

##### Crowdfunding
- Criação de campanha de financiamento coletivo
- Definição de meta de arrecadação
- Prazo de campanha (30, 60, 90 dias)
- Compartilhamento social
- Ideal para projetos comunitários

##### Cap Table (Equity/Participação Societária)
- Oferecimento de participação percentual
- Modelo de compartilhamento de retorno da geração solar
- Retorno estimado: 8-12% a.a.
- Prazo: 25 anos (vida útil do sistema)
- Ideal para investidores em energia limpa

### Co-Pagadores

Sistema de múltiplos pagadores permite:

- Adicionar quantos co-responsáveis necessário
- Campos para cada co-pagador:
  - Nome completo
  - CPF
  - E-mail
  - Telefone
  - Relação/Parentesco
- Responsabilidade compartilhada pelo pagamento
- Útil para projetos familiares ou societários

**Estrutura de Dados:**
```typescript
interface CoPayerData {
  id: string
  name: string
  cpf: string
  email: string
  phone: string
  relationship: string
}
```

### Carrinho de Compras

**Estrutura de Item:**
```typescript
interface CartItem {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  power?: string
}
```

**Armazenamento:**
- **Key**: `cart-items` - Itens no carrinho

### Resumo de Pagamento

Exibe:
- Subtotal
- Descontos aplicados
- Frete (grátis)
- Total final
- Informações de parcelamento (se aplicável)
- Quantidade de co-pagadores

### Segurança

#### Garantias Exibidas

- ✓ Certificação SSL 256-bit
- ✓ Conformidade PCI-DSS
- ✓ Proteção de dados LGPD
- ✓ Política de reembolso

#### Proteção de Dados Sensíveis

- Dados de cartão nunca armazenados localmente
- Criptografia end-to-end
- Tokenização de dados financeiros
- Auditoria de transações

## Fluxo de Uso

### Fluxo de Compra Completo

1. **Navegação para Checkout**
   - Usuário acessa via sidebar > Checkout
   - Visualiza itens do carrinho

2. **Visualização 3D**
   - Explora o projeto em 3 ângulos diferentes
   - Valida layout e dimensionamento

3. **Adicionar Co-Pagadores (Opcional)**
   - Clica em "Adicionar Co-Pagador"
   - Preenche dados de cada co-responsável

4. **Escolha do Método de Pagamento**
   - Seleciona aba: Tradicional, Financiamento ou Alternativo
   - Preenche dados específicos do método escolhido

5. **Análise de Crédito (Se Financiamento)**
   - Preenche dados de renda e emprego
   - Aceita termos de consulta
   - Aguarda pré-aprovação
   - Visualiza condições oferecidas

6. **Revisão Final**
   - Confere resumo do pagamento
   - Verifica total e condições

7. **Finalização**
   - Clica em "Finalizar Compra"
   - Recebe confirmação
   - E-mail de confirmação enviado

## Integração com Sistema

### Navegação

As páginas são integradas ao sistema de rotas:

```typescript
type RouteId = 'chat' | 'login' | 'checkout' | ...
```

**Acesso via Sidebar:**
- Login / Cadastro
- Checkout

### Estado Global

Utiliza `useKV` do Spark SDK para persistência:

```typescript
const [authUser, setAuthUser] = useKV<AuthUser | null>("current-auth-user", null)
const [cart, setCart] = useKV<CartItem[]>("cart-items", [])
const [coPayers, setCoPayers] = useKV<CoPayerData[]>("checkout-copayers", [])
```

## Próximos Passos

### Funcionalidades em Desenvolvimento

1. **Recuperação de Senha**
   - E-mail de reset
   - Token de validação

2. **OAuth Social**
   - Implementação completa Google/Facebook
   - Sincronização de perfil

3. **Gateway de Pagamento Real**
   - Integração com Stripe/PagSeguro
   - Webhook de confirmação

4. **DREX**
   - Aguardando liberação do piloto
   - Integração com API oficial

5. **Análise de Crédito Real**
   - Integração com bureaus de crédito
   - Serasa, SPC, Boa Vista

6. **Gestão de Crowdfunding**
   - Dashboard de campanha
   - Compartilhamento social
   - Tracking de arrecadação

7. **Cap Table Management**
   - Contrato de participação
   - Dashboard de retorno
   - Distribuição de lucros

## Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript
- **UI**: Shadcn UI v4 + Tailwind CSS
- **Estado**: Spark KV (persist)
- **Mapas 3D**: MapLibre GL JS
- **Animações**: Framer Motion
- **Ícones**: Phosphor Icons
- **Validação**: Zod (via react-hook-form)
- **Notificações**: Sonner

## Conformidade Legal

### LGPD (Lei Geral de Proteção de Dados)

- ✓ Consentimento explícito para coleta de dados
- ✓ Finalidade clara do uso de dados
- ✓ Direito de acesso e exclusão
- ✓ Segurança no armazenamento
- ✓ Notificação em caso de vazamento

### Regulamentação Financeira

- ✓ Conformidade com Banco Central
- ✓ Autorização para consulta de crédito
- ✓ Transparência em taxas e juros
- ✓ Direito de arrependimento

### PCI-DSS (Payment Card Industry)

- ✓ Não armazenamento de dados de cartão
- ✓ Transmissão criptografada
- ✓ Tokenização de pagamentos

## Suporte

Para dúvidas ou problemas:
- Acesse a seção de Ajuda no sistema
- Envie um bug report via sidebar
- Consulte a documentação técnica
