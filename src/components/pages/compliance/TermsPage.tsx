import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { FileText, ShieldCheck, Lock, List } from "@phosphor-icons/react"

interface TermsPageProps {
  onToggleSidebar: () => void
}

export function TermsPage({ onToggleSidebar }: TermsPageProps) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onToggleSidebar}
              className="w-10 h-10 rounded-xl hover:bg-accent/10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
              <FileText size={22} weight="fill" className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Termos e Políticas</h1>
              <p className="text-sm text-muted-foreground">Informações legais e políticas de uso</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText size={16} weight="bold" />
                Termos de Uso
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock size={16} weight="bold" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldCheck size={16} weight="bold" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terms">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Termos de Uso do Yello Solar Hub</CardTitle>
                    <CardDescription>Última atualização: 15 de janeiro de 2024</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    <section>
                      <h3 className="font-semibold text-base mb-3">1. Aceitação dos Termos</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Ao acessar e usar o Yello Solar Hub, você concorda em estar vinculado a estes Termos de Uso. 
                        Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">2. Descrição do Serviço</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        O Yello Solar Hub é uma plataforma de gestão de energia solar que oferece:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Assistente IA para consultas sobre energia solar</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Ferramentas de dimensionamento de sistemas fotovoltaicos</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Análise de viabilidade e crédito</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Gestão de equipamentos e projetos</span>
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">3. Uso Aceitável</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos. É proibido:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>Usar o serviço de maneira que viole leis locais, nacionais ou internacionais</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>Tentar acessar áreas restritas do sistema sem autorização</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>Interferir ou interromper o serviço ou servidores conectados</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-destructive mt-1">✗</span>
                          <span>Utilizar o serviço para transmitir conteúdo ilegal ou prejudicial</span>
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">4. Propriedade Intelectual</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Todo o conteúdo, recursos e funcionalidades do Yello Solar Hub são de propriedade exclusiva da Yello 
                        e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">5. Modificações do Serviço</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço 
                        (ou qualquer parte dele) com ou sem aviso prévio. Você concorda que não seremos responsáveis perante 
                        você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">6. Limitação de Responsabilidade</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        O serviço é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será 
                        ininterrupto, seguro ou livre de erros. Em nenhuma circunstância seremos responsáveis por quaisquer 
                        danos diretos, indiretos, incidentais, especiais ou consequenciais.
                      </p>
                    </section>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="privacy">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Política de Privacidade</CardTitle>
                    <CardDescription>Última atualização: 15 de janeiro de 2024</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    <section>
                      <h3 className="font-semibold text-base mb-3">1. Informações Coletadas</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Coletamos diferentes tipos de informações para fornecer e melhorar nosso serviço:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80">
                          <span className="font-medium">Informações de Conta:</span> Nome, e-mail, informações de perfil do Facebook
                        </li>
                        <li className="text-foreground/80">
                          <span className="font-medium">Dados de Uso:</span> Histórico de conversas, preferências, consultas realizadas
                        </li>
                        <li className="text-foreground/80">
                          <span className="font-medium">Dados Técnicos:</span> Endereço IP, tipo de navegador, sistema operacional
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">2. Uso das Informações</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Utilizamos as informações coletadas para:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Fornecer, manter e melhorar nossos serviços</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Personalizar sua experiência no aplicativo</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Comunicar atualizações e novidades</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Analisar padrões de uso para melhorias</span>
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">3. Armazenamento de Dados</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Seus dados são armazenados de forma segura usando criptografia em repouso e em trânsito. 
                        Utilizamos sistemas de armazenamento baseados em chave-valor com backup regular. As conversas 
                        são persistidas localmente no navegador e sincronizadas quando você está autenticado.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">4. Compartilhamento de Dados</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Não vendemos seus dados pessoais. Podemos compartilhar informações apenas nas seguintes situações:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Com seu consentimento explícito</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Para cumprir obrigações legais</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>Com provedores de serviços terceirizados (ex: OpenAI para processamento de IA)</span>
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">5. Seus Direitos</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. 
                        Entre em contato conosco através do suporte para exercer esses direitos.
                      </p>
                    </section>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Política de Segurança</CardTitle>
                    <CardDescription>Última atualização: 15 de janeiro de 2024</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    <section>
                      <h3 className="font-semibold text-base mb-3">1. Medidas de Segurança</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Implementamos múltiplas camadas de segurança para proteger seus dados:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80">
                          <span className="font-medium text-accent">Criptografia:</span> TLS/SSL para dados em trânsito, 
                          criptografia AES-256 para dados em repouso
                        </li>
                        <li className="text-foreground/80">
                          <span className="font-medium text-accent">Autenticação:</span> Integração com Facebook OAuth 
                          para autenticação segura
                        </li>
                        <li className="text-foreground/80">
                          <span className="font-medium text-accent">Controle de Acesso:</span> Permissões baseadas em 
                          função (owner vs. usuário)
                        </li>
                        <li className="text-foreground/80">
                          <span className="font-medium text-accent">Monitoramento:</span> Logs de segurança e detecção 
                          de atividades suspeitas
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">2. Práticas Recomendadas</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Para manter sua conta segura, recomendamos:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-success mt-1">✓</span>
                          <span>Manter sua conta Facebook segura com autenticação de dois fatores</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-success mt-1">✓</span>
                          <span>Não compartilhar credenciais de acesso</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-success mt-1">✓</span>
                          <span>Fazer logout em dispositivos compartilhados</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-success mt-1">✓</span>
                          <span>Reportar qualquer atividade suspeita imediatamente</span>
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">3. Resposta a Incidentes</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Em caso de violação de segurança que afete seus dados, nos comprometemos a notificá-lo dentro 
                        de 72 horas após a descoberta. Tomaremos medidas imediatas para mitigar o impacto e prevenir 
                        incidentes futuros.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">4. Relatório de Vulnerabilidades</h3>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        Se você descobrir uma vulnerabilidade de segurança, por favor:
                      </p>
                      <ul className="space-y-2 ml-6">
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">1.</span>
                          <span>Entre em contato conosco através do botão "Informar bug"</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">2.</span>
                          <span>Forneça detalhes sobre a vulnerabilidade</span>
                        </li>
                        <li className="text-foreground/80 flex items-start gap-2">
                          <span className="text-accent mt-1">3.</span>
                          <span>Aguarde nossa resposta antes de divulgar publicamente</span>
                        </li>
                      </ul>
                      <p className="text-foreground/80 leading-relaxed mt-3">
                        Agradecemos pesquisadores de segurança responsáveis e nos comprometemos a reconhecer suas contribuições.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="font-semibold text-base mb-3">5. Atualizações de Segurança</h3>
                      <p className="text-foreground/80 leading-relaxed">
                        Mantemos todos os componentes do sistema atualizados com os últimos patches de segurança. 
                        Realizamos auditorias de segurança regulares e testes de penetração para identificar e corrigir 
                        vulnerabilidades proativamente.
                      </p>
                    </section>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
